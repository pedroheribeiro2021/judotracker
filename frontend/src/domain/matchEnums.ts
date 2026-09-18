// frontend/src/domain/matchEnums.ts
export const MATCH_ROUNDS = [
  "eliminatória",
  "repescagem",
  "semifinal",
  "final",
  "disputa de bronze",
] as const;

export const MATCH_RESULTS = ["WIN", "LOSS", "DRAW"] as const;
export type MatchResult = (typeof MATCH_RESULTS)[number];

export const MATCH_RESULT_LABELS: Record<MatchResult, string> = {
  WIN: "Vitória",
  LOSS: "Derrota",
  DRAW: "Empate",
};

export const SCORE_TYPES = [
  "IPPON",
  "WAZA_ARI",
  "WAZA_ARI_AWASETE_IPPON",
  "DECISION",
  "HANSOKU_MAKE",
  "FUSEN_GACHI",
] as const;
export type ScoreType = (typeof SCORE_TYPES)[number];

export const SCORE_TYPE_LABELS: Record<ScoreType, string> = {
  IPPON: "Ippon",
  WAZA_ARI: "Waza-ari",
  WAZA_ARI_AWASETE_IPPON: "Waza-ari awasete ippon",
  DECISION: "Decisão dos árbitros",
  HANSOKU_MAKE: "Hansoku-make",
  FUSEN_GACHI: "Fusen-gachi (W.O.)",
};

export const MEDALS = ["GOLD", "SILVER", "BRONZE", "NONE"] as const;
export type Medal = (typeof MEDALS)[number];

export const MEDAL_LABELS: Record<Medal, string> = {
  GOLD: "Ouro",
  SILVER: "Prata",
  BRONZE: "Bronze",
  NONE: "Sem medalha",
};

export const MEDAL_EMOJI: Record<Exclude<Medal, "NONE">, string> = {
  GOLD: "🥇",
  SILVER: "🥈",
  BRONZE: "🥉",
};
