import { requireAdmin, json } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";

/**
 * Testimonial moderation (admin only).
 * GET → all rows newest-first (pending first). PATCH { id, status } →
 * flips pending rows to approved/rejected. Approved rows render on the
 * homepage; nothing else ever does.
 */

interface Env {
  DB: D1Database;
  ALERT_TOKEN?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
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
  try {
    const { DB } = env;
    const rows = await DB.prepare(
      "SELECT id, name, text, toolSlug, status, createdAt FROM testimonials ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, createdAt DESC LIMIT 200"
    ).all();
    return json({ ok: true, testimonials: rows.results || [] });
  } catch {
    return json({ ok: false, error: "Service unavailable" }, 503);
  }
}

export async function onRequestPatch(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  if (!(await isAuthed(request, env))) return json({ error: "unauthorized" }, 401);
  try {
    const { DB } = env;
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const rl = await checkRateLimit(DB, "admin-testimonials", ip, 30);
    if (rl.limited) return rl.response ?? json({ error: "rate_limited" }, 429);

    const body = (await request.json()) as { id?: unknown; status?: unknown };
    if (typeof body.id !== "string" || !body.id) {
      return json({ ok: false, error: "Missing id." }, 400);
    }
    if (body.status !== "approved" && body.status !== "rejected") {
      return json({ ok: false, error: "Status must be approved or rejected." }, 400);
    }
    const existing = await DB.prepare("SELECT id FROM testimonials WHERE id = ?")
      .bind(body.id)
      .first();
    if (!existing) return json({ ok: false, error: "Not found." }, 404);
    await DB.prepare("UPDATE testimonials SET status = ? WHERE id = ?")
      .bind(body.status, body.id)
      .run();
    recordRateLimit(DB, "admin-testimonials", ip, "/api/admin/testimonials");
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Service unavailable" }, 503);
  }
}
