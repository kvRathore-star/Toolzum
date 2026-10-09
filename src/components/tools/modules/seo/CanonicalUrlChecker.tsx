"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function CanonicalUrlChecker() {
  const [url, setUrl] = useState('https://example.com/blog/my-article'); const [result, setResult] = useState(''); const [checking, setChecking] = useState(false);
  const check = async () => {
    let u: URL;
    try { u = new URL(url); } catch { setResult('Invalid URL'); return; }
    const structural = [`Protocol: ${u.protocol}`, `Domain: ${u.hostname}`, `Path: ${u.pathname}`, u.hash ? '⚠️ Has fragment (#) — search engines may ignore' : '✓ No fragment', u.search ? '⚠️ Has query params — ensure these are the canonical version' : '✓ No query params', u.pathname.endsWith('/') ? '✓ Ends with /' : 'ℹ️ No trailing slash', u.hostname.startsWith('www.') ? 'ℹ️ With www' : 'ℹ️ Without www'];
    const readTag = (html: string, finalUrl: string, via: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const link = doc.querySelector('link[rel="canonical"]');
      const canonical = link?.getAttribute('href')?.trim() || '';
      if (canonical) {
        let resolved = canonical;
        try { resolved = new URL(canonical, url).toString(); } catch { /* keep raw */ }
        const selfRef = resolved.replace(/\/$/, '') === u.toString().replace(/\/$/, '');
        setResult([`✓ Valid URL format`, ...structural, '', `Canonical tag found (${via}): ${resolved}`, selfRef ? '✓ Self-referencing canonical (good)' : '⚠️ Canonical points to a different URL — that URL is the one search engines will index', `Final URL after redirects: ${finalUrl}`].join('\n'));
      } else {
        setResult([`✓ Valid URL format`, ...structural, '', `ℹ️ No <link rel="canonical"> tag found in the fetched HTML (${via}) — search engines will treat the page URL itself as canonical.`].join('\n'));
      }
    };
    const structuralOnly = (why: string) => {
      setResult([`✓ Valid URL format`, ...structural, '', `⚠️ ${why} Showing structural analysis only — open the page and check for a <link rel="canonical"> tag in its <head> manually.`].join('\n'));
    };
    setChecking(true);
    try {
      // 1. Direct browser fetch (works for CORS-open sites).
      try {
        const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
        readTag(await res.text(), res.url, 'direct fetch');
        return;
      } catch { /* fall through to first-party fetch */ }
      // 2. First-party fetch (SSRF-guarded server fetch, 20/min) — covers
      // the sites that block cross-origin browser reads.
      try {
        const r = await fetch('/api/fetch-page', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }), signal: AbortSignal.timeout(20000) });
        const data = (await r.json()) as { html?: string; finalUrl?: string; error?: string };
        if (!r.ok || !data.html) {
          const why = data.error === 'invalid_url' ? 'That address was rejected (private/local URLs cannot be fetched).'
            : data.error === 'not_html' ? 'That URL did not return an HTML page.'
            : data.error === 'too_large' ? 'That page exceeds the 1.5MB fetch cap.'
            : r.status === 429 ? 'Fetch budget exhausted (~20/min) — wait a minute and retry.'
            : 'The server could not fetch that page (it may block bots).';
          structuralOnly(why);
          return;
        }
        readTag(data.html, data.finalUrl || url, 'server fetch');
      } catch {
        structuralOnly('Could not fetch this URL from your browser or our server.');
      }
    } finally {
      setChecking(false);
    }
  };

  const presets = [
    { label: 'Article', apply: () => setUrl('https://example.com/blog/my-article') },
    { label: 'Product', apply: () => setUrl('https://shop.example.com/product/123?ref=email') },
    { label: 'Root', apply: () => setUrl('https://example.com/') },
    { label: 'Clear', apply: () => { setUrl(''); setResult(''); } },
  ];

  const resultText = result ? `URL checked: ${url}` : 'Enter URL to check canonical structure';

  return (
    <CalculatorShell category="SEO" title="Canonical URL Checker" result={resultText} customResult={result ? (<pre className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] font-mono text-sm whitespace-pre-wrap">{result}</pre>) : undefined} onCalculate={() => { void check(); }} calculateLabel={checking ? "Checking…" : "Check"} presets={presets} accent="blue" downloadData={result} downloadFilename="url-check.txt">
      <div className="space-y-4">
        <label htmlFor="lbl-canonicalurlchecker-url" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">URL to check</label>
        <input id="lbl-canonicalurlchecker-url" aria-label="URL to check" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/path"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" />
      </div>
    </CalculatorShell>
  );
}
