CREATE TABLE IF NOT EXISTS "strava_integrations" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "athleteId" INTEGER NOT NULL,
    "athleteUsername" TEXT,
    "athleteFirstName" TEXT,
    "athleteLastName" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenType" TEXT,
    "scope" TEXT,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "lastSyncAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "strava_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "strava_integrations_userId_key" ON "strava_integrations" ("userId");

-- trigger to automatically update updatedAt
CREATE OR REPLACE FUNCTION update_strava_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_strava_integrations_updated_at
BEFORE UPDATE ON "strava_integrations"
FOR EACH ROW EXECUTE FUNCTION update_strava_integrations_updated_at();
