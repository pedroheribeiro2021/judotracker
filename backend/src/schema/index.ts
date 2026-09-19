// backend/src/schema/index.ts
import { rootTypeDefs } from "./root";
import { userTypeDefs } from "./user";
import { athleteTypeDefs } from "./athlete";
import { coachTypeDefs } from "./coach";
import { weighInTypeDefs } from "./weighIn";
import { competitionTypeDefs } from "./competition";
import { matchTypeDefs } from "./match";
import { promotionTypeDefs } from "./promotion";
import { athleteStatsTypeDefs } from "./athleteStats";
import { trainingTypeDefs } from "./training";

export const typeDefs = [
  rootTypeDefs,
  userTypeDefs,
  athleteTypeDefs,
  coachTypeDefs,
  weighInTypeDefs,
  competitionTypeDefs,
  matchTypeDefs,
  promotionTypeDefs,
  athleteStatsTypeDefs,
  trainingTypeDefs,
];
