// backend/src/resolvers/promotion.ts
import type { Context } from "../context";
import { requireCoach } from "../context";

export const promotionResolvers = {
  Query: {
    // COACH only: histórico de graduações de um atleta, mais recente primeiro
    promotions: async (_: any, { athleteId }: { athleteId: string }, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.promotion.findMany({
        where: { athleteId },
        orderBy: { promotedAt: "desc" },
      });
    },
  },

  Mutation: {
    // COACH only: registrar promoção de faixa
    recordPromotion: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.promotion.create({
        data: {
          athleteId: input.athleteId,
          rank: input.rank,
          promotedAt: new Date(input.promotedAt),
          promotedBy: input.promotedBy,
          notes: input.notes,
        },
      });
    },

    // COACH only: excluir promoção
    deletePromotion: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireCoach(ctx);
      await ctx.prisma.promotion.delete({ where: { id } });
      return true;
    },
  },

  Promotion: {
    promotedAt: (parent: any) => parent.promotedAt.toISOString(),
    athlete: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.athlete.findUnique({ where: { id: parent.athleteId } }),
  },

  Athlete: {
    currentBelt: async (parent: any, _: any, ctx: Context) => {
      const last = await ctx.prisma.promotion.findFirst({
        where: { athleteId: parent.id },
        orderBy: { promotedAt: "desc" },
      });
      return last?.rank ?? null;
    },
  },
};
