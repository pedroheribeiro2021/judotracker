import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "apollo-server";
import { trainingResolvers } from "./training";
import {
  createMockContext,
  athleteUser,
  asContext,
} from "../testUtils/mockContext";

describe("trainingResolvers authz", () => {
  it("trainingSessions lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      trainingResolvers.Query.trainingSessions(null, {}, asContext(mock)),
    ).rejects.toThrow(ForbiddenError);
  });

  it("createTrainingSession lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      trainingResolvers.Mutation.createTrainingSession(
        null,
        { input: { date: "2026-01-10", type: "TECHNICAL", durationMinutes: 60 } },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.trainingSession.create).not.toHaveBeenCalled();
  });

  it("setAttendance lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      trainingResolvers.Mutation.setAttendance(
        null,
        { sessionId: "session-1", athleteIds: ["athlete-1"] },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.attendance.upsert).not.toHaveBeenCalled();
  });
});

describe("trainingResolvers.Query.trainingSessions", () => {
  it("filtra por período quando from/to são informados", async () => {
    const mock = createMockContext();
    mock.prisma.trainingSession.findMany.mockResolvedValue([]);

    await trainingResolvers.Query.trainingSessions(
      null,
      { from: "2026-01-01", to: "2026-01-07" },
      asContext(mock),
    );

    const call = mock.prisma.trainingSession.findMany.mock.calls[0][0];
    expect(call.where.date.gte).toEqual(new Date("2026-01-01"));
    expect(call.where.date.lte).toEqual(new Date("2026-01-07"));
    expect(call.orderBy).toEqual({ date: "asc" });
  });

  it("sem filtros, retorna todas as sessões", async () => {
    const mock = createMockContext();
    mock.prisma.trainingSession.findMany.mockResolvedValue([]);

    await trainingResolvers.Query.trainingSessions(null, {}, asContext(mock));

    const call = mock.prisma.trainingSession.findMany.mock.calls[0][0];
    expect(call.where).toEqual({});
  });
});

describe("trainingResolvers.Mutation.createTrainingSession", () => {
  it("cria a sessão vinculada ao Coach do currentUser", async () => {
    const mock = createMockContext();
    mock.prisma.coach.findUnique.mockResolvedValue({ id: "coach-1" } as any);
    mock.prisma.trainingSession.create.mockResolvedValue({ id: "session-1" } as any);

    await trainingResolvers.Mutation.createTrainingSession(
      null,
      {
        input: {
          date: "2026-01-10T18:00:00.000Z",
          type: "RANDORI",
          durationMinutes: 90,
          notes: "Foco em newaza",
        },
      },
      asContext(mock),
    );

    expect(mock.prisma.trainingSession.create).toHaveBeenCalledWith({
      data: {
        date: new Date("2026-01-10T18:00:00.000Z"),
        type: "RANDORI",
        durationMinutes: 90,
        notes: "Foco em newaza",
        coachId: "coach-1",
      },
    });
  });
});

describe("trainingResolvers.Mutation.deleteTrainingSession", () => {
  it("apaga presenças e a sessão em transação", async () => {
    const mock = createMockContext();
    mock.prisma.$transaction.mockImplementation((cb: any) => cb(mock.prisma));

    const result = await trainingResolvers.Mutation.deleteTrainingSession(
      null,
      { id: "session-1" },
      asContext(mock),
    );

    expect(mock.prisma.attendance.deleteMany).toHaveBeenCalledWith({
      where: { sessionId: "session-1" },
    });
    expect(mock.prisma.trainingSession.delete).toHaveBeenCalledWith({
      where: { id: "session-1" },
    });
    expect(result).toBe(true);
  });
});

describe("trainingResolvers.Mutation.setAttendance", () => {
  it("remove presenças fora da lista e marca presente para os informados", async () => {
    const mock = createMockContext();
    mock.prisma.attendance.findMany.mockResolvedValue([
      { id: "a1", sessionId: "session-1", athleteId: "athlete-1", present: true },
    ] as any);

    const result = await trainingResolvers.Mutation.setAttendance(
      null,
      { sessionId: "session-1", athleteIds: ["athlete-1", "athlete-2"] },
      asContext(mock),
    );

    expect(mock.prisma.attendance.deleteMany).toHaveBeenCalledWith({
      where: { sessionId: "session-1", athleteId: { notIn: ["athlete-1", "athlete-2"] } },
    });
    expect(mock.prisma.attendance.upsert).toHaveBeenCalledWith({
      where: { sessionId_athleteId: { sessionId: "session-1", athleteId: "athlete-1" } },
      update: { present: true },
      create: { sessionId: "session-1", athleteId: "athlete-1", present: true },
    });
    expect(mock.prisma.attendance.upsert).toHaveBeenCalledWith({
      where: { sessionId_athleteId: { sessionId: "session-1", athleteId: "athlete-2" } },
      update: { present: true },
      create: { sessionId: "session-1", athleteId: "athlete-2", present: true },
    });
    expect(result).toHaveLength(1);
  });
});

describe("trainingResolvers.Athlete.attendanceStats", () => {
  it("calcula taxas de presença e sequência atual a partir das sessões recentes", async () => {
    const mock = createMockContext();
    const now = new Date("2026-02-01T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const day = 24 * 60 * 60 * 1000;
    const sessions = [
      // mais recente primeiro (orderBy desc)
      { id: "s5", date: new Date(now.getTime() - 1 * day), attendances: [{ present: true }] },
      { id: "s4", date: new Date(now.getTime() - 5 * day), attendances: [{ present: true }] },
      { id: "s3", date: new Date(now.getTime() - 10 * day), attendances: [] }, // ausente
      { id: "s2", date: new Date(now.getTime() - 40 * day), attendances: [{ present: true }] },
      { id: "s1", date: new Date(now.getTime() - 89 * day), attendances: [{ present: true }] },
    ];
    mock.prisma.trainingSession.findMany.mockResolvedValue(sessions as any);

    const result = await trainingResolvers.Athlete.attendanceStats(
      { id: "athlete-1" } as any,
      null,
      asContext(mock),
    );

    // 30 dias: s5, s4, s3 -> 2 presentes de 3 -> 66.7%
    expect(result.rate30).toBe(66.7);
    expect(result.sessions30).toBe(3);
    // 90 dias: todas as 5 -> 4 presentes de 5 -> 80%
    expect(result.rate90).toBe(80);
    expect(result.sessions90).toBe(5);
    // sequência: s5 presente, s4 presente, s3 ausente -> streak = 2
    expect(result.currentStreak).toBe(2);

    vi.useRealTimers();
  });

  it("retorna zeros quando não há sessões no período", async () => {
    const mock = createMockContext();
    mock.prisma.trainingSession.findMany.mockResolvedValue([]);

    const result = await trainingResolvers.Athlete.attendanceStats(
      { id: "athlete-1" } as any,
      null,
      asContext(mock),
    );

    expect(result).toEqual({
      rate30: 0,
      rate90: 0,
      currentStreak: 0,
      sessions30: 0,
      sessions90: 0,
    });
  });
});
