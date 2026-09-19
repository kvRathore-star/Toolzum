/**
 * Shared Cloudflare Turnstile server-side verification for Pages Functions.
 *
 * Mirrors the better-auth captcha plugin convention: enforcement only
 * applies when TURNSTILE_SECRET_KEY is configured (unset in local dev →
 * callers should allow the request through, rate limits still apply).
 */

export async function verifyTurnstile(
  secret: string | undefined,
  token: unknown,
  ip?: string,
): Promise<{ ok: boolean; skipped: boolean }> {
  if (!secret) return { ok: true, skipped: true };
  if (typeof token !== "string" || !token) return { ok: false, skipped: false };
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip && ip !== "unknown" ? { remoteip: ip } : {}),
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return { ok: !!data.success, skipped: false };
  } catch {
    return { ok: false, skipped: false };
  }
}
