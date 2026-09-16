-- #27: version the previously lazy-created user_flags table
-- (functions/api/account/tour.ts). Onboarding-tour state per user.
-- Idempotent: safe to apply over databases where the lazy path already
-- created the table.
CREATE TABLE IF NOT EXISTS "user_flags" (
  "userId" text PRIMARY KEY,
  "tourSeenAt" integer,
  "updatedAt" integer NOT NULL
);
