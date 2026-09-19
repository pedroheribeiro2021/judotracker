// backend/src/resolvers/injury.ts
import type { Context } from "../context";
import { requireCoach, requireSelfOrCoach } from "../context";

export const injuryResolvers = {
  Query: {
    // COACH ou o próprio atleta: histórico de lesões
    injuries: async (
      _: any,
      { athleteId, activeOnly }: { athleteId: string; activeOnly?: boolean },
      ctx: Context,
    ) => {
      await requireSelfOrCoach(ctx, athleteId);
      return ctx.prisma.injury.findMany({
        where: {
          athleteId,
          ...(activeOnly ? { resolvedAt: null } : {}),
        },
        orderBy: { occurredAt: "desc" },
      });
    },
  },

  Mutation: {
    // COACH only: registrar lesão
    recordInjury: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.injury.create({
        data: {
          athleteId: input.athleteId,
          bodyPart: input.bodyPart,
          description: input.description,
          occurredAt: new Date(input.occurredAt),
          expectedReturn: input.expectedReturn
            ? new Date(input.expectedReturn)
            : undefined,
          severity: input.severity,
          notes: input.notes,
        },
      });
    },

    // COACH only: marcar lesão como resolvida
    resolveInjury: async (
      _: any,
      { id, resolvedAt }: { id: string; resolvedAt?: string },
      ctx: Context,
    ) => {
      requireCoach(ctx);
      return ctx.prisma.injury.update({
        where: { id },
        data: { resolvedAt: resolvedAt ? new Date(resolvedAt) : new Date() },
      });
    },
  },

  Injury: {
    occurredAt: (parent: any) => parent.occurredAt.toISOString(),
    expectedReturn: (parent: any) =>
      parent.expectedReturn ? parent.expectedReturn.toISOString() : null,
    resolvedAt: (parent: any) =>
      parent.resolvedAt ? parent.resolvedAt.toISOString() : null,
    athlete: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.athlete.findUnique({ where: { id: parent.athleteId } }),
  },

  Athlete: {
    status: async (parent: any, _: any, ctx: Context) => {
      const activeInjury = await ctx.prisma.injury.findFirst({
        where: { athleteId: parent.id, resolvedAt: null },
      });
      return activeInjury ? "INJURED" : "ACTIVE";
    },
  },
};
