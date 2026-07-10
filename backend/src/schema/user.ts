// backend/src/schema/user.ts
import { gql } from "apollo-server";

export const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    role: String!
    createdAt: String!
    athlete: Athlete
    coach: Coach
  }

  extend type Query {
    me: User
  }
`;
