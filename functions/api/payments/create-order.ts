interface Env {
  DB: D1Database;
}

const PRICES: Record<string, { amount: number; currency: string }> = {
  pass: { amount: 1999, currency: 'INR' },
  monthly: { amount: 499, currency: 'INR' },
  yearly: { amount: 3999, currency: 'INR' },
};

const RATE_LIMIT = 5;

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';

    const recent = await DB.prepare(
      "SELECT COUNT(*) as c FROM payment WHERE id LIKE ? AND createdAt > datetime('now', '-1 minute')"
    ).bind(`${ip}%`).first<{ c: number }>();

    if (recent && recent.c >= RATE_LIMIT) {
      return new Response('Too many requests', { status: 429 });
    }

    const formData = await context.request.formData();
    const plan = (formData.get('plan') as string) || 'pass';
    const gateway = (formData.get('gateway') as string) || 'razorpay';
    const price = PRICES[plan] || PRICES.pass;

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

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/pricing?order=${orderId}">
  <title>Order Created</title>
</head>
<body>
  <p>Order created. Redirecting...</p>
  <script>window.location.href = '/pricing?order=${orderId}';</script>
</body>
</html>`;
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
}
