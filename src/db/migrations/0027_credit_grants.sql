-- AI credit packs (decision Sep 2026): one-time top-ups, 12-month
-- expiry, spent only after the monthly allowance (src/lib/creditPacks.ts).
-- id is payment-derived (pack_<paymentId>) so webhook retries dedupe on
-- the primary key.
CREATE TABLE credit_grants (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  credits INTEGER NOT NULL,
  remaining INTEGER NOT NULL,
  source TEXT NOT NULL,
  orderId TEXT,
  grantedAt INTEGER NOT NULL,
  expiresAt INTEGER NOT NULL
);
CREATE INDEX idx_credit_grants_user_expiry ON credit_grants (userId, expiresAt);
