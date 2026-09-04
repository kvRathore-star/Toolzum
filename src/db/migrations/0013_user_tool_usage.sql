-- Missing migration: user_tool_usage table (defined in schema.ts but never migrated)
-- Powers /api/user/activity and /api/user/log-usage endpoints

CREATE TABLE IF NOT EXISTS user_tool_usage (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  toolSlug TEXT NOT NULL,
  toolName TEXT NOT NULL,
  category TEXT,
  usedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS user_tool_usage_userId_idx ON user_tool_usage(userId);
CREATE INDEX IF NOT EXISTS user_tool_usage_usedAt_idx ON user_tool_usage(usedAt);
