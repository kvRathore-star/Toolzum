"use client";
import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';
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

  const copyAll = () => {
    if (!parsed) return;
    const data = parts.map(p => `${p.label}: ${p.value}`).join('\n');
    clipboardWrite(data);
    toast.success('All URL components copied!');
  };

  const downloadJson = () => {
    if (!parsed) return;
    const data: Record<string, string> = {};
    parts.forEach(p => { data[p.label] = p.value; });
    if (params.length > 0) {
      data['Query Parameters'] = JSON.stringify(Object.fromEntries(params));
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'url-parsed.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON downloaded!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste a URL (e.g. https://example.com/page?q=hello#section)" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-5 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono focus:border-[var(--accent)] transition-colors" />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {parts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">URL Components</h4>
            <div className="flex gap-1">
              <button onClick={copyAll} className="text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors flex items-center gap-1"><Copy className="w-3 h-3" /> All</button>
              <button onClick={downloadJson} className="text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors flex items-center gap-1" aria-label="Download"><Download className="w-3 h-3" /></button>
            </div>
          </div>
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
