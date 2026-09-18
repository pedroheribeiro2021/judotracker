import { describe, expect, it } from "vitest";
import { ForbiddenError } from "apollo-server";
import { competitionResolvers } from "./competition";
import {
  createMockContext,
  athleteUser,
  asContext,
} from "../testUtils/mockContext";

describe("competitionResolvers authz", () => {
  it("createCompetition lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      competitionResolvers.Mutation.createCompetition(
        null,
        { input: { name: "Copa X", date: "2026-08-01", level: "REGIONAL" } },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.competition.create).not.toHaveBeenCalled();
  });

  it("competitions lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      competitionResolvers.Query.competitions(null, {}, asContext(mock)),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("competitionResolvers.Query.competitions", () => {
  it("filtra por futuras (upcoming) ordenando por data ascendente", async () => {
    const mock = createMockContext();
    mock.prisma.competition.findMany.mockResolvedValue([]);

    await competitionResolvers.Query.competitions(
      null,
      { upcoming: true },
      asContext(mock),
    );

    const call = mock.prisma.competition.findMany.mock.calls[0][0];
    expect(call.where.date.gte).toBeInstanceOf(Date);
    expect(call.orderBy).toEqual({ date: "asc" });
  });

  it("filtra por passadas (past) ordenando por data descendente", async () => {
    const mock = createMockContext();
    mock.prisma.competition.findMany.mockResolvedValue([]);

    await competitionResolvers.Query.competitions(
      null,
      { past: true },
      asContext(mock),
    );

    const call = mock.prisma.competition.findMany.mock.calls[0][0];
    expect(call.where.date.lt).toBeInstanceOf(Date);
    expect(call.orderBy).toEqual({ date: "desc" });
  });

  it("sem filtros, retorna todas ordenadas por data ascendente", async () => {
    const mock = createMockContext();
    mock.prisma.competition.findMany.mockResolvedValue([]);

    await competitionResolvers.Query.competitions(null, {}, asContext(mock));

    const call = mock.prisma.competition.findMany.mock.calls[0][0];
    expect(call.where).toBeUndefined();
    expect(call.orderBy).toEqual({ date: "asc" });
  });
});

describe("competitionResolvers.Mutation.createCompetition", () => {
  it("cria a competição convertendo as datas", async () => {
    const mock = createMockContext();
    mock.prisma.competition.create.mockResolvedValue({ id: "comp-1" } as any);

    await competitionResolvers.Mutation.createCompetition(
      null,
      {
        input: {
          name: "Copa São Paulo",
          date: "2026-09-15T00:00:00.000Z",
          level: "ESTADUAL",
          federation: "FPJ",
          registrationDeadline: "2026-09-01T00:00:00.000Z",
        },
      },
      asContext(mock),
    );

    const call = mock.prisma.competition.create.mock.calls[0][0];
    expect(call.data.date).toEqual(new Date("2026-09-15T00:00:00.000Z"));
    expect(call.data.registrationDeadline).toEqual(
      new Date("2026-09-01T00:00:00.000Z"),
    );
    expect(call.data.level).toBe("ESTADUAL");
    expect(call.data.federation).toBe("FPJ");
  });
});

describe("competitionResolvers.Mutation.updateCompetition (edição parcial)", () => {
  it("mantém campos ausentes como undefined", async () => {
    const mock = createMockContext();
    mock.prisma.competition.update.mockResolvedValue({ id: "comp-1" } as any);

    await competitionResolvers.Mutation.updateCompetition(
      null,
      { input: { id: "comp-1", name: "Novo nome" } },
      asContext(mock),
    );

    const call = mock.prisma.competition.update.mock.calls[0][0];
    expect(call.data.name).toBe("Novo nome");
    expect(call.data.date).toBeUndefined();
    expect(call.data.registrationDeadline).toBeUndefined();
  });

  it("limpa registrationDeadline quando enviado explicitamente como null", async () => {
    const mock = createMockContext();
    mock.prisma.competition.update.mockResolvedValue({ id: "comp-1" } as any);

    await competitionResolvers.Mutation.updateCompetition(
      null,
      { input: { id: "comp-1", registrationDeadline: null } },
      asContext(mock),
    );

    const call = mock.prisma.competition.update.mock.calls[0][0];
    expect(call.data.registrationDeadline).toBeNull();
  });
});

describe("competitionResolvers.Mutation.deleteCompetition", () => {
  it("apaga inscrições e a competição em transação", async () => {
    const mock = createMockContext();
    mock.prisma.$transaction.mockImplementation((cb: any) => cb(mock.prisma));

    const result = await competitionResolvers.Mutation.deleteCompetition(
      null,
      { id: "comp-1" },
      asContext(mock),
    );

    expect(mock.prisma.match.deleteMany).toHaveBeenCalledWith({
      where: { entry: { competitionId: "comp-1" } },
    });
    expect(mock.prisma.entry.deleteMany).toHaveBeenCalledWith({
      where: { competitionId: "comp-1" },
    });
    expect(mock.prisma.competition.delete).toHaveBeenCalledWith({
      where: { id: "comp-1" },
    });
    expect(result).toBe(true);
  });
});

describe("competitionResolvers.Competition field resolvers", () => {
  it("serializa date e registrationDeadline como ISO string (não como timestamp numérico)", () => {
    const date = new Date("2026-09-12T00:00:00.000Z");
    const registrationDeadline = new Date("2026-09-01T00:00:00.000Z");

    expect(
      competitionResolvers.Competition.date({ date } as any),
    ).toBe("2026-09-12T00:00:00.000Z");
    expect(
      competitionResolvers.Competition.registrationDeadline({
        registrationDeadline,
      } as any),
    ).toBe("2026-09-01T00:00:00.000Z");
    expect(
      competitionResolvers.Competition.registrationDeadline({
        registrationDeadline: null,
      } as any),
    ).toBeNull();
  });
});

describe("competitionResolvers.Mutation.registerEntry / removeEntry", () => {
  it("registerEntry lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      competitionResolvers.Mutation.registerEntry(
        null,
        { competitionId: "comp-1", athleteId: "athlete-1" },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.entry.create).not.toHaveBeenCalled();
  });

  it("registerEntry cria a inscrição com a categoria de peso informada", async () => {
    const mock = createMockContext();
    mock.prisma.entry.create.mockResolvedValue({ id: "entry-1" } as any);

    await competitionResolvers.Mutation.registerEntry(
      null,
      { competitionId: "comp-1", athleteId: "athlete-1", weightClass: "-73" },
      asContext(mock),
    );

    expect(mock.prisma.entry.create).toHaveBeenCalledWith({
      data: {
        competitionId: "comp-1",
        athleteId: "athlete-1",
        weightClass: "-73",
      },
    });
  });

  it("removeEntry apaga a inscrição", async () => {
    const mock = createMockContext();
    mock.prisma.entry.delete.mockResolvedValue({ id: "entry-1" } as any);

    const result = await competitionResolvers.Mutation.removeEntry(
      null,
      { id: "entry-1" },
      asContext(mock),
    );

    expect(mock.prisma.entry.delete).toHaveBeenCalledWith({
      where: { id: "entry-1" },
    });
    expect(result).toBe(true);
  });
});
