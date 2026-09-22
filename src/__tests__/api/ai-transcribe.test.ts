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

const ENV = { DB: mockDb() } as unknown as {
  DB: D1Database;
};

function req(opts: {
  cookie?: string | null;
  fields?: Record<string, string>;
  file?: { name: string; mime: string; content: string };
} = {}) {
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
    const env = {
      DB: mockDb({ credits: 30 }),
      GEMINI_API_KEY: 'test-key',
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
      GEMINI_API_KEY: 'k',
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
      GEMINI_API_KEY: 'k',
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
      GEMINI_API_KEY: 'k',
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
});

describe('POST /api/ai/transcribe credit cost (1 per minute, 30-min cap)', () => {
  it('pins the pricing constants (matches docs + pricing + UI preview)', () => {
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
      GEMINI_API_KEY: 'k',
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
      GEMINI_API_KEY: 'k',
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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'hello world' }] } }] }),
    }));
    const env = { DB: db, GEMINI_API_KEY: 'k' } as unknown as typeof ENV;
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

describe('POST /api/ai/transcribe provider chain', () => {
  const F = { name: 'clip.mp3', mime: 'audio/mpeg', content: 'fake-audio-bytes' };
  function envAll(credits = 30) {
    return {
      DB: mockDb({ credits }),
      GROQ_API_KEY: 'gk',
      GEMINI_API_KEY: 'gk',
    } as unknown as typeof ENV;
  }
  function envGeminiOnly(credits = 30) {
    return {
      DB: mockDb({ credits }),
      GEMINI_API_KEY: 'gk',
    } as unknown as typeof ENV;
  }
  function envGroqGemini(credits = 30) {
    return {
      DB: mockDb({ credits }),
      GROQ_API_KEY: 'gk',
      GEMINI_API_KEY: 'gk',
    } as unknown as typeof ENV;
  }
  function calledUrls(fetchSpy: ReturnType<typeof vi.fn>) {
    return fetchSpy.mock.calls.map(c => (c as unknown[])[0] as string);
  }

  describe('English chain: [workers-ai, groq, gemini]', () => {
    it('hits Groq when Workers AI is absent (no AI binding)', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('hello') });
      vi.stubGlobal('fetch', fetchSpy);
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60', language: 'en' } }),
        env: envAll(),
      });
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('hello');
      expect(calledUrls(fetchSpy)).toEqual(['https://api.groq.com/openai/v1/audio/transcriptions']);
      vi.unstubAllGlobals();
    });

    it('walks to Gemini when Groq fails (English)', async () => {
      const fetchSpy = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('boom') })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'from gemini' }] } }] }),
        });
      vi.stubGlobal('fetch', fetchSpy);
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60', language: 'en' } }),
        env: envAll(),
      });
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('from gemini');
      expect(calledUrls(fetchSpy)).toEqual([
        'https://api.groq.com/openai/v1/audio/transcriptions',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent?key=gk',
      ]);
      vi.unstubAllGlobals();
    });

    it('serves via Gemini only when GROQ_API_KEY is missing', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'gemini only' }] } }] }),
      });
      vi.stubGlobal('fetch', fetchSpy);
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60', language: 'en' } }),
        env: envGeminiOnly(),
      });
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('gemini only');
      expect(calledUrls(fetchSpy)).toEqual([
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent?key=gk',
      ]);
      vi.unstubAllGlobals();
    });
  });

  describe('Non-English chain: [workers-ai, gemini] (no Groq)', () => {
    it('serves Hindi via Gemini when Workers AI is absent', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'नमस्ते दुनिया' }] } }] }),
      });
      vi.stubGlobal('fetch', fetchSpy);
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60', language: 'hi' } }),
        env: envAll(),
      });
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('नमस्ते दुनिया');
      // Should NOT hit Groq — non-English never uses it
      expect(calledUrls(fetchSpy)).toEqual([
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent?key=gk',
      ]);
      vi.unstubAllGlobals();
    });

    it('walks to Gemini when Workers AI is absent and first Gemini call fails', async () => {
      const fetchSpy = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 429, text: () => Promise.resolve('rate limited') })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'retry ok' }] } }] }),
        });
      vi.stubGlobal('fetch', fetchSpy);
      // Note: the chain walks [workers-ai, gemini] — there's only one Gemini
      // leg, so a failure there returns 502. This test verifies that behavior.
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60', language: 'es' } }),
        env: envGeminiOnly(),
      });
      expect(res.status).toBe(502);
      vi.unstubAllGlobals();
    });

    it('502s when every configured leg fails (English: Groq + Gemini both fail)', async () => {
      const fetchSpy = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('groq down') })
        .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('gemini down') });
      vi.stubGlobal('fetch', fetchSpy);
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60', language: 'en' } }),
        env: envAll(),
      });
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({ error: 'Transcription failed' });
      vi.unstubAllGlobals();
    });

    it('502s when single Gemini leg fails (non-English, no Workers AI)', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({ ok: false, status: 403, text: () => Promise.resolve('forbidden') });
      vi.stubGlobal('fetch', fetchSpy);
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60', language: 'ta' } }),
        env: envGeminiOnly(),
      });
      expect(res.status).toBe(502);
      vi.unstubAllGlobals();
    });

    it('500s when no provider key exists at all', async () => {
      const env = { DB: mockDb({ credits: 30 }) } as unknown as typeof ENV;
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60', language: 'es' } }),
        env,
      });
      expect(res.status).toBe(500);
    });

    it('never hits Groq for non-English even when Groq key is available', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }),
      });
      vi.stubGlobal('fetch', fetchSpy);
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60', language: 'bn' } }),
        env: envGroqGemini(),
      });
      expect(res.status).toBe(200);
      const urls = calledUrls(fetchSpy);
      expect(urls.every(u => !u.includes('groq.com'))).toBe(true);
      vi.unstubAllGlobals();
    });

    it('serves missing language via Gemini (non-English fallback, never Groq)', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'detected' }] } }] }),
      });
      vi.stubGlobal('fetch', fetchSpy);
      const res = await onRequestPost({
        request: req({ cookie: COOKIE, file: F, fields: { durationSec: '60' } }),
        env: envAll(),
      });
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('detected');
      const urls = calledUrls(fetchSpy);
      expect(urls.some(u => u.includes('groq.com'))).toBe(false);
      vi.unstubAllGlobals();
    });
  });
});

