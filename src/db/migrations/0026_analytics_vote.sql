-- Survey helpfulness votes (PostDownloadSurvey yes/no). Nullable so all
-- existing pageview rows stay valid; event='vote', vote='yes'|'no'.
ALTER TABLE analytics_event ADD COLUMN event TEXT;
ALTER TABLE analytics_event ADD COLUMN vote TEXT;
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_event(event);
