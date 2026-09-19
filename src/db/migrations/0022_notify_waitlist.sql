-- Notify-me waitlist: emails collected from ComingSoon tool pages and the
-- browser-extension page ("notify me on launch"). Launch broadcast reads
-- rows where notified_at IS NULL, sends via Email Sending, stamps notified_at.
CREATE TABLE IF NOT EXISTS notify_waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  tool_slug TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  notifiedAt TEXT,
  UNIQUE(email, tool_slug)
);
CREATE INDEX IF NOT EXISTS idx_notify_waitlist_slug ON notify_waitlist(tool_slug, notifiedAt);
