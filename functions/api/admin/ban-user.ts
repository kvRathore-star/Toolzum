import { requireAdmin, json } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../../rate-limit";

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
  const rl = await checkRateLimit(DB, "admin-ban", ip, 10);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const body = (await context.request.json()) as { userId: string; status: string };
  const { userId, status } = body;

  if (!userId || !["active", "banned"].includes(status)) {
    return json({ error: "invalid_params" }, 400);
  }

  if (userId === auth.user.id) {
    return json({ error: "cannot_ban_self" }, 400);
  }

  const target = await DB.prepare('SELECT status FROM "user" WHERE id = ?')
    .bind(userId)
    .first<{ status: string }>();

  if (!target) return json({ error: "user_not_found" }, 404);

  if (target.status === status) {
    return json({ error: "already_" + status }, 400);
  }

  await DB.prepare('UPDATE "user" SET status = ? WHERE id = ?')
    .bind(status, userId)
    .run();

  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  )
    .bind(auth.user.email, status === "banned" ? "ban-user" : "unban-user", userId, target.status, status)
    .run()
    .catch(() => {});

  recordRateLimit(DB, "admin-ban", ip, "/api/admin/ban-user");

  return json({ success: true, userId, status });
}
