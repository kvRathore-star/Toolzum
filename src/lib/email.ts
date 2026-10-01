/**
 * Shared email sender. Primary transport: Resend REST API (free tier —
 * Workers Free cannot send to arbitrary recipients via Cloudflare Email
 * Sending, only to verified destinations). Fallback: Cloudflare Email
 * Sending REST API (still works for the owner's verified relay address).
 * Used by contact form, password reset, and email verification.
 *
 * Every message ships branded HTML (dark Toolzum card, accent bar, wordmark,
 * footer) — callers that omit `html` get it via brandFromText(subject, text);
 * callers that want a CTA button or detail rows pass `html: renderEmail(...)`.
 * The plain `text` twin is always sent as the fallback part.
 *
 * Requires RESEND_API_KEY (Pages secret) — or the legacy pair
 * CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID — as Pages secrets.
 * With neither: returns false, callers surface honest failures.
 */

import { brandFromText } from "./emailTemplate";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /**
   * Sender display name only — the address stays contact@toolzum.com (single
   * verified sender, replies forward to the owner). Per-type names like
   * "Toolzum Billing" help recipients sort signal from noise at a glance.
   */
  fromName?: string;
}

export interface EmailEnv {
  RESEND_API_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
}

/** True when any transport is configured (Resend alone is enough). */
export function emailConfigured(env: EmailEnv): boolean {
  return !!(
    env.RESEND_API_KEY ||
    (env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID)
  );
}

async function sendViaResend(
  apiKey: string,
  opts: EmailOptions,
  html: string
): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${opts.fromName || "Toolzum"} <contact@toolzum.com>`,
        to: [opts.to],
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
        subject: opts.subject,
        text: opts.text,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendViaCloudflare(
  env: EmailEnv,
  opts: EmailOptions,
  html: string
): Promise<boolean> {
  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID } = env;
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) return false;

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
          to: [{ address: opts.to }],
          from: { address: "contact@toolzum.com", name: opts.fromName || "Toolzum" },
          ...(opts.replyTo ? { reply_to: { address: opts.replyTo } } : {}),
          subject: opts.subject,
          text: opts.text,
          html,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendEmail(
  env: EmailEnv,
  opts: EmailOptions
): Promise<boolean> {
  const html = opts.html ?? brandFromText(opts.subject, opts.text);

  // Resend first (works for arbitrary recipients on the free tier). On
  // failure fall back to Cloudflare — harmless: it either succeeds (owner's
  // verified address) or rejects (arbitrary recipient) and we report false.
  if (env.RESEND_API_KEY) {
    const ok = await sendViaResend(env.RESEND_API_KEY, opts, html);
    if (ok) return true;
  }

  return sendViaCloudflare(env, opts, html);
}
