// backend/src/domain/judo/scoreTypes.ts
// Espelha o enum Prisma `ScoreType` (backend/prisma/schema.prisma), usado
// nas lutas registradas em Match. Centralizado aqui para servir de fonte
// única às regras de judô (ver ./rules.ts) e a qualquer resolver que
// precise dos rótulos em português.

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
