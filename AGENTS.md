# Repository Guidelines

## Project Structure & Module Organization
This Turborepo hosts three workspaces under `packages/`: `backend` (Fastify API + Prisma schema in `prisma/`), `frontend` (Next.js app inside `app/`), and `shared` (cross-package TypeScript contracts built from `src/` to `dist/`). Documentation lives in `docs/`, automation scripts in `scripts/`, and container assets in `docker/`. Keep assets such as images in `packages/frontend/public` and seed data in root scripts like `seed-test-data.js`.

## Build, Test, and Development Commands
Install once at the root with `npm install`. Use `npm run dev` to launch all workspaces in parallel; scope a single package with `npm run dev -- --filter=@summitstride/backend` (or `frontend`, `shared`). Core maintenance commands are:
```bash
npm run build             # turbo run build across workspaces
npm run lint              # lint TypeScript/JS with shared config
npm run type-check        # ensure TypeScript correctness
npm run format:check      # verify Prettier formatting
npm run db:migrate -- --filter=@summitstride/backend  # run Prisma migrations
```

## Coding Style & Naming Conventions
Write modern TypeScript (ESM) with explicit imports and named exports for shared utilities. Prettier governs formatting (two-space indentation, single quotes), and ESLint roots from `eslint.config.js`; run `npm run format` before pushing. React components follow PascalCase inside `packages/frontend/components`, route handlers use camelCase, and Prisma models live in `prisma/schema.prisma` with singular PascalCase names.

## Testing Guidelines
Target automated coverage per package, colocating specs as `*.test.ts` alongside source. Run suites through `npm run test` (or `npm run test -- --filter=...` for a package) once tests are added. Until formal frameworks are in place, sanity-check critical flows with the Node scripts (`node test-training-api.js`, `node test-advanced-features.js`) while documenting new scenarios.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) as seen in recent history. Each commit should stay scoped to one concern and pass `lint`, `type-check`, and relevant tests. PRs must describe the user story, list breaking changes, attach screenshots for UI updates, and reference issues or roadmap items when applicable.

## Environment & Configuration
Clone `.env.example` files (root and `packages/backend/`) into `.env` before running services. Keep secrets out of version control and rely on `docker-compose.yml` for local stacks when sharing reproducible environments. Update Prisma migrations through `npm run db:generate` and `npm run db:migrate`, committing both the schema and generated migration files.
