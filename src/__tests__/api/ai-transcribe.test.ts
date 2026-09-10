import { describe, it, expect, vi } from 'vitest';
import { onRequestPost } from '../../../functions/api/ai/transcribe';

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

const ENV = { DB: mockDb(), GEMINI_API_KEY: 'test-key' } as unknown as {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

function req(opts: { cookie?: string | null; body?: BodyInit | null; contentType?: string } = {}) {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers['cookie'] = opts.cookie;
  if (opts.contentType) headers['content-type'] = opts.contentType;
  const init: RequestInit = { method: 'POST', headers };
  if (opts.body) init.body = opts.body;
  return new Request('https://toolzum.com/api/ai/transcribe', init);
}

// NOTE: multipart bodies are built by hand — the jsdom FormData/File globals
// are a different realm from undici's parser, so passing a jsdom FormData as
// the request body leaves Content-Type unset and formData() throws (500).
const BOUNDARY = '----testboundary1234';
const MULTIPART = `multipart/form-data; boundary=${BOUNDARY}`;

function textFieldBody(name: string, value: string): string {
  return (
    `--${BOUNDARY}\r\n` +
    `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
    `${value}\r\n` +
    `--${BOUNDARY}--\r\n`
  );
}

function fileBody(filename: string, mime: string, content: string): string {
  return (
    `--${BOUNDARY}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: ${mime}\r\n\r\n` +
    `${content}\r\n` +
    `--${BOUNDARY}--\r\n`
  );
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
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        body: textFieldBody('language', 'en'),
        contentType: MULTIPART,
      }),
      env: ENV,
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Missing audio file' });
  });

  it('500s without a configured provider key', async () => {
    const env = { DB: mockDb() } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({
        cookie: COOKIE,
        body: fileBody('clip.mp3', 'audio/mpeg', 'fake-audio-bytes'),
        contentType: MULTIPART,
      }),
      env,
    });
    expect(res.status).toBe(500);
  });

  // NOTE: the 413 oversized-upload branch is deliberately untested — pushing a
  // >50MB part through undici's multipart parser trips an internal assertion
  // in this jsdom environment (parse throws -> 500), so the branch is not
  // reachable here. The 50MB cap itself is a one-line constant
  // (MAX_UPLOAD_BYTES) with no logic to pin down.
});
