// backend/src/schema/match.ts
import { gql } from "apollo-server";

export const matchTypeDefs = gql`
  enum Medal {
    GOLD
    SILVER
    BRONZE
    NONE
  }

  enum MatchResult {
    WIN
    LOSS
    DRAW
  }

  enum ScoreType {
    IPPON
    WAZA_ARI
    WAZA_ARI_AWASETE_IPPON
    DECISION
    HANSOKU_MAKE
    FUSEN_GACHI
  }

  type Match {
    id: ID!
    entryId: ID!
    entry: Entry
    round: String!
    opponentName: String!
    opponentClub: String
    result: MatchResult!
    scoreType: ScoreType
    technique: String
    shidosFor: Int!
    shidosAgainst: Int!
    goldenScore: Boolean!
    durationSeconds: Int
    notes: String
  }

  extend type Entry {
    finalPosition: Int
    medal: Medal
    matches: [Match!]!
  }

  input RecordMatchInput {
    entryId: ID!
    round: String!
    opponentName: String!
    opponentClub: String
    result: MatchResult!
    scoreType: ScoreType
    technique: String
    shidosFor: Int
    shidosAgainst: Int
    goldenScore: Boolean
    durationSeconds: Int
    notes: String
  }

  input UpdateMatchInput {
    id: ID!
    round: String
    opponentName: String
    opponentClub: String
    result: MatchResult
    scoreType: ScoreType
    technique: String
    shidosFor: Int
    shidosAgainst: Int
    goldenScore: Boolean
    durationSeconds: Int
    notes: String
  }

  extend type Query {
    matches(entryId: ID!): [Match!]!
  }

  extend type Mutation {
    recordMatch(input: RecordMatchInput!): Match!
    updateMatch(input: UpdateMatchInput!): Match!
    deleteMatch(id: ID!): Boolean!
    setEntryResult(entryId: ID!, finalPosition: Int, medal: Medal): Entry!
  }
`;
