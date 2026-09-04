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
  const rl = await checkRateLimit(DB, "admin-plan", ip, 10);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const body = (await context.request.json()) as { userId: string; plan: string };
  const { userId, plan } = body;

  if (!userId || !["free", "signedin", "pro"].includes(plan)) {
    return json({ error: "invalid_params" }, 400);
  }

  const target = await DB.prepare('SELECT plan FROM "user" WHERE id = ?')
    .bind(userId)
    .first<{ plan: string }>();

  if (!target) return json({ error: "user_not_found" }, 404);

  if (target.plan === plan) {
    return json({ error: "already_" + plan }, 400);
  }

  await DB.prepare('UPDATE "user" SET plan = ? WHERE id = ?')
    .bind(plan, userId)
    .run();

  // Invalidate all sessions for the target user so their client
  // picks up the new plan on next login (better-auth caches plan in session)
  await DB.prepare('DELETE FROM "session" WHERE userId = ?')
    .bind(userId)
    .run()
    .catch(() => {});

  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  )
    .bind(auth.user.email, "change-plan", userId, target.plan, plan)
    .run()
    .catch(() => {});

  recordRateLimit(DB, "admin-plan", ip, "/api/admin/change-plan");

  return json({ success: true, userId, plan });
}
