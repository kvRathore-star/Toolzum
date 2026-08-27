"use client";
import { useState } from 'react';

export default function ApiChangelogGenerator() {
  const [oldVersion, setOldVersion] = useState('2.0.0');
  const [newVersion, setNewVersion] = useState('2.1.0');
  const [changes, setChanges] = useState('Added: New /v2/users endpoint\nAdded: Rate limiting headers\nChanged: Response format for /v1/posts\nDeprecated: /v1/legacy endpoint\nFixed: Null pointer in auth middleware');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'API Release', oldV: '2.0.0', newV: '2.1.0', changes: 'Added: New /v2/users endpoint\nChanged: Response format for /v1/posts\nFixed: Null pointer in auth middleware\nDeprecated: /v1/legacy endpoint' },
    { label: 'Patch Fix', oldV: '1.5.0', newV: '1.5.1', changes: 'Fixed: Login redirect loop\nFixed: Memory leak in WebSocket handler\nSecurity: Upgraded dependencies' },
  ];
  const calc = () => {
    const lines = changes.split('\n').filter(Boolean);
    const categorized: Record<string, string[]> = { Added: [], Changed: [], Deprecated: [], Removed: [], Fixed: [], Security: [] };
    for (const line of lines) {
      const [cat] = line.split(':');
      const clean = cat.trim();
      if (categorized[clean]) categorized[clean].push(line.trim());
    }
    let output = `## Changelog\n\n### ${newVersion} (${new Date().toISOString().split('T')[0]})\n`;
    for (const [cat, items] of Object.entries(categorized)) {
      if (items.length) output += `\n#### ${cat}\n${items.map(i => `- ${i}`).join('\n')}\n`;
    }
    setResult(output);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Changelog Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setOldVersion(p.oldV); setNewVersion(p.newV); setChanges(p.changes); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-sky-400 text-[var(--text-secondary)] hover:text-sky-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Old Version</label>
            <input type="text" value={oldVersion} onChange={e => setOldVersion(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">New Version</label>
            <input type="text" value={newVersion} onChange={e => setNewVersion(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Changes (one per line: Added:/Changed:/Fixed:)</label>
          <textarea value={changes} onChange={e => setChanges(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Changelog</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
