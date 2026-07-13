interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const fingerprint = context.request.headers.get('x-download-fingerprint');
    if (!fingerprint) {
      return new Response(JSON.stringify({ allowed: false }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const today = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;

    const existing = await DB.prepare(
      "SELECT id, count FROM download_usage WHERE fingerprint = ? AND date = ?"
    ).bind(fingerprint, today).first<{ id: number; count: number }>();

    if (existing) {
      await DB.prepare(
        "UPDATE download_usage SET count = count + 1, updatedAt = datetime('now') WHERE id = ?"
      ).bind(existing.id).run();
    } else {
      await DB.prepare(
        "INSERT INTO download_usage (fingerprint, date, count, createdAt, updatedAt) VALUES (?, ?, 1, datetime('now'), datetime('now'))"
      ).bind(fingerprint, today).run();
    }

    return new Response(JSON.stringify({ allowed: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ allowed: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
