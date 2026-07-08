const ANON_LIMIT = 3;
const SIGNED_IN_EXTRA = 7;
const TOTAL_FREE = ANON_LIMIT + SIGNED_IN_EXTRA;
const KV_KEY_PREFIX = "dl_counter:";
const DAILY_TTL = 24 * 60 * 60; // 24 hours in seconds — auto-resets daily

function getResetDay(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function getFingerprint(request: Request): string {
  const fp = request.headers.get("x-download-fingerprint") || "";
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  return `${ip}_${fp}`;
}

function isSignedIn(request: Request): boolean {
  const cookies = request.headers.get("Cookie") || "";
  return cookies.includes("better-auth_session_token=") || cookies.includes("next-auth.session-token=");
}

export async function onRequestGet(context: any) {
  const { request, env } = context;

  try {
    const fp = getFingerprint(request);
    const signedIn = isSignedIn(request);
    const day = getResetDay();
    const kvKey = `${KV_KEY_PREFIX}${fp}:${day}`;

    let used = 0;
    try {
      const val = await env.KV_CONFIG.get(kvKey, { cacheTtl: 0 });
      if (val) used = parseInt(val, 10) || 0;
    } catch (e) {
      console.error("[toolhub] KV read failed", e);
    }

    const remaining = Math.max(0, TOTAL_FREE - used);
    const totalAllowed = signedIn ? TOTAL_FREE : ANON_LIMIT;

    return new Response(JSON.stringify({
      allowed: remaining > 0,
      remaining,
      total: totalAllowed,
      signedIn,
      day,
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
