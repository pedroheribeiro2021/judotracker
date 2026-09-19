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

// Helper: throws unless currentUser is COACH/ADMIN, or the ATHLETE whose
// Athlete.id matches athleteId (compares via Athlete.userId, já que
// currentUser.id é o User.id, não o Athlete.id).
export async function requireSelfOrCoach(ctx: Context, athleteId: string) {
  requireAuth(ctx);
  const role = ctx.currentUser!.role;
  if (role === "COACH" || role === "ADMIN") return;
  if (role === "ATHLETE" && ctx.currentUser!.id) {
    const athlete = await ctx.prisma.athlete.findUnique({
      where: { id: athleteId },
    });
    if (athlete && athlete.userId === ctx.currentUser!.id) return;
  }
  throw new ForbiddenError("Acesso restrito ao próprio atleta ou a treinadores");
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
