# Registro de sessões — JudoTracker

## 2026-09-27 (tarde) — Revisão mobile e bugs de exibição

**Objetivo**: revisar o staging em largura de celular (375px) e corrigir o
que o primeiro uso real revelou.

**Alterações (PR #30)**
- `frontend/vercel.json`: rewrite de SPA. F5 ou link direto em rotas
  internas davam 404 da Vercel.
- `domain/dates.ts`: datas "só dia" exibidas a partir do UTC. No fuso de
  Brasília apareciam um dia antes (nascimento, prova, prazo, graduação, lesão).
- `tailwind.config.js`: tokens `surface`/`text` mapeados para
  `ui/tokens/colors.css`. 61 usos de classes sem CSS gerado.
- Dashboard em cartões no celular; badges de peso com `gap`; navegação de
  semana compacta; números com vírgula decimal; eixo do gráfico com inteiros.
- Dados: horários dos treinos do seed corrigidos (16h → 19h).

**Decisões**: manter um único frontend na Vercel (`judotracker-web-staging`,
branch `develop`). O `judotracker-web` será excluído manualmente.

**Aprendizados**
- A revisão mobile via Chrome funciona carregando o app num `iframe` de
  375px na mesma origem: a sessão do Firebase é compartilhada e o zoom do
  navegador não interfere.
- Datas sem horário gravadas como meia-noite UTC precisam ser exibidas pelos
  componentes UTC. Formulários devem mandar `YYYY-MM-DD` (o
  `CompetitionForm` já faz isso).


## 2026-09-19 → 2026-09-27 — Staging novo (Supabase + Vercel)

**Objetivo**: o frontend de staging dava HTTP 400 porque o backend antigo
(Render) estava parado num código anterior ao Prompt 1. Montar um staging
novo e funcional. A sessão foi interrompida por limite de uso e por um
reinício do PC, e retomada em 2026-09-27.

**Alterações**
- Banco: schema `judotracker` no projeto Supabase `rachaconta`, com as 8
  migrations aplicadas e registradas em `judotracker._prisma_migrations`.
  Role dedicado `judotracker_app` (ADR-001, ADR-002).
- Prisma com multiSchema; migrations reescritas de `"public"` para
  `"judotracker"` (PR #25).
- Backend serverless na Vercel (`judotracker-api-staging`, região `cle1`,
  branch de produção `develop`): `src/app.ts` compartilhado entre dev local e
  `api/graphql.ts` (PR #25); correção do output dir do build e Prisma Client
  único (PR #26).
- Erro de banco não aparece mais como "Not authenticated"; cache do Apollo
  limitado (PR #27).
- Frontend: `VITE_GRAPHQL_URL` do `judotracker-web-staging` apontando para a
  API nova.
- Seed de demonstração no staging: 2 treinadores, 10 atletas, 100 pesagens,
  34 graduações, 6 competições, 23 inscrições, 38 lutas, 48 treinos com
  chamada, 4 lesões (2 ativas).
- Calendário mensal (`ui/MonthCalendar`) em Treinos e Competições, dia da
  semana em pt-BR, margem dos badges de peso, remoção do `@types/date-fns@2`
  (PR #28, aguardando merge).
- Manual do usuário em HTML publicado como artifact:
  https://claude.ai/artifact/SXGJvMAri9LJc4zTEzKZLL

**Arquivos principais**: `backend/prisma/schema.prisma`,
`backend/prisma/migrations/*`, `backend/src/{app,db,index}.ts`,
`backend/src/auth/index.ts`, `backend/api/graphql.ts`, `backend/vercel.json`,
`frontend/src/ui/components/{MonthCalendar,Badge}.tsx`,
`frontend/src/pages/{Trainings,Competitions,Dashboard}.tsx`, `docs/ADR/*`.

**Decisões**: ADR-001 (schema dedicado), ADR-002 (usuário de banco
dedicado). Nada foi apagado nos projetos Supabase compartilhados; todas as
mudanças no `rachaconta` foram aditivas e restritas ao schema `judotracker`
(mais o role `judotracker_app`).

**Aprendizados**
- O pooler do Supabase deste projeto fica em `aws-1-us-east-2`. Com `aws-0`
  o erro é `tenant/user not found`.
- No Windows, o `npm uninstall` apagou do lockfile entradas de esbuild para
  Linux. Remover pacotes editando o lockfile manualmente, ou conferir o diff.
- Vercel com framework "Other" exige output dir não vazio mesmo para projetos
  só de API.

**Pendências / próximos passos**: ver `Pendencias.md`. O próximo passo é a
revisão mobile, depois do merge do PR #28 (feita na sessão seguinte, acima).
