"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV, formatCSV } from './_shared';

export default function CsvMerger() {
  const [input1, setInput1] = useState('name,email\nJohn,john@example.com\nJane,jane@test.com');
  const [input2, setInput2] = useState('name,department\nJohn,Engineering\nJane,Marketing');
  const [key, setKey] = useState('name');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v1: 'name,email\nJohn,john@example.com\nJane,jane@test.com', v2: 'name,department\nJohn,Engineering\nJane,Marketing' },
  ];
  const handle = (p1i?: string, p2i?: string) => {
    const i1 = p1i !== undefined ? p1i : input1;
    const i2 = p2i !== undefined ? p2i : input2;
    if (p1i !== undefined) setInput1(i1);
    if (p2i !== undefined) setInput2(i2);
    const p1 = parseCSV(i1);
    if (!p1.headers.length) { toast.error('Enter first CSV'); return; }
    const p2 = parseCSV(i2);
    if (!p2.headers.length) { toast.error('Enter second CSV'); return; }
    const ci1 = p1.headers.indexOf(key);
    const ci2 = p2.headers.indexOf(key);
    if (ci1 < 0 || ci2 < 0) { toast.error('Key column not found in both'); return; }
    const map2 = new Map(p2.rows.map(r => [r[ci2], r]));
    const nh = [...p1.headers, ...p2.headers.filter(h => h !== key)];
    const nr = p1.rows.map(r => {
      const match = map2.get(r[ci1]);
      return match ? [...r, ...match.filter((_, i) => i !== ci2)] : [...r, ...Array(p2.headers.length - 1).fill('')];
    });
    setOut(formatCSV(nh, nr));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v1, p.v2)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CSV Merger</h2>
      <Input label="First CSV (left table)" rows={3} value={input1} onChange={v => { setInput1(v); setOut(''); }} placeholder="First CSV..." />
      <Input label="Second CSV (right table)" rows={3} value={input2} onChange={v => { setInput2(v); setOut(''); }} placeholder="Second CSV..." />
      <Input label="Key column (must exist in both)" value={key} onChange={v => { setKey(v); setOut(''); }} placeholder="name" />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors">Merge</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-cyan-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Merged Result</span>
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

