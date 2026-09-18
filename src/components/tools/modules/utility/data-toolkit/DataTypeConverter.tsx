"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV, formatCSV } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";


export default function DataTypeConverter() {
  const [input, setInput] = useState('name,age,salary\nJohn,35,75000\nJane,28,62000');
  const [col, setCol] = useState('age');
  const [type, setType] = useState('number');
  const [out, setOut] = useState('');
  const typePills = ['number', 'string', 'int', 'float'];
  const csvPresets = [
    { label: 'Default', v: 'name,age,salary\nJohn,35,75000\nJane,28,62000' },
    { label: 'Products', v: 'product,price,quantity\nWidget,19.99,100\nGadget,49.99,50\nDoohickey,9.99,200' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const ci = p.headers.indexOf(col);
    if (ci < 0) { toast.error('Column not found'); return; }
    const nr = p.rows.map(r => {
      const n = [...r];
      if (type === 'number') n[ci] = String(Number(n[ci]));
      else if (type === 'string') n[ci] = String(n[ci]);
      else if (type === 'int') n[ci] = String(parseInt(n[ci] ?? "", 10) || 0);
      else if (type === 'float') n[ci] = String(parseFloat(n[ci] ?? "") || 0);
      return n;
    });
    setOut(formatCSV(p.headers, nr));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Data Type Converter</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <Input label="Column name" value={col} onChange={v => { setCol(v); setOut(''); }} placeholder="Column name" />
      <div className="flex flex-wrap gap-1.5 mb-3">
        {typePills.map(t => <button key={t} onClick={() => setType(t)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${type === t ? 'bg-emerald-700 text-white border-emerald-500' : 'bg-emerald-700/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-700/20 border-emerald-500/20'}`}>{t}</button>)}
      </div>
      <button onClick={() => handle()} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">Convert</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-emerald-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Result — {col} as {type}</span>
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

