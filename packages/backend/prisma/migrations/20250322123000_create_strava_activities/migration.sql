CREATE TABLE IF NOT EXISTS "strava_activities" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stravaId" INTEGER NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sportType" TEXT,
    "distance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "movingTime" INTEGER NOT NULL DEFAULT 0,
    "elapsedTime" INTEGER NOT NULL DEFAULT 0,
    "totalElevationGain" DOUBLE PRECISION,
    "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "startDateLocal" TIMESTAMP WITH TIME ZONE,
    "averageSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "averageHeartRate" DOUBLE PRECISION,
    "maxHeartRate" DOUBLE PRECISION,
    "sufferScore" INTEGER,
    "raw" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "strava_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "strava_activities_userId_startDate_idx" ON "strava_activities" ("userId", "startDate");

-- trigger to update updatedAt
CREATE OR REPLACE FUNCTION update_strava_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_strava_activities_updated_at
BEFORE UPDATE ON "strava_activities"
FOR EACH ROW EXECUTE FUNCTION update_strava_activities_updated_at();
