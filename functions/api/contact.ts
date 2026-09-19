import { checkRateLimit, recordRateLimit } from "./rate-limit";
import { sendEmail } from "../../src/lib/email";

/**
 * Contact form backend (#contact-honesty). The form used to write to
 * localStorage and fake success — messages went nowhere. Now: validate,
 * rate-limit, honeypot-check, and relay via Cloudflare Email Service.
 *
 * Secrets (Pages env, owner-set per docs/ALERTS.md):
 * - CLOUDFLARE_API_TOKEN (Email Sending permission)
 * - CONTACT_TO (optional, defaults to kirtivardhan1996@gmail.com)
 * Without a token: 503 + the client shows a direct-mail fallback.
 * Never a fake success.
 */

interface Env {
  DB: D1Database;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CONTACT_TO?: string;
}

const MAX_LEN = 2000;

function clean(s: unknown, max = MAX_LEN): string {
  return typeof s === "string" ? s.replace(/<[^>]*>/g, "").slice(0, max) : "";
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { DB, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CONTACT_TO } = context.env;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";

  const rl = await checkRateLimit(DB, "contact", ip, 5);
  if (rl.limited) return rl.response;
  recordRateLimit(DB, "contact", ip, "/api/contact");

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  if (typeof body.website === "string" && body.website.length > 0) {
    return json({ ok: true });
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 320);
  const subject = clean(body.subject, 100) || "general";
  const message = clean(body.message, 5000);
  if (!name || !isEmail(email) || !message) {
    return json({ error: "invalid_params — send { name, email, subject?, message }" }, 400);
  }

  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
    return json({ error: "email_unconfigured", to: CONTACT_TO || "kirtivardhan1996@gmail.com" }, 503);
  }

  const to = CONTACT_TO || "kirtivardhan1996@gmail.com";
  const sent = await sendEmail(
    { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID },
    {
      to,
      subject: `[Contact:${subject}] from ${name}`,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
      replyTo: email,
    }
  );

  if (!sent) {
    return json({ error: "email_failed", to }, 502);
  }

  return json({ ok: true });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
