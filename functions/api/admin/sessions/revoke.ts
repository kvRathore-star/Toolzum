import { requireAdmin, json } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";

interface AdminEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
}

export async function onRequestPost(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-session-revoke", ip, 10);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const body = (await context.request.json()) as { sessionId: string };
  const { sessionId } = body;

  if (!sessionId) {
    return json({ error: "sessionId required" }, 400);
  }

  const session = await DB.prepare("SELECT id, userId FROM session WHERE id = ?")
    .bind(sessionId)
    .first<{ id: string; userId: string }>();

  if (!session) {
    return json({ error: "session_not_found" }, 404);
  }

  await DB.prepare("DELETE FROM session WHERE id = ?").bind(sessionId).run();

  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  )
    .bind(auth.user.email, "revoke-session", session.userId, sessionId, "revoked")
    .run()
    .catch(() => {});

  recordRateLimit(DB, "admin-session-revoke", ip, "/api/admin/sessions/revoke");

  return json({ success: true, sessionId });
}
