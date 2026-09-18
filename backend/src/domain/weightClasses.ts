// backend/src/domain/weightClasses.ts
//
// Categorias de peso oficiais do judô brasileiro (CBJ), conforme "Tabelas de
// Classes e Categorias" publicadas pelas federações estaduais (ex.: FPJ
// 2025), que reproduzem a tabela nacional da CBJ. Cobre as classes etárias
// pedidas no roadmap do produto: Sub-13, Sub-15, Sub-18, Sub-21 e Sênior.

export const AGE_DIVISIONS = ["SUB13", "SUB15", "SUB18", "SUB21", "SENIOR"] as const;
export type AgeDivision = (typeof AGE_DIVISIONS)[number];

export const AGE_DIVISION_LABELS: Record<AgeDivision, string> = {
  SUB13: "Sub-13",
  SUB15: "Sub-15",
  SUB18: "Sub-18",
  SUB21: "Sub-21",
  SENIOR: "Sênior",
};

export type Sex = "M" | "F";

export type WeightClass = {
  /** Rótulo exibido, ex.: "-73" ou "+100" (peso ilimitado acima do limite anterior) */
  label: string;
  /** Limite superior em kg da categoria; null = categoria "pesado" sem teto */
  maxKg: number | null;
};

// Cada tabela está em ordem crescente de peso; a última entrada de cada
// classe etária é sempre a categoria "pesado"/"super pesado" (maxKg: null).
const MASCULINO: Record<AgeDivision, WeightClass[]> = {
  SUB13: [
    { label: "-28", maxKg: 28 },
    { label: "-31", maxKg: 31 },
    { label: "-34", maxKg: 34 },
    { label: "-38", maxKg: 38 },
    { label: "-42", maxKg: 42 },
    { label: "-47", maxKg: 47 },
    { label: "-52", maxKg: 52 },
    { label: "-60", maxKg: 60 },
    { label: "+60", maxKg: null },
  ],
  SUB15: [
    { label: "-40", maxKg: 40 },
    { label: "-45", maxKg: 45 },
    { label: "-50", maxKg: 50 },
    { label: "-55", maxKg: 55 },
    { label: "-60", maxKg: 60 },
    { label: "-66", maxKg: 66 },
    { label: "-73", maxKg: 73 },
    { label: "-81", maxKg: 81 },
    { label: "+81", maxKg: null },
  ],
  SUB18: [
    { label: "-50", maxKg: 50 },
    { label: "-55", maxKg: 55 },
    { label: "-60", maxKg: 60 },
    { label: "-66", maxKg: 66 },
    { label: "-73", maxKg: 73 },
    { label: "-81", maxKg: 81 },
    { label: "-90", maxKg: 90 },
    { label: "+90", maxKg: null },
  ],
  SUB21: [
    { label: "-60", maxKg: 60 },
    { label: "-66", maxKg: 66 },
    { label: "-73", maxKg: 73 },
    { label: "-81", maxKg: 81 },
    { label: "-90", maxKg: 90 },
    { label: "-100", maxKg: 100 },
    { label: "+100", maxKg: null },
  ],
  SENIOR: [
    { label: "-60", maxKg: 60 },
    { label: "-66", maxKg: 66 },
    { label: "-73", maxKg: 73 },
    { label: "-81", maxKg: 81 },
    { label: "-90", maxKg: 90 },
    { label: "-100", maxKg: 100 },
    { label: "+100", maxKg: null },
  ],
};

const FEMININO: Record<AgeDivision, WeightClass[]> = {
  SUB13: [
    { label: "-28", maxKg: 28 },
    { label: "-31", maxKg: 31 },
    { label: "-34", maxKg: 34 },
    { label: "-38", maxKg: 38 },
    { label: "-42", maxKg: 42 },
    { label: "-47", maxKg: 47 },
    { label: "-52", maxKg: 52 },
    { label: "-60", maxKg: 60 },
    { label: "+60", maxKg: null },
  ],
  SUB15: [
    { label: "-36", maxKg: 36 },
    { label: "-40", maxKg: 40 },
    { label: "-44", maxKg: 44 },
    { label: "-48", maxKg: 48 },
    { label: "-52", maxKg: 52 },
    { label: "-57", maxKg: 57 },
    { label: "-63", maxKg: 63 },
    { label: "-70", maxKg: 70 },
    { label: "+70", maxKg: null },
  ],
  SUB18: [
    { label: "-40", maxKg: 40 },
    { label: "-44", maxKg: 44 },
    { label: "-48", maxKg: 48 },
    { label: "-52", maxKg: 52 },
    { label: "-57", maxKg: 57 },
    { label: "-63", maxKg: 63 },
    { label: "-70", maxKg: 70 },
    { label: "+70", maxKg: null },
  ],
  SUB21: [
    { label: "-48", maxKg: 48 },
    { label: "-52", maxKg: 52 },
    { label: "-57", maxKg: 57 },
    { label: "-63", maxKg: 63 },
    { label: "-70", maxKg: 70 },
    { label: "-78", maxKg: 78 },
    { label: "+78", maxKg: null },
  ],
  SENIOR: [
    { label: "-48", maxKg: 48 },
    { label: "-52", maxKg: 52 },
    { label: "-57", maxKg: 57 },
    { label: "-63", maxKg: 63 },
    { label: "-70", maxKg: 70 },
    { label: "-78", maxKg: 78 },
    { label: "+78", maxKg: null },
  ],
};

const TABLES: Record<Sex, Record<AgeDivision, WeightClass[]>> = {
  M: MASCULINO,
  F: FEMININO,
};

/**
 * Classe etária pela regra CBJ: idade completada no ano civil da referência
 * (ano da referência - ano de nascimento), não a idade exata em dias. É por
 * isso que, por exemplo, a tabela oficial associa Sub-15 aos nascidos em
 * "2012 / 2011" para a temporada de 2025 (2025-2012=13, 2025-2011=14).
 *
 * As faixas Sub-18 (15-17) e Sub-21 (15-20) se sobrepõem no regulamento
 * oficial (um atleta de 15-17 anos pode disputar como cadete ou júnior,
 * dependendo da competição); aqui adotamos uma partição sem sobreposição —
 * a classe mais nova que ainda cabe — como padrão computado para o atleta,
 * sempre substituível por override manual na inscrição.
 */
export function getAgeDivision(dob: Date, referenceDate: Date): AgeDivision {
  const age = referenceDate.getFullYear() - dob.getFullYear();
  if (age <= 12) return "SUB13";
  if (age <= 14) return "SUB15";
  if (age <= 17) return "SUB18";
  if (age <= 20) return "SUB21";
  return "SENIOR";
}

/** Tabela de categorias de peso de uma classe etária/sexo, em ordem crescente. */
export function getWeightClassTable(
  ageDivision: AgeDivision,
  sex: Sex,
): WeightClass[] {
  return TABLES[sex][ageDivision];
}

/** Categoria de peso (rótulo, ex.: "-73") para um peso, classe etária e sexo dados. */
export function getWeightClass(
  weightKg: number,
  ageDivision: AgeDivision,
  sex: Sex,
): string {
  const table = getWeightClassTable(ageDivision, sex);
  const match = table.find((c) => c.maxKg != null && weightKg <= c.maxKg);
  return (match ?? table[table.length - 1]).label;
}
