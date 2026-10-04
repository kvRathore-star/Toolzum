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
 * With neither: returns false and logs why, callers surface honest failures.
 * Every transport failure is logged to Pages function logs (status + body
 * snippet) — a revoked key or quota wall is never invisible.
 */

import { brandFromText } from "./emailTemplate";

export interface EmailAttachment {
  filename: string;
  /** Base64-encoded file bytes (Resend wire format). */
  content: string;
  mime?: string;
}

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
  /** Base64 attachments (admin replies from the inbox). Resend only. */
  attachments?: EmailAttachment[];
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

/**
 * Failure visibility: transports log status + truncated response body to
 * Pages function logs (console.error) so a revoked key or quota wall shows
 * up somewhere instead of failing silently — callers still get `false` to
 * surface their own honest error.
 */
async function logFailure(
  transport: "resend" | "cloudflare",
  opts: EmailOptions,
  res: Response
): Promise<void> {
  let detail = "";
  try {
    detail = await res.text();
  } catch {
    /* body unavailable (mocked/test responses) — status still identifies it */
  }
  console.error(
    `[email] ${transport} rejected: HTTP ${res.status} — to=${opts.to} subject="${opts.subject}"${detail ? ` detail=${detail.slice(0, 300)}` : ""}`
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
        ...(opts.attachments && opts.attachments.length
          ? {
              attachments: opts.attachments.map((a) => ({
                filename: a.filename,
                content: a.content,
                ...(a.mime ? { content_type: a.mime } : {}),
              })),
            }
          : {}),
      }),
    });
    if (res.ok) return true;
    await logFailure("resend", opts, res);
    return false;
  } catch (err) {
    console.error(
      `[email] resend threw: ${String(err)} — to=${opts.to} subject="${opts.subject}"`
    );
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
    if (res.ok) return true;
    await logFailure("cloudflare", opts, res);
    return false;
  } catch (err) {
    console.error(
      `[email] cloudflare threw: ${String(err)} — to=${opts.to} subject="${opts.subject}"`
    );
    return false;
  }
}

export async function sendEmail(
  env: EmailEnv,
  opts: EmailOptions
): Promise<boolean> {
  const html = opts.html ?? brandFromText(opts.subject, opts.text);

  if (!emailConfigured(env)) {
    console.error(
      `[email] no transport configured (missing RESEND_API_KEY) — to=${opts.to} subject="${opts.subject}"`
    );
    return false;
  }

  // Resend first (works for arbitrary recipients on the free tier). On
  // failure fall back to Cloudflare — harmless: it either succeeds (owner's
  // verified address) or rejects (arbitrary recipient) and we report false.
  if (env.RESEND_API_KEY) {
    const ok = await sendViaResend(env.RESEND_API_KEY, opts, html);
    if (ok) return true;
  }

  // Attachments are Resend-only: the Cloudflare fallback has no attachment
  // support, and silently dropping files from a delivered reply would be a
  // lie to the recipient. Fail honestly instead — caller surfaces email_failed.
  if (opts.attachments && opts.attachments.length) {
    console.error(
      `[email] resend failed with attachments — refusing attachment-less fallback — to=${opts.to} subject="${opts.subject}"`
    );
    return false;
  }

  return sendViaCloudflare(env, opts, html);
}
