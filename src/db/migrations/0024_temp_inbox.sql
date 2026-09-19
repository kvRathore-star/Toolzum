-- Temp-mail inbox (disposable addresses at t.toolzum.com).
-- Addresses live 60 minutes; messages are pruned with them.
CREATE TABLE IF NOT EXISTS temp_address (
  address TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  expiresAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS temp_message (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL,
  sender TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  receivedAt INTEGER NOT NULL,
  FOREIGN KEY (address) REFERENCES temp_address(address) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_temp_message_address ON temp_message(address, receivedAt);
CREATE INDEX IF NOT EXISTS idx_temp_address_expires ON temp_address(expiresAt);
