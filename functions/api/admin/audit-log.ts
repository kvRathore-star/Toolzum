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
  const rl = await checkRateLimit(DB, "admin-audit", ip, 30);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const url = new URL(context.request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;

  const countResult = await DB.prepare(
    "SELECT COUNT(*) as total FROM admin_audit_log"
  ).first<{ total: number }>();

  const logs = await DB.prepare(
    `SELECT a.*, u.name as targetUserName, u.email as targetUserEmail, au.name as actorUserName
     FROM admin_audit_log a
     LEFT JOIN "user" u ON a.targetUserId = u.id
     LEFT JOIN "user" au ON a.actorEmail = au.email
     ORDER BY a.createdAt DESC LIMIT ? OFFSET ?`
  )
    .bind(limit, offset)
    .all<{
      id: number;
      actorEmail: string;
      actorUserName: string | null;
      action: string;
      targetUserId: string;
      targetUserName: string | null;
      targetUserEmail: string | null;
      oldValue: string | null;
      newValue: string | null;
      createdAt: string;
    }>();

  recordRateLimit(DB, "admin-audit", ip, "/api/admin/audit-log");

  return json({
    logs: logs.results || [],
    total: countResult?.total || 0,
    page,
    limit,
  });
}
