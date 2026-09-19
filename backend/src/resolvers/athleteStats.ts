// backend/src/resolvers/athleteStats.ts
import type { Context } from "../context";
import { requireSelfOrCoach } from "../context";

export const athleteStatsResolvers = {
  Query: {
    // COACH ou o próprio atleta: estatísticas consolidadas do atleta
    athleteStats: async (
      _: any,
      { athleteId }: { athleteId: string },
      ctx: Context,
    ) => {
      await requireSelfOrCoach(ctx, athleteId);

      const entries = await ctx.prisma.entry.findMany({
        where: { athleteId },
        include: { matches: true },
      });

      const matches = entries.flatMap((e) =>
        e.matches.map((m) => ({ ...m, weightClass: e.weightClass })),
      );

      const totalMatches = matches.length;
      const wins = matches.filter((m) => m.result === "WIN").length;
      const losses = matches.filter((m) => m.result === "LOSS").length;
      const draws = matches.filter((m) => m.result === "DRAW").length;
      const winRate = totalMatches ? (wins / totalMatches) * 100 : 0;
      const ipponWins = matches.filter(
        (m) => m.result === "WIN" && m.scoreType === "IPPON",
      ).length;

      const scoreTypeCounts = new Map<string, number>();
      const winScoreTypeCounts = new Map<string, number>();
      const techniqueCounts = new Map<string, number>();
      for (const m of matches) {
        if (m.scoreType) {
          scoreTypeCounts.set(m.scoreType, (scoreTypeCounts.get(m.scoreType) ?? 0) + 1);
          if (m.result === "WIN") {
            winScoreTypeCounts.set(
              m.scoreType,
              (winScoreTypeCounts.get(m.scoreType) ?? 0) + 1,
            );
          }
        }
        if (m.result === "WIN" && m.technique) {
          techniqueCounts.set(m.technique, (techniqueCounts.get(m.technique) ?? 0) + 1);
        }
      }

      const topTechniques = Array.from(techniqueCounts.entries())
        .map(([technique, techniqueWins]) => ({ technique, wins: techniqueWins }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 5);

      const medalCounts = new Map<string, number>();
      for (const e of entries) {
        if (!e.medal || e.medal === "NONE") continue;
        medalCounts.set(e.medal, (medalCounts.get(e.medal) ?? 0) + 1);
      }

      // "shidos recebidos" = penalidades do próprio atleta, campo shidosAgainst
      // (shidosFor registra penalidades a favor dele, isto é, do adversário).
      const avgShidosPerMatch = totalMatches
        ? matches.reduce((sum, m) => sum + m.shidosAgainst, 0) / totalMatches
        : 0;

      const weightClassStats = new Map<
        string,
        { entryIds: Set<string>; wins: number; losses: number }
      >();
      for (const e of entries) {
        if (!e.weightClass) continue;
        if (!weightClassStats.has(e.weightClass)) {
          weightClassStats.set(e.weightClass, {
            entryIds: new Set(),
            wins: 0,
            losses: 0,
          });
        }
        weightClassStats.get(e.weightClass)!.entryIds.add(e.id);
      }
      for (const m of matches) {
        if (!m.weightClass) continue;
        const stat = weightClassStats.get(m.weightClass);
        if (!stat) continue;
        if (m.result === "WIN") stat.wins += 1;
        if (m.result === "LOSS") stat.losses += 1;
      }

      return {
        totalMatches,
        wins,
        losses,
        draws,
        winRate: Math.round(winRate * 10) / 10,
        ipponWins,
        scoreTypeDistribution: Array.from(scoreTypeCounts.entries()).map(
          ([scoreType, count]) => ({ scoreType, count }),
        ),
        winsByScoreType: Array.from(winScoreTypeCounts.entries()).map(
          ([scoreType, count]) => ({ scoreType, count }),
        ),
        topTechniques,
        medalsByType: Array.from(medalCounts.entries()).map(([medal, count]) => ({
          medal,
          count,
        })),
        avgShidosPerMatch: Math.round(avgShidosPerMatch * 100) / 100,
        performanceByWeightClass: Array.from(weightClassStats.entries()).map(
          ([weightClass, s]) => ({
            weightClass,
            entries: s.entryIds.size,
            wins: s.wins,
            losses: s.losses,
          }),
        ),
      };
    },
  },
};
