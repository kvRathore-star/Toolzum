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
  const rl = await checkRateLimit(DB, "admin-stats", ip, 20);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const totalUsers = await DB.prepare('SELECT COUNT(*) as count FROM "user"').first<{ count: number }>();
  const proUsers = await DB.prepare('SELECT COUNT(*) as count FROM "user" WHERE plan = ?').bind("pro").first<{ count: number }>();
  const adminUsers = await DB.prepare('SELECT COUNT(*) as count FROM "user" WHERE role = ?').bind("admin").first<{ count: number }>();

  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 86400;
  const signupsLast7Days = await DB.prepare(
    "SELECT COUNT(*) as count FROM user WHERE createdAt > ?"
  )
    .bind(sevenDaysAgo)
    .first<{ count: number }>();

  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400;
  const signupsLast30Days = await DB.prepare(
    "SELECT COUNT(*) as count FROM user WHERE createdAt > ?"
  )
    .bind(thirtyDaysAgo)
    .first<{ count: number }>();

  const recentActivity = await DB.prepare(
    "SELECT COUNT(*) as count FROM analytics_event WHERE timestamp > ?"
  )
    .bind(sevenDaysAgo)
    .first<{ count: number }>();

  recordRateLimit(DB, "admin-stats", ip, "/api/admin/stats");

  return json({
    totalUsers: totalUsers?.count || 0,
    proUsers: proUsers?.count || 0,
    adminUsers: adminUsers?.count || 0,
    signupsLast7Days: signupsLast7Days?.count || 0,
    signupsLast30Days: signupsLast30Days?.count || 0,
    pageViewsLast7Days: recentActivity?.count || 0,
  });
}
