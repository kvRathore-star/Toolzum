-- Dodo webhook idempotency: every delivery has a unique webhook-id.
-- Retries (exponential backoff) must not double-grant. Claimed BEFORE
-- processing (INSERT OR IGNORE + rowcount check).
CREATE TABLE IF NOT EXISTS webhook_event (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT '',
  receivedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_webhook_event_received ON webhook_event(receivedAt);
