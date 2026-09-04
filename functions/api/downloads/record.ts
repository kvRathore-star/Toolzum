import { checkRateLimit, recordRateLimit } from "../rate-limit";

interface Env {
  DB: D1Database;
}

function getUserLimit(plan: string | null, isProTool: boolean): number {
  if (plan === 'pro') return Infinity;
  if (isProTool) return plan ? 2 : 0;
  return plan ? 5 : 3;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const { request } = context;
    const ip = request.headers.get("cf-connecting-ip") || "unknown";

    const rl = await checkRateLimit(DB, "dl-record", ip, 10);
    if (rl.limited) return rl.response;

    // Parse optional body fields (toolSlug, category, isPro) sent by the client
    let toolSlug: string | null = null;
    let category: string | null = null;
    let isProTool = false;
    try {
      const body = await request.clone().json<{ toolSlug?: string; category?: string; isPro?: boolean }>();
      toolSlug = body.toolSlug || null;
      category = body.category || null;
      isProTool = body.isPro === true;
    } catch {
      // Body may be empty (legacy callers) — that's fine
    }

    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
    const token = tokenMatch?.[1];
    let plan: string | null = null;
    let userId: string | null = null;
    if (token) {
      const user = await DB.prepare(
        "SELECT u.plan, s.userId FROM session s JOIN user u ON u.id = s.userId WHERE s.token = ? AND s.expiresAt > unixepoch()"
      ).bind(token).first<{ plan: string; userId: string }>();
      plan = user?.plan || null;
      userId = user?.userId || null;
    }

    const limit = getUserLimit(plan, isProTool);
    const baseFingerprint = userId || request.headers.get('x-download-fingerprint') || 'unknown';
    const fingerprint = isProTool ? `pro:${baseFingerprint}` : baseFingerprint;
    const userType = plan === 'pro' ? 'pro' : plan ? 'signedin' : 'anon';
    const today = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;

    // Pro users: immediate allow, no tracking needed
    if (limit === Infinity) {
      recordRateLimit(DB, "dl-record", ip, "/downloads/record");
      if (toolSlug) {
        await DB.prepare(
          `INSERT INTO download_event (userId, fingerprint, userType, toolSlug, category, outcome, dailyCount, dailyLimit, createdAt)
           VALUES (?, ?, ?, ?, ?, 'allowed', 0, 999, unixepoch())`
        ).bind(userId, fingerprint, userType, toolSlug, category).run();
      }
      return new Response(JSON.stringify({ allowed: true, remaining: 999 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Anonymous users on Pro tools: immediate block
    if (limit === 0) {
      recordRateLimit(DB, "dl-record", ip, "/downloads/record");
      if (toolSlug) {
        await DB.prepare(
          `INSERT INTO download_event (userId, fingerprint, userType, toolSlug, category, outcome, dailyCount, dailyLimit, createdAt)
           VALUES (?, ?, ?, ?, ?, 'blocked_pro_anon', 0, 0, unixepoch())`
        ).bind(userId, fingerprint, userType, toolSlug, category).run();
      }
      return new Response(JSON.stringify({ allowed: false, remaining: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = await DB.prepare(
      "SELECT id, count FROM download_usage WHERE fingerprint = ? AND date = ?"
    ).bind(fingerprint, today).first<{ id: number; count: number }>();

    const currentCount = existing?.count || 0;

    // Blocked: daily quota exhausted
    if (currentCount >= limit) {
      recordRateLimit(DB, "dl-record", ip, "/downloads/record");
      if (toolSlug) {
        await DB.prepare(
          `INSERT INTO download_event (userId, fingerprint, userType, toolSlug, category, outcome, dailyCount, dailyLimit, createdAt)
           VALUES (?, ?, ?, ?, ?, 'blocked_quota', ?, ?, unixepoch())`
        ).bind(userId, fingerprint, userType, toolSlug, category, currentCount, limit).run();
      }
      return new Response(JSON.stringify({ allowed: false, remaining: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Allowed: increment counter
    if (existing) {
      await DB.prepare(
        "UPDATE download_usage SET count = count + 1, updatedAt = datetime('now') WHERE id = ?"
      ).bind(existing.id).run();
    } else {
      await DB.prepare(
        "INSERT INTO download_usage (fingerprint, date, count, createdAt, updatedAt) VALUES (?, ?, 1, datetime('now'), datetime('now'))"
      ).bind(fingerprint, today).run();
    }

    // Log the event
    if (toolSlug) {
      await DB.prepare(
        `INSERT INTO download_event (userId, fingerprint, userType, toolSlug, category, outcome, dailyCount, dailyLimit, createdAt)
         VALUES (?, ?, ?, ?, ?, 'allowed', ?, ?, unixepoch())`
      ).bind(userId, fingerprint, userType, toolSlug, category, currentCount + 1, limit).run();
    }

    recordRateLimit(DB, "dl-record", ip, "/downloads/record");
    return new Response(JSON.stringify({ allowed: true, remaining: limit - currentCount - 1 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ allowed: false, remaining: 0 }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
