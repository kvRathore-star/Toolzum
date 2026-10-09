import { checkRateLimit, recordRateLimit } from "./rate-limit";

/**
 * Testimonial submissions — real reviews from real users, never auto-published.
 *
 * POST → { ok, received: true } (always pending first; nothing renders until
 *   an admin approves). GET → { ok, testimonials: [...] } (approved only,
 *   for the homepage section + aggregateRating JSON-LD).
 *
 * Anti-spam is structural, not clever: 3 req/min/IP rate limit, 2–60 char
 * names, 10–500 char texts, no URLs in either field (review spam is link
 * spam). Moderation happens in /admin/reviews.
 */

interface Env {
  DB: D1Database;
}

const MAX_NAME = 60;
const MAX_TEXT = 500;
const URL_RE = /https?:\/\/|www\.[a-z0-9-]+\.[a-z]{2,}/i;

async function ensureTable(DB: D1Database) {
  try {
    await DB.prepare("SELECT 1 FROM testimonials LIMIT 1").first();
  } catch {
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS "testimonials" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL DEFAULT '',
        "text" text NOT NULL DEFAULT '',
        "toolSlug" text NOT NULL DEFAULT '',
        "status" text NOT NULL DEFAULT 'pending',
        "createdAt" integer NOT NULL
      )
    `).run();
    await DB.prepare('CREATE INDEX IF NOT EXISTS "idx_testimonials_status" ON "testimonials" ("status", "createdAt")').run();
  }
}

function bad(msg: string) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const ip = context.request.headers.get("cf-connecting-ip") || "unknown";

    const rl = await checkRateLimit(DB, "testimonials", ip, 3);
    if (rl.limited) return rl.response;

    let body: { name?: unknown; text?: unknown; toolSlug?: unknown };
    try {
      body = await context.request.json();
    } catch {
      return bad("Invalid JSON.");
    }
    const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME) : "";
    const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : "";
    const toolSlug = typeof body.toolSlug === "string" ? body.toolSlug.trim().slice(0, 120) : "";

    if (name.length < 2) return bad("Please give your first name (2+ characters).");
    if (text.length < 10) return bad("Please write a little more (10+ characters).");
    if (URL_RE.test(name) || URL_RE.test(text)) {
      return bad("Links aren't allowed in reviews — describe your experience in words.");
    }

    await ensureTable(DB);
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    await DB.prepare(
      'INSERT INTO testimonials (id, name, text, toolSlug, status, createdAt) VALUES (?, ?, ?, ?, \'pending\', unixepoch())'
    ).bind(id, name, text, toolSlug).run();
    recordRateLimit(DB, "testimonials", ip, "/api/testimonials");

    return new Response(JSON.stringify({ ok: true, received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    await ensureTable(DB);
    const rows = await DB.prepare(
      "SELECT name, text, toolSlug FROM testimonials WHERE status = 'approved' ORDER BY createdAt DESC LIMIT 50"
    ).all<{ name: string; text: string; toolSlug: string }>();
    return new Response(JSON.stringify({ ok: true, testimonials: rows.results || [] }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
