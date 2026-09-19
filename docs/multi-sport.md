---
titulo: Fundação multi-modalidade
data: 2026-09-19
status: preparação — judô continua sendo a única modalidade em uso
---

# Fundação multi-modalidade

O JudoTracker foi construído só para judô. Este documento descreve a
preparação de arquitetura feita para que, no futuro, o sistema possa
suportar outras modalidades (jiu-jitsu, luta olímpica, etc.) sem precisar
reescrever o núcleo do produto — **sem mudar nenhum comportamento atual**.
Não existe UI de seleção de esporte; todo dado novo continua sendo
implicitamente judô.

## O que existe hoje

### 1. Model `Sport`

```prisma
model Sport {
  id   String @id @default(uuid())
  name String
  slug String @unique

  teams            Team[]
  competitions     Competition[]
  trainingSessions TrainingSession[]
}
```

`Team`, `Competition` e `TrainingSession` ganharam `sportId String
@default("a0000000-0000-4000-8000-000000000001")` — esse UUID fixo é o id
do registro `Sport` semeado como judô na migration
`20260719150000_add_sport_foundation`. Como é um default a nível de banco,
**nenhum resolver precisou mudar**: `createCompetition`,
`createTrainingSession` etc. continuam funcionando exatamente como antes,
só que agora toda linha criada já nasce vinculada ao judô automaticamente.

`Athlete`, `Entry`, `Match`, `Promotion`, `Attendance` e `Injury`
propositalmente **não** ganharam `sportId` — eles penduram em `Athlete`,
`Competition` ou `TrainingSession`, que já carregam a modalidade. Adicionar
a mesma coluna nessas tabelas seria redundante e um lugar a mais para os
dados divergirem.

### 2. Interface `SportRules`

Regras que hoje estão espalhadas pelo domínio do judô (categorias de peso,
progressão de faixas, formas de pontuação de luta) foram isoladas atrás de
um contrato único:

```
backend/src/domain/
  sports/
    types.ts       # interface SportRules
    registry.ts     # SPORT_REGISTRY (slug -> SportRules) + getSportRules()
  judo/
    weightClasses.ts  # categorias de peso oficiais CBJ (Prompt 3)
    beltRanks.ts        # progressão de faixas CBJ (Prompt 4)
    scoreTypes.ts         # formas de pontuação de luta (enum ScoreType)
    rules.ts                # judoRules: SportRules — junta os três acima
```

```ts
// backend/src/domain/sports/types.ts
export interface SportRules {
  readonly slug: string;
  readonly name: string;
  getWeightClasses(ageDivision: string, sex: string): WeightClassRule[];
  getRankSystem(): RankRule[];
  getMatchScoreTypes(): MatchScoreTypeRule[];
}
```

`backend/src/domain/judo/rules.ts` implementa essa interface reaproveitando
as funções já existentes de `weightClasses.ts` e `beltRanks.ts` — nenhuma
regra de negócio foi duplicada ou reescrita, só isolada num só lugar sob um
contrato nomeado.

Os resolvers que hoje usam essas regras diretamente (ex.:
`athleteResolvers.Athlete.currentWeightClass`, que importa
`getAgeDivision`/`getWeightClass` de `domain/judo/weightClasses`)
continuam chamando as funções específicas do judô — eles ainda não
precisam saber que `SportRules` existe, porque só há uma modalidade em
uso. O registry existe para quando isso deixar de ser verdade.

## Como adicionar uma nova modalidade no futuro

1. Criar `backend/src/domain/<slug>/` com as regras específicas da
   modalidade (categorias de peso/graduação/pontuação, se aplicável —
   podem ser listas vazias ou uma implementação mínima se a modalidade não
   tiver um conceito equivalente).
2. Implementar `SportRules` em `backend/src/domain/<slug>/rules.ts`.
3. Registrar em `backend/src/domain/sports/registry.ts`:
   ```ts
   const SPORT_REGISTRY: Record<string, SportRules> = {
     judo: judoRules,
     "novo-esporte": novoEsporteRules,
   };
   ```
4. Adicionar o registro correspondente em `Sport` (migration de dados ou
   seed), com o mesmo `slug`.
5. Só então: expor `sportId`/seleção de esporte no GraphQL e na UI (fora do
   escopo desta preparação — nenhuma tela de seleção de esporte foi
   criada).

## O que propositalmente não foi feito

- **Nenhuma UI de seleção de esporte.** Todo formulário de criar
  competição/sessão de treino continua sem campo de esporte.
- **Nenhum resolver foi generalizado** para usar `SportRules` dinamicamente
  a partir do `sportId` de uma entidade — isso só faz sentido quando
  houver uma segunda modalidade real para validar o desenho contra ela.
- **Sem migração de dados condicional por esporte.** Os cálculos de
  categoria de peso, faixa atual e afins continuam chamando as funções de
  judô diretamente; eles só precisarão indireção pelo registry quando
  existir um atleta de outra modalidade no banco.
