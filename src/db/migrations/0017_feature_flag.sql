-- #41/49: lightweight feature-flag service (D1-backed, no vendor).
-- Instant-disable without a rebuild: flipping a row beats a 15-min deploy.
-- Idempotent seeds: safe to apply over any database state.
CREATE TABLE IF NOT EXISTS "feature_flag" (
  "key" text PRIMARY KEY,
  "enabled" integer NOT NULL DEFAULT 1,
  "note" text,
  "updatedAt" integer NOT NULL
);

-- Master AI kill-switch (checked by all /api/ai/* endpoints).
INSERT OR IGNORE INTO "feature_flag" ("key", "enabled", "note", "updatedAt")
VALUES ('ai_generation', 1, 'Master kill-switch for server AI (generate/transcribe/image). Flip to 0 to shed cost or abuse instantly.', strftime('%s', 'now'));

-- Gemini image engine (was a hardcoded const in AiImageGenerator).
INSERT OR IGNORE INTO "feature_flag" ("key", "enabled", "note", "updatedAt")
VALUES ('ai_image_gemini', 0, 'Gemini HD image engine. Stays off until output quality + billing are verified.', strftime('%s', 'now'));
