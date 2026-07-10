// backend/src/resolvers/index.ts
import { userResolvers } from "./user";
import { athleteResolvers } from "./athlete";
import { coachResolvers } from "./coach";
import { weighInResolvers } from "./weighIn";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...athleteResolvers.Query,
    ...coachResolvers.Query,
    ...weighInResolvers.Query,
  },
  Mutation: {
    ...athleteResolvers.Mutation,
    ...coachResolvers.Mutation,
    ...weighInResolvers.Mutation,
  },
  User: userResolvers.User,
  Athlete: athleteResolvers.Athlete,
  Coach: coachResolvers.Coach,
};
