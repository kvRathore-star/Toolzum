"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";


export default function PivotGenerator() {
  const [input, setInput] = useState('name,role,salary\nJohn,Admin,75000\nJane,Editor,62000\nBob,Admin,82000');
  const [groupCol, setGroupCol] = useState('role');
  const [valCol, setValCol] = useState('salary');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v: 'name,role,salary\nJohn,Admin,75000\nJane,Editor,62000\nBob,Admin,82000' },
    { label: 'Sales', v: 'rep,region,amount\nAlice,North,15000\nBob,South,22000\nAlice,North,18000\nBob,South,19000\nCharlie,North,12000' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const ci = p.headers.indexOf(groupCol);
    const vi = p.headers.indexOf(valCol);
    if (ci < 0 || vi < 0) { toast.error('Columns not found'); return; }
    const groups: Record<string, number[]> = {};
    p.rows.forEach(r => {
      const k = r[ci] || 'unknown';
      if (!groups[k]) groups[k] = [];
      groups[k].push(Number(r[vi]) || 0);
    });
    const lines = Object.entries(groups).map(([k, vals]) => `${k},${vals.length},${vals.reduce((a, b) => a + b, 0).toFixed(2)},${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)}`);
    setOut(['group,count,sum,avg', ...lines].join('\n'));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Pivot Generator</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <Input label="Group column" value={groupCol} onChange={v => { setGroupCol(v); setOut(''); }} placeholder="Group column" />
      <Input label="Value column" value={valCol} onChange={v => { setValCol(v); setOut(''); }} placeholder="Value column (numeric)" />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">Pivot</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-indigo-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Pivot Table (group, count, sum, avg)</span>
            <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(out).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
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

