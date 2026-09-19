"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV, formatCSV } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";


export default function ColumnRenamer() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor');
  const [mapping, setMapping] = useState('name:full_name');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const mappings = mapping.split(',').map(m => m.split(':').map(s => s.trim()));
    const nh = p.headers.map(h => { const m = mappings.find(([k]) => k === h); return m ? m[1] ?? h : h; });
    setOut(formatCSV(nh, p.rows));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Column Renamer</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <Input label="Mapping (old:new,old2:new2)" value={mapping} onChange={v => { setMapping(v); setOut(''); }} placeholder="name:full_name,email:email_address" />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors">Rename</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-violet-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Result</span>
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

