"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV, formatCSV } from './_shared';

export default function RowFilter() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor\nBob,bob@test.com,Admin');
  const [col, setCol] = useState('role');
  const [val, setVal] = useState('Admin');
  const [out, setOut] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const csvPresets = [
    { label: 'Default', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor\nBob,bob@test.com,Admin' },
    { label: 'Employees', v: 'name,dept,salary\nAlice,Engineering,95000\nBob,Marketing,72000\nCharlie,Engineering,88000\nDiana,Sales,65000\nEve,Engineering,91000' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const ci = p.headers.indexOf(col);
    if (ci < 0) { toast.error('Column not found'); return; }
    const nr = p.rows.filter(r => (r[ci] || '').toLowerCase().includes(val.toLowerCase()));
    setMatchCount(nr.length);
    setOut(formatCSV(p.headers, nr));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Row Filter</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <Input label="Column" value={col} onChange={v => { setCol(v); setOut(''); }} placeholder="Column name" />
      <Input label="Filter value" value={val} onChange={v => { setVal(v); setOut(''); }} placeholder="Filter value (case-insensitive)" />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-colors">Filter</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-pink-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Result — {matchCount} row(s) match</span>
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

