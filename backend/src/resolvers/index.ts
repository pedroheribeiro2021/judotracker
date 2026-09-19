// backend/src/resolvers/index.ts
import { userResolvers } from "./user";
import { athleteResolvers } from "./athlete";
import { coachResolvers } from "./coach";
import { weighInResolvers } from "./weighIn";
import { competitionResolvers } from "./competition";
import { matchResolvers } from "./match";
import { promotionResolvers } from "./promotion";
import { athleteStatsResolvers } from "./athleteStats";
import { trainingResolvers } from "./training";
import { injuryResolvers } from "./injury";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...athleteResolvers.Query,
    ...coachResolvers.Query,
    ...weighInResolvers.Query,
    ...competitionResolvers.Query,
    ...matchResolvers.Query,
    ...promotionResolvers.Query,
    ...athleteStatsResolvers.Query,
    ...trainingResolvers.Query,
    ...injuryResolvers.Query,
  },
  Mutation: {
    ...athleteResolvers.Mutation,
    ...coachResolvers.Mutation,
    ...weighInResolvers.Mutation,
    ...competitionResolvers.Mutation,
    ...matchResolvers.Mutation,
    ...promotionResolvers.Mutation,
    ...trainingResolvers.Mutation,
    ...injuryResolvers.Mutation,
  },
  User: userResolvers.User,
  Athlete: {
    ...athleteResolvers.Athlete,
    ...promotionResolvers.Athlete,
    ...trainingResolvers.Athlete,
    ...injuryResolvers.Athlete,
  },
  Coach: coachResolvers.Coach,
  Competition: competitionResolvers.Competition,
  Entry: { ...competitionResolvers.Entry, ...matchResolvers.Entry },
  Match: matchResolvers.Match,
  Promotion: promotionResolvers.Promotion,
  TrainingSession: trainingResolvers.TrainingSession,
  Attendance: trainingResolvers.Attendance,
  Injury: injuryResolvers.Injury,
};
