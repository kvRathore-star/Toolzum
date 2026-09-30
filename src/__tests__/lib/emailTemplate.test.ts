import { describe, it, expect, vi, afterEach } from 'vitest';
import { escapeHtml, renderEmail, brandFromText } from '@/lib/emailTemplate';
import { sendEmail } from '@/lib/email';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('escapeHtml', () => {
  it('neutralises every HTML metacharacter', () => {
    expect(escapeHtml('<script>alert("x")</script> & \'y\'')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;',
    );
  });
});

describe('renderEmail', () => {
  const base = {
    heading: 'Reset your Toolzum password',
    paragraphs: ['We got a request to reset your password.'],
  };

  it('renders the branded shell: heading, paragraphs, footer, hidden preheader', () => {
    const html = renderEmail(base);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Reset your Toolzum password');
    expect(html).toContain('We got a request to reset your password.');
    expect(html).toContain('https://toolzum.com/icon-192x192.png');
    expect(html).toContain('https://toolzum.com/privacy');
    expect(html).toContain('display:none');
    // Dark brand palette, inline styles only (email-client safe).
    expect(html).toContain('#18181b');
    expect(html).toContain('style="');
    expect(html).not.toMatch(/<style[\s>]/);
  });

  it('carries the logo in BOTH header and footer, both addresses, and an app link', () => {
    const html = renderEmail(base);
    const logo = 'https://toolzum.com/icon-192x192.png';
    expect(html.split(logo).length - 1, 'logo must appear in header and footer').toBe(2);
    expect(html).toContain('mailto:contact@toolzum.com');
    expect(html).toContain('mailto:support@toolzum.com');
    expect(html).toContain('href="https://toolzum.com"');
    expect(html).toContain('Open Toolzum');
    // Wordmark must survive in the footer too.
    expect(html.split('>Tool</span>').length - 1).toBe(2);
  });

  it('renders a unique greeting under the headline when supplied', () => {
    const html = renderEmail({ ...base, greeting: "Let's get you back in." });
    expect(html).toContain("Let&#39;s get you back in.");
    expect(renderEmail(base)).not.toContain('Let&#39;s get you back in.');
  });

  it('escapes attacker-controlled content in paragraphs, details, and the CTA', () => {
    const html = renderEmail({
      heading: '<img src=x onerror=alert(1)>',
      paragraphs: ['<b>bold</b>'],
      details: [{ label: 'Payment', value: '<script>bad()</script>' }],
      cta: { label: '"Click"', url: 'https://toolzum.com/?a=1&b=2' },
    });
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<b>bold</b>');
    expect(html).not.toContain('<script>bad()</script>');
    expect(html).toContain('&lt;script&gt;bad()&lt;/script&gt;');
    expect(html).toContain('href="https://toolzum.com/?a=1&amp;b=2"');
  });

  it('renders detail rows and a CTA button when provided', () => {
    const html = renderEmail({
      ...base,
      details: [
        { label: 'Charged', value: '3.99 USD' },
        { label: 'Payment', value: 'pay_123' },
      ],
      cta: { label: 'View balance', url: 'https://toolzum.com/dashboard/account' },
    });
    expect(html).toContain('Charged');
    expect(html).toContain('pay_123');
    expect(html).toContain('View balance');
    expect(html).toContain('https://toolzum.com/dashboard/account');
  });
});

describe('brandFromText', () => {
  it('uses the subject as the headline and splits blank-line blocks', () => {
    const html = brandFromText('Your Toolzum AI credit pack', 'Hi Kirti,\n\nPack added.\n\nValid 12 months.');
    expect(html).toContain('<h1');
    expect(html).toContain('Your Toolzum AI credit pack');
    expect(html).toContain('Pack added.');
    expect(html).toContain('Valid 12 months.');
  });

  it('splits single-newline receipts into their own paragraphs (webhook style)', () => {
    const html = brandFromText('Receipt', 'Line one\nLine two\nLine three');
    expect(html).toContain('Line one');
    expect(html).toContain('Line three');
    expect(html).not.toContain('Line one\nLine two');
  });

  it('turns bare URLs into links so plain-text callers still get clickable mail', () => {
    const html = brandFromText('Ended', 'Resubscribe anytime: https://toolzum.com/pricing');
    expect(html).toContain('<a href="https://toolzum.com/pricing"');
  });
});

describe('sendEmail', () => {
  const env = { CLOUDFLARE_API_TOKEN: 'tok', CLOUDFLARE_ACCOUNT_ID: 'acc' };

  it('always sends branded HTML, even when the caller only passes text', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendEmail(env, { to: 'a@b.com', subject: 'Hello', text: 'Hi Kirti,\n\nAll good.' });

    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.text).toBe('Hi Kirti,\n\nAll good.');
    expect(body.html).toContain('Hello');
    expect(body.html).toContain('#18181b');
    expect(body.from).toEqual({ address: 'contact@toolzum.com', name: 'Toolzum' });
  });

  it('keeps caller-supplied HTML (CTA emails) instead of overwriting it', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendEmail(env, {
      to: 'a@b.com',
      subject: 'Reset',
      text: 'plain',
      html: renderEmail({ heading: 'Reset your Toolzum password', cta: { label: 'Reset', url: 'https://x.test/r' } }),
    });

    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.html).toContain('https://x.test/r');
  });

  it('sends a per-type display name without changing the verified address', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendEmail(env, { to: 'a@b.com', subject: 'Receipt', text: 't', fromName: 'Toolzum Billing' });

    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.from).toEqual({ address: 'contact@toolzum.com', name: 'Toolzum Billing' });
  });

  it('no-ops without API credentials (never throws in production)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(sendEmail({}, { to: 'a@b.com', subject: 'S', text: 't' })).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
