interface Env {
  DB: D1Database;
}

export const PLAN_LIMITS: Record<string, { maxFileSizeMB: number; maxBatchSize: number; threads: number }> = {
  free:     { maxFileSizeMB: 30,   maxBatchSize: 1,   threads: 1 },
  signedin: { maxFileSizeMB: 150,  maxBatchSize: 10,  threads: 1 },
  pro:      { maxFileSizeMB: 2000, maxBatchSize: 500, threads: 6 },
};

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const cookies = context.request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
    const token = tokenMatch?.[1];

    const key = token ? 'signedin' : 'free';
    let plan: string = key;

    if (token) {
      const user = await DB.prepare(
        "SELECT u.plan FROM session s JOIN user u ON u.id = s.userId WHERE s.token = ? AND s.expiresAt > unixepoch()"
      ).bind(token).first<{ plan: string }>();
      plan = user?.plan || 'signedin';
    }

    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    return new Response(JSON.stringify({ plan, ...limits }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
