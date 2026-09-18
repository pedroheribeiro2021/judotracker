// backend/src/schema/competition.ts
import { gql } from "apollo-server";

export const competitionTypeDefs = gql`
  enum CompetitionLevel {
    REGIONAL
    ESTADUAL
    NACIONAL
    INTERNACIONAL
  }

  type Competition {
    id: ID!
    name: String!
    date: String!
    location: String
    level: CompetitionLevel
    federation: String
    city: String
    state: String
    registrationDeadline: String
    notes: String
    entries: [Entry!]!
  }

  type Entry {
    id: ID!
    competitionId: ID!
    competition: Competition
    athleteId: ID!
    athlete: Athlete
    weightClass: String
    result: String
    rank: Int
  }

  input CreateCompetitionInput {
    name: String!
    date: String!
    location: String
    level: CompetitionLevel!
    federation: String
    city: String
    state: String
    registrationDeadline: String
    notes: String
  }

  input UpdateCompetitionInput {
    id: ID!
    name: String
    date: String
    location: String
    level: CompetitionLevel
    federation: String
    city: String
    state: String
    registrationDeadline: String
    notes: String
  }

  extend type Query {
    competitions(upcoming: Boolean, past: Boolean): [Competition!]!
    competition(id: ID!): Competition
  }

  extend type Mutation {
    createCompetition(input: CreateCompetitionInput!): Competition!
    updateCompetition(input: UpdateCompetitionInput!): Competition!
    deleteCompetition(id: ID!): Boolean!
    registerEntry(
      competitionId: ID!
      athleteId: ID!
      weightClass: String
    ): Entry!
    removeEntry(id: ID!): Boolean!
  }
`;
