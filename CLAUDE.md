# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coach IA Hugo is a French ultra-trail coaching application that helps ultra-trail runners prepare optimally for races with personalized training plans, external API integrations, nutritional management, and calendar planning.

## Architecture

### Monorepo Structure
This is a monorepo using npm workspaces + Turbo for build orchestration:
- `packages/frontend/` - Next.js 15 application with TypeScript and Tailwind CSS
- `packages/backend/` - Fastify API server with TypeScript, Prisma ORM, PostgreSQL
- `packages/shared/` - Shared TypeScript types, Zod schemas, and utilities

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Fastify, TypeScript, Prisma ORM, bcryptjs, JWT authentication
- **Database**: PostgreSQL 16 with PostGIS extensions via Docker
- **Cache**: Redis via Docker
- **Build Tool**: Turbo for monorepo orchestration
- **Code Quality**: ESLint, Prettier, TypeScript, Husky + lint-staged

## Common Development Commands

### Development
```bash
npm run dev              # Start all development servers (frontend:3000, backend:4000)
npm run build            # Build all packages
npm run clean            # Clean all build artifacts
```

### Code Quality
```bash
npm run lint             # Lint all packages
npm run type-check       # TypeScript type checking across all packages
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Database Operations
```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio
```

### Infrastructure
```bash
docker-compose up -d     # Start PostgreSQL + Redis containers
```

## Package-Specific Commands

### Frontend (@coach-ia-hugo/frontend)
```bash
cd packages/frontend
npm run dev              # Start dev server with Turbopack (port 3000)
npm run build            # Build with Turbopack
npm run type-check       # TypeScript check
```

### Backend (@coach-ia-hugo/backend)
```bash
cd packages/backend
npm run dev              # Start with tsx watch (port 4000)
npm run build            # Compile TypeScript to dist/
npm run type-check       # TypeScript check
```

### Shared Package (@coach-ia-hugo/shared)
Must be built before other packages can use it:
```bash
cd packages/shared
npm run build            # Compile to dist/ for consumption by frontend/backend
npm run dev              # Watch mode for development
```

## Key Architecture Patterns

### Authentication Flow
- JWT-based authentication handled in `packages/backend/src/routes/auth.ts`
- Auth middleware in `packages/backend/src/middleware/auth.ts`
- Frontend auth context in `packages/frontend/lib/contexts/AuthContext.tsx`
- Auth hooks in `packages/frontend/lib/hooks/useAuth.ts`

### Type Safety
- Shared types defined in `packages/shared/src/types/`
- Zod schemas in `packages/shared/src/schemas/` for runtime validation
- Database models defined in `packages/backend/prisma/schema.prisma`
- Frontend and backend import shared types from `@coach-ia-hugo/shared`

### Database Schema
- User authentication and profiles
- Training plans and sessions with metrics
- Course/race data with geographical information
- Nutrition tracking with food items and meal entries
- Uses Prisma ORM with PostgreSQL + PostGIS

### API Structure
- Fastify server with plugin-based architecture
- Routes organized by domain: auth, users, courses, registrations
- Health checks at `/health` and `/api/db-status`
- CORS and security headers configured

## Development Workflow

1. **Setup**: Run `docker-compose up -d` for database services
2. **Dependencies**: Run `npm install` in root for all packages
3. **Shared Package**: Build shared package first with `npm run build --workspace=@coach-ia-hugo/shared`
4. **Development**: Use `npm run dev` to start all services in parallel
5. **Type Checking**: Always run `npm run type-check` before committing
6. **Code Quality**: Pre-commit hooks run linting and formatting automatically

## Database Setup

- PostgreSQL with PostGIS runs on port 5432 via Docker
- Redis for caching runs on port 6379 via Docker
- Environment variables configured via `.env` files
- Prisma handles database migrations and client generation

## Important Notes

- The shared package must be built (`npm run build`) before frontend/backend can import from it
- Use Turbo commands from the root for cross-package operations
- Database schema changes require running `npm run db:generate` to update the Prisma client
- The application is bilingual but primarily in French
- API endpoints are prefixed with `/api/`