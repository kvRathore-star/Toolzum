import { requireAdmin, json } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";
import { listFlags, setFlag } from "../_flags";

interface AdminEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
}

export async function onRequestGet(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-flags", ip, 30);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const flags = await listFlags(DB);
  recordRateLimit(DB, "admin-flags", ip, "/api/admin/flags");
  return json({ flags });
}

export async function onRequestPost(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-flags", ip, 30);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  let body: { key?: string; enabled?: boolean; note?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (!body.key || typeof body.enabled !== "boolean") {
    return json({ error: "invalid_params — send { key, enabled: boolean, note? }" }, 400);
  }

  let enabled: boolean;
  try {
    enabled = await setFlag(DB, body.key, body.enabled, body.note);
  } catch {
    return json({ error: "invalid_key" }, 400);
  }

  const clean = body.key.trim().toLowerCase();
  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  )
    .bind(auth.user.email, "flag-set", `flag:${clean}`, String(!enabled), String(enabled))
    .run()
    .catch(() => {});

  recordRateLimit(DB, "admin-flags", ip, "/api/admin/flags");
  return json({ ok: true, key: clean, enabled });
}
