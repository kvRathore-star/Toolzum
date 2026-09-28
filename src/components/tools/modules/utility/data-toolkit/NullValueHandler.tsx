"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV, formatCSV } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";


export default function NullValueHandler() {
  const [input, setInput] = useState('name,email,phone\nJohn,john@example.com,\nJane,,555-0100');
  const [replace, setReplace] = useState('N/A');
  const [out, setOut] = useState('');
  const [nullCount, setNullCount] = useState(0);
  const csvPresets = [
    { label: 'Default', v: 'name,email,phone\nJohn,john@example.com,\nJane,,555-0100\nBob,bob@test.com,' },
  ];
  const replacePresets = ['N/A', 'NULL', '0', '—', 'empty'];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    let count = 0;
    const nr = p.rows.map(r => r.map(c => { const t = c.trim(); if (!t) count++; return t || replace; }));
    setNullCount(count);
    setOut(formatCSV(p.headers, nr));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Null Value Handler</h2>
      <Input label="CSV Input (with empty cells)" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <div className="flex flex-wrap gap-1.5 mb-3">
        {replacePresets.map(r => <button key={r} onClick={() => setReplace(r)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${replace === r ? 'bg-teal-500 text-white border-teal-500' : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border-teal-500/20'}`}>{r}</button>)}
      </div>
      <button onClick={() => handle()} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Replace Nulls</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-teal-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Result ({nullCount} nulls replaced)</span>
            <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(out).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-overlay)] p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

