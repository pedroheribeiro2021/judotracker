// frontend/src/domain/trainingTypes.ts
export const TRAINING_TYPES = [
  "TECHNICAL",
  "RANDORI",
  "PHYSICAL",
  "KATA",
  "COMPETITION_PREP",
] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number];

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  TECHNICAL: "Técnico",
  RANDORI: "Randori",
  PHYSICAL: "Físico",
  KATA: "Kata",
  COMPETITION_PREP: "Preparação para competição",
};
