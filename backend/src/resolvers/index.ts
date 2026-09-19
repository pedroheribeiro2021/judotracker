// backend/src/resolvers/index.ts
import { userResolvers } from "./user";
import { athleteResolvers } from "./athlete";
import { coachResolvers } from "./coach";
import { weighInResolvers } from "./weighIn";
import { competitionResolvers } from "./competition";
import { matchResolvers } from "./match";
import { promotionResolvers } from "./promotion";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...athleteResolvers.Query,
    ...coachResolvers.Query,
    ...weighInResolvers.Query,
    ...competitionResolvers.Query,
    ...matchResolvers.Query,
    ...promotionResolvers.Query,
  },
  Mutation: {
    ...athleteResolvers.Mutation,
    ...coachResolvers.Mutation,
    ...weighInResolvers.Mutation,
    ...competitionResolvers.Mutation,
    ...matchResolvers.Mutation,
    ...promotionResolvers.Mutation,
  },
  User: userResolvers.User,
  Athlete: {
    ...athleteResolvers.Athlete,
    ...promotionResolvers.Athlete,
  },
  Coach: coachResolvers.Coach,
  Competition: competitionResolvers.Competition,
  Entry: { ...competitionResolvers.Entry, ...matchResolvers.Entry },
  Match: matchResolvers.Match,
  Promotion: promotionResolvers.Promotion,
};
