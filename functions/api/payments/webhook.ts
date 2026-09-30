import { sendEmail } from "../../../src/lib/email";
import { renderEmail } from "../../../src/lib/emailTemplate";
import { grantPass } from "../../../src/lib/planTiers";
import { grantPack } from "../../../src/lib/creditPacks";

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

// Live product catalog. Metadata plan=pro/pass (set on each Dodo product)
// is authoritative; product IDs are the fallback for payloads without it.
const PRO_PRODUCT_IDS = new Set([
  "pdt_0Nnxjj5tGkZs2aaArMZAg", // monthly
  "pdt_0NnxnhVX9UpNpAWGnPKis", // yearly
]);
const PASS_PRODUCT_IDS = new Set([
  "pdt_0NnxoUmsSDo8QS9UhLJ0J", // 7-day pass
]);
// Credit packs: one-time products → grant N credits (12-month expiry).
// Must match create-order.ts DODO_PRODUCTS — paste IDs when created in
// the Dodo dashboard. Metadata plan=pack, credits=N (set by our checkout)
// is the fallback for payloads without a known product ID.
const PACK_PRODUCTS = new Map<string, number>([
  // ["pdt_…", 100],  // pack_100
  // ["pdt_…", 500],  // pack_500
  // ["pdt_…", 1000], // pack_1000
]);

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
  await DB.prepare("DELETE FROM \"session\" WHERE userId = ?")
    .bind(userId)
    .run()
    .catch(() => {});
  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  ).bind(actor, action, userId, null, plan)
    .run()
    .catch(() => {});
}

