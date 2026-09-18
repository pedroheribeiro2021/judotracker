// backend/src/domain/beltRanks.ts
//
// Progressão oficial de faixas do judô brasileiro, conforme o "Regulamento
// para Exame e Outorga de Faixas e Graus" da CBJ (Conselho Nacional de
// Graus, 2018) — da faixa branca à faixa vermelha 10º Dan. Inclui as faixas
// bicolores de transição do sistema infantil (Branca/Cinza, Cinza/Azul,
// Azul/Amarela, Amarela/Laranja).
//
// Idade mínima e carência mínima (tempo na faixa anterior) são as
// recomendadas/exigidas pela CBJ; ficam aqui só como referência/documentação
// — o app não bloqueia o registro de uma promoção que não as cumpra, pois
// quem decide a graduação é o professor/banca examinadora, não o sistema.

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

/** idade mínima (anos) e carência mínima (meses) na faixa anterior, por regulamento CBJ */
export const BELT_RANK_REQUIREMENTS: Record<
  BeltRank,
  { minAge: number | null; minTenureMonths: number | null }
> = {
  WHITE: { minAge: null, minTenureMonths: null },
  WHITE_GREY: { minAge: 4, minTenureMonths: 3 },
  GREY: { minAge: 5, minTenureMonths: 3 },
  GREY_BLUE: { minAge: 6, minTenureMonths: 6 },
  BLUE: { minAge: 7, minTenureMonths: 6 },
  BLUE_YELLOW: { minAge: 8, minTenureMonths: 6 },
  YELLOW: { minAge: 9, minTenureMonths: 6 },
  YELLOW_ORANGE: { minAge: 10, minTenureMonths: 12 },
  ORANGE: { minAge: 11, minTenureMonths: 12 },
  GREEN: { minAge: 12, minTenureMonths: 12 },
  PURPLE: { minAge: 13, minTenureMonths: 12 },
  BROWN: { minAge: 14, minTenureMonths: 12 },
  BLACK_1DAN: { minAge: 16, minTenureMonths: 24 },
  BLACK_2DAN: { minAge: 20, minTenureMonths: 48 },
  BLACK_3DAN: { minAge: 25, minTenureMonths: 60 },
  BLACK_4DAN: { minAge: 31, minTenureMonths: 72 },
  BLACK_5DAN: { minAge: 37, minTenureMonths: 72 },
  RED_WHITE_6DAN: { minAge: 44, minTenureMonths: 84 },
  RED_WHITE_7DAN: { minAge: 52, minTenureMonths: 96 },
  RED_WHITE_8DAN: { minAge: 60, minTenureMonths: 96 },
  RED_9DAN: { minAge: 69, minTenureMonths: 108 },
  RED_10DAN: { minAge: 78, minTenureMonths: 108 },
};
