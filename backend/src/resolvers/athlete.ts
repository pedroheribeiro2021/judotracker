// backend/src/resolvers/athlete.ts
import type { Context } from "../context";
import { requireCoach } from "../context";

export const athleteResolvers = {
  Query: {
    // COACH only: list all athletes
    athletes: async (_: any, __: any, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.athlete.findMany({
        include: {
          user: true,
          coach: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    },

    // COACH only: single athlete detail
    athlete: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.athlete.findUnique({
        where: { id },
        include: {
          user: true,
          coach: { include: { user: true } },
        },
      });
    },
  },

  Mutation: {
    // COACH only: create athlete
    createAthlete: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      const user = await ctx.prisma.user.create({
        data: { email: input.email, name: input.name ?? null, role: "ATHLETE" },
      });
      return ctx.prisma.athlete.create({
        data: {
          userId: user.id,
          dob: input.dob ? new Date(input.dob) : undefined,
          heightCm: input.heightCm,
          defaultWeightKg: input.defaultWeightKg,
          coachId: input.coachId || null,
        },
        include: {
          user: true,
          coach: { include: { user: true } },
        },
      });
    },

    // COACH only: update athlete
    // Fields absent from `input` stay `undefined` so Prisma leaves them
    // untouched; `coachId: null` is the explicit way to unlink the coach.
    updateAthlete: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.athlete.update({
        where: { id: input.id },
        data: {
          coachId: input.coachId,
          heightCm: input.heightCm,
          defaultWeightKg: input.defaultWeightKg,
        },
        include: {
          user: true,
          coach: { include: { user: true } },
        },
      });
    },

    deleteAthlete: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireCoach(ctx);

      // Verificar se o atleta existe
      const athlete = await ctx.prisma.athlete.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!athlete) {
        throw new Error("Atleta não encontrado");
      }

      // Deletar em transação para garantir consistência
      return await ctx.prisma.$transaction(async (tx) => {
        // Deletar pesagens relacionadas
        await tx.weighIn.deleteMany({
          where: { athleteId: id },
        });

        // Deletar body measurements relacionados
        await tx.bodyMeasurement.deleteMany({
          where: { athleteId: id },
        });

        // Deletar entries relacionados
        await tx.entry.deleteMany({
          where: { athleteId: id },
        });

        // Deletar o atleta
        await tx.athlete.delete({
          where: { id },
        });

        // Deletar o usuário relacionado
        await tx.user.delete({
          where: { id: athlete.userId },
        });

        return true;
      });
    },
  },

  Athlete: {
    user: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.user.findUnique({ where: { id: parent.userId } }),
    coach: (parent: any, _: any, ctx: Context) =>
      parent.coachId
        ? ctx.prisma.coach.findUnique({
            where: { id: parent.coachId },
            include: { user: true },
          })
        : null,
  },
};
