-- Threaded contact correspondence: inbound replies parsed from email by
-- the toolzum-mail-bridge worker, outbound replies from /api/admin/reply.
-- One row per message (form submission stays the first row of its ticket
-- via contact_messages.message; replies stack here).
CREATE TABLE IF NOT EXISTS "contact_thread_messages" (
  "id" text PRIMARY KEY,
  "contact_id" text NOT NULL,
  "direction" text NOT NULL,
  "sender" text NOT NULL DEFAULT '',
  "body" text NOT NULL DEFAULT '',
  "attachments" text NOT NULL DEFAULT '[]',
  "createdAt" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_contact_thread_contact" ON "contact_thread_messages" ("contact_id", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_contact_thread_created" ON "contact_thread_messages" ("createdAt");
