/**
 * Dodo checkout return landing (return_url).
 *
 * Honest pending state: Dodo charges subscription first payments 2–10
 * minutes AFTER checkout, and only payment.succeeded (webhook) upgrades
 * the account. This page polls ./status and claims success only once the
 * webhook confirms the grant for THIS order — pro (plan flipped), pass
 * (local row settled, plan stays free), or pack (credit_grants row
 * attributed to this payment).
 */

interface Env {
  DB: D1Database;
}

type OrderState = "pro" | "pack" | "pass" | "pending";

async function orderFromSession(
  DB: D1Database,
  cookies: string,
  orderId: string,
): Promise<{ status: string; plan: string; packCredits: number } | null> {
  const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
  const token = tokenMatch?.[1];
  if (!token) return null;
  const session = await DB.prepare(
    "SELECT userId FROM session WHERE token = ? AND expiresAt > unixepoch()"
  )
    .bind(token)
    .first<{ userId: string }>();
  if (!session?.userId) return null;
  try {
    const row = await DB.prepare(
      `SELECT p.status, u.plan,
              (SELECT COALESCE(MAX(credits), 0) FROM credit_grants WHERE userId = u.id AND orderId = p.id) AS packCredits
       FROM payment p JOIN "user" u ON u.id = p.userId WHERE p.id = ? AND p.userId = ?`
    )
      .bind(orderId, session.userId)
      .first<{ status: string; plan: string; packCredits: number }>();
    return row ?? null;
  } catch {
    // migration 0027 not applied — legacy shape, never a pack state
    const row = await DB.prepare(
      "SELECT p.status, u.plan, 0 AS packCredits FROM payment p JOIN \"user\" u ON u.id = p.userId WHERE p.id = ? AND p.userId = ?"
    )
      .bind(orderId, session.userId)
      .first<{ status: string; plan: string; packCredits: number }>();
    return row ?? null;
  }
}

function stateOf(row: { status: string; plan: string; packCredits: number } | null): OrderState {
  if (!row) return "pending";
  if ((row.packCredits || 0) > 0) return "pack";
  if (row.plan === "pro") return "pro";
  if (row.status === "paid") return "pass";
  return "pending";
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const orderId = url.searchParams.get("order") || "";
  const cookies = context.request.headers.get("cookie") || "";
  const row = orderId ? await orderFromSession(context.env.DB, cookies, orderId) : null;
  const state: OrderState = stateOf(row);
  const packCredits = Math.max(Number(row?.packCredits) || 0, 0);

  const title = { pro: "You're Pro!", pack: "Credits added!", pass: "Pass activated!", pending: "Payment processing…" }[state];
  const headline = { pro: "You're Pro! 🎉", pack: "Credits added! 🎉", pass: "Your 7-Day Pass is active! 🎉", pending: "Payment processing…" }[state];
  const message = {
    pro: "Your Toolzum Pro subscription is active. Enjoy 500-page crawls, unlimited downloads, and 200 AI credits/month.",
    pack: `Your ${packCredits}-credit pack has been added. Pack credits are valid for 12 months and are used only after your monthly allowance runs out.`,
    pass: "Your 7-Day Pass is active: 7 days of Pro-level limits plus 70 bonus AI credits.",
    pending: "Dodo is confirming your payment — this takes 2–10 minutes for first charges. This page activates automatically. A receipt lands in your inbox.",
  }[state];
  const dashHref = state === "pack" ? "/dashboard/account" : "/dashboard";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#020617;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px}h1{font-size:28px;margin-bottom:12px}p{color:#94a3b8;max-width:420px}a{color:#818cf8}</style>
</head>
<body>
<div>
<h1>${headline}</h1>
<p id="msg">${message}</p>
<p><a href="${dashHref}">Go to dashboard</a> · <a href="/billing">Billing</a></p>
</div>
<script>
(function(){
  ${state === "pending" ? "" : "return;"}
  var order=${JSON.stringify(orderId)};
  var tries=0;
  var t=setInterval(async function(){
    tries++;
    try {
      var r=await fetch("/api/payments/status?order="+encodeURIComponent(order),{credentials:"same-origin"});
      var d=await r.json();
      if(d.granted==="pack"){
        document.querySelector("h1").textContent="Credits added! 🎉";
        document.getElementById("msg").textContent="Your "+d.credits+"-credit pack has been added. Pack credits are valid for 12 months and are used only after your monthly allowance runs out.";
        clearInterval(t);
      } else if(d.plan==="pro"){
        document.querySelector("h1").textContent="You're Pro! 🎉";
        document.getElementById("msg").textContent="Your Toolzum Pro subscription is active. Enjoy!";
        clearInterval(t);
      } else if(d.granted==="pass"){
        document.querySelector("h1").textContent="Your 7-Day Pass is active! 🎉";
        document.getElementById("msg").textContent="Your 7-Day Pass is active: 7 days of Pro-level limits plus 70 bonus AI credits.";
        clearInterval(t);
      }
    } catch(e){}
    if(tries>60)clearInterval(t);
  },10000);
})();
</script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
