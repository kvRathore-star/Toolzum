/**
 * toolzum-mail-bridge — inbound contact/support email pipeline.
 *
 * Email Routing rules for contact@ and support@ point here instead of
 * straight to Gmail. Per message:
 *   1. buffer message.raw (single read, survives later steps)
 *   2. parse with postal-mime (text + attachments as arraybuffer)
 *   3. store: match/create the contact_messages ticket, append a
 *      contact_thread_messages row ('in'), attachments → MAIL_KV under
 *      c/{threadId}/{i} (best-effort, per-step try/catch)
 *   4. forward the original to the owner's Gmail (copies stay intact —
 *      this is the copy pipeline that already worked before the swap)
 *
 * Any step failing logs loudly and never blocks the next — worst case the
 * Gmail copy still arrives and the panel misses one row (visible in
 * `wrangler tail`). fetch serves:
 *   GET /health
 *   GET /att/{kvKey}?t={hmac} — signed attachment download (constant-time
 *   verification via the shared src/lib/mailBridge helper).
 */

import PostalMime from "postal-mime";
import type { Email } from "postal-mime";
import { stripQuoted, stripHtml, toBytes, cleanFileName } from "./util";
import { verifyAttachmentSignature } from "../../../src/lib/mailBridge";

interface BridgeEnv {
  DB: D1Database;
  MAIL_KV: KVNamespace;
  FORWARD_TO: string;
  ATTACH_SECRET?: string;
}

interface ForwardableMessage {
  from: string;
  to: string;
  headers: Headers;
  raw: ReadableStream;
  rawSize: number;
  forward(_rcptTo: string): Promise<unknown>;
}

interface ThreadAttRef {
  key: string;
  name: string;
  mime: string;
  size: number;
}

const MAX_TOTAL_ATTACH_BYTES = 20 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;
const MAX_BODY_CHARS = 10000;

// Lazy DDL — must stay byte-compatible with src/db/migrations/0028 and
// 0029 (same columns/defaults/indexes): if this runs before the versioned
// migrations, the later migrations must still apply cleanly on top.
const CREATE_CONTACT = `CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "category" text NOT NULL,
  "label" text NOT NULL,
  "message" text NOT NULL,
  "status" text NOT NULL DEFAULT 'new',
  "createdAt" integer NOT NULL
)`;

const CREATE_THREAD = `CREATE TABLE IF NOT EXISTS "contact_thread_messages" (
  "id" text PRIMARY KEY,
  "contact_id" text NOT NULL,
  "direction" text NOT NULL,
  "sender" text NOT NULL DEFAULT '',
  "body" text NOT NULL DEFAULT '',
  "attachments" text NOT NULL DEFAULT '[]',
  "createdAt" integer NOT NULL
)`;

const INDEX_SQLS = [
  `CREATE INDEX IF NOT EXISTS "contact_messages_status_idx" ON "contact_messages" ("status")`,
  `CREATE INDEX IF NOT EXISTS "contact_messages_createdAt_idx" ON "contact_messages" ("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "idx_contact_thread_contact" ON "contact_thread_messages" ("contact_id", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "idx_contact_thread_created" ON "contact_thread_messages" ("createdAt")`,
];

async function ensureTables(db: D1Database): Promise<void> {
  await db.prepare(CREATE_CONTACT).run();
  await db.prepare(CREATE_THREAD).run();
  for (const sql of INDEX_SQLS) await db.prepare(sql).run();
}

/**
 * Find the open ticket for this sender (newest, never resurrects archived
 * threads) or auto-create one so an unsolicited email still lands in the
 * panel. Returns the contact id.
 */
async function upsertTicket(db: D1Database, from: Email["from"], body: string, subject: string, now: number): Promise<string> {
  const emailAddr = (from?.address || "").toLowerCase().slice(0, 320);
  const name = (from?.name || emailAddr || "Unknown sender").slice(0, 100);
  // Lookup runs even for an empty address: repeated malformed-sender mail
  // then threads into ONE catch-all ticket (email '') instead of spamming
  // a fresh row per message. The contact form never stores an empty email,
  // so '' can only ever match rows this branch created.
  const row = await db
    .prepare(
      "SELECT id FROM contact_messages WHERE lower(email) = ? AND status != 'archived' ORDER BY createdAt DESC LIMIT 1"
    )
    .bind(emailAddr)
    .first<{ id: string }>();
  if (row?.id) {
    // Follow-up on a replied thread needs attention again; archived
    // threads are excluded by the query above (stay archived).
    await db
      .prepare("UPDATE contact_messages SET status = 'new' WHERE id = ? AND status = 'replied'")
      .bind(row.id)
      .run();
    return row.id;
  }
  const id = crypto.randomUUID();
  await db
    .prepare(
      "INSERT INTO contact_messages (id, name, email, category, label, message, status, createdAt) VALUES (?, ?, ?, 'general', ?, ?, 'new', ?)"
    )
    .bind(id, name, emailAddr, subject.slice(0, 200) || "Email", body.slice(0, 500) || subject.slice(0, 500), now)
    .run();
  return id;
}

