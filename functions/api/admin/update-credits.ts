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
  const rl = await checkRateLimit(DB, "admin-credits", ip, 10);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const body = (await context.request.json()) as { userId: string; credits: number };
  const { userId, credits } = body;

  if (!userId || typeof credits !== "number" || credits < 0 || credits > 99999) {
    return json({ error: "invalid_params" }, 400);
  }

  const target = await DB.prepare('SELECT credits FROM "user" WHERE id = ?')
    .bind(userId)
    .first<{ credits: number }>();

  if (!target) return json({ error: "user_not_found" }, 404);

  await DB.prepare('UPDATE "user" SET credits = ? WHERE id = ?')
    .bind(Math.round(credits), userId)
    .run();

  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  )
    .bind(auth.user.email, "update-credits", userId, String(target.credits), String(Math.round(credits)))
    .run()
    .catch(() => {});

  recordRateLimit(DB, "admin-credits", ip, "/api/admin/update-credits");

  return json({ success: true, userId, credits: Math.round(credits) });
}
