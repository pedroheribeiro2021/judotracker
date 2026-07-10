// backend/src/schema/athlete.ts
import { gql } from "apollo-server";

export const athleteTypeDefs = gql`
  type Athlete {
    id: ID!
    userId: ID!
    user: User
    dob: String
    heightCm: Float
    defaultWeightKg: Float
    coach: Coach
    coachId: ID
    createdAt: String!
  }

  input CreateAthleteInput {
    email: String!
    name: String
    dob: String
    heightCm: Float
    defaultWeightKg: Float
    coachId: ID
  }

  input UpdateAthleteInput {
    id: ID!
    coachId: ID
    heightCm: Float
    defaultWeightKg: Float
  }

  extend type Query {
    athletes: [Athlete!]!
    athlete(id: ID!): Athlete
  }

  extend type Mutation {
    createAthlete(input: CreateAthleteInput!): Athlete!
    updateAthlete(input: UpdateAthleteInput!): Athlete!
    deleteAthlete(id: ID!): Boolean!
  }
`;
