/**
 * Dodo checkout return landing (return_url).
 *
 * Honest pending state: Dodo charges subscription first payments 2–10
 * minutes AFTER checkout, and only payment.succeeded (webhook) upgrades
 * the account. This page polls ./status until the plan flips to pro.
 * Never claims success before the webhook confirms it.
 */

interface Env {
  DB: D1Database;
}

function orderFromSession(DB: D1Database, cookies: string, orderId: string) {
  return (async () => {
    const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
    const token = tokenMatch?.[1];
    if (!token) return null;
    const session = await DB.prepare(
      "SELECT userId FROM session WHERE token = ? AND expiresAt > unixepoch()"
    )
      .bind(token)
      .first<{ userId: string }>();
    if (!session?.userId) return null;
    const row = await DB.prepare(
      "SELECT p.status, u.plan FROM payment p JOIN \"user\" u ON u.id = p.userId WHERE p.id = ? AND p.userId = ?"
    )
      .bind(orderId, session.userId)
      .first<{ status: string; plan: string }>();
    return row;
  })();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const orderId = url.searchParams.get("order") || "";
  const cookies = context.request.headers.get("cookie") || "";
  const row = orderId ? await orderFromSession(context.env.DB, cookies, orderId) : null;
  const state = row?.plan === "pro" ? "active" : "pending";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${state === "active" ? "You're Pro!" : "Payment processing…"}</title>
<style>body{font-family:system-ui,sans-serif;background:#020617;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px}h1{font-size:28px;margin-bottom:12px}p{color:#94a3b8;max-width:420px}a{color:#818cf8}</style>
</head>
<body>
<div>
<h1>${state === "active" ? "You're Pro! 🎉" : "Payment processing…"}</h1>
<p id="msg">${state === "active"
    ? "Your Toolzum Pro subscription is active. Enjoy 500-page crawls, unlimited downloads, and 200 AI credits/month."
    : "Dodo is confirming your payment — this takes 2–10 minutes for first charges. This page activates automatically. A receipt lands in your inbox."}</p>
<p><a href="/dashboard">Go to dashboard</a> · <a href="/billing">Billing</a></p>
</div>
<script>
(function(){
  ${state === "active" ? "return;" : ""}
  var order=${JSON.stringify(orderId)};
  var tries=0;
  var t=setInterval(async function(){
    tries++;
    try {
      var r=await fetch("/api/payments/status?order="+encodeURIComponent(order),{credentials:"same-origin"});
      var d=await r.json();
      if(d.plan==="pro"){document.querySelector("h1").textContent="You're Pro! 🎉";document.getElementById("msg").textContent="Your Toolzum Pro subscription is active. Enjoy!";clearInterval(t);}
    } catch(e){}
    if(tries>60)clearInterval(t);
  },10000);
})();
</script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
