// backend/src/schema/coach.ts
import { gql } from "apollo-server";

export const coachTypeDefs = gql`
  type Coach {
    id: ID!
    userId: ID!
    user: User
    athletes: [Athlete!]!
    createdAt: String!
  }

  input CreateCoachInput {
    email: String!
    name: String
  }

  extend type Query {
    coaches: [Coach!]!
  }

  extend type Mutation {
    createCoach(input: CreateCoachInput!): Coach!
  }
`;
