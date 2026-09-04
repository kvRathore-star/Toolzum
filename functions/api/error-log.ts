import { json } from "../../src/lib/admin-auth";
import type { D1Database } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

async function ensureTable(DB: D1Database) {
  try {
    await DB.prepare("SELECT 1 FROM error_log LIMIT 1").first();
  } catch {
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS "error_log" (
        "id" text PRIMARY KEY, "message" text NOT NULL, "stack" text,
        "source" text NOT NULL DEFAULT 'unknown', "toolSlug" text, "userId" text,
        "userAgent" text, "path" text, "count" integer NOT NULL DEFAULT 1,
        "firstSeenAt" integer NOT NULL, "lastSeenAt" integer NOT NULL, "createdAt" integer NOT NULL
      )
    `).run();
    await DB.prepare('CREATE INDEX IF NOT EXISTS "error_log_toolSlug_idx" ON "error_log" ("toolSlug")').run();
    await DB.prepare('CREATE INDEX IF NOT EXISTS "error_log_lastSeenAt_idx" ON "error_log" ("lastSeenAt")').run();
    await DB.prepare('CREATE INDEX IF NOT EXISTS "error_log_message_idx" ON "error_log" ("message")').run();
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const DB = context.env.DB;
  const userAgent = context.request.headers.get("user-agent") || null;

  let body: { errors: { message: string; stack?: string; source: string; toolSlug?: string; path?: string }[] };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const errors = body.errors?.slice(0, 20) || [];
  if (errors.length === 0) return json({ ok: true });

  await ensureTable(DB);
  const now = Math.floor(Date.now() / 1000);

  for (const err of errors) {
    if (!err.message) continue;
    const existing = await DB.prepare(
      'SELECT id, count FROM error_log WHERE message = ? AND source = ? AND toolSlug = ?'
    ).bind(err.message, err.source, err.toolSlug || null).first<{ id: string; count: number }>();

    if (existing) {
      await DB.prepare(
        'UPDATE error_log SET count = count + 1, lastSeenAt = ? WHERE id = ?'
      ).bind(now, existing.id).run();
    } else {
      const id = crypto.randomUUID();
      await DB.prepare(
        'INSERT INTO error_log (id, message, stack, source, toolSlug, userId, userAgent, path, count, firstSeenAt, lastSeenAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)'
      ).bind(id, err.message.slice(0, 2000), (err.stack || "").slice(0, 3000), err.source, err.toolSlug || null, null, userAgent, err.path || null, now, now, now).run();
    }
  }

  return json({ ok: true });
}
