const ANON_LIMIT = 2;
const SIGNED_IN_EXTRA = 3;
const TOTAL_FREE = ANON_LIMIT + SIGNED_IN_EXTRA;
const KV_KEY_PREFIX = "dl_counter:";
const MONTHLY_TTL = 30 * 24 * 60 * 60;

function getResetMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const fp = getFingerprint(request);
    const signedIn = isSignedIn(request);
    const month = getResetMonth();
    const kvKey = `${KV_KEY_PREFIX}${fp}:${month}`;

    let used = 0;
    try {
      const val = await env.KV_CONFIG.get(kvKey, { cacheTtl: 0 });
      if (val) used = parseInt(val, 10) || 0;
    } catch (e) {
      console.error("[toolhub] KV read failed", e);
    }

    const limit = signedIn ? TOTAL_FREE : ANON_LIMIT;

    if (used >= limit) {
      return new Response(JSON.stringify({ allowed: false, remaining: 0 }), {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    used++;
    await env.KV_CONFIG.put(kvKey, String(used), { expirationTtl: MONTHLY_TTL });

    return new Response(JSON.stringify({ allowed: true, remaining: Math.max(0, limit - used), month }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
