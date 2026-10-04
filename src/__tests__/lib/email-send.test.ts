import { describe, it, expect, vi, afterEach } from 'vitest';
import { sendEmail, emailConfigured } from '@/lib/email';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const RESEND_URL = 'https://api.resend.com/emails';
const CF_URL_PREFIX = 'https://api.cloudflare.com/client/v4/accounts/';

function lastCall(mock: ReturnType<typeof vi.fn>, index = 0): { url: string; init: RequestInit } {
  const call = mock.mock.calls[index]!;
  return { url: String(call[0]), init: (call[1] ?? {}) as RequestInit };
}

function bodyOf(init: RequestInit): Record<string, unknown> {
  return JSON.parse(String(init.body)) as Record<string, unknown>;
}

describe('emailConfigured', () => {
  it('is false with no secrets', () => {
    expect(emailConfigured({})).toBe(false);
  });

  it('is true with Resend alone (primary transport)', () => {
    expect(emailConfigured({ RESEND_API_KEY: 're_x' })).toBe(true);
  });

  it('is true with the complete Cloudflare pair (fallback)', () => {
    expect(
      emailConfigured({ CLOUDFLARE_API_TOKEN: 't', CLOUDFLARE_ACCOUNT_ID: 'a' })
    ).toBe(true);
  });

  it('is false with only half the Cloudflare pair', () => {
    expect(emailConfigured({ CLOUDFLARE_API_TOKEN: 't' })).toBe(false);
    expect(emailConfigured({ CLOUDFLARE_ACCOUNT_ID: 'a' })).toBe(false);
  });
});

describe('sendEmail — no transport', () => {
  it('returns false and never calls fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const ok = await sendEmail({}, { to: 'a@b.com', subject: 'Hi', text: 'body' });
    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('sendEmail — Resend primary', () => {
  it('posts to api.resend.com with the branded from, reply_to, and html', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendEmail(
      { RESEND_API_KEY: 're_test' },
      {
        to: 'user@example.com',
        subject: 'We got your message',
        text: 'plain body',
        replyTo: 'sender@example.com',
        fromName: 'Toolzum Support',
      }
    );

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const { url, init } = lastCall(fetchMock);
    expect(url).toBe(RESEND_URL);
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer re_test');

    const body = bodyOf(init);
    expect(body.from).toBe('Toolzum Support <contact@toolzum.com>');
    expect(body.to).toEqual(['user@example.com']);
    expect(body.reply_to).toBe('sender@example.com');
    expect(body.subject).toBe('We got your message');
    expect(body.text).toBe('plain body');
    expect(typeof body.html).toBe('string');
    expect(String(body.html).length).toBeGreaterThan(0);
  });

  it('defaults the display name to Toolzum when fromName is omitted', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await sendEmail(
      { RESEND_API_KEY: 're_test' },
      { to: 'a@b.com', subject: 'S', text: 't' }
    );

    expect(bodyOf(lastCall(fetchMock).init).from).toBe('Toolzum <contact@toolzum.com>');
  });

  it('passes caller-supplied html through untouched', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await sendEmail(
      { RESEND_API_KEY: 're_test' },
      { to: 'a@b.com', subject: 'S', text: 't', html: '<p>custom</p>' }
    );

    expect(bodyOf(lastCall(fetchMock).init).html).toBe('<p>custom</p>');
  });

  it('returns false when Resend rejects and no fallback exists', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendEmail(
      { RESEND_API_KEY: 're_bad' },
      { to: 'a@b.com', subject: 'S', text: 't' }
    );

    expect(ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(lastCall(fetchMock).url).toBe(RESEND_URL);
  });
});

