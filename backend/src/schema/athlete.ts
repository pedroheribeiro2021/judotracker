// backend/src/schema/athlete.ts
import { gql } from "apollo-server";

export const athleteTypeDefs = gql`
  type Athlete {
    id: ID!
    userId: ID!
    user: User
    dob: String
    sex: String
    heightCm: Float
    defaultWeightKg: Float
    coach: Coach
    coachId: ID
    createdAt: String!
    entries: [Entry!]!
    """Classe etária calculada pela idade completada no ano civil atual (regra CBJ)."""
    ageDivision: String
    """Categoria de peso oficial (CBJ) para a pesagem mais recente do atleta."""
    currentWeightClass: String
    """Peso (kg) da pesagem mais recente, com fallback para defaultWeightKg."""
    lastWeighInKg: Float
  }

  input CreateAthleteInput {
    email: String!
    name: String
    dob: String
    sex: String
    heightCm: Float
    defaultWeightKg: Float
    coachId: ID
  }

  input UpdateAthleteInput {
    id: ID!
    coachId: ID
    sex: String
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
