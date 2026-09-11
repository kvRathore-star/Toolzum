import { createAuth } from "../../../src/lib/auth";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export const FREE_CREDITS = 30;
export const PRO_CREDITS = 300;
const CREDIT_RESET_DAYS = 30;

/**
 * Live credit balance. Dashboard/account pages used to read `credits` from
 * the session snapshot, which only refreshes on the rolling session window
 * (up to 1 day) — balances stayed stale after AI use. This endpoint reads
 * D1 directly and applies the same monthly reset as ai/generate, so the
 * client can overlay fresh values with the session as fallback.
 */
export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;

    const auth = createAuth({
      DB,
      GOOGLE_CLIENT_ID: context.env.GOOGLE_CLIENT_ID as string,
      GOOGLE_CLIENT_SECRET: context.env.GOOGLE_CLIENT_SECRET as string,
      BETTER_AUTH_SECRET: context.env.BETTER_AUTH_SECRET as string,
      BETTER_AUTH_URL: context.env.BETTER_AUTH_URL as string,
      TURNSTILE_SECRET_KEY: context.env.TURNSTILE_SECRET_KEY as string,
    });
    const session = await auth.api.getSession({ headers: context.request.headers });
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const row = await DB.prepare(
      "SELECT plan, credits, creditResetAt FROM user WHERE id = ?"
    )
      .bind(session.user.id)
      .first<{ plan: string | null; credits: number | null; creditResetAt: number | null }>();
    if (!row) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const plan = row.plan || "free";
    const allowance = plan === "pro" ? PRO_CREDITS : FREE_CREDITS;
    let credits = row.credits ?? allowance;

    const now = Date.now();
    if (!row.creditResetAt || now - row.creditResetAt >= CREDIT_RESET_DAYS * 24 * 60 * 60 * 1000) {
      await DB.prepare("UPDATE user SET credits = ?, creditResetAt = ? WHERE id = ?")
        .bind(allowance, now, session.user.id)
        .run();
      credits = allowance;
    }

    return new Response(JSON.stringify({ credits, plan, allowance }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
