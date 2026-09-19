-- Fix 0021: the chunked-crawl code INSERTs/reads inputUrl, discovered,
-- jsRendering, but 0021 never created them. Every multi-chunk crawl was
-- failing its session save and silently completing after 20 pages.
ALTER TABLE crawl_session ADD COLUMN inputUrl TEXT NOT NULL DEFAULT '';
ALTER TABLE crawl_session ADD COLUMN discovered INTEGER NOT NULL DEFAULT 0;
ALTER TABLE crawl_session ADD COLUMN jsRendering INTEGER NOT NULL DEFAULT 0;
