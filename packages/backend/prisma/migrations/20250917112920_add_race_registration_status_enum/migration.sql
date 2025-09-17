/*
  Warnings:

  - The `status` column on the `race_registrations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RaceRegistrationStatus" AS ENUM ('REGISTERED', 'PREPARATION', 'COMPLETED', 'CANCELLED', 'DNS', 'DNF');

-- AlterTable
ALTER TABLE "race_registrations" ADD COLUMN     "targetDate" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "RaceRegistrationStatus" NOT NULL DEFAULT 'REGISTERED';
