import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/lib/admin-auth', () => ({
  requireAdmin: vi.fn(async () => ({ user: { id: 'admin-1', email: 'a@x.com' } })),
}));

vi.mock('../../../src/lib/email', () => ({
  sendEmail: vi.fn(async () => true),
  // Same rule as the real helper: Resend alone is enough; Cloudflare needs the pair.
  emailConfigured: (env: {
    RESEND_API_KEY?: string;
    CLOUDFLARE_API_TOKEN?: string;
    CLOUDFLARE_ACCOUNT_ID?: string;
  }) =>
    !!(env.RESEND_API_KEY || (env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID)),
}));

import { onRequestGet as probe, onRequestPost as send } from '../../../functions/api/admin/reply';
import { requireAdmin } from '../../../src/lib/admin-auth';
import { sendEmail } from '../../../src/lib/email';

function mockDb(rateCount = 0) {
  const sqls: string[] = [];
  const binds: unknown[][] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn((...args: unknown[]) => {
      sqls.push(sql);
      binds.push(args);
      return {
        first: vi.fn(async () => (sql.includes('FROM analytics_event') ? { c: rateCount } : null)),
        all: vi.fn(async () => ({ results: [] })),
        run: vi.fn(async () => ({})),
      };
    }),
    first: vi.fn(async () => null),
    run: vi.fn(async () => ({})),
  }));
  return { db: { prepare } as unknown as D1Database, sqls, binds };
}

const ENV = (db: D1Database, extras: Record<string, unknown> = {}) =>
  ({
    DB: db,
    GOOGLE_CLIENT_ID: 'x',
    GOOGLE_CLIENT_SECRET: 'x',
    BETTER_AUTH_SECRET: 'x',
    BETTER_AUTH_URL: 'https://toolzum.com',
    TURNSTILE_SECRET_KEY: 'x',
    ADMIN_EMAILS: 'a@x.com',
    ...extras,
  }) as never;

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://toolzum.com/api/admin/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const CONFIGURED = {
  CLOUDFLARE_API_TOKEN: 'tok',
  CLOUDFLARE_ACCOUNT_ID: 'acct',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAdmin).mockResolvedValue({ user: { id: 'admin-1', email: 'a@x.com' } } as never);
  vi.mocked(sendEmail).mockResolvedValue(true);
});

