import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "apollo-server";
import { injuryResolvers } from "./injury";
import {
  createMockContext,
  athleteUser,
  asContext,
} from "../testUtils/mockContext";

describe("injuryResolvers.Query.injuries authz", () => {
  it("permite COACH consultar lesões de qualquer atleta", async () => {
    const mock = createMockContext();
    mock.prisma.injury.findMany.mockResolvedValue([]);

    await injuryResolvers.Query.injuries(
      null,
      { athleteId: "athlete-1" },
      asContext(mock),
    );

    expect(mock.prisma.injury.findMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
      orderBy: { occurredAt: "desc" },
    });
  });

  it("permite ATHLETE consultar as próprias lesões", async () => {
    const mock = createMockContext(athleteUser);
    mock.prisma.athlete.findUnique.mockResolvedValue({
      id: "athlete-1",
      userId: athleteUser.id,
    } as any);
    mock.prisma.injury.findMany.mockResolvedValue([]);

    await expect(
      injuryResolvers.Query.injuries(
        null,
        { athleteId: "athlete-1" },
        asContext(mock),
      ),
    ).resolves.toEqual([]);
  });

  it("lança ForbiddenError para ATHLETE consultando lesões de outro atleta", async () => {
    const mock = createMockContext(athleteUser);
    mock.prisma.athlete.findUnique.mockResolvedValue({
      id: "athlete-2",
      userId: "outro-user",
    } as any);

    await expect(
      injuryResolvers.Query.injuries(
        null,
        { athleteId: "athlete-2" },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.injury.findMany).not.toHaveBeenCalled();
  });

  it("filtra apenas lesões ativas quando activeOnly é true", async () => {
    const mock = createMockContext();
    mock.prisma.injury.findMany.mockResolvedValue([]);

    await injuryResolvers.Query.injuries(
      null,
      { athleteId: "athlete-1", activeOnly: true },
      asContext(mock),
    );

    expect(mock.prisma.injury.findMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1", resolvedAt: null },
      orderBy: { occurredAt: "desc" },
    });
  });
});

describe("injuryResolvers.Mutation.recordInjury", () => {
  it("lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      injuryResolvers.Mutation.recordInjury(
        null,
        {
          input: {
            athleteId: "athlete-1",
            bodyPart: "Joelho",
            description: "Entorse",
            occurredAt: "2026-01-10",
            severity: "MODERATE",
          },
        },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.injury.create).not.toHaveBeenCalled();
  });

  it("cria a lesão convertendo as datas", async () => {
    const mock = createMockContext();
    mock.prisma.injury.create.mockResolvedValue({ id: "injury-1" } as any);

    await injuryResolvers.Mutation.recordInjury(
      null,
      {
        input: {
          athleteId: "athlete-1",
          bodyPart: "Joelho",
          description: "Entorse no randori",
          occurredAt: "2026-01-10T00:00:00.000Z",
          expectedReturn: "2026-02-10T00:00:00.000Z",
          severity: "MODERATE",
          notes: "Encaminhado ao fisioterapeuta",
        },
      },
      asContext(mock),
    );

    const call = mock.prisma.injury.create.mock.calls[0][0];
    expect(call.data.athleteId).toBe("athlete-1");
    expect(call.data.occurredAt).toEqual(new Date("2026-01-10T00:00:00.000Z"));
    expect(call.data.expectedReturn).toEqual(
      new Date("2026-02-10T00:00:00.000Z"),
    );
    expect(call.data.severity).toBe("MODERATE");
  });
});

describe("injuryResolvers.Mutation.resolveInjury", () => {
  it("lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      injuryResolvers.Mutation.resolveInjury(
        null,
        { id: "injury-1" },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.injury.update).not.toHaveBeenCalled();
  });

  it("usa resolvedAt informado quando presente", async () => {
    const mock = createMockContext();
    mock.prisma.injury.update.mockResolvedValue({ id: "injury-1" } as any);

    await injuryResolvers.Mutation.resolveInjury(
      null,
      { id: "injury-1", resolvedAt: "2026-02-01T00:00:00.000Z" },
      asContext(mock),
    );

    expect(mock.prisma.injury.update).toHaveBeenCalledWith({
      where: { id: "injury-1" },
      data: { resolvedAt: new Date("2026-02-01T00:00:00.000Z") },
    });
  });

  it("usa a data atual quando resolvedAt não é informado", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-05T00:00:00.000Z"));

    const mock = createMockContext();
    mock.prisma.injury.update.mockResolvedValue({ id: "injury-1" } as any);

    await injuryResolvers.Mutation.resolveInjury(
      null,
      { id: "injury-1" },
      asContext(mock),
    );

    expect(mock.prisma.injury.update).toHaveBeenCalledWith({
      where: { id: "injury-1" },
      data: { resolvedAt: new Date("2026-02-05T00:00:00.000Z") },
    });

    vi.useRealTimers();
  });
});

describe("injuryResolvers.Injury field resolvers", () => {
  it("serializa datas como ISO string, com null quando ausentes", () => {
    const occurredAt = new Date("2026-01-10T00:00:00.000Z");
    expect(injuryResolvers.Injury.occurredAt({ occurredAt } as any)).toBe(
      "2026-01-10T00:00:00.000Z",
    );
    expect(
      injuryResolvers.Injury.expectedReturn({ expectedReturn: null } as any),
    ).toBeNull();
    expect(
      injuryResolvers.Injury.resolvedAt({ resolvedAt: null } as any),
    ).toBeNull();
  });
});

describe("injuryResolvers.Athlete.status", () => {
  it("retorna INJURED quando há lesão sem resolvedAt", async () => {
    const mock = createMockContext();
    mock.prisma.injury.findFirst.mockResolvedValue({ id: "injury-1" } as any);

    const result = await injuryResolvers.Athlete.status(
      { id: "athlete-1" } as any,
      null,
      asContext(mock),
    );

    expect(mock.prisma.injury.findFirst).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1", resolvedAt: null },
    });
    expect(result).toBe("INJURED");
  });

  it("retorna ACTIVE quando não há lesão ativa", async () => {
    const mock = createMockContext();
    mock.prisma.injury.findFirst.mockResolvedValue(null);

    const result = await injuryResolvers.Athlete.status(
      { id: "athlete-1" } as any,
      null,
      asContext(mock),
    );

    expect(result).toBe("ACTIVE");
  });
});
