// backend/src/context.ts
import { AuthenticationError, ForbiddenError } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { verifyFirebaseTokenAndGetUser, CurrentUser } from "./auth/index";

export const prisma = new PrismaClient();

export type Context = {
  prisma: PrismaClient;
  currentUser: CurrentUser | null;
};

// Helper: throws if not authenticated
export function requireAuth(ctx: Context) {
  if (!ctx.currentUser) throw new AuthenticationError("Not authenticated");
}

// Helper: throws if not COACH role (admin)
export function requireCoach(ctx: Context) {
  requireAuth(ctx);
  if (ctx.currentUser!.role !== "COACH" && ctx.currentUser!.role !== "ADMIN") {
    throw new ForbiddenError("Acesso restrito a treinadores");
  }
}

export async function createContext({ req }: { req: any }): Promise<Context> {
  if (req.method === "OPTIONS") {
    return { prisma, currentUser: null };
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.warn("Missing Authorization header");
    return { prisma, currentUser: null };
  }
  const currentUser = await verifyFirebaseTokenAndGetUser(authHeader);
  if (!currentUser) {
    console.warn("Invalid/expired Firebase token");
  }
  return { prisma, currentUser };
}
