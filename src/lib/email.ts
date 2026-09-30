/**
 * Shared email sender via Cloudflare Email Sending REST API.
 * Used by contact form, password reset, and email verification.
 *
 * Every message ships branded HTML (dark Toolzum card, accent bar, wordmark,
 * footer) — callers that omit `html` get it via brandFromText(subject, text);
 * callers that want a CTA button or detail rows pass `html: renderEmail(...)`.
 * The plain `text` twin is always sent as the fallback part.
 *
 * Requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID as Pages secrets.
 * Without them, calls silently succeed (fire-and-forget best-effort).
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

export async function sendEmail(
  env: { CLOUDFLARE_API_TOKEN?: string; CLOUDFLARE_ACCOUNT_ID?: string },
  opts: EmailOptions
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
          html: opts.html ?? brandFromText(opts.subject, opts.text),
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
