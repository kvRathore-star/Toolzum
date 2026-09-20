import { describe, it, expect, vi } from 'vitest';
import { Request as UndiciRequest } from 'undici';
import { onRequestPost as generate } from '../../../functions/api/ai/generate';
import { onRequestPost as transcribe } from '../../../functions/api/ai/transcribe';

function mockDb(opts: { credits?: number; rateCount?: number; noTable?: boolean } = {}) {
  const { credits = 10, rateCount = 0, noTable = false } = opts;
  const seen: { sql: string; args: unknown[] }[] = [];
  const prepare = vi.fn((sql: string) => ({
    // NOTE: some calls chain .first()/.run() directly without .bind() (e.g.
    // the ensure-table probe/CREATE) — mirror real D1 and support both shapes.
    first: vi.fn(async () => {
      if (sql.includes('FROM ai_credit_event')) {
        if (noTable) throw new Error('no such table');
        return { '1': 1 };
      }
      return null;
    }),
    run: vi.fn(async () => {
      seen.push({ sql, args: [] });
      return {};
    }),
    bind: vi.fn((...args: unknown[]) => ({
      first: vi.fn(async () => {
        if (sql.includes('FROM ai_credit_event')) {
          if (noTable) throw new Error('no such table');
          return { '1': 1 };
        }
        if (sql.includes('FROM session')) return { userId: 'user-1', plan: 'free' };
        if (sql.includes('COUNT(*)')) return { c: rateCount };
        if (sql.includes('FROM user')) return { credits, creditResetAt: Date.now() };
        return null;
      }),
      run: vi.fn(async () => {
        seen.push({ sql, args });
        return {};
      }),
    })),
  }));
  return { db: { prepare } as unknown as D1Database, seen };
}

function genReq(body: unknown) {
  return new Request('https://toolzum.com/api/ai/generate', {
    method: 'POST',
    headers: { cookie: 'better-auth.session_token=tok', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('ai_credit_event analytics', () => {
  it('generate: blocked_exhausted logged on 403, table auto-created when missing', async () => {
    const { db, seen } = mockDb({ credits: 0, noTable: true });
    const res = await generate({
      request: genReq({ messages: [{ role: 'user', content: 'hi' }] }),
      env: { DB: db, GEMINI_API_KEY: 'k' } as never,
    });
    expect(res.status).toBe(403);
    expect(seen.some((q) => q.sql.includes('CREATE TABLE IF NOT EXISTS "ai_credit_event"'))).toBe(true);
    const evt = seen.find((q) => q.sql.includes('INSERT INTO ai_credit_event'));
    expect(evt).toBeDefined();
    expect(evt?.args.slice(0, 5)).toEqual(['user-1', 'generate', 'blocked_exhausted', 0, 10]);
  });

  it('generate: allowed logged on success without failing the request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'hi' }] } }] }))),
    );
    try {
      const { db, seen } = mockDb({ credits: 10 });
      const res = await generate({
        request: genReq({ messages: [{ role: 'user', content: 'hi' }] }),
        env: { DB: db, GEMINI_API_KEY: 'k' } as never,
      });
      expect(res.status).toBe(200);
      const evt = seen.find((q) => q.sql.includes('INSERT INTO ai_credit_event'));
      expect(evt?.args.slice(0, 5)).toEqual(['user-1', 'generate', 'allowed', 9, 10]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('transcribe: blocked_exhausted logged below the per-minute cost', async () => {
    const { db, seen } = mockDb({ credits: 5 });
    // Same-realm multipart: jsdom FormData globals break the handler's
    // parser (500), hiding the branch under test.
    const BOUNDARY = '----testboundary1234';
    const body =
      `--${BOUNDARY}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="a.mp3"\r\n` +
      `Content-Type: audio/mpeg\r\n\r\n` +
      `${'x'.repeat(250000)}\r\n` +
      `--${BOUNDARY}\r\n` +
      `Content-Disposition: form-data; name="durationSec"\r\n\r\n` +
      `600\r\n` +
      `--${BOUNDARY}--\r\n`;
    const res = await transcribe({
      request: new UndiciRequest('https://toolzum.com/api/ai/transcribe', {
        method: 'POST',
        headers: {
          cookie: 'better-auth.session_token=tok',
          'content-type': `multipart/form-data; boundary=${BOUNDARY}`,
        },
        body,
      }) as unknown as Request,
      env: { DB: db, OPENAI_API_KEY: 'k' } as never,
    });
    expect(res.status).toBe(403);
    const evt = seen.find((q) => q.sql.includes('INSERT INTO ai_credit_event'));
    expect(evt?.args.slice(0, 5)).toEqual(['user-1', 'transcribe', 'blocked_exhausted', 5, 10]);
  });
});
