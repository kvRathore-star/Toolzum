interface Env {
  DB: D1Database;
  DODO_API_KEY?: string;
}

// Dodo product catalog (live). Only products created in the Dodo dashboard
// may be sold — unknown plans must 400, never substitute (pricing-lie guard).
const DODO_PRODUCTS: Record<string, string> = {
  monthly: "pdt_0Nnxjj5tGkZs2aaArMZAg",
  yearly: "pdt_0NnxnhVX9UpNpAWGnPKis",
  pass: "pdt_0NnxoUmsSDo8QS9UhLJ0J",
  // Credit packs: create three ONE-TIME products in the Dodo dashboard at
  // the INR+USD prices in PRICES below (and in webhook PACK_PRODUCTS),
  // then paste their IDs here. Empty string keeps the guard honest —
  // checkout 400s instead of selling a pack at the wrong product.
  pack_100: "",
  pack_500: "",
  pack_1000: "",
};

const PRICES: Record<string, { INR: number; USD: number }> = {
  // Advertised prices, single-sourced with PricingCards + pricing/layout.
  // A previous revision charged ₹1999 for the ₹99 pass — amounts below
  // MUST match the UI or checkout lies. Dodo takes major units (verify
  // per-country prices match the Dodo dashboard, #36).
  pass: { INR: 99, USD: 3.99 },
  monthly: { INR: 299, USD: 9.99 },
  yearly: { INR: 2990, USD: 99 },
  // Credit packs — one-time, valid 12 months. Volume ladder above the
  // Pro floor ($9.99 ÷ 200 ≈ $0.05/credit): $0.08 → $0.06 → $0.05.
  pack_100: { INR: 249, USD: 7.99 },
  pack_500: { INR: 899, USD: 29.99 },
  pack_1000: { INR: 1499, USD: 49.99 },
};

// Dodo is the only integrated gateway. A legacy 'razorpay' gateway value
// from an old client is coerced to dodo — the old razorpay branch created
// 'created' orders that could never complete (no checkout ever existed).
const VALID_GATEWAYS = ['dodo'];

const RATE_LIMIT = 5;

import { checkRateLimit, recordRateLimit } from '../rate-limit';
import { packCreditsFor } from '../../../src/lib/creditPacks';

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB, DODO_API_KEY } = context.env;
    const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';

    const rl = await checkRateLimit(DB, 'payment_rate', ip, RATE_LIMIT);
    if (rl.limited) return rl.response;

    recordRateLimit(DB, 'payment_rate', ip, '/api/payments/create-order');

    const formData = await context.request.formData();
    const plan = (formData.get('plan') as string) || 'pass';
    let gateway = (formData.get('gateway') as string) || 'dodo';
    if (!VALID_GATEWAYS.includes(gateway)) gateway = 'dodo';
    // Unknown plans previously fell through to the pass price — a pricing
    // lie by typo. Reject instead. Currency follows the buyer's country
    // (cf-ipcountry): India gets the INR localized price, rest of world
    // gets USD. Must match the per-country prices set in Dodo dashboard;
    // the Dodo webhook is the source of truth for upgrades (#36, built).
    const tier = PRICES[plan];
    if (!tier) {
      return new Response(JSON.stringify({ error: 'invalid_plan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const buyerCountry = (context.request.headers.get("cf-ipcountry") || "US").toUpperCase();
    const currency = buyerCountry === "IN" ? "INR" : "USD";
    const price = { amount: tier[currency], currency };

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const cookies = context.request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
    const token = tokenMatch?.[1];

    let userId: string | null = null;
    if (token) {
      const session = await DB.prepare(
        "SELECT userId FROM session WHERE token = ? AND expiresAt > unixepoch()"
      ).bind(token).first<{ userId: string }>();
      userId = session?.userId || null;
    }

    if (!userId) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/sign-in?redirect=/pricing">
  <title>Redirecting to sign in...</title>
</head>
<body>
  <p>Please sign in first to continue with payment.</p>
  <script>window.location.href = '/sign-in?redirect=/pricing';</script>
</body>
</html>`;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    await DB.prepare(
      "INSERT INTO payment (id, userId, gateway, orderId, amount, currency, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, 'created', datetime('now'))"
    ).bind(orderId, userId, gateway, orderId, price.amount, price.currency).run();

    // Dodo path: create a hosted checkout session and send the buyer there.
    // The local payment row stays 'created' until payment.succeeded upgrades
    // it to 'paid' via the webhook (source of truth — never the redirect).
    if (gateway === "dodo") {
      const productId = DODO_PRODUCTS[plan];
      if (!productId) {
        return new Response(JSON.stringify({ error: "plan_unavailable_on_gateway" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!DODO_API_KEY) {
        return new Response(JSON.stringify({ error: "checkout_unconfigured" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }
      const buyer = await DB.prepare('SELECT email, name FROM "user" WHERE id = ?')
        .bind(userId)
        .first<{ email: string; name: string | null }>();
      if (!buyer) {
        return new Response(JSON.stringify({ error: "user_not_found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      let checkout: { session_id?: string; checkout_url?: string };
      try {
        const res = await fetch("https://live.dodopayments.com/checkouts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DODO_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_cart: [{ product_id: productId, quantity: 1 }],
            customer: { email: buyer.email, name: buyer.name || undefined },
            metadata: plan.startsWith("pack_")
              ? { plan: "pack", tier: plan, credits: String(packCreditsFor(plan) ?? ""), orderId }
              : { plan: plan === "pass" ? "pass" : "pro", orderId },
            billing_currency: currency,
            billing_address: { country: buyerCountry },
            return_url: `https://toolzum.com/api/payments/return?order=${orderId}`,
          }),
        });
        if (!res.ok) {
          return new Response(JSON.stringify({ error: "checkout_failed" }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
          });
        }
        checkout = (await res.json()) as { session_id?: string; checkout_url?: string };
      } catch {
        return new Response(JSON.stringify({ error: "checkout_failed" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!checkout.checkout_url) {
        return new Response(JSON.stringify({ error: "checkout_failed" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (checkout.session_id) {
        await DB.prepare("UPDATE payment SET orderId = ? WHERE id = ?")
          .bind(checkout.session_id, orderId)
          .run()
          .catch(() => {});
      }
      return Response.redirect(checkout.checkout_url, 303);
    }

    // Unreachable after the VALID_GATEWAYS coercion above (dodo is the
    // only value that survives) — a loud 503 instead of resurrecting the
    // old dead-end "Order Created" page that could never be paid.
    return new Response(JSON.stringify({ error: "checkout_unconfigured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
