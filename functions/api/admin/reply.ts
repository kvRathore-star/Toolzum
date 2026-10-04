import { sendEmail, emailConfigured, type EmailAttachment } from "../../../src/lib/email";
import { brandFromText } from "../../../src/lib/emailTemplate";
import { requireAdmin } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";
import type { StoredAttachment } from "../../../src/lib/mailBridge";

/**
 * In-app reply / compose endpoint — the fallback for Gmail's Jan-2027
 * "Send mail as" retirement (docs/EMAIL.md). The owner replies from the
 * admin dashboard and the message goes through the same send pipeline
 * (Resend primary, Cloudflare fallback) as every other Toolzum email:
 * From Toolzum Support <contact@toolzum.com>, branded HTML via
 * brandFromText — subject as headline, plus an "Open Toolzum" CTA button
 * and a "reply reaches the same inbox" note.
 *
 * Auth: admin session (browser UI) OR Bearer ALERT_TOKEN (curl/automation).
 * GET  → capability probe for the UI ({ configured, from }).
 * POST → { to, subject, message, messageId?, attachments? } — an optional
 * messageId ties the send to a contact-inbox row: on success the row flips
 * to `replied` and the reply (with attachment refs, stored in MAIL_KV) is
 * appended to contact_thread_messages so the admin sees the full thread.
 *
 * Attachments: [{ filename, content: base64, mime? }], ≤5 files, ≤8 MB
 * decoded each (mirrors src/lib/attachClient.ts). Resend-only — with
 * attachments present the Cloudflare fallback is refused (no silent strip).
 *
 * Secrets (Pages env, owner-set per docs/ALERTS.md):
 * - RESEND_API_KEY (primary transport)
 * - CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID (fallback)
 * - ATTACH_SECRET (attachment URL signing for the admin thread view)
 * No transport configured: 503 email_unconfigured — never a fake success.
 */

interface Env {
  DB: D1Database;
  MAIL_KV?: KVNamespace;
  ALERT_TOKEN?: string;
  RESEND_API_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  ATTACH_SECRET?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
}

const MAX_SUBJECT = 120;
const MAX_BODY = 5000;
const RATE_PER_MIN = 10;
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
// Total raw cap is a MEMORY limit, not just a Resend limit: the request
// body string, request.json() copy, and Resend JSON.stringify copy are all
// alive at once (~4/3 base64 each) — 12 MB raw peaks near 60 MB against
// the 128 MB Workers ceiling; 25 MB would have OOMed at max payload.
// (Resend's own per-email cap of 40 MB encoded is also respected with room.)
const MAX_TOTAL_ATTACHMENT_BYTES = 12 * 1024 * 1024;

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.replace(/<[^>]*>/g, "").slice(0, max) : "";
}

/**
 * Validate the client-supplied attachment array — throws a user-facing
 * message on the first violation (never silently truncates the files the
 * user picked). Decoded size is estimated from base64 length.
 * Exported for unit tests (src/__tests__/api/admin-reply-api.test.ts).
 */
