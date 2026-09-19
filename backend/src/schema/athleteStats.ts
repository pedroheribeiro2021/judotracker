// backend/src/schema/athleteStats.ts
import { gql } from "apollo-server";

export const athleteStatsTypeDefs = gql`
  type ScoreTypeCount {
    scoreType: ScoreType!
    count: Int!
  }

  type TechniqueStat {
    technique: String!
    wins: Int!
  }

  type MedalCount {
    medal: Medal!
    count: Int!
  }

  type WeightClassPerformance {
    weightClass: String!
    entries: Int!
    wins: Int!
    losses: Int!
  }

  type AthleteStats {
    totalMatches: Int!
    wins: Int!
    losses: Int!
    draws: Int!
    """Percentual de vitórias, de 0 a 100."""
    winRate: Float!
    ipponWins: Int!
    """Distribuição por forma de pontuação em todas as lutas (vitórias e derrotas)."""
    scoreTypeDistribution: [ScoreTypeCount!]!
    """Distribuição por forma de pontuação apenas nas vitórias (para o gráfico de pizza)."""
    winsByScoreType: [ScoreTypeCount!]!
    """Top 5 técnicas mais vitoriosas (tokui-waza)."""
    topTechniques: [TechniqueStat!]!
    medalsByType: [MedalCount!]!
    """Média de shidos recebidos (do próprio atleta) por luta."""
    avgShidosPerMatch: Float!
    performanceByWeightClass: [WeightClassPerformance!]!
  }

  extend type Query {
    athleteStats(athleteId: ID!): AthleteStats!
  }
`;
