// backend/src/resolvers/user.ts
import type { Context } from "../context";
import { requireAuth } from "../context";

export const userResolvers = {
  Query: {
    // Any authenticated user: returns own user data
    me: async (_: any, __: any, ctx: Context) => {
      requireAuth(ctx);
      if (!ctx.currentUser!.id) return null;
      return ctx.prisma.user.findUnique({
        where: { id: ctx.currentUser!.id! },
      });
    },
  },

  User: {
    athlete: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.athlete.findUnique({ where: { userId: parent.id } }),
    coach: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.coach.findUnique({ where: { userId: parent.id } }),
  },
};