describe('sendEmail — Cloudflare fallback', () => {
  it('falls back to Cloudflare when Resend fails and CF pair exists', async () => {
    const fetchMock = vi.fn(async (input: unknown) => ({
      ok: !String(input).includes('resend'),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendEmail(
      {
        RESEND_API_KEY: 're_x',
        CLOUDFLARE_API_TOKEN: 'cf_tok',
        CLOUDFLARE_ACCOUNT_ID: 'cf_acct',
      },
      { to: 'a@b.com', subject: 'S', text: 't', fromName: 'Toolzum Billing' }
    );

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lastCall(fetchMock, 0).url).toBe(RESEND_URL);
    const second = lastCall(fetchMock, 1);
    expect(second.url).toBe(`${CF_URL_PREFIX}cf_acct/email/sending/send`);
    expect((second.init.headers as Record<string, string>).Authorization).toBe(
      'Bearer cf_tok'
    );
    const cfBody = bodyOf(second.init);
    expect(cfBody.from).toEqual({
      address: 'contact@toolzum.com',
      name: 'Toolzum Billing',
    });
    expect(cfBody.to).toEqual([{ address: 'a@b.com' }]);
  });

  it('uses Cloudflare directly when no Resend key is set', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendEmail(
      { CLOUDFLARE_API_TOKEN: 't', CLOUDFLARE_ACCOUNT_ID: 'acct' },
      { to: 'a@b.com', subject: 'S', text: 't' }
    );

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(lastCall(fetchMock).url).toBe(`${CF_URL_PREFIX}acct/email/sending/send`);
  });

  it('returns false when both transports fail', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false }));
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendEmail(
      {
        RESEND_API_KEY: 're_x',
        CLOUDFLARE_API_TOKEN: 't',
        CLOUDFLARE_ACCOUNT_ID: 'a',
      },
      { to: 'a@b.com', subject: 'S', text: 't' }
    );

    expect(ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('sendEmail — attachments', () => {
  it('passes Resend-format attachments through on the primary transport', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendEmail(
      { RESEND_API_KEY: 're_test' },
      {
        to: 'user@example.com',
        subject: 'Re: your message',
        text: 'see attached',
        attachments: [
          { filename: 'screenshot.png', content: 'aGVsbG8=', mime: 'image/png' },
          { filename: 'notes.txt', content: 'd29ybGQ=' },
        ],
      }
    );

    expect(ok).toBe(true);
    const body = bodyOf(lastCall(fetchMock).init);
    expect(body.attachments).toEqual([
      { filename: 'screenshot.png', content: 'aGVsbG8=', content_type: 'image/png' },
      { filename: 'notes.txt', content: 'd29ybGQ=' },
    ]);
  });

  it('omits the attachments key entirely when none are given', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await sendEmail({ RESEND_API_KEY: 're_test' }, { to: 'a@b.com', subject: 'S', text: 't' });

    expect('attachments' in bodyOf(lastCall(fetchMock).init)).toBe(false);
  });

  it('refuses the Cloudflare fallback when attachments were requested (no silent strip)', async () => {
    const fetchMock = vi.fn(async (input: unknown) => ({
      ok: !String(input).includes('resend'),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ok = await sendEmail(
      {
        RESEND_API_KEY: 're_x',
        CLOUDFLARE_API_TOKEN: 'cf_tok',
        CLOUDFLARE_ACCOUNT_ID: 'cf_acct',
      },
      {
        to: 'a@b.com',
        subject: 'S',
        text: 't',
        attachments: [{ filename: 'a.txt', content: 'aGk=' }],
      }
    );

    expect(ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(lastCall(fetchMock).url).toBe(RESEND_URL);
    const logged = errSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(logged).toContain('refusing attachment-less fallback');
  });
});

describe('sendEmail — failure logging', () => {
  it('logs status, body snippet, to and subject when Resend rejects', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 401,
      text: async () => '{"message":"API key is invalid"}',
    }));
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendEmail(
      { RESEND_API_KEY: 're_bad' },
      { to: 'a@b.com', subject: 'Reset link', text: 't' }
    );

    expect(ok).toBe(false);
    const logged = errSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(logged).toContain('[email] resend rejected');
    expect(logged).toContain('HTTP 401');
    expect(logged).toContain('API key is invalid');
    expect(logged).toContain('to=a@b.com');
    expect(logged).toContain('subject="Reset link"');
  });

  it('logs when Cloudflare rejects on the fallback path', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 500,
      text: async () => 'upstream failure',
    }));
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendEmail(
      { CLOUDFLARE_API_TOKEN: 't', CLOUDFLARE_ACCOUNT_ID: 'a' },
      { to: 'a@b.com', subject: 'S', text: 't' }
    );

    expect(ok).toBe(false);
    const logged = errSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(logged).toContain('[email] cloudflare rejected');
    expect(logged).toContain('HTTP 500');
    expect(logged).toContain('upstream failure');
  });

  it('logs when no transport is configured at all', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const ok = await sendEmail({}, { to: 'a@b.com', subject: 'S', text: 't' });

    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    const logged = errSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(logged).toContain('[email] no transport configured');
  });
});
