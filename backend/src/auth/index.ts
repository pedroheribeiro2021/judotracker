// backend/src/auth/index.ts
import admin from "../firebase/admin";
import { PrismaClient } from "@prisma/client";
import { ApolloError } from "apollo-server";

const prisma = new PrismaClient();

function decodeJwtPayloadUnsafe(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

export type CurrentUser = {
  uid: string; // firebase uid
  email?: string | null;
  name?: string | null;
  role?: string | null; // optional, from DB
  id?: string | null; // local user id (Prisma)
};

// Lista de emails que devem ter role COACH
// Adicione aqui todos os emails que devem ser treinadores/admin
const COACH_EMAILS = [
  "admin@mail.com",
  "pedro@mail.com",
  // Adicione outros emails conforme necessário
];

export async function verifyFirebaseTokenAndGetUser(
  authHeader?: string,
): Promise<CurrentUser | null> {
  if (!authHeader) return null;
  const matches = authHeader.match(/^Bearer (.+)$/i);
  if (!matches) return null;
  const token = matches[1];

  if (!admin || !admin.auth) {
    throw new ApolloError(
      "Firebase admin not initialized",
      "INTERNAL_SERVER_ERROR",
    );
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    // decoded contains uid, email, name, etc.
    const uid = decoded.uid;
    const email = decoded.email ?? null;
    const name = decoded.name ?? null;

    // Determinar a role baseada no email
    const desiredRole = COACH_EMAILS.includes(email || "")
      ? "COACH"
      : "ATHLETE";

    // Buscar local user por firebaseUid
    let localUser = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (localUser) {
      // Usuário existe - verificar se a role precisa ser atualizada
      if (localUser.role !== desiredRole && desiredRole === "COACH") {
        console.log(
          `🔄 Atualizando role do usuário ${email} de ${localUser.role} para ${desiredRole}`,
        );
        localUser = await prisma.user.update({
          where: { id: localUser.id },
          data: { role: desiredRole },
        });
      }

      return {
        uid,
        email,
        name,
        role: localUser.role,
        id: localUser.id,
      };
    }

    // Usuário não existe - criar novo
    console.log(
      `📝 Criando novo usuário: ${email} (${uid}) com role ${desiredRole}`,
    );

    try {
      localUser = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: email || "",
          name: name,
          role: desiredRole,
          createdAt: new Date(),
        },
      });
      console.log(
        `✅ Usuário criado com sucesso: ${email} (${localUser.role})`,
      );

      return {
        uid,
        email,
        name,
        role: localUser.role,
        id: localUser.id,
      };
    } catch (createError) {
      console.error("❌ Erro ao criar usuário no banco:", createError);
      // Se falhar ao criar, retorna usuário sem role (acesso negado)
      return {
        uid,
        email,
        name,
        role: null,
        id: null,
      };
    }
  } catch (err: any) {
    const payload = decodeJwtPayloadUnsafe(token);
    if (payload) {
      console.warn("Firebase token rejected (jwt payload):", {
        iss: payload.iss,
        aud: payload.aud,
        sub: payload.sub,
      });
    }
    // token invalid/expired
    // do not leak internal details
    console.warn("Firebase token verification failed:", {
      message: err?.message,
      code: err?.code, // ex: auth/id-token-expired
      errorInfo: err?.errorInfo,
    });
    return null;
  }
}
