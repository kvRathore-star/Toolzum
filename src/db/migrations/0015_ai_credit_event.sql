-- #27: version the previously lazy-created ai_credit_event table
-- (functions/api/ai/credit-events.ts). AI-credit analytics mirroring the
-- download_event pattern: which task drains credits, who hits empty.
-- Idempotent: safe to apply over databases where the lazy path already
-- created the table.
CREATE TABLE IF NOT EXISTS "ai_credit_event" (
  "userId" text NOT NULL,
  "task" text NOT NULL,
  "outcome" text NOT NULL,
  "balance" integer NOT NULL,
  "allowance" integer NOT NULL,
  "createdAt" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "ai_credit_event_task_outcome_idx" ON "ai_credit_event" ("task", "outcome");
CREATE INDEX IF NOT EXISTS "ai_credit_event_userId_idx" ON "ai_credit_event" ("userId");
