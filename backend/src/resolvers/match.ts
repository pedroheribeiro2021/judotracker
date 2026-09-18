// backend/src/resolvers/match.ts
import type { Context } from "../context";
import { requireCoach } from "../context";

export const matchResolvers = {
  Query: {
    // COACH only: lista as lutas de uma inscrição, na ordem em que foram registradas
    matches: async (_: any, { entryId }: { entryId: string }, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.match.findMany({
        where: { entryId },
        orderBy: { createdAt: "asc" },
      });
    },
  },

  Mutation: {
    // COACH only: registrar luta de uma inscrição
    recordMatch: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.match.create({
        data: {
          entryId: input.entryId,
          round: input.round,
          opponentName: input.opponentName,
          opponentClub: input.opponentClub,
          result: input.result,
          scoreType: input.scoreType,
          technique: input.technique,
          shidosFor: input.shidosFor ?? 0,
          shidosAgainst: input.shidosAgainst ?? 0,
          goldenScore: input.goldenScore ?? false,
          durationSeconds: input.durationSeconds,
          notes: input.notes,
        },
      });
    },

    // COACH only: atualizar luta.
    // Campos ausentes no input viram `undefined` (Prisma ignora e não
    // altera a coluna), igual à convenção de updateCompetition.
    updateMatch: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.match.update({
        where: { id: input.id },
        data: {
          round: input.round,
          opponentName: input.opponentName,
          opponentClub: input.opponentClub,
          result: input.result,
          scoreType: input.scoreType,
          technique: input.technique,
          shidosFor: input.shidosFor,
          shidosAgainst: input.shidosAgainst,
          goldenScore: input.goldenScore,
          durationSeconds: input.durationSeconds,
          notes: input.notes,
        },
      });
    },

    // COACH only: excluir luta
    deleteMatch: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireCoach(ctx);
      await ctx.prisma.match.delete({ where: { id } });
      return true;
    },

    // COACH only: define o resultado final (colocação/medalha) de uma inscrição
    setEntryResult: async (
      _: any,
      {
        entryId,
        finalPosition,
        medal,
      }: { entryId: string; finalPosition?: number | null; medal?: string | null },
      ctx: Context,
    ) => {
      requireCoach(ctx);
      return ctx.prisma.entry.update({
        where: { id: entryId },
        data: { finalPosition, medal } as any,
      });
    },
  },

  Entry: {
    matches: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.match.findMany({
        where: { entryId: parent.id },
        orderBy: { createdAt: "asc" },
      }),
  },

  Match: {
    entry: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.entry.findUnique({ where: { id: parent.entryId } }),
  },
};
