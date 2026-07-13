interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const body = await context.request.json();
    const { path, fingerprint, clientType, viewport } = body;

    await DB.prepare(
      "INSERT INTO analytics_event (path, fingerprint, clientType, viewport, createdAt) VALUES (?, ?, ?, ?, datetime('now'))"
    ).bind(path, fingerprint || 'web', clientType || 'Web Browser', viewport || '').run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
