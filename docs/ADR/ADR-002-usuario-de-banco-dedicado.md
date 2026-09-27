# ADR-002 — Usuário de banco dedicado `judotracker_app`

- **Data**: 2026-09-27
- **Status**: aceito
- **Relacionado**: ADR-001 (schema dedicado no Supabase)

## Contexto

O backend na Vercel precisa de uma `DATABASE_URL` com usuário e senha do
Postgres. O projeto Supabase `rachaconta` é compartilhado com outros apps, e
a senha do usuário `postgres` não era conhecida. Resetá-la arriscaria
quebrar qualquer outro consumidor que dependa dela, como o Supabase CLI usado
no HealthIA.

Usar a chave de API do Supabase no lugar da senha não funciona: ela só dá
acesso à API HTTP (PostgREST/supabase-js). O Prisma fala o protocolo do
Postgres e precisa de credencial de banco. Migrar para supabase-js exigiria
expor o schema `judotracker` na Data API, onde os usuários anônimos do
fut-inss também têm papel `authenticated`.

## Decisão

- Criar o role `judotracker_app` (LOGIN, sem superuser/createdb/createrole)
  com `USAGE` no schema `judotracker` e `SELECT/INSERT/UPDATE/DELETE` nas
  tabelas, mais `ALTER DEFAULT PRIVILEGES` para tabelas futuras criadas pelo
  `postgres`. `search_path = judotracker`.
- A senha é definida pelo dono no SQL Editor (`ALTER ROLE ... PASSWORD`),
  sem passar por ferramentas automatizadas.
- A `DATABASE_URL` da Vercel usa o Transaction pooler:
  `postgresql://judotracker_app.grsqjzrgngpyckcfkxon:<senha>@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=judotracker`

## Consequências

- A senha do `postgres` e os outros apps do projeto ficam intocados.
- O backend não enxerga nenhum outro schema (verificado: zero grants fora de
  `judotracker`).
- O role não pode rodar DDL. Migrations continuam sendo aplicadas como
  `postgres`, via MCP do Supabase ou `supabase db query --linked --file`,
  nunca `db push` (ver ADR-001).
- O host do pooler é **`aws-1`**, não `aws-0`. Com `aws-0` o erro é
  `(ENOTFOUND) tenant/user ... not found`, e isso foi confundido com falha de
  login até o PR #27 separar os dois erros.
