# Pendências — JudoTracker

Atualizado em 2026-09-27. Item concluído sai daqui e vai para o
`Registro-de-Sessoes.md`.

## Em andamento

- [ ] **Excluir o projeto `judotracker-web` na Vercel** (ação manual do Pedro;
  a trava de segurança do Claude Code bloqueia exclusões). Ele publica a
  `main` apontando para `localhost:4000` e gera builds a cada push.
- [ ] Filtro "Próximas/Histórico" de competições no backend compara com
  `now()` em UTC: uma prova muda para o histórico ~3h antes da meia-noite de
  Brasília. Baixa prioridade.

## Infra / configuração

- [ ] Firebase → Authentication → Authorized domains: adicionar
  `judotracker-web-staging.vercel.app` (só necessário para login por
  popup/redirect).
- [ ] Banco local (docker): `npx prisma migrate reset` com
  `?schema=judotracker` na `DATABASE_URL`, porque os checksums das migrations
  mudaram (ADR-001).
- [ ] Criar `backend/.env.example` e `frontend/.env.example`.
- [ ] Desativar o backend antigo no Render (`judotracker-staging.onrender.com`),
  que não é mais usado.
- [ ] Guardar o seed de demonstração do staging no repositório (hoje o SQL foi
  aplicado direto no Supabase).

## Produto (ideias ainda não priorizadas)

- [ ] UI para modelos que já existem no schema: `BodyMeasurement` (medidas
  corporais), `Team` (equipes), `Media` (fotos/vídeos), `AuditLog`.
- [ ] Área do atleta: o que um usuário com papel ATHLETE vê ao entrar.
- [ ] Papéis por flag no banco ou custom claims, em vez da lista fixa
  `COACH_EMAILS`.
- [ ] Seleção de modalidade (multi-sport já tem fundação, sem UI).
- [ ] Calendário também no Dashboard (próximos treinos e prazos da semana).
- [ ] Upgrade do Apollo Server 3 (fim de vida) para `@apollo/server` 4.
