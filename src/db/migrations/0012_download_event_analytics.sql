-- Per-download event log for analytics (cap-hit rate, tool popularity, conversion tracking).
-- Fingerprint for anon users: retain for 90 days, then purge (GDPR — see v2.1.0 changelog).
CREATE TABLE "download_event" (
  "id"            INTEGER PRIMARY KEY AUTOINCREMENT,
  "userId"        TEXT,              -- nullable for anonymous users
  "fingerprint"   TEXT NOT NULL,     -- userId if signed in, else browser fingerprint hash
  "userType"      TEXT NOT NULL,     -- 'anon' | 'signedin' | 'pro' (pre-computed, no join needed)
  "toolSlug"      TEXT NOT NULL,
  "category"      TEXT,
  "outcome"       TEXT NOT NULL,     -- 'allowed' | 'blocked_quota' | 'blocked_plan'
  "dailyCount"    INTEGER,           -- their count for that day at time of attempt
  "dailyLimit"    INTEGER,           -- their daily limit (3 anon, 10 signed-in, 999 pro)
  "createdAt"     INTEGER NOT NULL
);

CREATE INDEX "idx_dl_event_fp_date"    ON "download_event" ("fingerprint", "createdAt");
CREATE INDEX "idx_dl_event_tool"       ON "download_event" ("toolSlug");
CREATE INDEX "idx_dl_event_outcome"    ON "download_event" ("outcome");
CREATE INDEX "idx_dl_event_created"    ON "download_event" ("createdAt");
CREATE INDEX "idx_dl_event_userId"     ON "download_event" ("userId");
CREATE INDEX "idx_dl_event_userType"   ON "download_event" ("userType");
