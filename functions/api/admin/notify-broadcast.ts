import { sendEmail } from "../../../src/lib/email";
import { renderEmail } from "../../../src/lib/emailTemplate";
import { requireAdmin } from "../../../src/lib/admin-auth";

/**
 * Launch-broadcast sender for the notify-me waitlist (#notify-me).
 *
 * Auth: EITHER an admin session (browser UI) OR Bearer ALERT_TOKEN
 * (curl / automation). Session path uses requireAdmin; token path
 * matches alerts-check.
 * GET /api/admin/notify-broadcast?tool=<slug>&limit=<n>
 *
 * Sends a launch email to every address waiting on `tool` whose
 * notifiedAt IS NULL, then stamps notifiedAt. Idempotent: re-running
 * only touches unstamped rows. Batched small (default 25, max 50) to
 * stay under the free-plan subrequest ceiling per invocation.
 */

interface Env {
  DB: D1Database;
  ALERT_TOKEN?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;
const POLITENESS_MS = 150;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function isSlug(s: string): boolean {
  return /^[a-z0-9-]{1,80}$/.test(s);
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const { DB, ALERT_TOKEN } = env;

  // Session admin (browser UI) OR bearer token (curl/automation).
  const session = await requireAdmin(request, env).catch(() => null);
  const authedBySession = !!session && !("error" in session);
  const authHeader = request.headers.get("authorization") || "";
  const authedByToken = !!ALERT_TOKEN && authHeader === `Bearer ${ALERT_TOKEN}`;
  if (!authedBySession && !authedByToken) {
    if (!ALERT_TOKEN) return json({ error: "broadcast_not_configured" }, 503);
    return json({ error: "unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const tool = (url.searchParams.get("tool") || "").trim();
  const subject = (url.searchParams.get("subject") || "").trim().slice(0, 120);
  const link = (url.searchParams.get("link") || "").trim().slice(0, 200);
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") || "", 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  if (!isSlug(tool)) {
    return json({ error: "invalid_params — send ?tool=<slug>&subject=…&link=…" }, 400);
  }
  if (!subject || !link || !/^https:\/\/toolzum\.com\//.test(link)) {
    return json({ error: "subject and link (https://toolzum.com/…) required" }, 400);
  }

  let rows: { email: string }[];
  try {
    const res = await DB.prepare(
      "SELECT email FROM notify_waitlist WHERE tool_slug = ? AND notifiedAt IS NULL LIMIT ?"
    )
      .bind(tool, limit)
      .all<{ email: string }>();
    rows = res.results || [];
  } catch {
    return json({ error: "store_unavailable" }, 502);
  }

  let sent = 0;
  const failed: string[] = [];
  for (const row of rows) {
    const ok = await sendEmail(env, {
      to: row.email,
      subject,
      text: `Good news — the wait is over.\n\n${subject}\n\nOpen it here: ${link}\n\nYou're receiving this because you joined the launch waitlist on toolzum.com.`,
      html: renderEmail({
        heading: subject,
        greeting: "The wait is over — the tool you asked for is live.",
        paragraphs: [
          "Good news — the wait is over. The tool you asked us to build is live and ready.",
        ],
        cta: { label: "Open the tool", url: link },
        note: "You're receiving this because you joined the launch waitlist on toolzum.com.",
      }),
    });
    if (ok) {
      sent++;
      try {
        await DB.prepare(
          "UPDATE notify_waitlist SET notifiedAt = datetime('now') WHERE email = ? AND tool_slug = ? AND notifiedAt IS NULL"
        )
          .bind(row.email, tool)
          .run();
      } catch {
        /* stamp best-effort — unstamped rows retry next run */
      }
    } else {
      failed.push(row.email);
    }
    await sleep(POLITENESS_MS);
  }

  let remaining = 0;
  try {
    const r = await DB.prepare(
      "SELECT COUNT(*) as c FROM notify_waitlist WHERE tool_slug = ? AND notifiedAt IS NULL"
    )
      .bind(tool)
      .first<{ c: number }>();
    remaining = r?.c ?? 0;
  } catch {
    /* remaining best-effort */
  }

  return json({ ok: true, tool, sent, failed: failed.length, remaining });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
