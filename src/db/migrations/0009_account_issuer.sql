-- Add issuer column to account table and update unique index
ALTER TABLE "account" ADD COLUMN "issuer" text NOT NULL DEFAULT '';

-- Drop old unique index on accountId alone
DROP INDEX IF EXISTS "account_accountId_key";

-- Create new composite unique index on (issuer, accountId)
CREATE UNIQUE INDEX IF NOT EXISTS "account_issuer_accountId_key" ON "account" ("issuer", "accountId");
