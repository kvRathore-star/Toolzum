interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const fingerprint = context.request.headers.get('x-download-fingerprint');
    if (!fingerprint) {
      return new Response(JSON.stringify({ allowed: false, remaining: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const today = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
    const row = await DB.prepare(
      "SELECT count FROM download_usage WHERE fingerprint = ? AND date = ?"
    ).bind(fingerprint, today).first<{ count: number }>();

    const count = row?.count || 0;
    const remaining = Math.max(0, 3 - count);

    return new Response(JSON.stringify({ allowed: remaining > 0, remaining }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ allowed: true, remaining: 3 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
