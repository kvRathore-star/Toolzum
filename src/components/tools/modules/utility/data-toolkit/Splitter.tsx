"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV, formatCSV } from './_shared';

export default function Splitter() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor\nBob,bob@test.com,Admin\nAlice,alice@test.com,Editor');
  const [parts, setParts] = useState('2');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor\nBob,bob@test.com,Admin\nAlice,alice@test.com,Editor' },
  ];
  const partPresets = ['2', '3', '4'];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const n = Math.max(1, parseInt(parts, 10) || 2);
    const chunk = Math.ceil(p.rows.length / n);
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
      const chunkRows = p.rows.slice(i * chunk, (i + 1) * chunk);
      result.push(`=== Part ${i + 1} (${chunkRows.length} rows) ===\n${formatCSV(p.headers, chunkRows)}`);
    }
    setOut(result.join('\n\n'));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CSV Splitter</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <div className="flex flex-wrap gap-1.5 mb-3">
        {partPresets.map(p => <button key={p} onClick={() => setParts(p)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${parts === p ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/20'}`}>{p} parts</button>)}
      </div>
      <button onClick={() => handle()} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Split</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Split Result</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

