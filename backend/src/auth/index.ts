// backend/src/auth/index.ts
import admin from "../firebase/admin";
import { PrismaClient } from "@prisma/client";
import { ApolloError } from "apollo-server";

const prisma = new PrismaClient();

export type CurrentUser = {
  uid: string; // firebase uid
  email?: string | null;
  name?: string | null;
  role?: string | null; // optional, from DB
  id?: string | null; // local user id (Prisma)
};

export async function verifyFirebaseTokenAndGetUser(
  authHeader?: string
): Promise<CurrentUser | null> {
  if (!authHeader) return null;
  const matches = authHeader.match(/^Bearer (.+)$/i);
  if (!matches) return null;
  const token = matches[1];

  if (!admin || !admin.auth) {
    throw new ApolloError(
      "Firebase admin not initialized",
      "INTERNAL_SERVER_ERROR"
    );
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token, true);
    // decoded contains uid, email, name, etc.
    const uid = decoded.uid;
    const email = decoded.email ?? null;
    const name = decoded.name ?? null;

    // find local user by firebaseUid
    const localUser = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (localUser) {
      return {
        uid,
        email,
        name,
        role: localUser.role,
        id: localUser.id,
      };
    }

    // If no local user exists, you can choose to auto-provision or return limited user.
    // Here we return uid+email and no local id — resolvers can decide how to handle.
    return {
      uid,
      email,
      name,
      role: null,
      id: null,
    };
  } catch (err: any) {
    // Tenta extrair infos não sensíveis do JWT para diagnosticar mismatch de projeto
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
        const payload = JSON.parse(payloadJson);
        const iss = payload?.iss;
        const aud = payload?.aud;
        const sub = payload?.sub;
        console.warn("Firebase token rejected (jwt payload):", { iss, aud, sub });
      }
    } catch {
      // ignore diagnostic decode errors
    }
    // token invalid/expired
    // do not leak internal details
    console.warn("Firebase token verification failed:", err?.message ?? err);
    return null;
  }
}
