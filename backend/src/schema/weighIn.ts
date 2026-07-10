// backend/src/schema/weighIn.ts
import { gql } from "apollo-server";

export const weighInTypeDefs = gql`
  type WeighIn {
    id: ID!
    athleteId: ID!
    weightKg: Float!
    recordedAt: String!
    notes: String
  }

  input RecordWeighInInput {
    athleteId: ID!
    weightKg: Float!
    recordedAt: String
    notes: String
  }

  extend type Query {
    weighIns(athleteId: ID!): [WeighIn!]!
  }

  extend type Mutation {
    recordWeighIn(input: RecordWeighInInput!): WeighIn!
  }
`;
