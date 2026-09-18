// frontend/src/domain/competitionLevels.ts
export const COMPETITION_LEVELS = [
  "REGIONAL",
  "ESTADUAL",
  "NACIONAL",
  "INTERNACIONAL",
] as const;

export type CompetitionLevel = (typeof COMPETITION_LEVELS)[number];

export const COMPETITION_LEVEL_LABELS: Record<CompetitionLevel, string> = {
  REGIONAL: "Regional",
  ESTADUAL: "Estadual",
  NACIONAL: "Nacional",
  INTERNACIONAL: "Internacional",
};
