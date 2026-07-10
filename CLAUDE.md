# JudoTracker

MVP para acompanhamento de atletas de judô: cadastro de atletas e
treinadores, controle de peso (pesagens) e autenticação por papel
(treinador/admin vs atleta).

## Stack

- **Backend**: Node.js + TypeScript, Apollo Server 3 (GraphQL), Prisma ORM,
  PostgreSQL, Firebase Admin (verificação de token).
- **Frontend**: React 18 + TypeScript, Vite, Apollo Client, React Router,
  React Hook Form + Zod, Tailwind CSS, Recharts, Firebase (auth client).
- **Infra local**: Postgres via `docker-compose.yml` (porta host `5433`).
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) — build do backend e
  typecheck + build do frontend em push/PR para `develop`/`main`.

## Estrutura

```
backend/
  src/
    index.ts          # bootstrap do ApolloServer (typeDefs + resolvers + context)
    context.ts         # Context (prisma, currentUser), requireAuth/requireCoach, createContext
    schema/             # typeDefs por domínio (user, athlete, coach, weighIn) + root.ts
    resolvers/           # resolvers por domínio, mesclados em resolvers/index.ts
    auth/index.ts        # verifica token Firebase e sincroniza User local (Prisma)
    firebase/admin.ts    # inicialização do Firebase Admin SDK
    prisma/seed.ts        # seed de dados de desenvolvimento
  prisma/schema.prisma    # modelos: User, Athlete, Coach, Team, WeighIn,
                           # BodyMeasurement, Competition, Entry, Media, AuditLog

frontend/
  src/
    pages/               # Dashboard, Login
    components/           # formulários e modais de domínio (CreateAthleteForm,
                           # EditAthleteForm, AthleteDetailModal, RecordWeighInForm, ...)
    ui/components/         # design system próprio (Button, Card, Modal, Table, ...)
    graphql/               # client.ts (Apollo Client) e queries.ts (todas as
                           # operações GraphQL usadas pelo front)
    contexts/AuthContext.tsx  # estado de autenticação (Firebase)
    firebase/firebase.ts      # inicialização do Firebase client
```

Modelos do schema Prisma ainda **sem UI/resolvers**: `Competition`, `Entry`,
`BodyMeasurement`, `Media`, `Team`, `AuditLog`.

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
- **Papéis de usuário**: hoje definidos por lista fixa `COACH_EMAILS` em
  `backend/src/auth/index.ts` (MVP). Se crescer, migrar para flag no banco
  ou custom claims do Firebase.
- **Frontend/GraphQL**: toda operação usada pelo front fica centralizada em
  `frontend/src/graphql/queries.ts`; não escreva `gql` inline nos
  componentes.
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

- `backend/.env`: `DATABASE_URL`, `GOOGLE_APPLICATION_CREDENTIALS` (chave
  de service account do Firebase — não versionar; ver `backend/keys/`,
  ignorado no git).
- `frontend/.env`: `VITE_GRAPHQL_URL` + `VITE_FIREBASE_*` (config do
  Firebase client).

Nenhum dos dois `.env` é versionado; não existe `.env.example` ainda —
ao criar uma variável nova, considere adicionar um exemplo.
