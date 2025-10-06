-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "stripePriceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_stripePriceId_key" ON "subscription_plans"("stripePriceId");
