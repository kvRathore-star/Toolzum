/**
 * Order status for the checkout return page (session-scoped: callers only
 * ever see their own orders).
 * GET /api/payments/status?order=<id> → { status, plan, granted, credits }
 *
 * `granted` names which grant the webhook applied FOR THIS ORDER:
 * "pack" (credit_grants row attributed to this payment — checked first,
 * so a Pro user buying a pack still sees pack copy), "pro" (plan flipped),
 * "pass" (local row settled, plan still free), null while pending.
 * `credits` is the original pack size when granted==="pack".
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

  let row: { status: string; plan: string; packCredits: number } | null = null;
  try {
    row = await context.env.DB.prepare(
      `SELECT p.status, u.plan,
              (SELECT COALESCE(MAX(credits), 0) FROM credit_grants WHERE userId = u.id AND orderId = p.id) AS packCredits
       FROM payment p JOIN "user" u ON u.id = p.userId WHERE p.id = ? AND p.userId = ?`
    )
      .bind(orderId, session.userId)
      .first<{ status: string; plan: string; packCredits: number }>();
  } catch {
    // migration 0027 not applied — fall back to the legacy shape
    row = await context.env.DB.prepare(
      "SELECT p.status, u.plan, 0 AS packCredits FROM payment p JOIN \"user\" u ON u.id = p.userId WHERE p.id = ? AND p.userId = ?"
    )
      .bind(orderId, session.userId)
      .first<{ status: string; plan: string; packCredits: number }>();
  }
  if (!row) return json({ error: "not_found" }, 404);
  const credits = row.packCredits || 0;
  const granted =
    credits > 0 ? "pack"
    : row.plan === "pro" ? "pro"
    : row.status === "paid" ? "pass"
    : null;
  return json({ status: row.status, plan: row.plan, granted, credits });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
