-- #21: alert cooldown state for the threshold endpoint.
-- One row per alert key; prevents one incident paging sixty times.
-- Idempotent like all migrations in this directory.
CREATE TABLE IF NOT EXISTS "alert_log" (
  "key" text PRIMARY KEY,
  "lastSentAt" integer NOT NULL,
  "lastDetail" text,
  "updatedAt" integer NOT NULL
);
