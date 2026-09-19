import { checkRateLimit, recordRateLimit } from "./rate-limit";

/**
 * Notify-me waitlist backend (ComingSoon tool pages + extension page).
 * POST { email, tool } → validates, rate-limits, stores in notify_waitlist.
 * Duplicate (email, tool) is a silent success — never leaks list membership.
 * Launch broadcast (future): select where notifiedAt IS NULL per tool_slug.
 */

interface Env {
  DB: D1Database;
}

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.replace(/<[^>]*>/g, "").trim().slice(0, max) : "";
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isSlug(s: string): boolean {
  return /^[a-z0-9-]{1,80}$/.test(s);
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { DB } = context.env;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";

  const rl = await checkRateLimit(DB, "notify-me", ip, 10);
  if (rl.limited) return rl.response;
  recordRateLimit(DB, "notify-me", ip, "/api/notify-me");

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const email = clean(body.email, 320).toLowerCase();
  const tool = clean(body.tool, 80);
  if (!isEmail(email) || !isSlug(tool)) {
    return json({ error: "invalid_params — send { email, tool }" }, 400);
  }

  try {
    await DB.prepare(
      "INSERT OR IGNORE INTO notify_waitlist (email, tool_slug) VALUES (?, ?)"
    )
      .bind(email, tool)
      .run();
  } catch {
    return json({ error: "store_failed" }, 502);
  }

  return json({ ok: true });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
