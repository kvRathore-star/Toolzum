-- User-submitted testimonials: never auto-published. Rows start as
-- 'pending'; the admin reviews page flips them to 'approved' (shown on the
-- homepage with aggregateRating JSON-LD) or 'rejected'. No fake seed rows —
-- an empty approved set renders an honest "be the first" state.
CREATE TABLE IF NOT EXISTS "testimonials" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL DEFAULT '',
  "text" text NOT NULL DEFAULT '',
  "toolSlug" text NOT NULL DEFAULT '',
  "status" text NOT NULL DEFAULT 'pending',
  "createdAt" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_testimonials_status" ON "testimonials" ("status", "createdAt");
