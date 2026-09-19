/**
 * Shared email sender via Cloudflare Email Sending REST API.
 * Used by contact form, password reset, and email verification.
 *
 * Requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID as Pages secrets.
 * Without them, calls silently succeed (fire-and-forget best-effort).
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
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
          from: { address: "contact@toolzum.com", name: "Toolzum" },
          ...(opts.replyTo ? { reply_to: { address: opts.replyTo } } : {}),
          subject: opts.subject,
          text: opts.text,
          ...(opts.html ? { html: opts.html } : {}),
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
