import { describe, expect, it } from "vitest";
import { ForbiddenError } from "apollo-server";
import { athleteStatsResolvers } from "./athleteStats";
import {
  createMockContext,
  athleteUser,
  asContext,
} from "../testUtils/mockContext";

function makeEntries() {
  return [
    {
      id: "entry-1",
      athleteId: "athlete-1",
      weightClass: "-73",
      medal: "BRONZE",
      matches: [
        {
          id: "m1",
          result: "WIN",
          scoreType: "IPPON",
          technique: "seoi-nage",
          shidosFor: 0,
          shidosAgainst: 1,
        },
        {
          id: "m2",
          result: "LOSS",
          scoreType: "WAZA_ARI",
          technique: "o-soto-gari",
          shidosFor: 1,
          shidosAgainst: 0,
        },
        {
          id: "m3",
          result: "WIN",
          scoreType: "IPPON",
          technique: "seoi-nage",
          shidosFor: 0,
          shidosAgainst: 2,
        },
      ],
    },
    {
      id: "entry-2",
      athleteId: "athlete-1",
      weightClass: "-81",
      medal: null,
      matches: [
        {
          id: "m4",
          result: "WIN",
          scoreType: "DECISION",
          technique: null,
          shidosFor: 1,
          shidosAgainst: 1,
        },
      ],
    },
  ];
}

describe("athleteStatsResolvers authz", () => {
  it("lança ForbiddenError para ATHLETE consultando estatísticas de outro atleta", async () => {
    const mock = createMockContext(athleteUser);
    mock.prisma.athlete.findUnique.mockResolvedValue({
      id: "athlete-2",
      userId: "outro-user",
    } as any);

    await expect(
      athleteStatsResolvers.Query.athleteStats(
        null,
        { athleteId: "athlete-2" },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.entry.findMany).not.toHaveBeenCalled();
  });
});

describe("athleteStatsResolvers.Query.athleteStats", () => {
  it("agrega lutas e inscrições em estatísticas consolidadas", async () => {
    const mock = createMockContext();
    mock.prisma.entry.findMany.mockResolvedValue(makeEntries() as any);

    const result = await athleteStatsResolvers.Query.athleteStats(
      null,
      { athleteId: "athlete-1" },
      asContext(mock),
    );

    expect(mock.prisma.entry.findMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
      include: { matches: true },
    });

    expect(result.totalMatches).toBe(4);
    expect(result.wins).toBe(3);
    expect(result.losses).toBe(1);
    expect(result.draws).toBe(0);
    expect(result.winRate).toBe(75);
    expect(result.ipponWins).toBe(2);

    expect(result.scoreTypeDistribution).toEqual(
      expect.arrayContaining([
        { scoreType: "IPPON", count: 2 },
        { scoreType: "WAZA_ARI", count: 1 },
        { scoreType: "DECISION", count: 1 },
      ]),
    );
    expect(result.winsByScoreType).toEqual(
      expect.arrayContaining([
        { scoreType: "IPPON", count: 2 },
        { scoreType: "DECISION", count: 1 },
      ]),
    );

    expect(result.topTechniques[0]).toEqual({ technique: "seoi-nage", wins: 2 });

    expect(result.medalsByType).toEqual([{ medal: "BRONZE", count: 1 }]);

    // shidosAgainst: 1 + 0 + 2 + 1 = 4, em 4 lutas -> média 1
    expect(result.avgShidosPerMatch).toBe(1);

    expect(result.performanceByWeightClass).toEqual(
      expect.arrayContaining([
        { weightClass: "-73", entries: 1, wins: 2, losses: 1 },
        { weightClass: "-81", entries: 1, wins: 1, losses: 0 },
      ]),
    );
  });

  it("retorna zeros quando o atleta não tem lutas registradas", async () => {
    const mock = createMockContext();
    mock.prisma.entry.findMany.mockResolvedValue([]);

    const result = await athleteStatsResolvers.Query.athleteStats(
      null,
      { athleteId: "athlete-1" },
      asContext(mock),
    );

    expect(result.totalMatches).toBe(0);
    expect(result.winRate).toBe(0);
    expect(result.avgShidosPerMatch).toBe(0);
    expect(result.topTechniques).toEqual([]);
    expect(result.medalsByType).toEqual([]);
    expect(result.performanceByWeightClass).toEqual([]);
  });
});
