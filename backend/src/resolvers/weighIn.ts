// backend/src/resolvers/weighIn.ts
import type { Context } from "../context";
import { requireCoach, requireSelfOrCoach } from "../context";

export const weighInResolvers = {
  Query: {
    // COACH ou o próprio atleta: histórico de pesagens
    weighIns: async (
      _: any,
      { athleteId }: { athleteId: string },
      ctx: Context,
    ) => {
      await requireSelfOrCoach(ctx, athleteId);
      const rows = await ctx.prisma.weighIn.findMany({
        where: { athleteId },
        orderBy: { recordedAt: "desc" },
      });
      return rows.map((r: { recordedAt: Date } & Record<string, any>) => ({
        ...r,
        recordedAt: r.recordedAt.toISOString(),
      }));
    },
  },

  Mutation: {
    // COACH only: record weigh-in
    recordWeighIn: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      const wi = await ctx.prisma.weighIn.create({
        data: {
          athleteId: input.athleteId,
          weightKg: input.weightKg,
          recordedAt: input.recordedAt
            ? new Date(input.recordedAt)
            : new Date(),
          notes: input.notes,
        },
      });
      return { ...wi, recordedAt: wi.recordedAt.toISOString() };
    },
  },
};
