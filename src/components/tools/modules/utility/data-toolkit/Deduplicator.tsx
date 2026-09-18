"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV, formatCSV } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";


export default function Deduplicator() {
  const [input, setInput] = useState('name,email\nJohn,john@example.com\nJane,jane@test.com\nJohn,john@example.com');
  const [col, setCol] = useState('name');
  const [out, setOut] = useState('');
  const [stats, setStats] = useState<{ before: number; after: number } | null>(null);
  const csvPresets = [
    { label: 'Default', v: 'name,email\nJohn,john@example.com\nJane,jane@test.com\nJohn,john@example.com\nBob,bob@test.com\nJane,jane@test.com' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const ci = p.headers.indexOf(col);
    if (ci < 0) { toast.error('Column not found'); return; }
    const seen = new Set<string>();
    const nr = p.rows.filter(r => { const v = r[ci] || ''; if (seen.has(v)) return false; seen.add(v); return true; });
    setStats({ before: p.rows.length, after: nr.length });
    setOut(formatCSV(p.headers, nr));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Deduplicator</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); setStats(null); }} placeholder="CSV input..." />
      <Input label="Column to deduplicate on" value={col} onChange={v => { setCol(v); setOut(''); setStats(null); }} placeholder="Column name" />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">Deduplicate</button>
      {stats && (
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-orange-400">
              <span className="text-xs text-zinc-500">Before</span>
              <p className="text-lg font-bold text-[var(--text-primary)]">{stats.before}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-green-400">
              <span className="text-xs text-zinc-500">After</span>
              <p className="text-lg font-bold text-green-600">{stats.after}</p>
            </div>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-blue-400">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-zinc-500">Deduplicated Data</span>
              <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(out).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
            </div>
            <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
          </div>
        </div>
      )}
    
      </div>
    </>
  );
}

