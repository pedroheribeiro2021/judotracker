# JudoTracker

Acompanhamento de atletas de judô: atletas e treinadores, pesagens com alerta
de corte de peso, graduações (faixas CBJ), treinos com chamada, competições
com súmula luta a luta, lesões e estatísticas por atleta. Autenticação por
papel (treinador/admin vs atleta). Frontend é PWA instalável (Android/iPhone).
README (em inglês, voltado a portfólio) resume produto e arquitetura.

## Stack

- **Backend**: Node.js + TypeScript, Apollo Server 3 (GraphQL), Prisma ORM,
  PostgreSQL, Firebase Admin (verificação de token).
- **Frontend**: React 18 + TypeScript, Vite, Apollo Client, React Router,
  React Hook Form + Zod, Tailwind CSS, Recharts, Firebase (auth client).
- **PWA**: `vite-plugin-pwa` (manifest + service worker `autoUpdate`; cacheia
  só o casco do app, nunca respostas GraphQL). Ícones em `frontend/public/`.
- **Infra local**: Postgres via `docker-compose.yml` (porta host `5433`).
- **Staging (Vercel + Supabase)**: frontend `judotracker-web-staging` e backend
  `judotracker-api-staging` (função serverless, região `cle1`), ambos com
  branch de produção `develop`. Banco no schema `judotracker` do projeto
  Supabase `rachaconta`, acessado pelo role `judotracker_app` (ADR-001/002).
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) — lint, testes e build do
  backend; lint, testes, typecheck e build do frontend, em push para
  `develop`/`main` e PR para `develop`.

## Estrutura

```
backend/
  api/graphql.ts      # função serverless da Vercel (reaproveita src/app.ts)
  vercel.json          # rewrite /graphql -> /api/graphql
  src/
    app.ts            # app Express + ApolloServer (typeDefs + resolvers + context)
    index.ts          # servidor local (listen na porta 4000, /graphql)
    context.ts         # Context (prisma, currentUser), requireAuth/requireCoach, createContext
    db.ts              # PrismaClient único (uma conexão por instância serverless)
    schema/             # typeDefs por domínio (athlete, coach, competition, match,
                         # promotion, training, injury, weighIn, user...) + root.ts
    resolvers/           # resolvers por domínio (com *.test.ts), mesclados em resolvers/index.ts
    domain/judo/         # regras CBJ: categorias de peso, classes etárias, faixas, pontuações
    domain/sports/       # registry multi-modalidade (docs/multi-sport.md)
    auth/index.ts        # verifica token Firebase e sincroniza User local (Prisma)
    firebase/admin.ts    # inicialização do Firebase Admin SDK
    prisma/seed.ts        # seed de dados de desenvolvimento
  prisma/schema.prisma    # modelos: User, Athlete, Coach, Team, WeighIn,
                           # BodyMeasurement, Competition, Entry, Media, AuditLog

frontend/
  vercel.json            # rewrite de SPA (rotas internas → index.html)
  vite.config.ts          # React + PWA (manifest, workbox)
  public/                 # ícones do PWA (judogi) e imagens
  src/
    pages/               # Dashboard, Competitions, Trainings, AthletePage, Login
    components/           # formulários e modais de domínio (CreateAthleteForm,
                           # EditAthleteForm, AthleteDetailModal, RecordWeighInForm, ...)
    ui/components/         # design system próprio (Button, Card, Modal, Badge,
                           # MonthCalendar, ...); tokens em ui/tokens/colors.css
    domain/                # regras do front: weightCut, dates (datas "só dia"),
                           # pwa, labels de enums
    components/InstallHint.tsx, OfflineBanner.tsx  # convite de instalação / sem conexão
    graphql/               # client.ts (Apollo Client) e queries.ts (todas as
                           # operações GraphQL usadas pelo front)
    contexts/AuthContext.tsx  # estado de autenticação (Firebase)
    firebase/firebase.ts      # inicialização do Firebase client
```

Modelos do schema Prisma ainda **sem UI/resolvers**: `BodyMeasurement`,
`Media`, `Team`, `AuditLog`, `Sport` (fundação multi-modalidade preparada
em `docs/multi-sport.md`; hoje só judô é usado, sem UI de seleção).

## Convenções

- **Schema GraphQL modular**: cada domínio tem seu `schema/<dominio>.ts` com
  `extend type Query`/`extend type Mutation` (o tipo base vazio vive em
  `schema/root.ts`) e seu `resolvers/<dominio>.ts`. Ao adicionar um domínio
  novo, registre os typeDefs em `schema/index.ts` e os resolvers em
  `resolvers/index.ts`.
