// backend/src/schema/index.ts
import { rootTypeDefs } from "./root";
import { userTypeDefs } from "./user";
import { athleteTypeDefs } from "./athlete";
import { coachTypeDefs } from "./coach";
import { weighInTypeDefs } from "./weighIn";

export const typeDefs = [
  rootTypeDefs,
  userTypeDefs,
  athleteTypeDefs,
  coachTypeDefs,
  weighInTypeDefs,
];
