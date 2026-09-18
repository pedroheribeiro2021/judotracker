import { describe, expect, it } from "vitest";
import { ForbiddenError } from "apollo-server";
import { matchResolvers } from "./match";
import {
  createMockContext,
  athleteUser,
  asContext,
} from "../testUtils/mockContext";

describe("matchResolvers authz", () => {
  it("recordMatch lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      matchResolvers.Mutation.recordMatch(
        null,
        {
          input: {
            entryId: "entry-1",
            round: "final",
            opponentName: "Fulano",
            result: "WIN",
          },
        },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.match.create).not.toHaveBeenCalled();
  });

  it("matches lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      matchResolvers.Query.matches(null, { entryId: "entry-1" }, asContext(mock)),
    ).rejects.toThrow(ForbiddenError);
  });

  it("setEntryResult lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      matchResolvers.Mutation.setEntryResult(
        null,
        { entryId: "entry-1", finalPosition: 1, medal: "GOLD" },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.entry.update).not.toHaveBeenCalled();
  });
});

describe("matchResolvers.Query.matches", () => {
  it("lista as lutas da inscrição ordenadas por criação", async () => {
    const mock = createMockContext();
    mock.prisma.match.findMany.mockResolvedValue([]);

    await matchResolvers.Query.matches(null, { entryId: "entry-1" }, asContext(mock));

    expect(mock.prisma.match.findMany).toHaveBeenCalledWith({
      where: { entryId: "entry-1" },
      orderBy: { createdAt: "asc" },
    });
  });
});

describe("matchResolvers.Mutation.recordMatch", () => {
  it("cria a luta aplicando defaults de shidos e golden score", async () => {
    const mock = createMockContext();
    mock.prisma.match.create.mockResolvedValue({ id: "match-1" } as any);

    await matchResolvers.Mutation.recordMatch(
      null,
      {
        input: {
          entryId: "entry-1",
          round: "final",
          opponentName: "Fulano de Tal",
          result: "WIN",
          scoreType: "IPPON",
          technique: "seoi-nage",
        },
      },
      asContext(mock),
    );

    expect(mock.prisma.match.create).toHaveBeenCalledWith({
      data: {
        entryId: "entry-1",
        round: "final",
        opponentName: "Fulano de Tal",
        opponentClub: undefined,
        result: "WIN",
        scoreType: "IPPON",
        technique: "seoi-nage",
        shidosFor: 0,
        shidosAgainst: 0,
        goldenScore: false,
        durationSeconds: undefined,
        notes: undefined,
      },
    });
  });
});

describe("matchResolvers.Mutation.updateMatch (edição parcial)", () => {
  it("mantém campos ausentes como undefined", async () => {
    const mock = createMockContext();
    mock.prisma.match.update.mockResolvedValue({ id: "match-1" } as any);

    await matchResolvers.Mutation.updateMatch(
      null,
      { input: { id: "match-1", notes: "Luta dura" } },
      asContext(mock),
    );

    const call = mock.prisma.match.update.mock.calls[0][0];
    expect(call.data.notes).toBe("Luta dura");
    expect(call.data.result).toBeUndefined();
    expect(call.data.opponentName).toBeUndefined();
  });
});

describe("matchResolvers.Mutation.deleteMatch", () => {
  it("apaga a luta", async () => {
    const mock = createMockContext();
    mock.prisma.match.delete.mockResolvedValue({ id: "match-1" } as any);

    const result = await matchResolvers.Mutation.deleteMatch(
      null,
      { id: "match-1" },
      asContext(mock),
    );

    expect(mock.prisma.match.delete).toHaveBeenCalledWith({
      where: { id: "match-1" },
    });
    expect(result).toBe(true);
  });
});

describe("matchResolvers.Mutation.setEntryResult", () => {
  it("atualiza colocação final e medalha da inscrição", async () => {
    const mock = createMockContext();
    mock.prisma.entry.update.mockResolvedValue({ id: "entry-1" } as any);

    await matchResolvers.Mutation.setEntryResult(
      null,
      { entryId: "entry-1", finalPosition: 1, medal: "GOLD" },
      asContext(mock),
    );

    expect(mock.prisma.entry.update).toHaveBeenCalledWith({
      where: { id: "entry-1" },
      data: { finalPosition: 1, medal: "GOLD" },
    });
  });

  it("permite limpar a medalha enviando null explicitamente", async () => {
    const mock = createMockContext();
    mock.prisma.entry.update.mockResolvedValue({ id: "entry-1" } as any);

    await matchResolvers.Mutation.setEntryResult(
      null,
      { entryId: "entry-1", finalPosition: null, medal: null },
      asContext(mock),
    );

    expect(mock.prisma.entry.update).toHaveBeenCalledWith({
      where: { id: "entry-1" },
      data: { finalPosition: null, medal: null },
    });
  });
});

describe("matchResolvers.Entry.matches", () => {
  it("busca as lutas da inscrição pelo id do parent", async () => {
    const mock = createMockContext();
    mock.prisma.match.findMany.mockResolvedValue([]);

    await matchResolvers.Entry.matches({ id: "entry-1" }, null, asContext(mock));

    expect(mock.prisma.match.findMany).toHaveBeenCalledWith({
      where: { entryId: "entry-1" },
      orderBy: { createdAt: "asc" },
    });
  });
});
