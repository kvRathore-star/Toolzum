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
  const rl = await checkRateLimit(DB, "admin-sessions", ip, 30);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const url = new URL(context.request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return json({ error: "userId required" }, 400);
  }

  const sessions = await DB.prepare(
    'SELECT id, token, ipAddress, userAgent, createdAt, expiresAt FROM session WHERE userId = ? AND expiresAt > unixepoch() ORDER BY createdAt DESC'
  )
    .bind(userId)
    .all<{
      id: string;
      token: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: number;
      expiresAt: number;
    }>();

  recordRateLimit(DB, "admin-sessions", ip, "/api/admin/sessions");

  return json({
    sessions: (sessions.results || []).map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: false, // cannot determine from server side without token comparison
    })),
    total: sessions.results?.length || 0,
  });
}
