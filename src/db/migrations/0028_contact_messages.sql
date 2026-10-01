-- Contact inbox (#contact-inbox): every relayed contact-form message is
-- archived so the admin panel can list, read, and reply from one screen
-- instead of copy-pasting out of Gmail. Best-effort insert in
-- functions/api/contact.ts (the relay still gates form success).
-- createdAt: unix seconds (ledger family: error_log / download_event).
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "category" text NOT NULL,
  "label" text NOT NULL,
  "message" text NOT NULL,
  "status" text NOT NULL DEFAULT 'new',
  "createdAt" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "contact_messages_status_idx" ON "contact_messages" ("status");
CREATE INDEX IF NOT EXISTS "contact_messages_createdAt_idx" ON "contact_messages" ("createdAt");
