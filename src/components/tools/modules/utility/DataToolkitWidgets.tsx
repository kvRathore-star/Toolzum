"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
function Input({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const id = React.useId();
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea id={id} className={cls} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input id={id} className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 1) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim()));
  return { headers, rows };
}

function formatCSV(headers: string[], rows: string[][]): string {
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function parseJSON(s: string): JsonValue | null {
  try { return JSON.parse(s) as JsonValue; } catch { toast.error('Invalid JSON'); return null; }
}

const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Eve', 'Charlie', 'Diana', 'Frank', 'Grace', 'Henry'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.org'];

export function ColumnExtractor() {
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
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Column Extractor</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <Input label="Columns to extract" value={cols} onChange={v => { setCols(v); setOut(''); }} placeholder="col1,col2" />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">Extract</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-blue-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Result ({out.split('\n').length - 1} rows)</span>
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

export function ColumnRenamer() {
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
    const nh = p.headers.map(h => { const m = mappings.find(([k]) => k === h); return m ? m[1] : h; });
    setOut(formatCSV(nh, p.rows));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Column Renamer</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <Input label="Mapping (old:new,old2:new2)" value={mapping} onChange={v => { setMapping(v); setOut(''); }} placeholder="name:full_name,email:email_address" />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors">Rename</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-violet-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Result</span>
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

export function DataTypeConverter() {
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
      else if (type === 'int') n[ci] = String(parseInt(n[ci], 10) || 0);
      else if (type === 'float') n[ci] = String(parseFloat(n[ci]) || 0);
      return n;
    });
    setOut(formatCSV(p.headers, nr));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
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

export function Deduplicator() {
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
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
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
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stats.before}</p>
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
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
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

export function FormatValidator() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com');
  const [issues, setIssues] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const csvPresets = [
    { label: 'Clean', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor' },
    { label: 'Bad Cols', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com' },
    { label: 'Empty', v: 'name,email\nJohn,\n,test@test.com' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const iss: string[] = [];
    const colCount = p.headers.length;
    p.rows.forEach((r, rowIdx) => {
      if (r.length !== colCount) iss.push(`Row ${rowIdx + 2}: ${r.length} cols (expected ${colCount})`);
      r.forEach((c, colIdx) => { if (!c.trim()) iss.push(`Row ${rowIdx + 2}, Col "${p.headers[colIdx]}": empty cell`); });
    });
    setIssues(iss);
    setIsValid(iss.length === 0);
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Format Validator</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setIssues([]); setIsValid(null); }} placeholder="CSV input..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      {isValid !== null && (
        <div className="mt-4 space-y-2">
          {isValid ? (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl border-l-4 border-green-400 text-sm font-medium">✓ Valid CSV — all rows well-formed</div>
          ) : (
            <>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border-l-4 border-red-400 text-sm font-medium">✗ Found {issues.length} issue(s)</div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-yellow-400 space-y-1">
                {issues.map((iss, i) => <div key={i} className="text-xs text-red-600 dark:text-red-400">⚠ {iss}</div>)}
              </div>
            </>
          )}
        </div>
      )}
    
      </div>
    </>
  );
}

export function CsvMerger() {
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
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v1, p.v2)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
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

