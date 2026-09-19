// backend/src/schema/injury.ts
import { gql } from "apollo-server";

export const injuryTypeDefs = gql`
  enum InjurySeverity {
    MINOR
    MODERATE
    SEVERE
  }

  type Injury {
    id: ID!
    athleteId: ID!
    athlete: Athlete
    bodyPart: String!
    description: String!
    occurredAt: String!
    expectedReturn: String
    resolvedAt: String
    severity: InjurySeverity!
    notes: String
  }

  extend type Athlete {
    """ACTIVE ou INJURED (tem lesão sem resolvedAt)."""
    status: String!
  }

  input RecordInjuryInput {
    athleteId: ID!
    bodyPart: String!
    description: String!
    occurredAt: String!
    expectedReturn: String
    severity: InjurySeverity!
    notes: String
  }

  extend type Query {
    injuries(athleteId: ID!, activeOnly: Boolean): [Injury!]!
  }

  extend type Mutation {
    recordInjury(input: RecordInjuryInput!): Injury!
    """resolvedAt padrão: agora, se não informado."""
    resolveInjury(id: ID!, resolvedAt: String): Injury!
  }
`;