export function parseAttachments(raw: unknown): EmailAttachment[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new Error("attachments must be an array");
  if (raw.length > MAX_ATTACHMENTS) {
    throw new Error(`at most ${MAX_ATTACHMENTS} attachments per reply`);
  }
  let total = 0;
  return raw.map((a, i) => {
    const att = a as { filename?: unknown; content?: unknown; mime?: unknown };
    const filename = typeof att.filename === "string" ? att.filename.replace(/[\r\n<>\\"/]/g, "").trim().slice(0, 200) : "";
    const content = typeof att.content === "string" ? att.content : "";
    const mime = typeof att.mime === "string" ? att.mime.slice(0, 100) : "";
    if (!filename || !/^[A-Za-z0-9+/]+={0,2}$/.test(content) || content.length % 4 !== 0) {
      throw new Error(`attachment ${i + 1} is malformed`);
    }
    const decodedBytes = Math.floor((content.length * 3) / 4);
    if (decodedBytes > MAX_ATTACHMENT_BYTES) {
      throw new Error(`"${filename}" exceeds the 8 MB per-file limit`);
    }
    total += decodedBytes;
    if (total > MAX_TOTAL_ATTACHMENT_BYTES) {
      throw new Error(`attachments exceed the 12 MB total limit`);
    }
    return { filename, content, mime: mime || undefined };
  });
}

async function isAuthed(request: Request, env: Env): Promise<boolean> {
  const session = await requireAdmin(request, env).catch(() => null);
  if (session && !("error" in session)) return true;
  const authHeader = request.headers.get("authorization") || "";
  return !!env.ALERT_TOKEN && authHeader === `Bearer ${env.ALERT_TOKEN}`;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  if (!(await isAuthed(request, env))) return json({ error: "unauthorized" }, 401);
  return json({
    ok: true,
    from: "contact@toolzum.com",
    fromName: "Toolzum Support",
    configured: emailConfigured(env),
  });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const { DB } = env;

  if (!(await isAuthed(request, env))) return json({ error: "unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const to = clean(body.to, 320);
  const subject = clean(body.subject, MAX_SUBJECT);
  const message = clean(body.message, MAX_BODY);
  const messageId = clean(body.messageId, 64);
  if (!isEmail(to) || !subject || !message) {
    return json({ error: "invalid_params — send { to, subject, message }" }, 400);
  }

  let attachments: EmailAttachment[];
  try {
    attachments = parseAttachments(body.attachments);
  } catch (err) {
    return json({ error: `invalid_attachments — ${err instanceof Error ? err.message : String(err)}` }, 400);
  }

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-reply", ip, RATE_PER_MIN);
  if (rl.limited) return rl.response ?? json({ error: "rate_limited" }, 429);
  recordRateLimit(DB, "admin-reply", ip, "/api/admin/reply");

  if (!emailConfigured(env)) {
    return json({ error: "email_unconfigured" }, 503);
  }

  const sent = await sendEmail(
    env,
    {
      to,
      subject,
      text: message,
      fromName: "Toolzum Support",
      ...(attachments.length ? { attachments } : {}),
      // Branded with the action button + reply note so owner replies look
      // like every other Toolzum email instead of a bare text blob.
      html: brandFromText(subject, message, {
        cta: { label: "Open Toolzum", url: "https://toolzum.com/tools" },
        note: "Just reply to this email to continue the conversation — it reaches the same inbox.",
      }),
    }
  );
  if (!sent) return json({ error: "email_failed" }, 502);

  // Inbox triage (best-effort): when this reply came from the inbox UI the
  // row flips to `replied` — a stamp failure never fails a delivered send.
  if (messageId) {
    try {
      await DB.prepare("UPDATE contact_messages SET status = 'replied' WHERE id = ?")
        .bind(messageId)
        .run();
    } catch (err) {
      console.error(`[admin-reply] status stamp failed (send already delivered): ${String(err)}`);
    }
    // Thread append is independent of the status flip: a missing thread
    // table or KV hiccup never un-delivers or un-records the reply.
    try {
      const threadId = crypto.randomUUID();
      const refs: StoredAttachment[] = [];
      if (attachments.length && env.MAIL_KV) {
        for (let i = 0; i < attachments.length; i++) {
          const a = attachments[i]!;
          const bytes = Uint8Array.from(atob(a.content), (c) => c.charCodeAt(0));
          const key = `c/${threadId}/${i}`;
          await env.MAIL_KV.put(key, bytes, {
            metadata: { name: a.filename, mime: a.mime || "application/octet-stream" },
          });
          refs.push({ key, name: a.filename, mime: a.mime || "application/octet-stream", size: bytes.byteLength });
        }
      } else if (attachments.length) {
        // The recipient already got the files (send succeeded above) — the
        // panel just can't store copies without the binding. Log it loudly
        // so a missing MAIL_KV binding is never an invisible degradation.
        console.error("[admin-reply] MAIL_KV binding missing — attachments delivered but not stored for the thread view");
      }
      await DB.prepare(
        "INSERT INTO contact_thread_messages (id, contact_id, direction, sender, body, attachments, createdAt) VALUES (?, ?, 'out', 'contact@toolzum.com', ?, ?, ?)"
      )
        .bind(threadId, messageId, message, JSON.stringify(refs), Math.floor(Date.now() / 1000))
        .run();
    } catch (err) {
      console.error(`[admin-reply] thread append failed (send already delivered): ${String(err)}`);
    }
  }

  return json({ ok: true, to });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
