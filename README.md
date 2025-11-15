# SummitStride

Full‑stack training companion for ultra‑trail runners: build personalized plans, track sessions and nutrition, sync activities, and plan races — all in one modern monorepo.

## Tech Stack
- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- Backend: Fastify 4 (TypeScript), Prisma 5, PostgreSQL 16 + PostGIS, Redis
- Shared: TypeScript contracts and Zod schemas
- Monorepo: Turborepo + npm workspaces
- Tooling: ESLint, Prettier, Husky

## What It Does
- Generates structured training plans (base/build/peak/taper) with sessions
- Tracks workouts and nutrition, with course and race planning
- Syncs activities via Strava (integration routes included)
- Exposes a typed API and shared models between backend and frontend

## Monorepo Structure
```
SummitStride/
├─ packages/
│  ├─ frontend/   # Next.js app (app/)
│  ├─ backend/    # Fastify API + Prisma schema (prisma/)
│  └─ shared/     # Shared TS types, Zod schemas, utils
├─ docker/        # Docker compose & assets (Postgres, Redis)
├─ scripts/       # Automation scripts (e.g., seeding)
├─ docs/          # Additional documentation
└─ seed-test-data.js
```

## Getting Started
Prereqs: Node 18+, npm 8+, Docker Compose (for DB/Redis)

```bash
npm install
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
docker-compose up -d   # start Postgres + Redis

# develop all workspaces in parallel
npm run dev

# or scope to one package
npm run dev -- --filter=@summitstride/backend
```

## Useful Scripts
```bash
npm run build             # turbo build across workspaces
npm run lint              # lint all packages
npm run type-check        # TS type checking
npm run format:check      # verify Prettier formatting
npm run db:migrate -- --filter=@summitstride/backend  # Prisma migrations
npm run db:studio  -- --filter=@summitstride/backend  # Prisma Studio
npm run seed:test-data    # seed sample data
```

## Local URLs
- Frontend: http://localhost:3000
- API: http://localhost:4000
- Health: http://localhost:4000/health

## Configuration
- Copy `.env.example` files (root and `packages/backend/`) and adjust values
- See `docker-compose.yml` for default DB/Redis credentials