- **Autorização**: use os helpers `requireAuth`/`requireCoach` de
  `context.ts` no início de cada resolver protegido — não duplique a lógica
  de checagem de papel.
- **Atualizações parciais (Prisma)**: em resolvers de `update`, um campo
  ausente no input deve virar `undefined` (Prisma ignora e não altera a
  coluna); só passe `null` quando o input explicitamente enviar `null`
  (ex.: desvincular `coachId`). Evite o padrão `input.campo || null`, que
  apaga o valor sempre que o campo não é enviado.
- **Schema do banco**: tudo vive no schema Postgres `judotracker` (não
  `public`), porque a staging divide um projeto Supabase com outros apps. Todo
  model/enum novo leva `@@schema("judotracker")`, e migrations geradas devem
  referenciar `"judotracker".`. Ver `docs/ADR/ADR-001-schema-dedicado-supabase.md`.
- **Papéis de usuário**: hoje definidos por lista fixa `COACH_EMAILS` em
  `backend/src/auth/index.ts` (MVP). Se crescer, migrar para flag no banco
  ou custom claims do Firebase.
- **Frontend/GraphQL**: toda operação usada pelo front fica centralizada em
  `frontend/src/graphql/queries.ts`; não escreva `gql` inline nos
  componentes.
- **Datas "só dia"** (nascimento, data da prova, prazo, graduação, lesão) são
  gravadas como meia-noite UTC. Exiba sempre com `formatDateOnly`/`toDateOnly`
  de `frontend/src/domain/dates.ts` — `new Date()` + `format` mostra o dia
  anterior no Brasil. Campos com horário (pesagens, treinos) usam fuso local.
  Formulários enviam `YYYY-MM-DD`.
- **Números na UI** em pt-BR (`formatDecimal`): `33,3%`, não `33.3%`.
- **Cores**: use as classes mapeadas no `tailwind.config.js` (`brand-*`,
  `surface-*`, `text-default`/`text-muted`, `danger-500`...). Classe fora
  do config não gera CSS nenhum, sem erro.
- **Mobile-first**: estilos base para o celular, `sm:`/`md:` para telas
  maiores. Nada de `min-w` maior que a tela fora de um contêiner
  `overflow-x-auto`; listas densas viram cartões abaixo de `sm`.
- **Lockfile no Windows**: `npm install`/`uninstall` pode apagar do
  `package-lock.json` entradas de esbuild de outras plataformas (inclusive
  Linux, usado no CI/Vercel). Confira o diff do lock antes de commitar.
- **Design system**: componentes de UI genéricos (botão, input, modal,
  tabela, badge...) vivem em `frontend/src/ui/components` e são
  reexportados por `frontend/src/ui/index.ts`. Componentes de domínio
  (formulários, modais específicos) importam daqui em vez de recriar
  estilos.

## Comandos

### Backend (`backend/`)
```
npm run dev              # servidor GraphQL em watch mode (ts-node-dev)
npm run build             # compila para dist/
npm run start              # roda o build (dist/index.js)
npm run lint                # ESLint
npm run format               # Prettier --write
npx tsc --noEmit               # typecheck sem build
npm run prisma:generate         # gera o Prisma Client
npm run prisma:migrate:dev       # cria/aplica migration em dev
npm run prisma:studio             # abre o Prisma Studio
npm run seed                       # popula dados de desenvolvimento
```

### Frontend (`frontend/`)
```
npm run dev         # Vite dev server
npm run build         # build de produção (gera frontend/dist, não versionado)
npm run typecheck       # tsc --noEmit
npm run lint              # ESLint
npm run format              # Prettier --write
```

### Infra
```
docker-compose up -d db   # sobe Postgres local na porta 5433
```

## Variáveis de ambiente

- `backend/.env`: `DATABASE_URL` (com `?schema=judotracker`), `GOOGLE_APPLICATION_CREDENTIALS` (chave
  de service account do Firebase — não versionar; ver `backend/keys/`,
  ignorado no git).
- `frontend/.env`: `VITE_GRAPHQL_URL` + `VITE_FIREBASE_*` (config do
  Firebase client).

- **Vercel (staging)**: `judotracker-api-staging` usa `DATABASE_URL` (pooler
  `aws-1-us-east-2`, porta 6543, usuário `judotracker_app.<ref>`,
  `?pgbouncer=true&connection_limit=1&schema=judotracker`) e
  `FIREBASE_SERVICE_ACCOUNT` (JSON). `judotracker-web-staging` usa
  `VITE_GRAPHQL_URL` + `VITE_FIREBASE_*`. Variável nova só vale após redeploy.

Nenhum dos dois `.env` é versionado; não existe `.env.example` ainda —
ao criar uma variável nova, considere adicionar um exemplo.
