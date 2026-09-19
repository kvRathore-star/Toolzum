-- Crawl sessions for chunked sitemap crawls (free-plan subrequest ceiling).
-- Each invocation crawls one chunk (~20 pages); the client chains continuations
-- by cursor. Sessions expire after 1 hour and are deleted on completion.
CREATE TABLE IF NOT EXISTS crawl_session (
  id TEXT PRIMARY KEY,
  baseUrl TEXT NOT NULL,
  maxAllowed INTEGER NOT NULL,
  exclusions TEXT NOT NULL DEFAULT '[]',
  queue TEXT NOT NULL DEFAULT '[]',
  visited TEXT NOT NULL DEFAULT '[]',
  pages TEXT NOT NULL DEFAULT '[]',
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS crawl_session_updated_idx ON crawl_session(updatedAt);
