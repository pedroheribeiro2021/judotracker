// frontend/src/domain/injuries.ts
export const INJURY_SEVERITIES = ["MINOR", "MODERATE", "SEVERE"] as const;
export type InjurySeverity = (typeof INJURY_SEVERITIES)[number];

export const INJURY_SEVERITY_LABELS: Record<InjurySeverity, string> = {
  MINOR: "Leve",
  MODERATE: "Moderada",
  SEVERE: "Grave",
};

export type AthleteStatus = "ACTIVE" | "INJURED";
