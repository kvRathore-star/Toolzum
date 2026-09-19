/// <reference types="@cloudflare/workers-types" />
/**
 * toolzum-temp-inbox — disposable email receiver at t.toolzum.com.
 *
 * Email Routing rule `*@t.toolzum.com` → Send to Worker delivers here.
 * - email(): validates recipient, parses with postal-mime, stores (capped).
 * - fetch(): CORS-locked JSON API for the Temp Email tool page:
 *     POST /api/temp-address        { captcha } → { address, expiresAt }
 *     GET  /api/temp-inbox?address= → { address, expiresAt, messages[] }
 *     DELETE /api/temp-inbox?address= → { ok: true }
 *
 * Abuse controls: Turnstile on creation, 60-min TTL, 512KB raw cap,
 * 50 msgs/address, 200 live addresses globally, no outbound sending.
 */

import PostalMime from "postal-mime";

interface Env {
  DB: D1Database;
  TURNSTILE_SECRET_KEY?: string;
}

const DOMAIN = "t.toolzum.com";
const TTL_S = 3600;
const MAX_RAW_BYTES = 512 * 1024;
const MAX_MSGS_PER_ADDRESS = 50;
const MAX_LIVE_ADDRESSES = 200;
const BODY_TRUNCATE = 10000;
const ALLOWED_ORIGINS = ["https://toolzum.com", "http://localhost:3000"];

const ADJECTIVES = (
  "amber ash azure bold brave bright brisk calm clever cobalt coral crisp dawn eager ember fleet frost glad grand hazy ivory jade keen kind lively lucid lunar mild misty neon noble north ocean olive opal peach pearl pine plum quick quiet rapid red round royal sage sandy sharp silent silver sleek small smart solar south sunny swift teal vivid warm wild"
).split(" ");
const NOUNS = (
  "anchor arrow badger beacon birch blade bridge brook cabin comet cove crane creek dawn drift falcon fern finch fox grove gull harbor hawk heron hill inlet iris jay kite lake lark leaf lotus maple meadow mesa moon moth otter owl peak pine piper quail raven reef ridge river robin rock rook sage seal shell shore sparrow spruce stone stream swift tern tide trail trout turtle vale wave wren"
).split(" ");

function json(data: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
      Vary: "Origin",
    },
  });
}

function corsOrigin(request: Request): string | null {
  const o = request.headers.get("origin") || "";
  return ALLOWED_ORIGINS.includes(o) ? o : null;
}

