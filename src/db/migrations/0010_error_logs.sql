CREATE TABLE IF NOT EXISTS "error_log" (
  "id" text PRIMARY KEY,
  "message" text NOT NULL,
  "stack" text,
  "source" text NOT NULL DEFAULT 'unknown',
  "toolSlug" text,
  "userId" text,
  "userAgent" text,
  "path" text,
  "count" integer NOT NULL DEFAULT 1,
  "firstSeenAt" integer NOT NULL,
  "lastSeenAt" integer NOT NULL,
  "createdAt" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "error_log_toolSlug_idx" ON "error_log" ("toolSlug");
CREATE INDEX IF NOT EXISTS "error_log_userId_idx" ON "error_log" ("userId");
CREATE INDEX IF NOT EXISTS "error_log_lastSeenAt_idx" ON "error_log" ("lastSeenAt");
CREATE INDEX IF NOT EXISTS "error_log_message_idx" ON "error_log" ("message");