describe('POST /api/admin/reply (in-app reply fallback)', () => {
  it('sends as Toolzum Support with branded HTML, CTA button, and reply note', async () => {
    const { db } = mockDb();
    const res = await send({
      request: post({ to: 'user@example.com', subject: 'Re: your message', message: 'Thanks for writing in.' }),
      env: ENV(db, CONFIGURED),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, to: 'user@example.com' });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const arg = vi.mocked(sendEmail).mock.calls[0]![1];
    expect(arg).toMatchObject({
      to: 'user@example.com',
      subject: 'Re: your message',
      text: 'Thanks for writing in.',
      fromName: 'Toolzum Support',
    });
    // branded shell: heading, Open Toolzum button (ctaHtml style marker), reply note
    expect(arg.html).toContain('Re: your message');
    expect(arg.html).toContain('Open Toolzum');
    expect(arg.html).toContain('padding:14px 28px');
    expect(arg.html).toContain('reply to this email');
    expect(arg.html).toContain('contact@toolzum.com');
  });

  it('rejects an invalid recipient, missing subject, or HTML in fields', async () => {
    const { db } = mockDb();
    const bad = [
      { to: 'not-an-email', subject: 'x', message: 'y' },
      { to: 'user@example.com', subject: '', message: 'y' },
      { to: 'user@example.com', subject: 'x', message: '' },
    ];
    for (const body of bad) {
      const res = await send({ request: post(body), env: ENV(db, CONFIGURED) });
      expect(res.status).toBe(400);
    }
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('strips HTML tags out of the message body', async () => {
    const { db } = mockDb();
    await send({
      request: post({ to: 'user@example.com', subject: 'x', message: 'hi <script>alert(1)</script> there' }),
      env: ENV(db, CONFIGURED),
    });
    expect(vi.mocked(sendEmail).mock.calls[0]![1].text).toBe('hi alert(1) there');
  });

  it('returns 503 when email secrets are missing — never a fake success', async () => {
    const { db } = mockDb();
    const res = await send({
      request: post({ to: 'user@example.com', subject: 'x', message: 'y' }),
      env: ENV(db),
    });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'email_unconfigured' });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns 502 when the send fails', async () => {
    vi.mocked(sendEmail).mockResolvedValue(false);
    const { db } = mockDb();
    const res = await send({
      request: post({ to: 'user@example.com', subject: 'x', message: 'y' }),
      env: ENV(db, CONFIGURED),
    });
    expect(res.status).toBe(502);
  });

  it('rate limits after 10 sends a minute', async () => {
    const { db } = mockDb(10);
    const res = await send({
      request: post(
        { to: 'user@example.com', subject: 'x', message: 'y' },
        { 'cf-connecting-ip': '203.0.113.9' },
      ),
      env: ENV(db, CONFIGURED),
    });
    expect(res.status).toBe(429);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('requires admin — falls back to Bearer ALERT_TOKEN', async () => {
    const { db } = mockDb();
    vi.mocked(requireAdmin).mockResolvedValue({ error: new Response('no', { status: 401 }) } as never);
    const denied = await send({
      request: post({ to: 'user@example.com', subject: 'x', message: 'y' }),
      env: ENV(db, CONFIGURED),
    });
    expect(denied.status).toBe(401);

    const allowed = await send({
      request: post(
        { to: 'user@example.com', subject: 'x', message: 'y' },
        { authorization: 'Bearer secret-token' },
      ),
      env: ENV(db, { ...CONFIGURED, ALERT_TOKEN: 'secret-token' }),
    });
    expect(allowed.status).toBe(200);
  });

  it('rejects a malformed JSON body', async () => {
    const { db } = mockDb();
    const res = await send({ request: post('nope{'), env: ENV(db, CONFIGURED) });
    expect(res.status).toBe(400);
  });

  it('marks the contact-inbox row replied when messageId is passed', async () => {
    const { db, sqls, binds } = mockDb();
    const res = await send({
      request: post({ to: 'user@example.com', subject: 'Re: x', message: 'y', messageId: 'msg-7' }),
      env: ENV(db, CONFIGURED),
    });
    expect(res.status).toBe(200);
    expect(sqls.some((s) => s.includes("UPDATE contact_messages SET status = 'replied'"))).toBe(true);
    expect(binds.some((b) => b[0] === 'msg-7')).toBe(true);
  });

  it('never touches the inbox when the send fails or messageId is absent', async () => {
    // failing send with messageId
    vi.mocked(sendEmail).mockResolvedValue(false);
    const failed = mockDb();
    const res1 = await send({
      request: post({ to: 'user@example.com', subject: 'x', message: 'y', messageId: 'msg-7' }),
      env: ENV(failed.db, CONFIGURED),
    });
    expect(res1.status).toBe(502);
    expect(failed.sqls.some((s) => s.includes('contact_messages'))).toBe(false);

    // successful send without messageId
    const plain = mockDb();
    await send({
      request: post({ to: 'user@example.com', subject: 'x', message: 'y' }),
      env: ENV(plain.db, CONFIGURED),
    });
    expect(plain.sqls.some((s) => s.includes('contact_messages'))).toBe(false);
  });
});

describe('POST /api/admin/reply — attachments', () => {
  const VALID = { filename: 'shot.png', content: 'aGVsbG8=', mime: 'image/png' };

  function mockKv() {
    const puts: { key: string; value: unknown }[] = [];
    return {
      puts,
      kv: {
        put: vi.fn(async (key: string, value: unknown) => {
          puts.push({ key, value });
        }),
      } as unknown as KVNamespace,
    };
  }

  it('passes validated attachments through to sendEmail', async () => {
    const { db } = mockDb();
    const res = await send({
      request: post({
        to: 'user@example.com',
        subject: 'Re: x',
        message: 'see attached',
        attachments: [VALID],
      }),
      env: ENV(db, CONFIGURED),
    });
    expect(res.status).toBe(200);
    const arg = vi.mocked(sendEmail).mock.calls[0]![1];
    expect(arg.attachments).toEqual([{ filename: 'shot.png', content: 'aGVsbG8=', mime: 'image/png' }]);
  });

  it('omits the attachments key when none were sent', async () => {
    const { db } = mockDb();
    await send({
      request: post({ to: 'user@example.com', subject: 'x', message: 'y' }),
      env: ENV(db, CONFIGURED),
    });
    const arg = vi.mocked(sendEmail).mock.calls[0]![1];
    expect(arg.attachments).toBeUndefined();
  });

  it('rejects more than 5 attachments with 400 before sending', async () => {
    const { db } = mockDb();
    const res = await send({
      request: post({
        to: 'user@example.com',
        subject: 'x',
        message: 'y',
        attachments: Array.from({ length: 6 }, () => VALID),
      }),
      env: ENV(db, CONFIGURED),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('invalid_attachments');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('rejects malformed base64 (bad char or bad length) with 400', async () => {
    const { db } = mockDb();
    for (const content of ['not*base64', 'abc']) {
      const res = await send({
        request: post({
          to: 'user@example.com',
          subject: 'x',
          message: 'y',
          attachments: [{ filename: 'a.txt', content }],
        }),
        env: ENV(db, CONFIGURED),
      });
      expect(res.status).toBe(400);
    }
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('rejects a single file over the 8 MB per-file limit with 400', async () => {
    const { db } = mockDb();
    // base64 "AAAA".repeat(N) decodes to 3N bytes — N just over 8 MB / 3.
    const oversized = 'AAAA'.repeat(2_796_203);
    const res = await send({
      request: post({
        to: 'user@example.com',
        subject: 'x',
        message: 'y',
        attachments: [{ filename: 'big.bin', content: oversized }],
      }),
      env: ENV(db, CONFIGURED),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('8 MB per-file');
    expect(sendEmail).not.toHaveBeenCalled();
  }, 30_000);

  it('rejects a combined payload over the 12 MB total limit with 400', async () => {
    const { db } = mockDb();
    // 4 files × 3.3 MB decoded — each under 8 MB, total over 12 MB.
    const chunk = 'AAAA'.repeat(1_100_000);
    const res = await send({
      request: post({
        to: 'user@example.com',
        subject: 'x',
        message: 'y',
        attachments: Array.from({ length: 4 }, (_, i) => ({ filename: `p${i}.bin`, content: chunk })),
      }),
      env: ENV(db, CONFIGURED),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('12 MB total');
    expect(sendEmail).not.toHaveBeenCalled();
  }, 30_000);

  it('stores sent attachments in MAIL_KV and records thread refs on messageId', async () => {
    const { db, sqls, binds } = mockDb();
    const { kv, puts } = mockKv();
    const res = await send({
      request: post({
        to: 'user@example.com',
        subject: 'Re: x',
        message: 'here it is',
        messageId: 'msg-9',
        attachments: [VALID, { filename: 'b.txt', content: 'd29ybGQ=' }],
      }),
      env: ENV(db, { ...CONFIGURED, MAIL_KV: kv }),
    });
    expect(res.status).toBe(200);
    expect(puts).toHaveLength(2);
    expect(puts[0]!.key).toMatch(/^c\/[0-9a-f-]{36}\/0$/);
    const insert = sqls.find((s) => s.includes('INSERT INTO contact_thread_messages'));
    expect(insert).toBeTruthy();
    const refs = binds.find((b) => typeof b[3] === 'string' && (b[3] as string).startsWith('['));
    expect(refs).toBeTruthy();
    const parsedRefs = JSON.parse(refs![3] as string) as { name: string; mime: string }[];
    expect(parsedRefs.map((r) => r.name)).toEqual(['shot.png', 'b.txt']);
    expect(parsedRefs[0]!.mime).toBe('image/png');
  });

  it('still appends the thread row with empty refs when MAIL_KV is missing', async () => {
    const { db, sqls } = mockDb();
    const res = await send({
      request: post({
        to: 'user@example.com',
        subject: 'Re: x',
        message: 'here it is',
        messageId: 'msg-9',
        attachments: [VALID],
      }),
      env: ENV(db, CONFIGURED),
    });
    expect(res.status).toBe(200);
    expect(sqls.some((s) => s.includes('INSERT INTO contact_thread_messages'))).toBe(true);
  });
});

describe('GET /api/admin/reply capability probe', () => {
  it('reports the sender identity and configured state', async () => {
    const { db } = mockDb();
    const res = await probe({ request: new Request('https://toolzum.com/api/admin/reply'), env: ENV(db, CONFIGURED) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      from: 'contact@toolzum.com',
      fromName: 'Toolzum Support',
      configured: true,
    });
  });

  it('reports configured: false without secrets', async () => {
    const { db } = mockDb();
    const res = await probe({ request: new Request('https://toolzum.com/api/admin/reply'), env: ENV(db) });
    expect(await res.json()).toMatchObject({ configured: false });
  });

  it('reports configured: true with only RESEND_API_KEY', async () => {
    const { db } = mockDb();
    const res = await probe({
      request: new Request('https://toolzum.com/api/admin/reply'),
      env: ENV(db, { RESEND_API_KEY: 're_x' }),
    });
    expect(await res.json()).toMatchObject({ configured: true });
  });

  it('is 401 without a session', async () => {
    const { db } = mockDb();
    vi.mocked(requireAdmin).mockResolvedValue({ error: new Response('no', { status: 401 }) } as never);
    const res = await probe({ request: new Request('https://toolzum.com/api/admin/reply'), env: ENV(db, CONFIGURED) });
    expect(res.status).toBe(401);
  });
});
