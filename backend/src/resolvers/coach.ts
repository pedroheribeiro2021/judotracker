// backend/src/resolvers/coach.ts
import type { Context } from "../context";
import { requireCoach } from "../context";

export const coachResolvers = {
  Query: {
    // COACH only: list coaches
    coaches: async (_: any, __: any, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.coach.findMany({
        include: {
          user: true,
          athletes: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    // COACH only: create coach
    createCoach: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      const user = await ctx.prisma.user.create({
        data: { email: input.email, name: input.name ?? null, role: "COACH" },
      });
      return ctx.prisma.coach.create({
        data: { userId: user.id },
        include: {
          user: true,
          athletes: { include: { user: true } },
        },
      });
    },
  },

  Coach: {
    user: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.user.findUnique({ where: { id: parent.userId } }),
    athletes: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.athlete.findMany({
        where: { coachId: parent.id },
        include: { user: true },
      }),
  },
};
