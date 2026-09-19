/**
 * Order status for the checkout return page (session-scoped: callers only
 * ever see their own orders).
 * GET /api/payments/status?order=<id> → { status, plan }
 */

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const orderId = url.searchParams.get("order") || "";
  if (!orderId) return json({ error: "missing order" }, 400);

  const cookies = context.request.headers.get("cookie") || "";
  const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
  const token = tokenMatch?.[1];
  if (!token) return json({ error: "sign_in_required" }, 401);

  const session = await context.env.DB.prepare(
    "SELECT userId FROM session WHERE token = ? AND expiresAt > unixepoch()"
  )
    .bind(token)
    .first<{ userId: string }>();
  if (!session?.userId) return json({ error: "sign_in_required" }, 401);

  const row = await context.env.DB.prepare(
    "SELECT p.status, u.plan FROM payment p JOIN \"user\" u ON u.id = p.userId WHERE p.id = ? AND p.userId = ?"
  )
    .bind(orderId, session.userId)
    .first<{ status: string; plan: string }>();
  if (!row) return json({ error: "not_found" }, 404);
  return json({ status: row.status, plan: row.plan });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
