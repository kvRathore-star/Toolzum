import { sendEmail } from "../../../src/lib/email";

/**
 * Dodo Payments webhook (#36 verify-then-upgrade).
 *
 * POST /api/payments/webhook — Standard Webhooks verification
 * (webhook-id / webhook-timestamp / webhook-signature headers,
 * HMAC-SHA256 over "{id}.{ts}.{raw-body}", 5-min replay window),
 * idempotency via webhook_event, then:
 * - payment.succeeded / subscription.renewed → plan='pro' + receipt email
 * - subscription.cancelled / expired, refund.succeeded → plan='free' + notice
 * - subscription.on_hold, payment.failed → payment-issue email, no plan change
 * - anything else → 200 ignored (Dodo retries non-2xx with backoff)
 *
 * Secrets (Pages env): DODO_WEBHOOK_SECRET (whsec_…),
 * CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID (receipt emails).
 */

interface Env {
  DB: D1Database;
  DODO_WEBHOOK_SECRET?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
}

// Live Monthly Pro product. Metadata plan=pro also accepted (set on the
// Dodo product) so future products map without code changes.
const PRO_PRODUCT_IDS = new Set(["pdt_0Nnxjj5tGkZs2aaArMZAg"]);

const REPLAY_TOLERANCE_S = 300;

