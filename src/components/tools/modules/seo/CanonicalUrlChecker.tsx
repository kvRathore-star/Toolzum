"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function CanonicalUrlChecker() {
  const [url, setUrl] = useState('https://example.com/blog/my-article'); const [result, setResult] = useState('');
  const check = () => { try { new URL(url); } catch { setResult('Invalid URL'); return; } const u = new URL(url); setResult([`✓ Valid URL format`,`Protocol: ${u.protocol}`,`Domain: ${u.hostname}`,`Path: ${u.pathname}`,u.hash ? '⚠️ Has fragment (#) — search engines may ignore' : '✓ No fragment',u.search ? '⚠️ Has query params — ensure these are the canonical version' : '✓ No query params',u.pathname.endsWith('/') ? '✓ Ends with /' : 'ℹ️ No trailing slash',u.hostname.startsWith('www.') ? 'ℹ️ With www' : 'ℹ️ Without www'].join('\n')); };

  const presets = [
    { label: 'Article', apply: () => setUrl('https://example.com/blog/my-article') },
    { label: 'Product', apply: () => setUrl('https://shop.example.com/product/123?ref=email') },
    { label: 'Root', apply: () => setUrl('https://example.com/') },
    { label: 'Clear', apply: () => { setUrl(''); setResult(''); } },
  ];

  const resultText = result ? `URL checked: ${url}` : 'Enter URL to check canonical structure';

  return (
    <CalculatorShell category="SEO" title="Canonical URL Checker" result={resultText} onCalculate={check} calculateLabel="Check" presets={presets} accent="blue" downloadData={result} downloadFilename="url-check.txt">
      <div className="space-y-4">
        <label htmlFor="lbl-canonicalurlchecker-url" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">URL</label>
        <input id="lbl-canonicalurlchecker-url" aria-label="URL" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/path"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />

        {result && (
          <pre className="p-4 bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 font-mono text-sm whitespace-pre-wrap">{result}</pre>
        )}
      </div>
    </CalculatorShell>
  );
}
