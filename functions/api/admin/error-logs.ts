import { requireAdmin, json } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";
import type { D1Database } from "@cloudflare/workers-types";

interface AdminEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
}

interface ErrorInput {
  message: string;
  stack?: string;
  source: string;
  toolSlug?: string;
  path?: string;
}

async function ensureTable(DB: D1Database) {
  try {
    await DB.prepare("SELECT 1 FROM error_log LIMIT 1").first();
  } catch {
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS "error_log" (
        "id" text PRIMARY KEY,
        "message" text NOT NULL,
        "stack" text,
        "source" text NOT NULL DEFAULT 'unknown',
        "toolSlug" text,
        "userId" text,
        "userAgent" text,
        "path" text,
        "count" integer NOT NULL DEFAULT 1,
        "firstSeenAt" integer NOT NULL,
        "lastSeenAt" integer NOT NULL,
        "createdAt" integer NOT NULL
      )
    `).run();
    await DB.prepare('CREATE INDEX IF NOT EXISTS "error_log_toolSlug_idx" ON "error_log" ("toolSlug")').run();
    await DB.prepare('CREATE INDEX IF NOT EXISTS "error_log_userId_idx" ON "error_log" ("userId")').run();
    await DB.prepare('CREATE INDEX IF NOT EXISTS "error_log_lastSeenAt_idx" ON "error_log" ("lastSeenAt")').run();
    await DB.prepare('CREATE INDEX IF NOT EXISTS "error_log_message_idx" ON "error_log" ("message")').run();
  }
}

export async function onRequestPost(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "error-log-write", ip, 60);
  if (rl.limited) return rl.response;

  const userAgent = context.request.headers.get("user-agent") || null;
  const body = (await context.request.json()) as { errors: ErrorInput[] };
  const errors = body.errors?.slice(0, 20) || [];
  if (errors.length === 0) return json({ ok: true });

  await ensureTable(DB);
  const now = Math.floor(Date.now() / 1000);

  for (const err of errors) {
    if (!err.message) continue;
    const dedupeKey = `${err.message}|${err.source}|${err.toolSlug || ""}`;
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

  recordRateLimit(DB, "error-log-write", ip, "/api/error-log");
  return json({ ok: true });
}

export async function onRequestGet(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-error-logs", ip, 30);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  await ensureTable(DB);

  const url = new URL(context.request.url);
  const groupBy = url.searchParams.get("group") || "tool"; // tool | source | message
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 200);

  if (groupBy === "tool") {
    const results = await DB.prepare(
      `SELECT toolSlug, SUM(count) as totalCount, COUNT(*) as distinctErrors, MAX(lastSeenAt) as lastSeen, MIN(firstSeenAt) as firstSeen
       FROM error_log WHERE toolSlug IS NOT NULL
       GROUP BY toolSlug ORDER BY totalCount DESC LIMIT ?`
    ).bind(limit).all<{
      toolSlug: string; totalCount: number; distinctErrors: number;
      lastSeen: number; firstSeen: number;
    }>();
    return json({ groupBy: "tool", groups: results.results || [] });
  }

  if (groupBy === "source") {
    const results = await DB.prepare(
      `SELECT source, SUM(count) as totalCount, COUNT(*) as distinctErrors, MAX(lastSeenAt) as lastSeen
       FROM error_log GROUP BY source ORDER BY totalCount DESC`
    ).all<{ source: string; totalCount: number; distinctErrors: number; lastSeen: number }>();
    return json({ groupBy: "source", groups: results.results || [] });
  }

  // message group — latest errors
  const results = await DB.prepare(
    `SELECT id, message, stack, source, toolSlug, path, count, firstSeenAt, lastSeenAt
     FROM error_log ORDER BY lastSeenAt DESC LIMIT ?`
  ).bind(limit).all<{
    id: string; message: string; stack: string | null; source: string;
    toolSlug: string | null; path: string | null; count: number;
    firstSeenAt: number; lastSeenAt: number;
  }>();
  return json({ groupBy: "message", errors: results.results || [] });
}
