// backend/src/domain/sports/types.ts
//
// Contrato que isola as regras específicas de cada modalidade esportiva do
// resto da aplicação. Hoje só o judô está implementado (ver
// backend/src/domain/judo/rules.ts); ver docs/multi-sport.md para o passo a
// passo de como adicionar uma nova modalidade.

export type WeightClassRule = {
  /** Rótulo exibido, ex.: "-73" ou "+100" */
  label: string;
  /** Limite superior em kg; null = categoria sem teto */
  maxKg: number | null;
};

export type RankRule = {
  /** Valor interno da graduação (ex.: código do enum) */
  rank: string;
  /** Rótulo exibido */
  label: string;
};

export type MatchScoreTypeRule = {
  /** Valor interno da forma de pontuação/finalização (ex.: código do enum) */
  code: string;
  /** Rótulo exibido */
  label: string;
};

export interface SportRules {
  readonly slug: string;
  readonly name: string;

  /** Categorias de peso oficiais de uma classe etária/sexo, em ordem crescente. */
  getWeightClasses(ageDivision: string, sex: string): WeightClassRule[];

  /** Progressão de graduações da modalidade, da mais baixa à mais alta. */
  getRankSystem(): RankRule[];

  /** Formas de pontuação/finalização possíveis numa luta/partida da modalidade. */
  getMatchScoreTypes(): MatchScoreTypeRule[];
}