export function NullValueHandler() {
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
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Null Value Handler</h2>
      <Input label="CSV Input (with empty cells)" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <div className="flex flex-wrap gap-1.5 mb-3">
        {replacePresets.map(r => <button key={r} onClick={() => setReplace(r)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${replace === r ? 'bg-teal-500 text-white border-teal-500' : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border-teal-500/20'}`}>{r}</button>)}
      </div>
      <button onClick={() => handle()} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Replace Nulls</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-teal-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Result ({nullCount} nulls replaced)</span>
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

export function PivotGenerator() {
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
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
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

export function RowFilter() {
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

export function Sorter() {
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
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
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

export function Splitter() {
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

export function Transpose() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor' },
    { label: 'Metrics', v: 'metric,Q1,Q2,Q3,Q4\nRevenue,100,120,110,130\nCost,60,65,63,68\nProfit,40,55,47,62' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const all = [p.headers, ...p.rows];
    const maxLen = Math.max(...all.map(r => r.length));
    const filled = all.map(r => [...r, ...Array(maxLen - r.length).fill('')]);
    const transposed = filled[0].map((_, ci) => filled.map(r => r[ci]));
    const nh = transposed[0];
    const nr = transposed.slice(1);
    setOut(formatCSV(nh, nr));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CSV Transpose</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors">Transpose</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-amber-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Transposed ({out.split('\n').length - 1} rows)</span>
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

export function CsvToMarkdown() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor' },
    { label: 'Products', v: 'product,price,stock\nWidget,19.99,100\nGadget,49.99,50\nDoohickey,9.99,200' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const sep = `|${p.headers.map(() => '---').join('|')}|`;
    const head = `|${p.headers.join('|')}|`;
    const rows = p.rows.map(r => `|${r.join('|')}|`).join('\n');
    setOut([head, sep, rows].join('\n'));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CSV → Markdown Table</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors">Generate MD</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-green-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Markdown Table</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.md'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function CsvToNdjson() {
  const [input, setInput] = useState('name,age\nJohn,35\nJane,28');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v: 'name,age\nJohn,35\nJane,28' },
    { label: 'Users', v: 'id,name,active\n1,Alice,true\n2,Bob,false\n3,Charlie,true' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const objs = p.rows.map(r => {
      const o: Record<string, string> = {};
      p.headers.forEach((h, j) => o[h] = r[j] || '');
      return JSON.stringify(o);
    }).join('\n');
    setOut(objs);
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CSV → NDJSON</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors">Convert</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-purple-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">NDJSON ({out.split('\n').length} objects)</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.json'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function CsvToSql() {
  const [input, setInput] = useState('name,age\nJohn,35\nJane,28');
  const [table, setTable] = useState('data');
  const [out, setOut] = useState('');
  const csvPresets = [
    { label: 'Default', v: 'name,age\nJohn,35\nJane,28' },
    { label: 'Products', v: 'product,price,stock\nWidget,19.99,100\nGadget,49.99,50\nDoohickey,9.99,200' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const inserts = p.rows.map(r => `INSERT INTO ${table} (${p.headers.join(', ')}) VALUES (${r.map(c => `'${c.replace(/'/g, "''")}'`).join(', ')});`);
    setOut(inserts.join('\n'));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CSV → SQL INSERT</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="CSV input..." />
      <Input label="Table name" value={table} onChange={v => { setTable(v); setOut(''); }} placeholder="Table name" />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors">Generate SQL</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-slate-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">SQL INSERT ({out.split('\n').length} statements)</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.sql'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function JsonEscapeUnescape() {
  const [input, setInput] = useState('{"name":"John","age":30}');
  const [out, setOut] = useState('');
  const jsonPresets = [
    { label: 'Default', v: '{"name":"John","age":30}' },
    { label: 'Multi-line', v: '{"name":"John","bio":"Line 1\nLine 2\nLine 3"}' },
  ];
  const escape = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    setOut(txt.replace(/"/g, '\\"').replace(/\n/g, '\\n'));
  };
  const unescape = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    setOut(txt.replace(/\\"/g, '"').replace(/\\n/g, '\n'));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => { setInput(p.v); setOut(''); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON Escape / Unescape</h2>
      <Input label="JSON Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="JSON input..." />
      <div className="flex gap-2 mb-3">
        <button onClick={() => escape()} className="flex-1 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors">Escape</button>
        <button onClick={() => unescape()} className="flex-1 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Unescape</button>
      </div>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-cyan-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Result ({out.length} chars)</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function JsonFlattener() {
  const [input, setInput] = useState('{"name":"John","address":{"street":"123 Main","zip":"10001"}}');
  const [out, setOut] = useState('');
  const jsonPresets = [
    { label: 'Default', v: '{"name":"John","address":{"street":"123 Main","zip":"10001"}}' },
    { label: 'Deep', v: '{"user":{"profile":{"name":"Alice","details":{"age":30,"city":"NYC"}}},"tags":["a","b","c"]}' },
  ];
  const handle = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    const obj = parseJSON(txt);
    if (!obj) return;
    const flat: Record<string, JsonValue> = {};
    const go = (o: JsonValue, prefix: string) => {
      if (typeof o !== 'object' || o === null) { flat[prefix] = o; return; }
      if (Array.isArray(o)) o.forEach((v, i) => go(v, `${prefix}[${i}]`));
      else Object.entries(o).forEach(([k, v]) => go(v, prefix ? `${prefix}.${k}` : k));
    };
    go(obj, '');
    setOut(JSON.stringify(flat, null, 2));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON Flattener</h2>
      <Input label="Nested JSON" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="Nested JSON..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">Flatten</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-orange-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Flattened ({Object.keys(JSON.parse(out)).length} keys)</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.json'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function JsonLdGenerator() {
  const [input, setInput] = useState('{"name":"My Page","description":"A sample page"}');
  const [out, setOut] = useState('');
  const typePresets = [
    { label: 'WebPage', v: 'WebPage' },
    { label: 'Article', v: 'Article' },
    { label: 'Product', v: 'Product' },
    { label: 'Organization', v: 'Organization' },
    { label: 'Person', v: 'Person' },
  ];
  const [schemaType, setSchemaType] = useState('WebPage');
  const handle = (t?: string) => {
    const tp = t !== undefined ? t : schemaType;
    if (t !== undefined) setSchemaType(tp);
    try {
      const parsed = JSON.parse(input);
      const ld: Record<string, any> = { "@context": "https://schema.org", "@type": tp };
      if (typeof parsed === 'object' && !Array.isArray(parsed)) Object.assign(ld, parsed);
      setOut(JSON.stringify(ld, null, 2));
    } catch { toast.error('Invalid JSON'); }
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {typePresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${schemaType === p.v ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/20'}`}>{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON-LD Generator</h2>
      <Input label="JSON Properties" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="JSON input..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">Generate JSON-LD</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-blue-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">JSON-LD ({schemaType})</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.json'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function MergePatchGenerator() {
  const [orig, setOrig] = useState('{"name":"John","age":30,"city":"NYC"}');
  const [modified, setModified] = useState('{"name":"John","age":31,"city":"LA"}');
  const [out, setOut] = useState('');
  const jsonPresets = [
    { label: 'Default', o: '{"name":"John","age":30,"city":"NYC"}', m: '{"name":"John","age":31,"city":"LA"}' },
    { label: 'Add Field', o: '{"name":"John","age":30}', m: '{"name":"John","age":30,"email":"john@test.com"}' },
    { label: 'Remove Field', o: '{"name":"John","age":30,"city":"NYC"}', m: '{"name":"John","age":30}' },
  ];
  const handle = (a?: string, b?: string) => {
    const o = a !== undefined ? a : orig;
    const m = b !== undefined ? b : modified;
    if (a !== undefined) setOrig(o);
    if (b !== undefined) setModified(m);
    const objA = parseJSON(o);
    const objB = parseJSON(m);
    if (!objA || !objB) return;
    const patch: Record<string, JsonValue> = {};
    const recA = objA as Record<string, JsonValue>;
    const recB = objB as Record<string, JsonValue>;
    const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
    allKeys.forEach(k => {
      if (!(k in recA)) patch[k] = recB[k];
      else if (!(k in recB)) patch[k] = null;
      else if (JSON.stringify(recA[k]) !== JSON.stringify(recB[k])) patch[k] = recB[k];
    });
    setOut(JSON.stringify(patch, null, 2));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => handle(p.o, p.m)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Merge Patch Generator</h2>
      <Input label="Original JSON" rows={3} value={orig} onChange={v => { setOrig(v); setOut(''); }} placeholder="Original JSON..." />
      <Input label="Modified JSON" rows={3} value={modified} onChange={v => { setModified(v); setOut(''); }} placeholder="Modified JSON..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Patch</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-violet-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Merge Patch (RFC 7396)</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.json'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function JsonSchemaGenerator() {
  const [input, setInput] = useState('{"name":"John","age":30,"active":true}');
  const [out, setOut] = useState('');
  const jsonPresets = [
    { label: 'User', v: '{"name":"John","age":30,"active":true}' },
    { label: 'Product', v: '{"id":1,"title":"Widget","price":19.99,"inStock":true}' },
    { label: 'Nested', v: '{"user":{"name":"Alice","address":{"street":"123 Main","zip":"10001"}},"tags":["a","b"]}' },
  ];
  const handle = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    const obj = parseJSON(txt);
    if (!obj) return;
    const infer = (o: JsonValue): unknown => {
      if (o === null) return { type: 'null' };
      if (Array.isArray(o)) return { type: 'array', items: o.length ? infer(o[0]) : {} };
      if (typeof o === 'object') {
        const props: Record<string, unknown> = {};
        Object.entries(o).forEach(([k, v]) => { props[k] = infer(v); });
        return { type: 'object', properties: props, required: Object.keys(o) };
      }
      if (typeof o === 'string') return { type: 'string' };
      if (typeof o === 'number') return { type: 'number' };
      if (typeof o === 'boolean') return { type: 'boolean' };
      return {};
    };
    setOut(JSON.stringify({ $schema: 'http://json-schema.org/draft-07/schema#', ...(infer(obj) as Record<string, unknown>) }, null, 2));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON Schema Generator</h2>
      <Input label="JSON Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="JSON input..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Schema</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-indigo-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">JSON Schema (draft-07)</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.json'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function JsonSizeAnalyzer() {
  const [input, setInput] = useState('{"name":"John","age":30,"address":{"street":"123 Main","zip":"10001"},"tags":["a","b","c"]}');
  const [metrics, setMetrics] = useState<{ size: string; chars: number; keys: number; depth: number; type: string; rootKeys: number } | null>(null);
  const jsonPresets = [
    { label: 'Default', v: '{"name":"John","age":30,"address":{"street":"123 Main","zip":"10001"},"tags":["a","b","c"]}' },
    { label: 'Large', v: '{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"},{"id":3,"name":"Charlie"},{"id":4,"name":"Diana"},{"id":5,"name":"Eve"}]}' },
  ];
  const handle = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    const obj = parseJSON(txt);
    if (!obj) return;
    const str = JSON.stringify(obj);
    const countKeys = (o: JsonValue): number => {
      if (typeof o !== 'object' || o === null) return 0;
      return Object.keys(o).length + Object.values(o as Record<string, JsonValue>).reduce((s: number, v: JsonValue) => s + countKeys(v), 0);
    };
    const maxDepth = (o: JsonValue): number => {
      if (typeof o !== 'object' || o === null) return 0;
      return 1 + Math.max(0, ...Object.values(o as Record<string, JsonValue>).map(maxDepth));
    };
    setMetrics({
      size: (str.length / 1024).toFixed(2),
      chars: str.length,
      keys: countKeys(obj),
      depth: maxDepth(obj),
      type: Array.isArray(obj) ? 'Array' : typeof obj,
      rootKeys: Object.keys(obj).length,
    });
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON Size Analyzer</h2>
      <Input label="JSON Input" rows={4} value={input} onChange={v => { setInput(v); setMetrics(null); }} placeholder="JSON input..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Analyze</button>
      {metrics && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: 'Size', value: `${metrics.size} KB`, color: 'border-l-rose-400' },
            { label: 'Characters', value: metrics.chars.toLocaleString(), color: 'border-l-pink-400' },
            { label: 'Keys (total)', value: metrics.keys.toLocaleString(), color: 'border-l-orange-400' },
            { label: 'Max Depth', value: metrics.depth.toString(), color: 'border-l-amber-400' },
            { label: 'Type', value: metrics.type, color: 'border-l-yellow-400' },
            { label: 'Root Keys', value: metrics.rootKeys.toString(), color: 'border-l-lime-400' },
          ].map(m => (
            <div key={m.label} className={`bg-[var(--bg-surface)] rounded-xl p-3 ${m.color} border-l-4`}>
              <span className="text-xs text-zinc-500">{m.label}</span>
              <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{m.value}</p>
            </div>
          ))}
        </div>
      )}
    
      </div>
    </>
  );
}

export function JsonToZod() {
  const [input, setInput] = useState('{"name":"John","age":30,"active":true}');
  const [out, setOut] = useState('');
  const jsonPresets = [
    { label: 'User', v: '{"name":"John","age":30,"active":true}' },
    { label: 'Nested', v: '{"user":{"name":"Alice","age":25},"tags":["admin","user"]}' },
  ];
  const handle = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    const obj = parseJSON(txt);
    if (!obj) return;
    const toZod = (o: JsonValue): string => {
      if (o === null) return 'z.null()';
      if (Array.isArray(o)) return `z.array(${o.length ? toZod(o[0]) : 'z.any()'})`;
      if (typeof o === 'object') {
        const props = Object.entries(o).map(([k, v]) => `  ${k}: ${toZod(v)},`).join('\n');
        return `z.object({\n${props}\n})`;
      }
      if (typeof o === 'string') return 'z.string()';
      if (typeof o === 'number') return 'z.number()';
      if (typeof o === 'boolean') return 'z.boolean()';
      return 'z.any()';
    };
    setOut(`import { z } from 'zod';\n\nexport const schema = ${toZod(obj).trim()};`);
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON → Zod Schema</h2>
      <Input label="JSON Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="JSON input..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">Generate Zod</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-emerald-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Zod Schema</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.ts'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function JwkGenerator() {
  const [bits, setBits] = useState('256');
  const [out, setOut] = useState('');
  const bitPresets = ['128', '256'];
  const handle = (b?: string) => {
    const bs = b !== undefined ? b : bits;
    if (b !== undefined) setBits(bs);
    const keyBytes = parseInt(bs, 10) / 8;
    const randBytes = Array.from({ length: keyBytes }, () => Math.floor(Math.random() * 256));
    const b64url = btoa(String.fromCharCode(...randBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwk = {
      kty: 'oct',
      k: b64url,
      alg: parseInt(bs, 10) >= 256 ? 'A256GCM' : 'A128GCM',
      use: 'enc',
      kid: crypto.randomUUID().slice(0, 8),
    };
    setOut(JSON.stringify(jwk, null, 2));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {bitPresets.map(b => <button key={b} onClick={() => handle(b)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${bits === b ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20'}`}>{b} bits</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JWK Generator</h2>
      <button onClick={() => handle()} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium transition-colors">Generate JWK</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-yellow-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Symmetric JWK ({bits}-bit)</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.json'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function JsonlFormatter() {
  const [input, setInput] = useState('{"name":"John","age":30}\n{"name":"Jane","age":25}');
  const [out, setOut] = useState('');
  const jsonPresets = [
    { label: 'Default', v: '{"name":"John","age":30}\n{"name":"Jane","age":25}' },
    { label: 'Mixed', v: '{"id":1,"active":true}\n{"id":2}\n{"id":3,"name":"Bob","tags":["a","b"]}' },
  ];
  const handle = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    const lines = txt.split('\n').filter(l => l.trim());
    const formatted = lines.map(l => { try { return JSON.stringify(JSON.parse(l), null, 2); } catch { return l; } }).join('\n---\n');
    setOut(formatted);
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSONL Formatter</h2>
      <Input label="JSONL Input (one JSON per line)" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="One JSON object per line..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">Format</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-sky-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Formatted JSONL</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function NdjsonToJson() {
  const [input, setInput] = useState('{"name":"John","age":30}\n{"name":"Jane","age":25}');
  const [out, setOut] = useState('');
  const [objCount, setObjCount] = useState(0);
  const jsonPresets = [
    { label: 'Default', v: '{"name":"John","age":30}\n{"name":"Jane","age":25}' },
    { label: 'Events', v: '{"event":"click","ts":100}\n{"event":"scroll","ts":200}\n{"event":"submit","ts":300}' },
  ];
  const handle = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    const lines = txt.split('\n').filter(l => l.trim());
    const objs: JsonValue[] = [];
    for (const l of lines) { try { objs.push(JSON.parse(l)); } catch { /* skip */ } }
    setObjCount(objs.length);
    setOut(JSON.stringify(objs, null, 2));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">NDJSON → JSON Array</h2>
      <Input label="NDJSON Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="One JSON per line..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors">Convert</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-purple-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">JSON Array ({objCount} objects)</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.json'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function JsonToUrlParams() {
  const [input, setInput] = useState('{"name":"John","age":30,"city":"NYC"}');
  const [out, setOut] = useState('');
  const jsonPresets = [
    { label: 'Default', v: '{"name":"John","age":30,"city":"NYC"}' },
    { label: 'Search', v: '{"q":"typescript","page":"1","sort":"asc","category":"programming"}' },
  ];
  const handle = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    try {
      const obj = JSON.parse(txt);
      if (typeof obj !== 'object' || Array.isArray(obj)) { toast.error('Expected a flat object'); return; }
      setOut(new URLSearchParams(obj).toString());
    } catch { toast.error('Invalid JSON'); }
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON → URL Params</h2>
      <Input label="Flat JSON Object" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder='{"key":"value"}' />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-colors">Convert</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-pink-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">URL Query String</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

export function CsvJsonRowGenerator() {
  const [type, setType] = useState('csv');
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');
  const handle = () => {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      if (type === 'csv') {
        results.push(`${firstNames[Math.floor(Math.random() * firstNames.length)]},${lastNames[Math.floor(Math.random() * lastNames.length)]},${Math.floor(Math.random() * 50 + 20)},${['Active','Inactive','Pending'][Math.floor(Math.random() * 3)]}`);
      } else {
        results.push(JSON.stringify({
          id: crypto.randomUUID().slice(0, 8),
          name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          age: Math.floor(Math.random() * 50 + 20),
          email: `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
          active: Math.random() > 0.3,
        }));
      }
    }
    setOut(results.join('\n'));
  };
  const downloadFile = type === 'csv' ? 'output.csv' : 'output.json';
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CSV Row / JSON Generator</h2>
      <div className="flex gap-2 mb-3">
        {[{ v: 'csv', l: 'CSV Row' }, { v: 'json', l: 'JSON' }].map(({ v, l }) => (
          <button key={v} onClick={() => setType(v)} className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors ${type === v ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'}`}>{l}</button>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-[var(--text-secondary)]">Rows: {count}</span>
        <input type="range" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} aria-label="Rows" className="flex-1 h-2 accent-blue-500" />
      </div>
      <button onClick={handle} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">Generate</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-blue-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Generated {type.toUpperCase()} ({count} rows)</span>
            <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(out); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=downloadFile; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
  );
}