// Settle the local 'created' row (id = metadata.orderId, written by
// create-order) so /payments/return and /payments/status can confirm the
// grant honestly — they poll payment.status, and without this the ord_*
// row stayed 'created' forever (only plan=pro ever flipped). Best-effort:
// the grant itself is already durable + idempotent; worst case the return
// page keeps its honest "processing" state and the receipt email lands.
async function settleLocalOrder(DB: D1Database, meta: Record<string, unknown>): Promise<void> {
  const localId = str(meta.orderId);
  if (!localId) return;
  await DB.prepare(
    "UPDATE payment SET status = 'paid' WHERE id = ? AND status = 'created'",
  ).bind(localId).run().catch(() => {});
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
    // Money moved (or mandate live): deliver. subscription.active
    // alone (no charge yet) only ensures the account row exists.
    const { email, name } = extractCustomer(data);
    const prod = extractProduct(data);
    const meta = ((data.metadata || {}) as Record<string, unknown>);
    const metaCredits = parseInt(str(meta.credits), 10);
    const packCredits =
      PACK_PRODUCTS.get(prod.productId) ??
      (prod.plan === "pack" && Number.isFinite(metaCredits) && metaCredits > 0 ? metaCredits : 0);
    const plan =
      packCredits > 0
        ? "pack"
        : prod.plan === "pass" || PASS_PRODUCT_IDS.has(prod.productId)
          ? "pass"
          : prod.plan === "pro" || PRO_PRODUCT_IDS.has(prod.productId)
            ? "pro"
            : null;
    if (!email || !plan) {
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
    // Local 'created' row (written by create-order) carries the amount and
    // currency the buyer actually saw. Prefer the webhook payload; fall
    // back to it so INR receipts never print USD defaults.
    let localCurrency = "";
    let localAmount: number | null = null;
    try {
      const local = await DB.prepare(
        "SELECT amount, currency FROM payment WHERE userId = ? AND gateway = 'dodo' AND status = 'created' ORDER BY createdAt DESC LIMIT 1"
      )
        .bind(user.id)
        .first<{ amount: number; currency: string }>();
      localCurrency = local?.currency || "";
      localAmount = typeof local?.amount === "number" ? local.amount : null;
    } catch {
      /* best-effort */
    }
    const currency = prod.currency || localCurrency;
    const amount = prod.amount ?? localAmount;
    const charged = type !== "subscription.active";
    if (plan === "pack") {
      // One-time pack: grant credits only — never touches user.plan.
      if (!charged) return json({ ok: true, granted: false });
      const granted = await grantPack(DB, {
        userId: user.id,
        credits: packCredits,
        source: str(meta.tier) || `pack_${packCredits}`,
        // Prefer our ord_* id (metadata.orderId) so the grant is
        // attributable to the local payment row on the return page.
        orderId: str(meta.orderId) || prod.paymentId || id,
      });
      if (granted) {
        try {
          await DB.prepare(
            "INSERT INTO payment (id, userId, gateway, orderId, amount, currency, status, createdAt) VALUES (?, ?, 'dodo', ?, ?, ?, 'paid', datetime('now'))"
          )
            .bind(
              `dodo_${prod.paymentId || id}`,
              user.id,
              prod.paymentId || id,
              amount ?? 0,
              currency || "USD",
            )
            .run();
        } catch {
          /* duplicate payment row — grant already applied */
        }
        await settleLocalOrder(DB, meta);
        await sendEmail(context.env, {
          to: user.email,
          subject: "Your Toolzum AI credit pack",
          text: [
            `Hi${name ? ` ${name}` : ""},`,
            ``,
            `Your ${packCredits}-credit pack has been added to your account.`,
            amount !== null
              ? `Charged: ${amount}${currency ? ` ${currency}` : ""}`
              : `Credits: ${packCredits}`,
            `Payment: ${prod.paymentId || id}`,
            ``,
            `Pack credits are valid for 12 months and are used only after your monthly allowance runs out.`,
            `Balance: https://toolzum.com/dashboard/account`,
          ].join("\n"),
          html: renderEmail({
            heading: "Your AI credit pack is live",
            greeting: `Thanks for topping up${name ? `, ${name.split(" ")[0]}` : ""} — the credits are already in your balance.`,
            paragraphs: [
              `Your ${packCredits}-credit pack has been added to your account. Pack credits are valid for 12 months and are spent only after your monthly allowance runs out.`,
            ],
            details: [
              amount !== null
                ? {
                    label: "Charged",
                    value: `${amount}${currency ? ` ${currency}` : ""}`,
                  }
                : { label: "Credits", value: String(packCredits) },
              { label: "Payment", value: prod.paymentId || id },
            ],
            cta: { label: "View balance", url: "https://toolzum.com/dashboard/account" },
            note: "Need more? Top up any time from your dashboard — packs never auto-renew.",
          }),
        });
      }
      return json({ ok: true, granted: granted ? "pack" : false });
    }
    if (plan === "pass") {
      if (charged) {
        await grantPass(DB, user.id);
        try {
          await DB.prepare(
            "INSERT INTO payment (id, userId, gateway, orderId, amount, currency, status, createdAt) VALUES (?, ?, 'dodo', ?, ?, ?, 'paid', datetime('now'))"
          )
            .bind(
              `dodo_${prod.paymentId || id}`,
              user.id,
              prod.paymentId || id,
              amount ?? 3.99,
              currency || "USD",
            )
            .run();
        } catch {
          /* duplicate payment row — grant already applied */
        }
        await settleLocalOrder(DB, meta);
        await sendEmail(context.env, {
          to: user.email,
          subject: "Receipt for your Toolzum 7-Day Pass",
          text: [
            `Hi${name ? ` ${name}` : ""},`,
            ``,
            `Your Toolzum 7-Day Pass is active.`,
            amount !== null
              ? `Charged: ${amount}${currency ? ` ${currency}` : ""}`
              : `Plan: Toolzum 7-Day Pass`,
            `Payment: ${prod.paymentId || id}`,
            ``,
            `You get 7 days of Pro-level limits plus 70 bonus AI credits.`,
          ].join("\n"),
          html: renderEmail({
            heading: "Your Toolzum 7-Day Pass is active",
            greeting: `Thanks for your purchase${name ? `, ${name.split(" ")[0]}` : ""} — you're all set.`,
            paragraphs: [
              "You now have 7 days of Pro-level limits plus 70 bonus AI credits. It's a one-time charge — nothing auto-renews.",
            ],
            details: [
              amount !== null
                ? {
                    label: "Charged",
                    value: `${amount}${currency ? ` ${currency}` : ""}`,
                  }
                : { label: "Plan", value: "Toolzum 7-Day Pass" },
              { label: "Payment", value: prod.paymentId || id },
            ],
            cta: { label: "View your pass", url: "https://toolzum.com/billing" },
          }),
        });
      }
      return json({ ok: true, granted: charged ? "pass" : false });
    }
    if (charged && user.plan !== "pro") {
      await setPlan(DB, user.id, "pro", "dodo-webhook", type);
    }
    if (charged) {
      const planLabel =
        prod.productId === "pdt_0NnxnhVX9UpNpAWGnPKis" ? "Toolzum Pro Yearly" : "Toolzum Pro Monthly";
      await settleLocalOrder(DB, meta);
      try {
        await DB.prepare(
          "INSERT INTO payment (id, userId, gateway, orderId, amount, currency, status, createdAt) VALUES (?, ?, 'dodo', ?, ?, ?, 'paid', datetime('now'))"
        )
          .bind(
            `dodo_${prod.paymentId || id}`,
            user.id,
            prod.paymentId || id,
            amount ?? 9.99,
            currency || "USD",
          )
          .run();
      } catch {
        /* duplicate payment row — grant already applied */
      }
      await sendEmail(context.env, {
        to: user.email,
        subject: `You're Pro — receipt for ${planLabel}`,
        text: [
          `Hi${name ? ` ${name}` : ""},`,
          ``,
          `Your ${planLabel} subscription is active.`,
          amount !== null
            ? `Charged: ${amount}${currency ? ` ${currency}` : ""}`
            : `Plan: ${planLabel}`,
          `Payment: ${prod.paymentId || id}`,
          ``,
          `Pro includes 500-page sitemap crawls, unlimited downloads, and 200 AI credits/month.`,
          `Manage or cancel anytime from https://toolzum.com/billing`,
        ].join("\n"),
        html: renderEmail({
          heading: `You're Pro — receipt for ${planLabel}`,
          greeting: `You're officially Pro${name ? `, ${name.split(" ")[0]}` : ""} — everything is unlocked.`,
          paragraphs: [
            `Your ${planLabel} subscription is active. Pro includes 500-page sitemap crawls, unlimited downloads, and 200 AI credits/month.`,
          ],
          details: [
            amount !== null
              ? { label: "Charged", value: `${amount}${currency ? ` ${currency}` : ""}` }
              : { label: "Plan", value: planLabel },
            { label: "Payment", value: prod.paymentId || id },
          ],
          cta: { label: "Manage subscription", url: "https://toolzum.com/billing" },
          note: "Manage or cancel anytime — no emails, no calls, self-serve.",
        }),
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
      html: renderEmail({
        heading: "Your Toolzum Pro subscription ended",
        greeting: "Just so you're in the loop — no action needed.",
        paragraphs: [
          "You're back on the Free plan — every free tool keeps working, and your account data stays exactly where it was.",
        ],
        details: [{ label: "Reason", value: type }],
        cta: { label: "See plans", url: "https://toolzum.com/pricing" },
        note: "Changed your mind? Resubscribing takes one click and restores Pro instantly.",
      }),
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
          html: renderEmail({
            heading: "Action needed: your payment failed",
            greeting: "Heads up — this needs a minute of your time.",
            paragraphs: [
              "We couldn't charge your Toolzum Pro subscription. Update your payment method to keep Pro active — your current access continues while we retry.",
            ],
            cta: { label: "Update payment method", url: "https://toolzum.com/billing" },
          }),
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
