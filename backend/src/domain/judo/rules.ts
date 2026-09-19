// backend/src/domain/judo/rules.ts
import type { SportRules } from "../sports/types";
import {
  AGE_DIVISIONS,
  AgeDivision,
  Sex,
  getWeightClassTable,
} from "./weightClasses";
import { BELT_RANKS, BELT_RANK_LABELS } from "./beltRanks";
import { SCORE_TYPES, SCORE_TYPE_LABELS } from "./scoreTypes";

export const judoRules: SportRules = {
  slug: "judo",
  name: "Judô",

  getWeightClasses(ageDivision, sex) {
    if (!(AGE_DIVISIONS as readonly string[]).includes(ageDivision)) return [];
    if (sex !== "M" && sex !== "F") return [];
    return getWeightClassTable(ageDivision as AgeDivision, sex as Sex);
  },

  getRankSystem() {
    return BELT_RANKS.map((rank) => ({ rank, label: BELT_RANK_LABELS[rank] }));
  },

  getMatchScoreTypes() {
    return SCORE_TYPES.map((code) => ({ code, label: SCORE_TYPE_LABELS[code] }));
  },
};
