-- Performance indexes for 100k+ users
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "user" ("role");
CREATE INDEX IF NOT EXISTS "user_plan_idx" ON "user" ("plan");
CREATE INDEX IF NOT EXISTS "user_createdAt_idx" ON "user" ("createdAt");
CREATE INDEX IF NOT EXISTS "user_status_idx" ON "user" ("status");
CREATE INDEX IF NOT EXISTS "payment_userId_idx" ON "payment" ("userId");
CREATE INDEX IF NOT EXISTS "payment_status_idx" ON "payment" ("status");
CREATE INDEX IF NOT EXISTS "payment_createdAt_idx" ON "payment" ("createdAt");
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
