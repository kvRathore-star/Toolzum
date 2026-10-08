interface Env {
  DB: D1Database;
}

import { checkRateLimit, recordRateLimit } from './rate-limit';
import { maybePurgeOldRows } from './_retention';

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const body = await context.request.json();
    const { path, fingerprint, clientType, viewport, event, vote } = body;

    if (typeof path !== 'string' || path.length > 500) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid path' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    // Closed event vocabulary — anything else is a malformed client.
    // 'vote' needs a yes/no; 'drop' is a standalone funnel event (hero file
    // drops carry no filenames, ever — only the file category in path).
    const voteClean = vote === 'yes' || vote === 'no' ? vote : null;
    const eventClean = event === 'vote' || event === 'drop' ? event : null;
    if (eventClean === 'vote' && !voteClean) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid vote' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!eventClean && event !== undefined && event !== null) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid event' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    const rl = await checkRateLimit(DB, 'analytics', ip, 30);
    if (rl.limited) return rl.response;

    recordRateLimit(DB, 'analytics', ip, '/api/analytics');

    try {
      await DB.prepare(
        "INSERT INTO analytics_event (path, fingerprint, clientType, viewport, event, vote, createdAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
      ).bind(path.slice(0, 500), fingerprint || 'web', clientType || 'Web Browser', viewport || '', eventClean, voteClean).run();
    } catch {
      // Pre-migration DBs lack event/vote columns — degrade to pageview row
      // rather than dropping the event entirely.
      await DB.prepare(
        "INSERT INTO analytics_event (path, fingerprint, clientType, viewport, createdAt) VALUES (?, ?, ?, ?, datetime('now'))"
      ).bind(path.slice(0, 500), fingerprint || 'web', clientType || 'Web Browser', viewport || '').run();
    }

    // #26: sampled 90-day retention enforcement (no cron on Pages).
    await maybePurgeOldRows(DB);

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
