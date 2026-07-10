// backend/src/schema/root.ts
import { gql } from "apollo-server";

// Base Query/Mutation types with no fields; each domain module adds its
// own fields via `extend type Query` / `extend type Mutation`.
export const rootTypeDefs = gql`
  type Query
  type Mutation
`;
