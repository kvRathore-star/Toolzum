-- Pricing spec (Sep 2026): 7-Day Project Pass model. Pass holders get Pro
-- treatment until passExpiresAt (unix millis, matches creditResetAt);
-- expiry is time-based at read, so no cron or cleanup job is needed.
-- Stale timestamps are harmless (resolvePlanWithPass compares to now).
ALTER TABLE "user" ADD COLUMN "passExpiresAt" INTEGER DEFAULT NULL;
