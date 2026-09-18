import { checkRateLimit, recordRateLimit } from "./rate-limit";

/**
 * Contact form backend (#contact-honesty). The form used to write to
 * localStorage and fake success — messages went nowhere. Now: validate,
 * rate-limit, honeypot-check, and relay via Cloudflare Email Service.
 *
 * Secrets (Pages env, owner-set per docs/ALERTS.md):
 * - CLOUDFLARE_API_TOKEN (Email Sending permission)
 * - CONTACT_TO (optional, defaults to support@toolzum.com)
 * Without a token: 503 + the client shows a direct-mail fallback.
 * Never a fake success.
 */

interface Env {
  DB: D1Database;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CONTACT_TO?: string;
}

const SUPPORT_FALLBACK = "support@toolzum.com";
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
  // Count every call (not just successes) so invalid-payload spam still
  // burns the sender's budget.
  recordRateLimit(DB, "contact", ip, "/api/contact");

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  // Honeypot: bots fill it, humans never see it. Swallow silently so
  // bots can't probe the validation rules.
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
    return json({ error: "email_unconfigured", to: CONTACT_TO || SUPPORT_FALLBACK }, 503);
  }

  const to = CONTACT_TO || SUPPORT_FALLBACK;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/email/sending/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: [{ address: to }],
          from: { address: "contact@toolzum.com", name: "Toolzum Contact" },
          reply_to: email,
          subject: `[Contact:${subject}] from ${name}`,
          text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
        }),
      },
    );
    if (!res.ok) {
      return json({ error: "email_failed", to }, 502);
    }
  } catch {
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
