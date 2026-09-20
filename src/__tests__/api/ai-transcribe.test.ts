import { describe, it, expect, vi } from 'vitest';
import { Request as UndiciRequest } from 'undici';
import { onRequestPost } from '../../../functions/api/ai/transcribe';
import {
  TRANSCRIPTION_CREDITS_PER_MINUTE,
  TRANSCRIPTION_MAX_SECONDS,
  TRANSCRIPTION_MAX_BYTES,
  transcriptionCostForDuration,
} from '../../../src/lib/transcriptionPricing';

// NOTE: transcribe.ts resolves the session from the session cookie via a
// manual D1 lookup (no createAuth mock here — mirrors ai-generate.test.ts).
function mockDb(
  opts: { credits?: number; noUser?: boolean; noSession?: boolean; rateCount?: number } = {},
) {
  const { credits = 10, noUser = false, noSession = false, rateCount = 0 } = opts;
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (sql.includes('FROM session')) {
          return noSession ? null : { userId: 'user-1', plan: 'free' };
        }
        if (sql.includes('COUNT(*)')) return { c: rateCount };
        if (sql.includes('FROM user')) {
          return noUser ? null : { credits, creditResetAt: Date.now() };
        }
        return null;
      }),
      run: vi.fn(async () => ({})),
    })),
  }));
  return { prepare } as unknown as D1Database;
}

const ENV = { DB: mockDb(), OPENAI_API_KEY: 'test-key' } as unknown as {
  DB: D1Database;
  OPENAI_API_KEY: string;
};

function req(opts: {
  cookie?: string | null;
  fields?: Record<string, string>;
  file?: { name: string; mime: string; content: string };
} = {}) {
  // NOTE: bodies are hand-built strings sent through undici's own Request so
  // multipart parsing happens in one realm — jsdom globals mixed with the
  // handler's parser throw on file parts (500), hiding real branches.
  const BOUNDARY = '----testboundary1234';
  let body = '';
  if (opts.file) {
    body +=
      `--${BOUNDARY}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${opts.file.name}"\r\n` +
      `Content-Type: ${opts.file.mime}\r\n\r\n` +
      `${opts.file.content}\r\n`;
  }
  for (const [k, v] of Object.entries(opts.fields || {})) {
    body +=
      `--${BOUNDARY}\r\n` +
      `Content-Disposition: form-data; name="${k}"\r\n\r\n` +
      `${v}\r\n`;
  }
  body += `--${BOUNDARY}--\r\n`;
  const headers: Record<string, string> = {
    'content-type': `multipart/form-data; boundary=${BOUNDARY}`,
  };
  if (opts.cookie) headers['cookie'] = opts.cookie;
  return new UndiciRequest('https://toolzum.com/api/ai/transcribe', {
    method: 'POST',
    headers,
    body,
  }) as unknown as Request;
}

const COOKIE = 'better-auth.session_token=tok123';

