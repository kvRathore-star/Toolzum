import { jsonResponse, errorResponse, rateLimitCheck, handleOptions } from "../../_shared";

const ANON_LIMIT = 3;
const SIGNED_IN_EXTRA = 7;
const TOTAL_FREE = ANON_LIMIT + SIGNED_IN_EXTRA;
const KV_KEY_PREFIX = "dl_counter:";
const DAILY_TTL = 24 * 60 * 60;

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

export async function onRequestPost(context: any) {
  const { request, env } = context;

  const options = handleOptions(request);
  if (options) return options;

  if (!await rateLimitCheck(context, request)) {
    return errorResponse("Rate limit exceeded. Try again shortly.", 429, "RATE_LIMITED");
  }

  try {
    const fp = getFingerprint(request);
    const signedIn = isSignedIn(request);
    const day = getResetDay();
    const kvKey = `${KV_KEY_PREFIX}${fp}:${day}`;

    let used = 0;
    try {
      const val = await env.KV_CONFIG.get(kvKey, { cacheTtl: 0 });
      if (val) used = parseInt(val, 10) || 0;
    } catch {
      // KV read failed — treat as zero downloads
    }

    const limit = signedIn ? TOTAL_FREE : ANON_LIMIT;

    if (used >= limit) {
      return jsonResponse({ allowed: false, remaining: 0 });
    }

    used++;
    await env.KV_CONFIG.put(kvKey, String(used), { expirationTtl: DAILY_TTL });

    return jsonResponse({ allowed: true, remaining: Math.max(0, limit - used), day });
  } catch {
    return errorResponse("Internal error", 500);
  }
}
