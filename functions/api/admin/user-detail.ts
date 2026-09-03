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

export async function onRequestGet(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-user-detail", ip, 30);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const url = new URL(context.request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return json({ error: "userId required" }, 400);

  const user = await DB.prepare(
    'SELECT id, name, email, role, plan, credits, status, lastLoginAt, createdAt, image FROM "user" WHERE id = ?'
  )
    .bind(userId)
    .first<{
      id: string;
      name: string;
      email: string;
      role: string;
      plan: string;
      credits: number;
      status: string;
      lastLoginAt: number | null;
      createdAt: number;
      image: string | null;
    }>();

  if (!user) return json({ error: "user_not_found" }, 404);

  const payments = await DB.prepare(
    "SELECT id, gateway, orderId, amount, currency, status, createdAt FROM payment WHERE userId = ? ORDER BY createdAt DESC LIMIT 20"
  )
    .bind(userId)
    .all<{
      id: string;
      gateway: string;
      orderId: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: number;
    }>();

  const toolUsage = await DB.prepare(
    "SELECT toolSlug, COUNT(*) as count FROM user_tool_usage WHERE userId = ? GROUP BY toolSlug ORDER BY count DESC LIMIT 10"
  )
    .bind(userId)
    .all<{ toolSlug: string; count: number }>();

  const auditLog = await DB.prepare(
    "SELECT actorEmail, action, oldValue, newValue, createdAt FROM admin_audit_log WHERE targetUserId = ? ORDER BY createdAt DESC LIMIT 10"
  )
    .bind(userId)
    .all<{
      actorEmail: string;
      action: string;
      oldValue: string | null;
      newValue: string | null;
      createdAt: string;
    }>();

  recordRateLimit(DB, "admin-user-detail", ip, "/api/admin/user-detail");

  return json({
    user,
    payments: payments.results || [],
    toolUsage: toolUsage.results || [],
    roleHistory: auditLog.results || [],
  });
}
