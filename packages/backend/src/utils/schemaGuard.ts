import { PrismaClient } from '@prisma/client'

let planInfrastructurePromise: Promise<void> | null = null
let templateInfrastructurePromise: Promise<void> | null = null

const PLAN_PHASE_ENUM_SQL = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlanPhase') THEN
    CREATE TYPE "PlanPhase" AS ENUM ('BASE', 'BUILD', 'PEAK', 'TAPER', 'RECOVERY');
  END IF;
END
$$;
`

const TRAINING_PLAN_COLUMNS_SQL = `
ALTER TABLE "training_plans"
  ADD COLUMN IF NOT EXISTS "sourceTemplateId" TEXT,
  ADD COLUMN IF NOT EXISTS "totalDuration" INTEGER,
  ADD COLUMN IF NOT EXISTS "totalDistance" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "loadScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "progression" JSONB,
  ADD COLUMN IF NOT EXISTS "lastAnalyzedAt" TIMESTAMPTZ;
`

const TRAINING_SESSION_COLUMNS_SQL = `
ALTER TABLE "training_sessions"
  ADD COLUMN IF NOT EXISTS "templateSessionId" TEXT,
  ADD COLUMN IF NOT EXISTS "phase" "PlanPhase",
  ADD COLUMN IF NOT EXISTS "weekNumber" INTEGER,
  ADD COLUMN IF NOT EXISTS "dayOfWeek" INTEGER,
  ADD COLUMN IF NOT EXISTS "plannedLoad" INTEGER;
`

const TRAINING_PLAN_TEMPLATES_SQL = `
CREATE TABLE IF NOT EXISTS "training_plan_templates" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "targetCategory" TEXT NOT NULL,
  "targetExperience" TEXT,
  "durationWeeks" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`

const TRAINING_SESSION_TEMPLATES_SQL = `
CREATE TABLE IF NOT EXISTS "training_session_templates" (
  "id" TEXT PRIMARY KEY,
  "planTemplateId" TEXT NOT NULL,
  "phase" "PlanPhase" NOT NULL,
  "weekOffset" INTEGER NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "type" "TrainingType" NOT NULL,
  "intensity" "Intensity" NOT NULL,
  "duration" INTEGER,
  "distance" DOUBLE PRECISION,
  "description" TEXT,
  "focusAreas" TEXT[],
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "training_session_templates_planTemplateId_fkey"
    FOREIGN KEY ("planTemplateId") REFERENCES "training_plan_templates"("id") ON DELETE CASCADE
);
`

export function ensurePlanInfrastructure(prisma: PrismaClient) {
  if (!planInfrastructurePromise) {
    planInfrastructurePromise = prisma.$transaction(async tx => {
      await tx.$executeRawUnsafe(PLAN_PHASE_ENUM_SQL)
      await tx.$executeRawUnsafe(TRAINING_PLAN_COLUMNS_SQL)
      await tx.$executeRawUnsafe(TRAINING_SESSION_COLUMNS_SQL)
    })
  }
  return planInfrastructurePromise
}

export function ensureTemplateInfrastructure(prisma: PrismaClient) {
  if (!templateInfrastructurePromise) {
    templateInfrastructurePromise = prisma.$transaction(async tx => {
      await tx.$executeRawUnsafe(PLAN_PHASE_ENUM_SQL)
      await tx.$executeRawUnsafe(TRAINING_PLAN_TEMPLATES_SQL)
      await tx.$executeRawUnsafe(TRAINING_SESSION_TEMPLATES_SQL)
    })
  }
  return templateInfrastructurePromise
}