async function verifyStandardWebhook(
  secret: string,
  id: string,
  ts: string,
  raw: string,
  sigHeader: string,
): Promise<boolean> {
  const tsNum = parseInt(ts, 10);
  if (!Number.isFinite(tsNum)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - tsNum) > REPLAY_TOLERANCE_S) return false;
  const keyB64 = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  let keyBytes: Uint8Array;
  try {
    const bin = atob(keyB64);
    keyBytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return false;
  }
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const data = new TextEncoder().encode(`${id}.${tsNum}.${raw}`);
    const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
    let bin = "";
    for (let i = 0; i < mac.length; i++) bin += String.fromCharCode(mac[i]!);
    const expected = btoa(bin);
    for (const part of sigHeader.split(" ")) {
      const [ver, sig] = part.split(",");
      if (ver !== "v1" || !sig || sig.length !== expected.length) continue;
      let diff = 0;
      for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
      if (diff === 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

// Defensive extraction — Dodo payload shapes vary by event; unknown
// shapes log the full body (server logs only) so we can tighten.
function extractCustomer(d: Record<string, unknown>): { email: string; name: string } {
  const c = (d.customer || {}) as Record<string, unknown>;
  return {
    email: str(c.email || d.customer_email || d.email).toLowerCase(),
    name: str(c.name || d.customer_name || ""),
  };
}

function extractProduct(d: Record<string, unknown>): { productId: string; plan: string; amount: number | null; currency: string; paymentId: string; subscriptionId: string } {
  const p = (d.product || {}) as Record<string, unknown>;
  const meta = ((d.metadata || p.metadata || {}) as Record<string, unknown>);
  const amount = d.amount ?? d.total_amount ?? d.total;
  return {
    productId: str(d.product_id || p.product_id || p.id),
    plan: str(meta.plan),
    amount: typeof amount === "number" ? amount : null,
    currency: str(d.currency),
    paymentId: str(d.payment_id || d.id),
    subscriptionId: str(d.subscription_id || (d.subscription as Record<string, unknown> | undefined)?.id),
  };
}

async function setPlan(
  DB: D1Database,
  userId: string,
  plan: "pro" | "free",
  actor: string,
  action: string,
): Promise<void> {
  await DB.prepare('UPDATE "user" SET plan = ? WHERE id = ?').bind(plan, userId).run();
  await DB.prepare('DELETE FROM "session" WHERE userId = ?')
    .bind(userId)
    .run()
    .catch(() => {});
  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  )
    .bind(actor, action, userId, null, plan)
    .run()
    .catch(() => {});
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { DB, DODO_WEBHOOK_SECRET } = context.env;
  if (!DODO_WEBHOOK_SECRET) {
    return json({ error: "webhook_not_configured" }, 503);
  }

  const raw = await context.request.text();
  const id = context.request.headers.get("webhook-id") || "";
  const ts = context.request.headers.get("webhook-timestamp") || "";
  const sig = context.request.headers.get("webhook-signature") || "";
  if (!id || !ts || !sig) return json({ error: "missing signature headers" }, 401);
  const ok = await verifyStandardWebhook(DODO_WEBHOOK_SECRET, id, ts, raw, sig);
  if (!ok) return json({ error: "invalid signature" }, 401);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const type = str(body.type);
  const data = (body.data || {}) as Record<string, unknown>;

  // Idempotency: claim BEFORE processing (retries must not double-grant).
  try {
    await DB.prepare("INSERT INTO webhook_event (event_id, type) VALUES (?, ?)")
      .bind(id, type)
      .run();
  } catch {
    return json({ ok: true, deduped: true });
  }

  if (
    type === "payment.succeeded" ||
    type === "subscription.renewed" ||
    type === "subscription.active"
  ) {
    // Money moved (or mandate live): deliver Pro. subscription.active
    // alone (no charge yet) only ensures the account row exists.
    const { email, name } = extractCustomer(data);
    const prod = extractProduct(data);
    const isPro = prod.plan === "pro" || PRO_PRODUCT_IDS.has(prod.productId);
    if (!email || !isPro) {
      console.error(`[DODO] unrecognized grant shape type=${type}`, raw.slice(0, 1000));
      return json({ ok: true, ignored: "unrecognized product" });
    }
    const user = await DB.prepare('SELECT id, email, plan FROM "user" WHERE email = ?')
      .bind(email)
      .first<{ id: string; email: string; plan: string }>();
    if (!user) {
      console.error(`[DODO] payment for unknown user email=${email} payment=${prod.paymentId}`);
      return json({ ok: true, ignored: "unknown user" });
    }
    const charged = type !== "subscription.active";
    if (charged && user.plan !== "pro") {
      await setPlan(DB, user.id, "pro", "dodo-webhook", type);
    }
    if (charged) {
      try {
        await DB.prepare(
          "INSERT INTO payment (id, userId, gateway, orderId, amount, currency, status, createdAt) VALUES (?, ?, 'dodo', ?, ?, ?, 'paid', datetime('now'))"
        )
          .bind(
            `dodo_${prod.paymentId || id}`,
            user.id,
            prod.paymentId || id,
            prod.amount ?? 9.99,
            prod.currency || "USD",
          )
          .run();
      } catch {
        /* duplicate payment row — grant already applied */
      }
      await sendEmail(context.env, {
        to: user.email,
        subject: "You're Pro — receipt for Toolzum Pro Monthly",
        text: [
          `Hi${name ? ` ${name}` : ""},`,
          ``,
          `Your Toolzum Pro Monthly subscription is active.`,
          prod.amount !== null ? `Charged: ${prod.amount} ${prod.currency || "USD"}` : `Plan: Toolzum Pro Monthly ($9.99/month)`,
          `Payment: ${prod.paymentId || id}`,
          ``,
          `Pro includes 500-page sitemap crawls, unlimited downloads, and 200 AI credits/month.`,
          `Manage or cancel anytime from https://toolzum.com/billing`,
        ].join("\n"),
      });
    }
    return json({ ok: true, granted: charged });
  }

  if (
    type === "subscription.cancelled" ||
    type === "subscription.expired" ||
    type === "refund.succeeded"
  ) {
    const { email } = extractCustomer(data);
    if (!email) return json({ ok: true, ignored: "no customer" });
    const user = await DB.prepare('SELECT id, email FROM "user" WHERE email = ?')
      .bind(email)
      .first<{ id: string; email: string }>();
    if (!user) return json({ ok: true, ignored: "unknown user" });
    await setPlan(DB, user.id, "free", "dodo-webhook", type);
    await sendEmail(context.env, {
      to: user.email,
      subject: "Your Toolzum Pro subscription ended",
      text: [
        `Your Toolzum Pro subscription has ended (${type}).`,
        `You're back on the Free plan — all free tools keep working.`,
        `Resubscribe anytime: https://toolzum.com/pricing`,
      ].join("\n"),
    });
    return json({ ok: true, downgraded: true });
  }

  if (type === "subscription.on_hold" || type === "payment.failed") {
    const { email } = extractCustomer(data);
    if (email) {
      const user = await DB.prepare('SELECT email FROM "user" WHERE email = ?')
        .bind(email)
        .first<{ email: string }>();
      if (user) {
        await sendEmail(context.env, {
          to: user.email,
          subject: "Action needed: your Toolzum Pro payment failed",
          text: [
            `We couldn't charge your Toolzum Pro subscription.`,
            `Update your payment method to keep Pro active: https://toolzum.com/billing`,
            `Your current Pro access continues while we retry.`,
          ].join("\n"),
        });
      }
    }
    return json({ ok: true, notified: true });
  }

  return json({ ok: true, ignored: type });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
