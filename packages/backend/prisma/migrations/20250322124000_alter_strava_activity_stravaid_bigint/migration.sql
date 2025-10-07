ALTER TABLE "strava_activities"
    ALTER COLUMN "stravaId" TYPE BIGINT USING "stravaId"::BIGINT;
