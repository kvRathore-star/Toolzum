"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV, formatCSV } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";


export default function Sorter() {
  const [input, setInput] = useState('name,age,salary\nJohn,35,75000\nJane,28,62000\nBob,42,82000\nAlice,31,58000');
  const [col, setCol] = useState('age');
  const [dir, setDir] = useState('asc');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v: 'name,age,salary\nJohn,35,75000\nJane,28,62000\nBob,42,82000\nAlice,31,58000' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const ci = p.headers.indexOf(col);
    if (ci < 0) { toast.error('Column not found'); return; }
    const nr = [...p.rows].sort((a, b) => {
      const va = a[ci] || '', vb = b[ci] || '';
      const na = Number(va), nb = Number(vb);
      const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : va.localeCompare(vb);
      return dir === 'asc' ? cmp : -cmp;
    });
    setOut(formatCSV(p.headers, nr));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Sorter</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <Input label="Sort column" value={col} onChange={v => { setCol(v); setOut(''); }} placeholder="Column name" />
      <div className="flex flex-wrap gap-1.5 mb-3">
        {[{ v: 'asc', l: 'Ascending' }, { v: 'desc', l: 'Descending' }].map(d => <button key={d.v} onClick={() => setDir(d.v)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${dir === d.v ? 'bg-sky-500 text-white border-sky-500' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border-sky-500/20'}`}>{d.l}</button>)}
      </div>
      <button onClick={() => handle()} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">Sort</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-sky-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Sorted by {col} ({dir})</span>
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

