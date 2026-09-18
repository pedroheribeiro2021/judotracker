// frontend/src/domain/beltRanks.ts
// Espelha backend/src/domain/beltRanks.ts (progressão oficial CBJ de faixas).

export const BELT_RANKS = [
  "WHITE",
  "WHITE_GREY",
  "GREY",
  "GREY_BLUE",
  "BLUE",
  "BLUE_YELLOW",
  "YELLOW",
  "YELLOW_ORANGE",
  "ORANGE",
  "GREEN",
  "PURPLE",
  "BROWN",
  "BLACK_1DAN",
  "BLACK_2DAN",
  "BLACK_3DAN",
  "BLACK_4DAN",
  "BLACK_5DAN",
  "RED_WHITE_6DAN",
  "RED_WHITE_7DAN",
  "RED_WHITE_8DAN",
  "RED_9DAN",
  "RED_10DAN",
] as const;

export type BeltRank = (typeof BELT_RANKS)[number];

export const BELT_RANK_LABELS: Record<BeltRank, string> = {
  WHITE: "Branca",
  WHITE_GREY: "Branca/Cinza (11º Kyû)",
  GREY: "Cinza (10º Kyû)",
  GREY_BLUE: "Cinza/Azul (9º Kyû)",
  BLUE: "Azul (8º Kyû)",
  BLUE_YELLOW: "Azul/Amarela (7º Kyû)",
  YELLOW: "Amarela (6º Kyû)",
  YELLOW_ORANGE: "Amarela/Laranja (5º Kyû)",
  ORANGE: "Laranja (4º Kyû)",
  GREEN: "Verde (3º Kyû)",
  PURPLE: "Roxa (2º Kyû)",
  BROWN: "Marrom (1º Kyû)",
  BLACK_1DAN: "Preta 1º Dan",
  BLACK_2DAN: "Preta 2º Dan",
  BLACK_3DAN: "Preta 3º Dan",
  BLACK_4DAN: "Preta 4º Dan",
  BLACK_5DAN: "Preta 5º Dan",
  RED_WHITE_6DAN: "Vermelha e Branca 6º Dan",
  RED_WHITE_7DAN: "Vermelha e Branca 7º Dan",
  RED_WHITE_8DAN: "Vermelha e Branca 8º Dan",
  RED_9DAN: "Vermelha 9º Dan",
  RED_10DAN: "Vermelha 10º Dan",
};

/** Cor(es) de fundo da faixa (2 cores = bicolor/transição) e cor do texto do badge. */
export const BELT_RANK_COLORS: Record<
  BeltRank,
  { colors: [string] | [string, string]; text: string }
> = {
  WHITE: { colors: ["#FFFFFF"], text: "#1f2937" },
  WHITE_GREY: { colors: ["#FFFFFF", "#9CA3AF"], text: "#1f2937" },
  GREY: { colors: ["#9CA3AF"], text: "#FFFFFF" },
  GREY_BLUE: { colors: ["#9CA3AF", "#2563EB"], text: "#FFFFFF" },
  BLUE: { colors: ["#2563EB"], text: "#FFFFFF" },
  BLUE_YELLOW: { colors: ["#2563EB", "#FACC15"], text: "#1f2937" },
  YELLOW: { colors: ["#FACC15"], text: "#1f2937" },
  YELLOW_ORANGE: { colors: ["#FACC15", "#F97316"], text: "#1f2937" },
  ORANGE: { colors: ["#F97316"], text: "#FFFFFF" },
  GREEN: { colors: ["#16A34A"], text: "#FFFFFF" },
  PURPLE: { colors: ["#7C3AED"], text: "#FFFFFF" },
  BROWN: { colors: ["#78350F"], text: "#FFFFFF" },
  BLACK_1DAN: { colors: ["#111827"], text: "#FFFFFF" },
  BLACK_2DAN: { colors: ["#111827"], text: "#FFFFFF" },
  BLACK_3DAN: { colors: ["#111827"], text: "#FFFFFF" },
  BLACK_4DAN: { colors: ["#111827"], text: "#FFFFFF" },
  BLACK_5DAN: { colors: ["#111827"], text: "#FFFFFF" },
  RED_WHITE_6DAN: { colors: ["#DC2626", "#FFFFFF"], text: "#111827" },
  RED_WHITE_7DAN: { colors: ["#DC2626", "#FFFFFF"], text: "#111827" },
  RED_WHITE_8DAN: { colors: ["#DC2626", "#FFFFFF"], text: "#111827" },
  RED_9DAN: { colors: ["#DC2626"], text: "#FFFFFF" },
  RED_10DAN: { colors: ["#DC2626"], text: "#FFFFFF" },
};
