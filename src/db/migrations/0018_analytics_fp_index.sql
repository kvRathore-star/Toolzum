-- #37: every request runs a fingerprint-scoped rate-limit lookup, but
-- analytics_event only had path + createdAt indexes — full scans per
-- request at scale. Composite index covers both the lookup and the
-- velocity-guard windows in functions/api/_abuse.ts.
CREATE INDEX IF NOT EXISTS "idx_analytics_fp_created"
  ON "analytics_event" ("fingerprint", "createdAt");
