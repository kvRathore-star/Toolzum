"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function UrlParser() {
  const [url, setUrl] = useState('');

  let parsed: URL | null = null;
  let error = '';
  try { if (url.trim()) parsed = new URL(url.trim()); } catch (e) { console.error(e); if (url.trim()) error = 'Invalid URL'; }

  const parts = parsed ? [
    { label: 'Protocol', value: parsed.protocol },
    { label: 'Hostname', value: parsed.hostname },
    { label: 'Port', value: parsed.port || '(default)' },
    { label: 'Pathname', value: parsed.pathname },
    { label: 'Search (Query String)', value: parsed.search || '(none)' },
    { label: 'Hash', value: parsed.hash || '(none)' },
    { label: 'Username', value: parsed.username || '(none)' },
    { label: 'Password', value: parsed.password || '(none)' },
    { label: 'Origin', value: parsed.origin },
    { label: 'HREF (Full)', value: parsed.href },
  ] : [];

  const params = parsed ? [...parsed.searchParams.entries()] : [];

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste a URL (e.g. https://example.com/page?q=hello#section)" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-5 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none font-mono focus:border-[var(--accent)] transition-colors" />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {parts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">URL Components</h4>
          <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            {parts.map((p, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-2.5 ${i % 2 === 0 ? 'bg-white dark:bg-black/20' : ''}`}>
                <span className="w-[140px] shrink-0 text-xs font-medium text-[var(--text-secondary)]">{p.label}</span>
                <code className="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-all">{p.value}</code>
                <button onClick={() => { clipboardWrite(p.value); toast.success('Copied!'); }} className="ml-auto text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0">Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {params.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Query Parameters ({params.length})</h4>
          <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            {params.map(([key, val], i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-2.5 ${i % 2 === 0 ? 'bg-white dark:bg-black/20' : ''}`}>
                <code className="text-xs font-mono text-blue-600 dark:text-blue-400 w-[140px] shrink-0">{key}</code>
                <code className="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-all">{val}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
