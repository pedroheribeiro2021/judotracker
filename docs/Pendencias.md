# Pendências — JudoTracker

Atualizado em 2026-09-27. Item concluído sai daqui e vai para o
`Registro-de-Sessoes.md`.

## Em andamento

- [ ] **Merge do PR #28** (calendário em treinos e competições, dia da semana
  em pt-BR, margem dos badges de peso).
- [ ] **Revisão mobile no staging**: navegar por todas as telas em largura de
  celular e corrigir o que quebrar. Já conhecidos: a tabela do Dashboard força
  `min-w-[700px]` (rolagem horizontal no celular; trocar por cartões abaixo de
  `sm`); só 13 de 33 componentes têm ajustes responsivos.

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