async function storeAttachments(
  kv: KVNamespace,
  threadId: string,
  parsed: Email
): Promise<ThreadAttRef[]> {
  const refs: ThreadAttRef[] = [];
  if (!parsed.attachments?.length) return refs;
  let total = 0;
  for (let i = 0; i < parsed.attachments.length && refs.length < MAX_ATTACHMENTS; i++) {
    const a = parsed.attachments[i];
    if (!a) continue;
    const bytes = toBytes(a.content);
    if (bytes.byteLength === 0) continue;
    total += bytes.byteLength;
    if (total > MAX_TOTAL_ATTACH_BYTES) break;
    const name = cleanFileName(a.filename, refs.length);
    const key = `c/${threadId}/${refs.length}`;
    // Per-attachment best-effort: one KV failure must not drop the whole
    // reply (thread row still lands with the refs that did store).
    try {
      await kv.put(key, bytes, { metadata: { name, mime: a.mimeType || "application/octet-stream" } });
      refs.push({ key, name, mime: a.mimeType || "application/octet-stream", size: bytes.byteLength });
    } catch (err) {
      console.error(`[mail-bridge] KV put failed key=${key}: ${String(err)}`);
    }
  }
  return refs;
}

export async function storeMessage(env: BridgeEnv, message: ForwardableMessage, parsed: Email): Promise<void> {
  await ensureTables(env.DB);
  const now = Math.floor(Date.now() / 1000);
  const text = (parsed.text || (parsed.html ? stripHtml(parsed.html) : "")).trim();
  let body = stripQuoted(text).slice(0, MAX_BODY_CHARS);
  const subject = (parsed.subject || "").slice(0, 300);

  const contactId = await upsertTicket(env.DB, parsed.from, body, subject, now);
  const threadId = crypto.randomUUID();
  const refs = await storeAttachments(env.MAIL_KV, threadId, parsed);

  // Attachment-only replies (screenshot, no text) get an honest placeholder
  // instead of an empty bubble — the chips below the text carry the content.
  if (!body) {
    body = refs.length ? "[No text — attachment-only message]" : "[No message text]";
  }

  await env.DB.prepare(
    "INSERT INTO contact_thread_messages (id, contact_id, direction, sender, body, attachments, createdAt) VALUES (?, ?, 'in', ?, ?, ?, ?)"
  )
    .bind(threadId, contactId, (parsed.from?.address || message.from || "").slice(0, 320), body, JSON.stringify(refs), now)
    .run();
}

function attachmentDisposition(name: string): string {
  return `attachment; filename="${name.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

const worker = {
  async email(message: ForwardableMessage, env: BridgeEnv): Promise<void> {
    // 1. Buffer the raw MIME once — every later step reads this copy, and
    // the forward at the end goes through the runtime's own stored message.
    let raw: ArrayBuffer;
    try {
      raw = await new Response(message.raw).arrayBuffer();
    } catch (err) {
      console.error(`[mail-bridge] raw read failed from=${message.from}: ${String(err)}`);
      try {
        await message.forward(env.FORWARD_TO);
      } catch (ferr) {
        console.error(`[mail-bridge] CRITICAL forward failed from=${message.from}: ${String(ferr)}`);
      }
      return;
    }

    // 2. Parse (a parse failure still forwards the copy below).
    let parsed: Email | null = null;
    try {
      parsed = await PostalMime.parse(raw, { attachmentEncoding: "arraybuffer" });
    } catch (err) {
      console.error(`[mail-bridge] parse failed from=${message.from} rawSize=${raw.byteLength}: ${String(err)}`);
    }

    // 3. Store into the admin panel (best-effort).
    if (parsed) {
      try {
        await storeMessage(env, message, parsed);
      } catch (err) {
        console.error(`[mail-bridge] store failed from=${message.from}: ${String(err)}`);
      }
    }

    // 4. Forward the owner's copy last — the pre-existing pipeline, kept
    // intact. Independent of everything above: even a broken panel must
    // never eat the owner's email.
    try {
      await message.forward(env.FORWARD_TO);
    } catch (err) {
      console.error(`[mail-bridge] CRITICAL forward failed from=${message.from}: ${String(err)}`);
    }
  },

  async fetch(request: Request, env: BridgeEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, service: "toolzum-mail-bridge" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    const match = /^\/att\/(.+)$/.exec(url.pathname);
    if (!match) return new Response("not found", { status: 404 });
    const key = decodeURIComponent(match[1] || "");
    const sig = url.searchParams.get("t") || "";
    if (!env.ATTACH_SECRET || !(await verifyAttachmentSignature(key, sig, env.ATTACH_SECRET))) {
      return new Response("forbidden", { status: 403 });
    }
    try {
      const stored = await env.MAIL_KV.getWithMetadata<{ name?: string; mime?: string }>(key, {
        type: "arrayBuffer",
      });
      if (!stored || !stored.value) return new Response("not found", { status: 404 });
      const name = stored.metadata?.name || "attachment";
      return new Response(stored.value, {
        headers: {
          "Content-Type": stored.metadata?.mime || "application/octet-stream",
          "Content-Disposition": attachmentDisposition(name),
          "Cache-Control": "private, no-store",
        },
      });
    } catch (err) {
      console.error(`[mail-bridge] att read failed key=${key}: ${String(err)}`);
      return new Response("not found", { status: 404 });
    }
  },
};

export default worker;
