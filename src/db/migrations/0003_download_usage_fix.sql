ALTER TABLE download_usage RENAME TO download_usage_old;

CREATE TABLE download_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

INSERT INTO download_usage (fingerprint, date, count, createdAt, updatedAt)
SELECT fingerprint, date, SUM(count), MIN(createdAt), MAX(updatedAt)
FROM download_usage_old
GROUP BY fingerprint, date;

DROP INDEX IF EXISTS idx_download_usage_fp_date;

CREATE INDEX idx_download_usage_fp_date ON download_usage(fingerprint, date);

DROP TABLE download_usage_old;
