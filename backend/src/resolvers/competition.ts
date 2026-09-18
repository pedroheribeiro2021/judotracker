// backend/src/resolvers/competition.ts
import type { Context } from "../context";
import { requireCoach } from "../context";

export const competitionResolvers = {
  Query: {
    // COACH only: lista competições, com filtro opcional por futuras/passadas
    competitions: async (
      _: any,
      { upcoming, past }: { upcoming?: boolean; past?: boolean },
      ctx: Context,
    ) => {
      requireCoach(ctx);
      const now = new Date();
      const where =
        upcoming && !past
          ? { date: { gte: now } }
          : past && !upcoming
            ? { date: { lt: now } }
            : undefined;
      return ctx.prisma.competition.findMany({
        where,
        orderBy: { date: past ? "desc" : "asc" },
      });
    },

    // COACH only: detalhe de uma competição
    competition: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.competition.findUnique({ where: { id } });
    },
  },

  Mutation: {
    // COACH only: criar competição
    createCompetition: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.competition.create({
        data: {
          name: input.name,
          date: new Date(input.date),
          location: input.location,
          level: input.level,
          federation: input.federation,
          city: input.city,
          state: input.state,
          registrationDeadline: input.registrationDeadline
            ? new Date(input.registrationDeadline)
            : undefined,
          notes: input.notes,
        },
      });
    },

    // COACH only: atualizar competição.
    // Campos ausentes no input viram `undefined` (Prisma ignora e não
    // altera a coluna); registrationDeadline aceita `null` explícito para
    // limpar o prazo de inscrição.
    updateCompetition: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.competition.update({
        where: { id: input.id },
        data: {
          name: input.name,
          date: input.date ? new Date(input.date) : undefined,
          location: input.location,
          level: input.level,
          federation: input.federation,
          city: input.city,
          state: input.state,
          registrationDeadline:
            input.registrationDeadline === undefined
              ? undefined
              : input.registrationDeadline
                ? new Date(input.registrationDeadline)
                : null,
          notes: input.notes,
        },
      });
    },

    // COACH only: excluir competição e suas inscrições
    deleteCompetition: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.$transaction(async (tx) => {
        await tx.entry.deleteMany({ where: { competitionId: id } });
        await tx.competition.delete({ where: { id } });
        return true;
      });
    },

    // COACH only: inscrever atleta em competição
    registerEntry: async (
      _: any,
      {
        competitionId,
        athleteId,
        weightClass,
      }: { competitionId: string; athleteId: string; weightClass?: string },
      ctx: Context,
    ) => {
      requireCoach(ctx);
      return ctx.prisma.entry.create({
        data: { competitionId, athleteId, weightClass },
      });
    },

    // COACH only: remover inscrição
    removeEntry: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireCoach(ctx);
      await ctx.prisma.entry.delete({ where: { id } });
      return true;
    },
  },

  Competition: {
    // GraphQL não chama Date.toJSON() por padrão (usa valueOf(), que
    // devolve o timestamp em ms); serializamos explicitamente para ISO
    // string, igual ao padrão já usado em weighInResolvers.
    date: (parent: any) => parent.date.toISOString(),
    registrationDeadline: (parent: any) =>
      parent.registrationDeadline
        ? parent.registrationDeadline.toISOString()
        : null,
    entries: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.entry.findMany({ where: { competitionId: parent.id } }),
  },

  Entry: {
    competition: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.competition.findUnique({
        where: { id: parent.competitionId },
      }),
    athlete: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.athlete.findUnique({ where: { id: parent.athleteId } }),
  },
};
