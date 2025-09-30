-- CreateEnum
CREATE TYPE "PlanPhase" AS ENUM ('BASE', 'BUILD', 'PEAK', 'TAPER', 'RECOVERY');

-- AlterTable
ALTER TABLE "training_plans" ADD COLUMN     "lastAnalyzedAt" TIMESTAMP(3),
ADD COLUMN     "loadScore" INTEGER,
ADD COLUMN     "progression" JSONB,
ADD COLUMN     "sourceTemplateId" TEXT,
ADD COLUMN     "totalDistance" DOUBLE PRECISION,
ADD COLUMN     "totalDuration" INTEGER;

-- AlterTable
ALTER TABLE "training_sessions" ADD COLUMN     "dayOfWeek" INTEGER,
ADD COLUMN     "phase" "PlanPhase",
ADD COLUMN     "plannedLoad" INTEGER,
ADD COLUMN     "templateSessionId" TEXT,
ADD COLUMN     "weekNumber" INTEGER;

-- CreateTable
CREATE TABLE "training_plan_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetCategory" TEXT NOT NULL,
    "targetExperience" "ExperienceLevel",
    "durationWeeks" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_plan_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_session_templates" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_session_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "training_plan_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_templateSessionId_fkey" FOREIGN KEY ("templateSessionId") REFERENCES "training_session_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_session_templates" ADD CONSTRAINT "training_session_templates_planTemplateId_fkey" FOREIGN KEY ("planTemplateId") REFERENCES "training_plan_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
