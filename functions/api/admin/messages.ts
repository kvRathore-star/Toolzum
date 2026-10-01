import { requireAdmin, json } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";

/**
 * Contact inbox API (#contact-inbox) — read and triage the messages
 * archived by functions/api/contact.ts. The table is created by the
 * versioned migration (src/db/migrations/0028_contact_messages.sql) or,
 * lazily, by the contact form's ensureTable — so before the first message
 * ever exists an empty read is the honest answer (caught below), and a
 * PATCH against no table is a 404, never a fake success.
 *
 * Auth: admin session (browser UI) OR Bearer ALERT_TOKEN (curl/automation),
 * same as /api/admin/reply.
 * GET    → { ok, messages: [...], unread }         (optional ?status=filter)
 * PATCH  → { id, status: new|replied|archived }    (triage from the inbox UI)
 *
 * Reply flow: the inbox UI opens /admin/reply?to=…&messageId=…, and the
 * reply endpoint marks the row `replied` after a successful send.
 */

interface Env {
  DB: D1Database;
  ALERT_TOKEN?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
}

type MessageStatus = "new" | "replied" | "archived";

const STATUSES: MessageStatus[] = ["new", "replied", "archived"];
const MAX_ID = 64;
const RATE_PER_MIN = 30;
const LIST_LIMIT = 200;

function isStatus(s: unknown): s is MessageStatus {
  return typeof s === "string" && (STATUSES as string[]).includes(s);
}

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.replace(/<[^>]*>/g, "").slice(0, max) : "";
}

async function isAuthed(request: Request, env: Env): Promise<boolean> {
  const session = await requireAdmin(request, env).catch(() => null);
  if (session && !("error" in session)) return true;
  const authHeader = request.headers.get("authorization") || "";
  return !!env.ALERT_TOKEN && authHeader === `Bearer ${env.ALERT_TOKEN}`;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  if (!(await isAuthed(request, env))) return json({ error: "unauthorized" }, 401);

  const status = new URL(request.url).searchParams.get("status");
  const filter = isStatus(status) ? status : null;

  try {
    const list = filter
      ? await env.DB.prepare(
          "SELECT id, name, email, category, label, message, status, createdAt FROM contact_messages WHERE status = ? ORDER BY createdAt DESC LIMIT ?"
        )
          .bind(filter, LIST_LIMIT)
          .all()
      : await env.DB.prepare(
          "SELECT id, name, email, category, label, message, status, createdAt FROM contact_messages ORDER BY createdAt DESC LIMIT ?"
        )
          .bind(LIST_LIMIT)
          .all();
    const unread = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM contact_messages WHERE status = 'new'"
    ).first<{ n: number }>();
    return json({ ok: true, messages: list.results ?? [], unread: unread?.n ?? 0 });
  } catch {
    // No table yet (no message ever submitted, migration still applying) —
    // an empty inbox is the truthful response, not a 500.
    return json({ ok: true, messages: [], unread: 0 });
  }
}

export async function onRequestPatch(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const { DB } = env;
  if (!(await isAuthed(request, env))) return json({ error: "unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const id = clean(body.id, MAX_ID);
  const status = body.status;
  if (!id || !isStatus(status)) {
    return json({ error: "invalid_params — send { id, status: new|replied|archived }" }, 400);
  }

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-messages", ip, RATE_PER_MIN);
  if (rl.limited) return rl.response ?? json({ error: "rate_limited" }, 429);
  recordRateLimit(DB, "admin-messages", ip, "/api/admin/messages");

  try {
    const row = await DB.prepare("SELECT id FROM contact_messages WHERE id = ?")
      .bind(id)
      .first();
    if (!row) return json({ error: "not_found" }, 404);
    await DB.prepare("UPDATE contact_messages SET status = ? WHERE id = ?")
      .bind(status, id)
      .run();
    return json({ ok: true, id, status });
  } catch {
    // Table absent (nothing to triage yet) or transient D1 failure.
    return json({ error: "not_found" }, 404);
  }
}
