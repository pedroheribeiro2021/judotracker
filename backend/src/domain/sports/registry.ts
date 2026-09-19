// backend/src/domain/sports/registry.ts
//
// Registro de modalidades por slug. Para adicionar uma nova modalidade:
//   1. Criar backend/src/domain/<slug>/rules.ts implementando SportRules.
//   2. Registrar aqui em SPORT_REGISTRY.
//   3. Adicionar uma linha em backend/src/prisma/seed.ts (ou uma migration
//      de dados) criando o registro correspondente em Sport, com o mesmo
//      slug.
// Ver docs/multi-sport.md para o passo a passo completo.

import type { SportRules } from "./types";
import { judoRules } from "../judo/rules";

// Id fixo do registro `Sport` do judô, semeado por essa mesma constante na
// migration (backend/prisma/migrations/*_add_sport). Mantém `sportId` das
// tabelas existentes (Team, Competition, TrainingSession) sempre apontando
// para o judô por padrão, sem exigir nenhuma UI de seleção de esporte.
export const JUDO_SPORT_ID = "a0000000-0000-4000-8000-000000000001";

const SPORT_REGISTRY: Record<string, SportRules> = {
  judo: judoRules,
};

export function getSportRules(slug: string): SportRules | undefined {
  return SPORT_REGISTRY[slug];
}

export function listSportRules(): SportRules[] {
  return Object.values(SPORT_REGISTRY);
}