function randomAddress(): string {
  const pick = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)];
  const digits = Math.floor(10 + Math.random() * 90);
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}${digits}@${DOMAIN}`;
}

function validAddress(addr: string): boolean {
  return /^[a-z]+-[a-z]+[0-9]{2}@t\.toolzum\.com$/.test(addr);
}

async function prune(DB: D1Database, now: number): Promise<void> {
  try {
    await DB.batch([
      DB.prepare("DELETE FROM temp_message WHERE address IN (SELECT address FROM temp_address WHERE expiresAt < ?)").bind(now),
      DB.prepare("DELETE FROM temp_address WHERE expiresAt < ?").bind(now),
    ]);
  } catch {
    /* best-effort */
  }
}

async function verifyTurnstile(secret: string | undefined, token: unknown): Promise<boolean> {
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

async function handleCreate(request: Request, env: Env, origin: string | null): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid json" }, 400, origin);
  }
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.captcha))) {
    return json({ error: "captcha_failed" }, 403, origin);
  }
  const now = Math.floor(Date.now() / 1000);
  await prune(env.DB, now);
  try {
    const count = await env.DB.prepare(
      "SELECT COUNT(*) as c FROM temp_address WHERE expiresAt > ?"
    )
      .bind(now)
      .first<{ c: number }>();
    if ((count?.c ?? 0) >= MAX_LIVE_ADDRESSES) {
      return json({ error: "capacity_full" }, 503, origin);
    }
    // Retry on (astronomically unlikely) address collision.
    for (let i = 0; i < 5; i++) {
      const address = randomAddress();
      try {
        await env.DB.prepare(
          "INSERT INTO temp_address (address, createdAt, expiresAt) VALUES (?, ?, ?)"
        )
          .bind(address, now, now + TTL_S)
          .run();
        return json({ address, expiresAt: now + TTL_S, ttlSeconds: TTL_S }, 200, origin);
      } catch {
        /* collision — retry */
      }
    }
    return json({ error: "store_failed" }, 502, origin);
  } catch {
    return json({ error: "store_unavailable" }, 502, origin);
  }
}

async function handleInbox(request: Request, env: Env, origin: string | null): Promise<Response> {
  const url = new URL(request.url);
  const address = (url.searchParams.get("address") || "").trim().toLowerCase();
  if (!validAddress(address)) return json({ error: "invalid address" }, 400, origin);
  const now = Math.floor(Date.now() / 1000);
  try {
    const row = await env.DB.prepare(
      "SELECT address, expiresAt FROM temp_address WHERE address = ?"
    )
      .bind(address)
      .first<{ address: string; expiresAt: number }>();
    if (!row || row.expiresAt <= now) return json({ error: "expired" }, 404, origin);
    const msgs = await env.DB.prepare(
      "SELECT sender, subject, body, receivedAt FROM temp_message WHERE address = ? ORDER BY receivedAt DESC LIMIT 50"
    )
      .bind(address)
      .all<{ sender: string; subject: string; body: string; receivedAt: number }>();
    return json(
      { address, expiresAt: row.expiresAt, messages: msgs.results || [] },
      200,
      origin,
    );
  } catch {
    return json({ error: "store_unavailable" }, 502, origin);
  }
}

async function handleDelete(request: Request, env: Env, origin: string | null): Promise<Response> {
  const url = new URL(request.url);
  const address = (url.searchParams.get("address") || "").trim().toLowerCase();
  if (!validAddress(address)) return json({ error: "invalid address" }, 400, origin);
  try {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM temp_message WHERE address = ?").bind(address),
      env.DB.prepare("DELETE FROM temp_address WHERE address = ?").bind(address),
    ]);
    return json({ ok: true }, 200, origin);
  } catch {
    return json({ error: "store_unavailable" }, 502, origin);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = corsOrigin(request);
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          Vary: "Origin",
        },
      });
    }
    if (url.pathname === "/api/temp-address" && request.method === "POST") {
      return handleCreate(request, env, origin);
    }
    if (url.pathname === "/api/temp-inbox" && request.method === "GET") {
      return handleInbox(request, env, origin);
    }
    if (url.pathname === "/api/temp-inbox" && request.method === "DELETE") {
      return handleDelete(request, env, origin);
    }
    return json({ error: "not found" }, 404, origin);
  },

  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const to = (message.to || "").toLowerCase();
    if (!to.endsWith(`@${DOMAIN}`)) return; // not ours — drop
    if (message.rawSize > MAX_RAW_BYTES) {
      message.setReject("Message too large");
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    const row = await env.DB.prepare(
      "SELECT address FROM temp_address WHERE address = ? AND expiresAt > ?"
    )
      .bind(to, now)
      .first<{ address: string }>()
      .catch(() => null);
    if (!row) {
      message.setReject("Mailbox expired or unknown");
      return;
    }
    let sender = message.from || "";
    let subject = "";
    let body = "";
    try {
      const raw = await new Response(message.raw).arrayBuffer();
      const parsed = await PostalMime.parse(raw);
      subject = (parsed.subject || "").slice(0, 300);
      body = (parsed.text || parsed.html || "").slice(0, BODY_TRUNCATE);
      if (parsed.from) {
        sender = parsed.from.address || sender;
      }
    } catch {
      subject = message.headers.get("subject") || "";
      body = "";
    }
    try {
      await env.DB.prepare(
        "INSERT INTO temp_message (address, sender, subject, body, receivedAt) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(to, sender.slice(0, 320), subject, body, now)
        .run();
      // Cap messages per address (keep newest).
      await env.DB.prepare(
        `DELETE FROM temp_message WHERE address = ? AND id NOT IN
         (SELECT id FROM temp_message WHERE address = ? ORDER BY receivedAt DESC LIMIT ?)`
      )
        .bind(to, to, MAX_MSGS_PER_ADDRESS)
        .run()
        .catch(() => {});
    } catch {
      /* store failed — message already consumed; nothing to do */
    }
  },
} satisfies ExportedHandler<Env>;
