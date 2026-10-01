import { sendEmail, emailConfigured } from "../../../src/lib/email";
import { requireAdmin } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";

/**
 * In-app reply / compose endpoint — the fallback for Gmail's Jan-2027
 * "Send mail as" retirement (docs/EMAIL.md). The owner replies from the
 * admin dashboard and the message goes through the same send pipeline
 * (Resend primary, Cloudflare fallback) as every other Toolzum email:
 * From Toolzum Support <contact@toolzum.com>, branded HTML via
 * brandFromText (html omitted).
 *
 * Auth: admin session (browser UI) OR Bearer ALERT_TOKEN (curl/automation).
 * GET  → capability probe for the UI ({ configured, from }).
 * POST → { to, subject, message }.
 *
 * Secrets (Pages env, owner-set per docs/ALERTS.md):
 * - RESEND_API_KEY (primary transport)
 * - CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID (fallback)
 * No transport configured: 503 email_unconfigured — never a fake success.
 */

interface Env {
  DB: D1Database;
  ALERT_TOKEN?: string;
  RESEND_API_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
}

const MAX_SUBJECT = 120;
const MAX_BODY = 5000;
const RATE_PER_MIN = 10;

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.replace(/<[^>]*>/g, "").slice(0, max) : "";
}

async function isAuthed(request: Request, env: Env): Promise<boolean> {
  const session = await requireAdmin(request, env).catch(() => null);
  if (session && !("error" in session)) return true;
  const authHeader = request.headers.get("authorization") || "";
  return !!env.ALERT_TOKEN && authHeader === `Bearer ${env.ALERT_TOKEN}`;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  if (!(await isAuthed(request, env))) return json({ error: "unauthorized" }, 401);
  return json({
    ok: true,
    from: "contact@toolzum.com",
    fromName: "Toolzum Support",
    configured: emailConfigured(env),
  });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const { DB } = env;

  if (!(await isAuthed(request, env))) return json({ error: "unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const to = clean(body.to, 320);
  const subject = clean(body.subject, MAX_SUBJECT);
  const message = clean(body.message, MAX_BODY);
  if (!isEmail(to) || !subject || !message) {
    return json({ error: "invalid_params — send { to, subject, message }" }, 400);
  }

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-reply", ip, RATE_PER_MIN);
  if (rl.limited) return rl.response ?? json({ error: "rate_limited" }, 429);
  recordRateLimit(DB, "admin-reply", ip, "/api/admin/reply");

  if (!emailConfigured(env)) {
    return json({ error: "email_unconfigured" }, 503);
  }

  const sent = await sendEmail(
    env,
    { to, subject, text: message, fromName: "Toolzum Support" }
  );
  if (!sent) return json({ error: "email_failed" }, 502);

  return json({ ok: true, to });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
