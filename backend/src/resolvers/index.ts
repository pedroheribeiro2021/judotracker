// backend/src/resolvers/index.ts
import { userResolvers } from "./user";
import { athleteResolvers } from "./athlete";
import { coachResolvers } from "./coach";
import { weighInResolvers } from "./weighIn";
import { competitionResolvers } from "./competition";
import { matchResolvers } from "./match";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...athleteResolvers.Query,
    ...coachResolvers.Query,
    ...weighInResolvers.Query,
    ...competitionResolvers.Query,
    ...matchResolvers.Query,
  },
  Mutation: {
    ...athleteResolvers.Mutation,
    ...coachResolvers.Mutation,
    ...weighInResolvers.Mutation,
    ...competitionResolvers.Mutation,
    ...matchResolvers.Mutation,
  },
  User: userResolvers.User,
  Athlete: athleteResolvers.Athlete,
  Coach: coachResolvers.Coach,
  Competition: competitionResolvers.Competition,
  Entry: { ...competitionResolvers.Entry, ...matchResolvers.Entry },
  Match: matchResolvers.Match,
};
