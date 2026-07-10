// backend/src/resolvers/weighIn.ts
import type { Context } from "../context";
import { requireCoach } from "../context";

export const weighInResolvers = {
  Query: {
    // COACH only: weigh-ins
    weighIns: async (
      _: any,
      { athleteId }: { athleteId: string },
      ctx: Context,
    ) => {
      requireCoach(ctx);
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
