interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const body = await context.request.json();
    const { path, fingerprint, clientType, viewport } = body;

    if (typeof path !== 'string' || path.length > 500) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid path' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    const recent = await DB.prepare(
      "SELECT COUNT(*) as c FROM analytics_event WHERE fingerprint = ? AND createdAt > datetime('now', '-1 minute')"
    ).bind(`analytics:${ip}`).first<{ c: number }>();
    if (recent && recent.c >= 30) {
      return new Response(JSON.stringify({ ok: false, error: 'Rate limited' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }

    await DB.prepare(
      "INSERT INTO analytics_event (path, fingerprint, clientType, viewport, createdAt) VALUES (?, ?, ?, ?, datetime('now'))"
    ).bind(path.slice(0, 500), fingerprint || 'web', clientType || 'Web Browser', viewport || '').run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
