// backend/src/resolvers/training.ts
import type { Context } from "../context";
import { requireCoach } from "../context";

const DAY_MS = 24 * 60 * 60 * 1000;

export const trainingResolvers = {
  Query: {
    // COACH only: sessões de treino num período (lista semanal)
    trainingSessions: async (
      _: any,
      { from, to }: { from?: string; to?: string },
      ctx: Context,
    ) => {
      requireCoach(ctx);
      const where: any = {};
      if (from || to) {
        where.date = {};
        if (from) where.date.gte = new Date(from);
        if (to) where.date.lte = new Date(to);
      }
      return ctx.prisma.trainingSession.findMany({
        where,
        orderBy: { date: "asc" },
      });
    },
  },

  Mutation: {
    // COACH only: criar sessão de treino, vinculada ao treinador logado
    createTrainingSession: async (_: any, { input }: any, ctx: Context) => {
      requireCoach(ctx);
      const coach = ctx.currentUser!.id
        ? await ctx.prisma.coach.findUnique({
            where: { userId: ctx.currentUser!.id! },
          })
        : null;
      return ctx.prisma.trainingSession.create({
        data: {
          date: new Date(input.date),
          type: input.type,
          durationMinutes: input.durationMinutes,
          notes: input.notes,
          coachId: coach?.id,
        },
      });
    },

    // COACH only: excluir sessão e suas presenças (FK Attendance->TrainingSession é RESTRICT)
    deleteTrainingSession: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireCoach(ctx);
      return ctx.prisma.$transaction(async (tx) => {
        await tx.attendance.deleteMany({ where: { sessionId: id } });
        await tx.trainingSession.delete({ where: { id } });
        return true;
      });
    },

    // COACH only: substitui a lista de presentes da sessão em lote
    setAttendance: async (
      _: any,
      { sessionId, athleteIds }: { sessionId: string; athleteIds: string[] },
      ctx: Context,
    ) => {
      requireCoach(ctx);
      await ctx.prisma.attendance.deleteMany({
        where: { sessionId, athleteId: { notIn: athleteIds } },
      });
      await Promise.all(
        athleteIds.map((athleteId) =>
          ctx.prisma.attendance.upsert({
            where: { sessionId_athleteId: { sessionId, athleteId } },
            update: { present: true },
            create: { sessionId, athleteId, present: true },
          }),
        ),
      );
      return ctx.prisma.attendance.findMany({ where: { sessionId } });
    },
  },

  TrainingSession: {
    date: (parent: any) => parent.date.toISOString(),
    coach: (parent: any, _: any, ctx: Context) =>
      parent.coachId
        ? ctx.prisma.coach.findUnique({
            where: { id: parent.coachId },
            include: { user: true },
          })
        : null,
    attendances: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.attendance.findMany({ where: { sessionId: parent.id } }),
  },

  Attendance: {
    athlete: (parent: any, _: any, ctx: Context) =>
      ctx.prisma.athlete.findUnique({ where: { id: parent.athleteId } }),
  },

  Athlete: {
    // Presença: sessões sem registro de Attendance para o atleta contam
    // como ausência (não é preciso criar uma linha explícita "ausente").
    attendanceStats: async (parent: any, _: any, ctx: Context) => {
      const now = new Date();
      const from90 = new Date(now.getTime() - 90 * DAY_MS);
      const from30 = new Date(now.getTime() - 30 * DAY_MS);

      const sessions90 = await ctx.prisma.trainingSession.findMany({
        where: { date: { gte: from90, lte: now } },
        orderBy: { date: "desc" },
        include: { attendances: { where: { athleteId: parent.id } } },
      });

      const sessions30 = sessions90.filter((s) => s.date >= from30);

      const rate = (sessions: typeof sessions90) => {
        if (sessions.length === 0) return 0;
        const present = sessions.filter((s) =>
          s.attendances.some((a) => a.present),
        ).length;
        return Math.round((present / sessions.length) * 1000) / 10;
      };

      let currentStreak = 0;
      for (const s of sessions90) {
        const wasPresent = s.attendances.some((a) => a.present);
        if (!wasPresent) break;
        currentStreak += 1;
      }

      return {
        rate30: rate(sessions30),
        rate90: rate(sessions90),
        currentStreak,
        sessions30: sessions30.length,
        sessions90: sessions90.length,
      };
    },
  },
};
