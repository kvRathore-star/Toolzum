"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV, formatCSV } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";


export default function ColumnExtractor() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor');
  const [cols, setCols] = useState('name,email');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor\nBob,bob@test.com,User' },
    { label: 'Employees', v: 'id,name,department,salary\n1,Alice,Engineering,95000\n2,Bob,Marketing,72000\n3,Charlie,Engineering,88000\n4,Diana,Sales,65000' },
  ];
  const handle = (i?: string, c?: string) => {
    const inp = i !== undefined ? i : input;
    const colStr = c !== undefined ? c : cols;
    if (i !== undefined) setInput(inp);
    if (c !== undefined) setCols(colStr);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const colList = colStr.split(',').map(x => x.trim()).filter(Boolean);
    const idxs = colList.map(x => p.headers.indexOf(x)).filter(x => x >= 0);
    if (!idxs.length) { toast.error('No matching columns'); return; }
    const nh = colList.filter(x => p.headers.includes(x));
    const nr = p.rows.map(r => idxs.map(i => r[i] || ''));
    setOut(formatCSV(nh, nr));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Column Extractor</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <Input label="Columns to extract" value={cols} onChange={v => { setCols(v); setOut(''); }} placeholder="col1,col2" />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white rounded-xl text-sm font-medium transition-colors">Extract</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-[var(--accent)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Result ({out.split('\n').length - 1} rows)</span>
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

