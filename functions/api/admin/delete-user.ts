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
  const rl = await checkRateLimit(DB, "admin-delete", ip, 5);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const body = (await context.request.json()) as { userId: string; confirm: string };
  const { userId, confirm } = body;

  if (!userId || confirm !== "DELETE") {
    return json({ error: "invalid_params — send { userId, confirm: 'DELETE' }" }, 400);
  }

  if (userId === auth.user.id) {
    return json({ error: "cannot_delete_self" }, 400);
  }

  const target = await DB.prepare('SELECT email FROM "user" WHERE id = ?')
    .bind(userId)
    .first<{ email: string }>();

  if (!target) return json({ error: "user_not_found" }, 404);

  await DB.prepare("DELETE FROM session WHERE userId = ?").bind(userId).run();
  await DB.prepare("DELETE FROM account WHERE userId = ?").bind(userId).run();
  await DB.prepare("DELETE FROM payment WHERE userId = ?").bind(userId).run();
  await DB.prepare("DELETE FROM user_favorite WHERE userId = ?").bind(userId).run();
  await DB.prepare("DELETE FROM user_tool_usage WHERE userId = ?").bind(userId).run();
  await DB.prepare('DELETE FROM "user" WHERE id = ?').bind(userId).run();

  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  )
    .bind(auth.user.email, "gdpr-delete", userId, target.email, "deleted", "deleted")
    .run()
    .catch(() => {});

  recordRateLimit(DB, "admin-delete", ip, "/api/admin/delete-user");

  return json({ success: true, userId, deleted: true });
}
