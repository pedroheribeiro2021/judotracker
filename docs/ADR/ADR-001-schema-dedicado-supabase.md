# ADR-001 — Banco de staging em schema dedicado `judotracker` no Supabase

- **Data**: 2026-09-27 (execução iniciada em 2026-09-19)
- **Status**: aceito

## Contexto

O frontend de staging (`judotracker-web-staging.vercel.app`) retornava HTTP 400
porque o backend antigo no Render estava parado num código anterior ao
Prompt 1 e ninguém tinha acesso para atualizá-lo (nem ao Neon por trás dele).

A org Supabase do Pedro está no limite de 2 projetos free (`rachaconta`,
`zerosheet-judotracker`), ambos em uso por outros apps. **Nada nesses projetos
pode ser apagado.** O padrão já usado no HealthIA é um schema Postgres
dedicado dentro do `rachaconta`.

## Decisão

- O banco de staging vive no schema `judotracker` do projeto Supabase
  `rachaconta` (`grsqjzrgngpyckcfkxon`), isolado de `public` e dos outros apps.
- `schema.prisma` declara `schemas = ["judotracker"]` e `@@schema("judotracker")`
  em todo model/enum (multiSchema é GA no Prisma 6.16, sem preview flag).
- As migrations referenciam `"judotracker".` em vez de `"public".`, e a
  inicial faz `CREATE SCHEMA IF NOT EXISTS`. Vale também para o dev local.
- A `DATABASE_URL` leva `?schema=judotracker`, para que a tabela
  `_prisma_migrations` também fique dentro do schema (e não em `public`).
- O schema não é exposto na Data API do Supabase e `anon`/`authenticated`
  não têm `USAGE` nele: o acesso é só pelo backend (Prisma), com auth via Firebase.
- O backend roda como função serverless na Vercel (`backend/api/graphql.ts`,
  que reaproveita a mesma app Express de `src/app.ts` usada no dev local).

## Consequências

- Os checksums das migrations mudaram: um banco local criado antes precisa de
  `npx prisma migrate reset` (usando `?schema=judotracker` na URL local).
- Em serverless, usar a URL do pooler do Supabase (transaction mode, porta
  6543) com `pgbouncer=true&connection_limit=1`. Para `prisma migrate deploy`,
  usar a conexão de sessão (porta 5432).
- Nunca rodar `supabase db push` nesse projeto, porque ele é compartilhado
  (ver o vault, `Global/Infra-Cloud-Compartilhada.md`).