describe('POST /api/ai/transcribe contract', () => {
  it('401s without any cookie', async () => {
    const res = await onRequestPost({ request: req(), env: ENV });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Sign in required' });
  });

  it('401s when the cookie carries no session token', async () => {
    const res = await onRequestPost({
      request: req({ cookie: 'foo=bar' }),
      env: ENV,
    });
    expect(res.status).toBe(401);
  });

  it('401s when the token matches no live session row', async () => {
    const env = {
      DB: mockDb({ noSession: true }),
      GEMINI_API_KEY: 'test-key',
    } as unknown as typeof ENV;
    const res = await onRequestPost({ request: req({ cookie: COOKIE }), env });
    expect(res.status).toBe(401);
  });

  it('400s when no audio file is attached (before touching the model)', async () => {
    // Balance above any per-minute cost so the test reaches file validation.
    const env = {
      DB: mockDb({ credits: 30 }),
      OPENAI_API_KEY: 'test-key',
    } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        fields: { language: 'en' },
      }),
      env,
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Missing audio file' });
  });

  it('500s without a configured provider key', async () => {
    const env = { DB: mockDb({ credits: 30 }) } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        file: { name: 'clip.mp3', mime: 'audio/mpeg', content: 'fake-audio-bytes' },
        fields: { durationSec: '60' },
      }),
      env,
    });
    expect(res.status).toBe(500);
  });

  it('400s when durationSec is missing', async () => {
    const env = {
      DB: mockDb({ credits: 30 }),
      OPENAI_API_KEY: 'k',
    } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        file: { name: 'clip.mp3', mime: 'audio/mpeg', content: 'fake-audio-bytes' },
      }),
      env,
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'durationSec is required (audio length in seconds)' });
  });

  it('400s when audio exceeds the 30-minute cap', async () => {
    const env = {
      DB: mockDb({ credits: 500 }),
      OPENAI_API_KEY: 'k',
    } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        file: { name: 'clip.mp3', mime: 'audio/mpeg', content: 'fake-audio-bytes' },
        fields: { durationSec: '1801' },
      }),
      env,
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Audio exceeds 30-minute limit — split into parts' });
  });

  it('400s when declared duration is implausible for the file size', async () => {
    const env = {
      DB: mockDb({ credits: 500 }),
      OPENAI_API_KEY: 'k',
    } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        file: { name: 'clip.mp3', mime: 'audio/mpeg', content: 'fake-audio-bytes' },
        fields: { durationSec: '1500' },
      }),
      env,
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Duration does not match file size' });
  });

  // NOTE: the 413 oversized-upload branch is deliberately untested — pushing a
  // >25MB part through undici's multipart parser trips an internal assertion
  // in this jsdom environment (parse throws -> 500), so the branch is not
  // reachable here. The 25MB cap itself is a one-line constant
  // (TRANSCRIPTION_MAX_BYTES) with no logic to pin down.
});

describe('POST /api/ai/transcribe credit cost (1 per minute, 30-min cap)', () => {
  it('pins the pricing constants (matches docs + pricing + UI preview)', () => {
    // Happy-path deduction SQL is unreachable in jsdom (undici multipart
    // parser rejects jsdom FormData — see note above), so pricing is pinned
    // at the shared module both backend charges and UI previews import.
    expect(TRANSCRIPTION_CREDITS_PER_MINUTE).toBe(1);
    expect(TRANSCRIPTION_MAX_SECONDS).toBe(1800);
    expect(TRANSCRIPTION_MAX_BYTES).toBe(25 * 1024 * 1024);
    expect(transcriptionCostForDuration(1)).toBe(1);
    expect(transcriptionCostForDuration(60)).toBe(1);
    expect(transcriptionCostForDuration(61)).toBe(2);
    expect(transcriptionCostForDuration(1500)).toBe(25);
    expect(transcriptionCostForDuration(1800)).toBe(30);
  });

  it('403s with 5 credits on a 10-minute file (below the 10 cost) before touching the provider', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const env = {
      DB: mockDb({ credits: 5 }),
      OPENAI_API_KEY: 'k',
    } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        file: { name: 'clip.mp3', mime: 'audio/mpeg', content: 'x'.repeat(250000) },
        fields: { durationSec: '600' },
      }),
      env,
    });
    expect(res.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('403s with 19 credits on a 20-minute file: floor logic, no rounding into the action', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const env = {
      DB: mockDb({ credits: 19 }),
      OPENAI_API_KEY: 'k',
    } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        file: { name: 'clip.mp3', mime: 'audio/mpeg', content: 'x'.repeat(600000) },
        fields: { durationSec: '1200' },
      }),
      env,
    });
    expect(res.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('deducts the per-minute cost on success (100-sec file costs 2)', async () => {
    const updates: string[] = [];
    const db = mockDb({ credits: 30 });
    const origPrepare = (db as unknown as { prepare: (sql: string) => unknown }).prepare;
    (db as unknown as { prepare: (sql: string) => unknown }).prepare = ((sql: string) => {
      if (sql.startsWith('UPDATE user SET credits')) updates.push(sql);
      return (origPrepare as (s: string) => unknown)(sql);
    }) as never;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('hello world') }));
    const env = { DB: db, OPENAI_API_KEY: 'k' } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        file: { name: 'clip.mp3', mime: 'audio/mpeg', content: 'fake-audio-bytes' },
        fields: { durationSec: '100' },
      }),
      env,
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('hello world');
    expect(updates.some(u => u.includes('credits - 2'))).toBe(true);
    vi.unstubAllGlobals();
  });
});
