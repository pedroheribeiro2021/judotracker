# JudoTracker

Athlete management for judo coaches: weigh-ins and weight-cut alerts, belt
promotions, training attendance, competitions with bout-by-bout scoresheets,
injuries and per-athlete performance stats. Built as a full-stack TypeScript
app with a GraphQL API and an installable, mobile-first PWA.

**Live (staging):** https://judotracker-web-staging.vercel.app. Access
requires an account; a demo login is available on request.

> The UI is in Brazilian Portuguese and the domain rules follow the Brazilian
> Judo Confederation (CBJ): official weight classes per age division and the
> full belt progression, from the kids' two-tone belts to 10th dan.

## Features

- **Athlete roster** with belt, weight, age division and coach, plus alerts
  for active injuries, attendance below 50% in the last 30 days and weight
  above the class limit (`+1.4 kg over -73`).
- **Weigh-ins** with a weight trend chart per athlete and the class limit drawn
  on it.
- **Competitions**: upcoming, history and a monthly calendar with registration
  deadlines. Registering an injured athlete asks for confirmation instead of
  blocking.
- **Scoresheets**: every bout with round, opponent, result, score type (ippon,
  waza-ari, hansoku-make…), technique, shidos and golden score, feeding the
  athlete's stats (win rate, ippon wins, most effective techniques, medals).
- **Training sessions** by week or month, with attendance roll call, rates and
  current streak.
- **Belt promotions and injuries** with history; an athlete stays flagged as
  injured until the injury is resolved.
- **Installable PWA** on Android and iPhone, with an offline notice and
  automatic updates on every deploy.

## Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite, Apollo Client, React Router, React Hook Form + Zod, Tailwind CSS, Recharts, date-fns, vite-plugin-pwa |
| Backend  | Node.js, TypeScript, Apollo Server (GraphQL) on Express, Prisma ORM |
| Data     | PostgreSQL (Supabase in staging, Docker locally) |
| Auth     | Firebase Authentication (client) + Firebase Admin token verification (server) |
| Hosting  | Vercel: static frontend + backend as a serverless function |
| Quality  | Vitest + Testing Library (163 tests), ESLint, Prettier, GitHub Actions CI |

## Architecture

```mermaid
flowchart LR
  subgraph Client
    PWA["React PWA<br/>(Vercel)"]
  end
  FB["Firebase Auth"]
  API["Apollo GraphQL API<br/>serverless function (Vercel)"]
  DB[("PostgreSQL<br/>schema judotracker")]

  PWA -- "sign in" --> FB
  PWA -- "GraphQL + Firebase ID token" --> API
  API -- "verify token" --> FB
  API -- "Prisma via transaction pooler" --> DB
```

- **One Express + Apollo app, two entry points.** `backend/src/app.ts` builds
  the server once; `src/index.ts` runs it locally and `api/graphql.ts` wraps it
  as a Vercel function. The instance is memoized across warm invocations.
- **Modular GraphQL schema.** Each domain (athlete, competition, match,
  training, injury, promotion…) owns its type definitions and resolvers.
  Authorization goes through shared `requireAuth` / `requireCoach` /
  `requireSelfOrCoach` helpers.
- **Isolated database in a shared project.** The staging database lives in a
  dedicated Postgres schema accessed by a least-privilege role that can only
  read and write that schema ([ADR-001](docs/ADR/ADR-001-schema-dedicado-supabase.md),
  [ADR-002](docs/ADR/ADR-002-usuario-de-banco-dedicado.md)).
- **Sport-agnostic foundation.** Weight classes, belts and score types sit
  behind a sport registry, so other combat sports can be added without
  touching the resolvers ([docs/multi-sport.md](docs/multi-sport.md)).

## Engineering notes

Problems found and fixed while taking the app from local MVP to a deployed
staging environment:

- **Dates one day off.** Date-only fields (birth date, competition day,
  deadlines) are stored at UTC midnight and rendered in UTC−3, so 2 Nov
  displayed as 1 Nov. They are now rebuilt from UTC components in one helper
  (`frontend/src/domain/dates.ts`), with tests; timestamps such as weigh-ins
  keep local time.
- **Database errors reported as "Not authenticated".** Token verification and
  user lookup shared one `catch`, so a connection failure looked like an auth
  failure. They are now separate, and tests cover each path.
- **Serverless connection handling.** One Prisma client per function instance,
  through Supabase's transaction pooler with `connection_limit=1`.
- **Design tokens that produced no CSS.** 61 class usages pointed to colors
  Tailwind didn't know about. The tokens are now mapped to the CSS variables
  of the design system.
- **Mobile.** The roster becomes stacked cards below the `sm` breakpoint, the
  calendar shows dots with a day list underneath, and deep links work thanks
  to an SPA rewrite.

## Running locally

Requirements: Node 20+, Docker, and a Firebase project (Email/Password
sign-in enabled).

```bash
# Database (Postgres on port 5433)
docker-compose up -d db

# Backend: http://localhost:4000/graphql
cd backend
npm install
# .env: DATABASE_URL=postgresql://postgres:postgres@localhost:5433/judotracker?schema=judotracker
#       GOOGLE_APPLICATION_CREDENTIALS=<path to Firebase service account JSON>
npx prisma migrate deploy
npm run seed
npm run dev

# Frontend: http://localhost:5173
cd ../frontend
npm install
# .env: VITE_GRAPHQL_URL=http://localhost:4000/graphql and VITE_FIREBASE_* keys
npm run dev
```

Coach access is granted by e-mail (`COACH_EMAILS` in
`backend/src/auth/index.ts`); any other account signs in as an athlete.

```bash
npm test          # backend or frontend
npm run lint
npm run typecheck # frontend
```

## Project structure

```
backend/
  api/graphql.ts        Vercel function entry
  prisma/               schema and migrations
  src/
    app.ts              Express + Apollo app
    schema/, resolvers/ GraphQL, one module per domain
    domain/             judo rules: weight classes, belts, score types, sport registry
    auth/               Firebase token verification and user sync
frontend/
  src/
    pages/              Dashboard, Competitions, Trainings, AthletePage
    components/         domain forms and modals
    ui/                 in-house design system (Button, Modal, Badge, MonthCalendar…)
    domain/             client-side rules (weight cut, dates, PWA helpers)
    graphql/            Apollo client and every query/mutation
docs/                   ADRs, session log, pending items
```

## Status

MVP running in a staging environment with demo data. There are no real users
yet. Planned work is tracked in [docs/Pendencias.md](docs/Pendencias.md).
