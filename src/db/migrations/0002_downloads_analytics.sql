CREATE TABLE IF NOT EXISTS download_usage (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_download_usage_fp_date ON download_usage(fingerprint, date);

CREATE TABLE IF NOT EXISTS analytics_event (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  fingerprint TEXT,
  clientType TEXT,
  viewport TEXT,
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics_event(path);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_event(createdAt);
