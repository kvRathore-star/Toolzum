import { checkRateLimit, recordRateLimit } from "../rate-limit";
import { checkAnonDlVelocity } from "../_abuse";
import { maybePurgeOldRows } from "../_retention";
import { createAuth } from "../../../src/lib/auth";
import { resolvePlan, downloadLimit } from "../../../src/lib/planTiers";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

function getUserLimit(plan: ReturnType<typeof resolvePlan>, isProTool: boolean): number {
  return downloadLimit(plan, isProTool);
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const { request } = context;
    const ip = request.headers.get("cf-connecting-ip") || "unknown";

    const rl = await checkRateLimit(DB, "dl-record", ip, 10);
    if (rl.limited) return rl.response;

    // #26: sampled 90-day retention enforcement (no cron on Pages).
    await maybePurgeOldRows(DB);

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

    // Identify user via better-auth (see check.ts — manual token lookup
    // never matches the HMAC-signed session cookie).
    const auth = createAuth({
      DB,
      GOOGLE_CLIENT_ID: context.env.GOOGLE_CLIENT_ID as string,
      GOOGLE_CLIENT_SECRET: context.env.GOOGLE_CLIENT_SECRET as string,
      BETTER_AUTH_SECRET: context.env.BETTER_AUTH_SECRET as string,
      BETTER_AUTH_URL: context.env.BETTER_AUTH_URL as string,
      TURNSTILE_SECRET_KEY: context.env.TURNSTILE_SECRET_KEY as string,
    });
    const session = await auth.api.getSession({ headers: request.headers });
    let plan = resolvePlan(false, null);
    let userId: string | null = null;
    if (session?.user?.id) {
      userId = session.user.id;
      const row = await DB.prepare("SELECT plan FROM user WHERE id = ?")
        .bind(userId)
        .first<{ plan: string }>();
      plan = resolvePlan(true, row?.plan ?? null);
    }

    // #37 rotation backstop: the anon fingerprint quota is self-reported
    // and rotatable — cap total attempts per IP per day (signed-in users
    // are identity-bound already, so they skip this).
    if (!userId) {
      const vel = await checkAnonDlVelocity(DB, ip, "/downloads/record");
      if (vel) return vel;
    }

    const limit = getUserLimit(plan, isProTool);
    const baseFingerprint = userId || request.headers.get('x-download-fingerprint') || 'unknown';
    const fingerprint = isProTool ? `pro:${baseFingerprint}` : baseFingerprint;
    const userType = plan === 'pro' ? 'pro' : plan === 'signedin' ? 'signedin' : 'anon';
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
