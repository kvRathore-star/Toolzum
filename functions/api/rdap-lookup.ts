import { checkRateLimit, recordRateLimit } from './rate-limit';
import { lookupRdap } from '../../src/lib/rdap';

interface Env {
  DB?: D1Database;
}

const RATE_LIMIT_PER_MIN = 20;

/**
 * First-party RDAP lookup (per-TLD bootstrap).
 * POST { domain } → { outcome: 'registered'|'unregistered'|'unsupported', verdict? }.
 * 404 from the authoritative server means "not registered" — the strong
 * availability signal the DNS heuristic cannot give. Anything ambiguous
 * returns unsupported so callers fall back instead of guessing.
 * Same-origin browsers don't need CORS, but keep the sibling header so
 * previews share one policy.
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://toolzum.com' };
  let domain: unknown;
  try {
    ({ domain } = (await context.request.json()) as { domain?: unknown });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers });
  }
  if (typeof domain !== 'string' || domain.length > 253 || !/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(domain.trim())) {
    return new Response(JSON.stringify({ error: 'Invalid domain' }), { status: 400, headers });
  }

  if (context.env.DB) {
    const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    const rl = await checkRateLimit(context.env.DB, 'rdap-lookup', ip, RATE_LIMIT_PER_MIN);
    if (rl.limited) return rl.response;
    recordRateLimit(context.env.DB, 'rdap-lookup', ip, '/api/rdap-lookup');
  }

  try {
    const outcome = await lookupRdap(domain.trim(), { fetchImpl: fetch });
    if (outcome.kind === 'registered') {
      return new Response(JSON.stringify({ outcome: 'registered', verdict: outcome.verdict }), { headers });
    }
    if (outcome.kind === 'unregistered') {
      return new Response(JSON.stringify({ outcome: 'unregistered' }), { headers });
    }
    return new Response(JSON.stringify({ outcome: 'unsupported', reason: outcome.reason }), { headers });
  } catch {
    return new Response(JSON.stringify({ outcome: 'unsupported', reason: 'lookup failed' }), { headers });
  }
}
