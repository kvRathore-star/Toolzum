"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const inputClass = "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors";
const resultClass = "p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm whitespace-pre-wrap font-mono max-h-48 overflow-y-auto";

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

function parseJSON(s: string) {
  try { return JSON.parse(s); } catch { toast.error('Invalid JSON'); return null; }
}

const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Eve', 'Charlie', 'Diana', 'Frank', 'Grace', 'Henry'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.org'];

function OutputBlock({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="mt-3">
      <pre className={resultClass}>{value}</pre>
      <button onClick={() => { clipboardWrite(value); toast.success('Copied!'); }} className="mt-1 px-4 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium transition-colors">Copy</button>
    </div>
  );
}

export function ColumnExtractor() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor');
  const [cols, setCols] = useState('name,email');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const colList = cols.split(',').map(c => c.trim()).filter(c => c);
    const idxs = colList.map(c => p.headers.indexOf(c)).filter(i => i >= 0);
    if (!idxs.length) { toast.error('No matching columns'); return; }
    const nh = colList.filter(c => p.headers.includes(c));
    const nr = p.rows.map(r => idxs.map(i => r[i] || ''));
    setOut(formatCSV(nh, nr));
    toast.success(`Extracted ${nh.length} columns`);
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Column Extractor</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <input type="text" value={cols} onChange={e => setCols(e.target.value)} className={inputClass} placeholder="column1,column2" />
      <button onClick={handle} className={btnClass}>Extract</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function ColumnRenamer() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor');
  const [mapping, setMapping] = useState('name:full_name');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const mappings = mapping.split(',').map(m => m.split(':').map(s => s.trim()));
    const nh = p.headers.map(h => { const m = mappings.find(([k]) => k === h); return m ? m[1] : h; });
    setOut(formatCSV(nh, p.rows));
    toast.success('Columns renamed');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Column Renamer</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <input type="text" value={mapping} onChange={e => setMapping(e.target.value)} className={inputClass} placeholder="old:new,old2:new2" />
      <button onClick={handle} className={btnClass}>Rename</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function DataTypeConverter() {
  const [input, setInput] = useState('name,age,salary\nJohn,35,75000\nJane,28,62000');
  const [col, setCol] = useState('age');
  const [type, setType] = useState('number');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
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
    toast.success(`Converted ${col} to ${type}`);
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Data Type Converter</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <input type="text" value={col} onChange={e => setCol(e.target.value)} className={inputClass} placeholder="Column name" />
      <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
        <option value="number">Number</option>
        <option value="string">String</option>
        <option value="int">Integer</option>
        <option value="float">Float</option>
      </select>
      <button onClick={handle} className={btnClass}>Convert</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function Deduplicator() {
  const [input, setInput] = useState('name,email\nJohn,john@example.com\nJane,jane@test.com\nJohn,john@example.com');
  const [col, setCol] = useState('name');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const ci = p.headers.indexOf(col);
    if (ci < 0) { toast.error('Column not found'); return; }
    const seen = new Set<string>();
    const nr = p.rows.filter(r => { const v = r[ci] || ''; if (seen.has(v)) return false; seen.add(v); return true; });
    setOut(formatCSV(p.headers, nr));
    toast.success(`Deduped: ${p.rows.length} → ${nr.length} rows`);
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Deduplicator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <input type="text" value={col} onChange={e => setCol(e.target.value)} className={inputClass} placeholder="Column name" />
      <button onClick={handle} className={btnClass}>Deduplicate</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function FormatValidator() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const issues: string[] = [];
    const colCount = p.headers.length;
    p.rows.forEach((r, i) => {
      if (r.length !== colCount) issues.push(`Row ${i + 2}: ${r.length} cols (expected ${colCount})`);
      if (r.some(c => !c.trim())) issues.push(`Row ${i + 2}: empty cell`);
    });
    setOut(issues.length ? issues.join('\n') : '✓ Valid CSV – ' + p.rows.length + ' rows, ' + colCount + ' cols');
    toast.success(issues.length ? `Found ${issues.length} issues` : 'Valid!');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Format Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <button onClick={handle} className={btnClass}>Validate</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function CsvMerger() {
  const [input1, setInput1] = useState('name,email\nJohn,john@example.com\nJane,jane@test.com');
  const [input2, setInput2] = useState('name,department\nJohn,Engineering\nJane,Marketing');
  const [key, setKey] = useState('name');
  const [out, setOut] = useState('');
  const handle = () => {
    const p1 = parseCSV(input1);
    if (!p1.headers.length) { toast.error('Enter first CSV'); return; }
    const p2 = parseCSV(input2);
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
    toast.success('Merged');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">CSV Merger</h1>
      <textarea value={input1} onChange={e => setInput1(e.target.value)} className={inputClass + ' h-20'} placeholder="First CSV" />
      <textarea value={input2} onChange={e => setInput2(e.target.value)} className={inputClass + ' h-20'} placeholder="Second CSV" />
      <input type="text" value={key} onChange={e => setKey(e.target.value)} className={inputClass} placeholder="Key column" />
      <button onClick={handle} className={btnClass}>Merge</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function NullValueHandler() {
  const [input, setInput] = useState('name,email,phone\nJohn,john@example.com,\nJane,,555-0100');
  const [replace, setReplace] = useState('N/A');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const nr = p.rows.map(r => r.map(c => c.trim() ? c : replace));
    setOut(formatCSV(p.headers, nr));
    toast.success('Nulls replaced');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Null Value Handler</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input with empty cells" />
      <input type="text" value={replace} onChange={e => setReplace(e.target.value)} className={inputClass} placeholder="Replacement value" />
      <button onClick={handle} className={btnClass}>Replace Nulls</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function PivotGenerator() {
  const [input, setInput] = useState('name,role,salary\nJohn,Admin,75000\nJane,Editor,62000\nBob,Admin,82000');
  const [groupCol, setGroupCol] = useState('role');
  const [valCol, setValCol] = useState('salary');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
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
    toast.success('Pivot generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Pivot Generator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <input type="text" value={groupCol} onChange={e => setGroupCol(e.target.value)} className={inputClass} placeholder="Group column" />
      <input type="text" value={valCol} onChange={e => setValCol(e.target.value)} className={inputClass} placeholder="Value column" />
      <button onClick={handle} className={btnClass}>Pivot</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function RowFilter() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor\nBob,bob@test.com,Admin');
  const [col, setCol] = useState('role');
  const [val, setVal] = useState('Admin');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const ci = p.headers.indexOf(col);
    if (ci < 0) { toast.error('Column not found'); return; }
    const nr = p.rows.filter(r => (r[ci] || '').toLowerCase().includes(val.toLowerCase()));
    setOut(formatCSV(p.headers, nr));
    toast.success(`Filtered: ${nr.length} rows match`);
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Row Filter</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <input type="text" value={col} onChange={e => setCol(e.target.value)} className={inputClass} placeholder="Column" />
      <input type="text" value={val} onChange={e => setVal(e.target.value)} className={inputClass} placeholder="Filter value" />
      <button onClick={handle} className={btnClass}>Filter</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function Sorter() {
  const [input, setInput] = useState('name,age,salary\nJohn,35,75000\nJane,28,62000\nBob,42,82000\nAlice,31,58000');
  const [col, setCol] = useState('age');
  const [dir, setDir] = useState('asc');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
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
    toast.success(`Sorted by ${col} (${dir})`);
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Sorter</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <input type="text" value={col} onChange={e => setCol(e.target.value)} className={inputClass} placeholder="Column" />
      <select value={dir} onChange={e => setDir(e.target.value)} className={inputClass}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <button onClick={handle} className={btnClass}>Sort</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function Splitter() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor\nBob,bob@test.com,Admin\nAlice,alice@test.com,Editor');
  const [parts, setParts] = useState('2');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const n = Math.max(1, parseInt(parts, 10) || 2);
    const chunk = Math.ceil(p.rows.length / n);
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
      const chunkRows = p.rows.slice(i * chunk, (i + 1) * chunk);
      result.push(`=== Part ${i + 1} (${chunkRows.length} rows) ===\n${formatCSV(p.headers, chunkRows)}`);
    }
    setOut(result.join('\n\n'));
    toast.success(`Split into ${n} parts`);
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">CSV Splitter</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <input type="text" value={parts} onChange={e => setParts(e.target.value)} className={inputClass} placeholder="Number of parts" />
      <button onClick={handle} className={btnClass}>Split</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function Transpose() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const all = [p.headers, ...p.rows];
    const maxLen = Math.max(...all.map(r => r.length));
    const filled = all.map(r => [...r, ...Array(maxLen - r.length).fill('')]);
    const transposed = filled[0].map((_, ci) => filled.map(r => r[ci]));
    const nh = transposed[0];
    const nr = transposed.slice(1);
    setOut(formatCSV(nh, nr));
    toast.success('Transposed');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">CSV Transpose</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <button onClick={handle} className={btnClass}>Transpose</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function CsvToMarkdown() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const sep = `|${p.headers.map(() => '---').join('|')}|`;
    const head = `|${p.headers.join('|')}|`;
    const rows = p.rows.map(r => `|${r.join('|')}|`).join('\n');
    setOut([head, sep, rows].join('\n'));
    toast.success('Markdown table generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">CSV → Markdown Table</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <button onClick={handle} className={btnClass}>Generate MD</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function CsvToNdjson() {
  const [input, setInput] = useState('name,age\nJohn,35\nJane,28');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const objs = p.rows.map(r => {
      const o: Record<string, string> = {};
      p.headers.forEach((h, i) => o[h] = r[i] || '');
      return JSON.stringify(o);
    }).join('\n');
    setOut(objs);
    toast.success('NDJSON generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">CSV → NDJSON</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <button onClick={handle} className={btnClass}>Convert</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function CsvToSql() {
  const [input, setInput] = useState('name,age\nJohn,35\nJane,28');
  const [table, setTable] = useState('data');
  const [out, setOut] = useState('');
  const handle = () => {
    const p = parseCSV(input);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const inserts = p.rows.map(r => `INSERT INTO ${table} (${p.headers.join(', ')}) VALUES (${r.map(c => `'${c.replace(/'/g, "''")}'`).join(', ')});`);
    setOut(inserts.join('\n'));
    toast.success('SQL generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">CSV → SQL INSERT</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="CSV input" />
      <input type="text" value={table} onChange={e => setTable(e.target.value)} className={inputClass} placeholder="Table name" />
      <button onClick={handle} className={btnClass}>Generate SQL</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function JsonEscapeUnescape() {
  const [input, setInput] = useState('{"name":"John","age":30}');
  const [out, setOut] = useState('');
  const escape = () => { setOut(input.replace(/"/g, '\\"').replace(/\n/g, '\\n')); toast.success('Escaped'); };
  const unescape = () => { setOut(input.replace(/\\"/g, '"').replace(/\\n/g, '\n')); toast.success('Unescaped'); };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">JSON Escape / Unescape</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="JSON input" />
      <div className="flex gap-2">
        <button onClick={escape} className={`${btnClass} flex-1`}>Escape</button>
        <button onClick={unescape} className={`${btnClass} flex-1`}>Unescape</button>
      </div>
      <OutputBlock value={out} />
    </div>
  );
}

export function JsonFlattener() {
  const [input, setInput] = useState('{"name":"John","address":{"street":"123 Main","zip":"10001"}}');
  const [out, setOut] = useState('');
  const handle = () => {
    const obj = parseJSON(input);
    if (!obj) return;
    const flat: Record<string, any> = {};
    const go = (o: any, prefix: string) => {
      if (typeof o !== 'object' || o === null) { flat[prefix] = o; return; }
      if (Array.isArray(o)) o.forEach((v, i) => go(v, `${prefix}[${i}]`));
      else Object.entries(o).forEach(([k, v]) => go(v, prefix ? `${prefix}.${k}` : k));
    };
    go(obj, '');
    setOut(JSON.stringify(flat, null, 2));
    toast.success('Flattened');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">JSON Flattener</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="Nested JSON" />
      <button onClick={handle} className={btnClass}>Flatten</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function JsonLdGenerator() {
  const [input, setInput] = useState('{"name":"My Page","description":"A sample page"}');
  const [out, setOut] = useState('');
  const handle = () => {
    try {
      const parsed = JSON.parse(input);
      const ld: Record<string, any> = { "@context": "https://schema.org", "@type": "WebPage" };
      if (typeof parsed === 'object' && !Array.isArray(parsed)) Object.assign(ld, parsed);
      setOut(JSON.stringify(ld, null, 2));
      toast.success('JSON-LD generated');
    } catch { toast.error('Invalid JSON'); }
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">JSON-LD Generator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="JSON input to embed in schema.org context" />
      <button onClick={handle} className={btnClass}>Generate JSON-LD</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function MergePatchGenerator() {
  const [orig, setOrig] = useState('{"name":"John","age":30,"city":"NYC"}');
  const [modified, setModified] = useState('{"name":"John","age":31,"city":"LA"}');
  const [out, setOut] = useState('');
  const handle = () => {
    const a = parseJSON(orig);
    const b = parseJSON(modified);
    if (!a || !b) return;
    const patch: Record<string, any> = {};
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    allKeys.forEach(k => {
      if (!(k in a)) patch[k] = b[k];
      else if (!(k in b)) patch[k] = null;
      else if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) patch[k] = b[k];
    });
    setOut(JSON.stringify(patch, null, 2));
    toast.success('Merge patch generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Merge Patch Generator</h1>
      <textarea value={orig} onChange={e => setOrig(e.target.value)} className={inputClass + ' h-20'} placeholder="Original JSON" />
      <textarea value={modified} onChange={e => setModified(e.target.value)} className={inputClass + ' h-20'} placeholder="Modified JSON" />
      <button onClick={handle} className={btnClass}>Generate Patch</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function JsonSchemaGenerator() {
  const [input, setInput] = useState('{"name":"John","age":30,"active":true}');
  const [out, setOut] = useState('');
  const handle = () => {
    const obj = parseJSON(input);
    if (!obj) return;
    const infer = (o: any): any => {
      if (o === null) return { type: 'null' };
      if (Array.isArray(o)) return { type: 'array', items: o.length ? infer(o[0]) : {} };
      if (typeof o === 'object') {
        const props: Record<string, any> = {};
        Object.entries(o).forEach(([k, v]) => { props[k] = infer(v); });
        return { type: 'object', properties: props, required: Object.keys(o) };
      }
      if (typeof o === 'string') return { type: 'string' };
      if (typeof o === 'number') return { type: 'number' };
      if (typeof o === 'boolean') return { type: 'boolean' };
      return {};
    };
    setOut(JSON.stringify({ $schema: 'http://json-schema.org/draft-07/schema#', ...infer(obj) }, null, 2));
    toast.success('Schema generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">JSON Schema Generator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="JSON input" />
      <button onClick={handle} className={btnClass}>Generate Schema</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function JsonSizeAnalyzer() {
  const [input, setInput] = useState('{"name":"John","age":30,"address":{"street":"123 Main","zip":"10001"},"tags":["a","b","c"]}');
  const [out, setOut] = useState('');
  const handle = () => {
    const obj = parseJSON(input);
    if (!obj) return;
    const str = JSON.stringify(obj);
    const countKeys = (o: any): number => {
      if (typeof o !== 'object' || o === null) return 0;
      return Object.keys(o).length + Object.values(o).reduce((s: number, v: any) => s + countKeys(v), 0);
    };
    const maxDepth = (o: any): number => {
      if (typeof o !== 'object' || o === null) return 0;
      return 1 + Math.max(0, ...Object.values(o).map(maxDepth));
    };
    const lines = [
      `Size: ${(str.length / 1024).toFixed(2)} KB`,
      `Characters: ${str.length}`,
      `Keys (total): ${countKeys(obj)}`,
      `Depth: ${maxDepth(obj)}`,
      `Type: ${Array.isArray(obj) ? 'Array' : typeof obj}`,
      `Root keys: ${Object.keys(obj).length}`,
    ];
    setOut(lines.join('\n'));
    toast.success('Analysis done');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">JSON Size Analyzer</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="JSON input" />
      <button onClick={handle} className={btnClass}>Analyze</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function JsonToZod() {
  const [input, setInput] = useState('{"name":"John","age":30,"active":true}');
  const [out, setOut] = useState('');
  const handle = () => {
    const obj = parseJSON(input);
    if (!obj) return;
    const toZod = (o: any): string => {
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
    toast.success('Zod schema generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">JSON → Zod Schema</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="JSON input" />
      <button onClick={handle} className={btnClass}>Generate Zod</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function JwkGenerator() {
  const [bits, setBits] = useState('256');
  const [out, setOut] = useState('');
  const handle = () => {
    const keyBytes = parseInt(bits, 10) / 8;
    const randBytes = Array.from({ length: keyBytes }, () => Math.floor(Math.random() * 256));
    const b64url = btoa(String.fromCharCode(...randBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwk = {
      kty: 'oct',
      k: b64url,
      alg: parseInt(bits, 10) >= 256 ? 'A256GCM' : 'A128GCM',
      use: 'enc',
      kid: crypto.randomUUID().slice(0, 8),
    };
    setOut(JSON.stringify(jwk, null, 2));
    toast.success('Symmetric JWK generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">JWK Generator</h1>
      <select value={bits} onChange={e => setBits(e.target.value)} className={inputClass}>
        <option value="128">128 bits</option>
        <option value="256">256 bits</option>
      </select>
      <button onClick={handle} className={btnClass}>Generate JWK</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function JsonlFormatter() {
  const [input, setInput] = useState('{"name":"John","age":30}\n{"name":"Jane","age":25}');
  const [out, setOut] = useState('');
  const handle = () => {
    const lines = input.split('\n').filter(l => l.trim());
    const formatted = lines.map(l => { try { return JSON.stringify(JSON.parse(l), null, 2); } catch { return l; } }).join('\n---\n');
    setOut(formatted);
    toast.success('Formatted');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">JSONL Formatter</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="One JSON object per line" />
      <button onClick={handle} className={btnClass}>Format</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function NdjsonToJson() {
  const [input, setInput] = useState('{"name":"John","age":30}\n{"name":"Jane","age":25}');
  const [out, setOut] = useState('');
  const handle = () => {
    const lines = input.split('\n').filter(l => l.trim());
    const objs: any[] = [];
    for (const l of lines) { try { objs.push(JSON.parse(l)); } catch { /* skip */ } }
    setOut(JSON.stringify(objs, null, 2));
    toast.success(`Converted ${objs.length} objects`);
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">NDJSON → JSON Array</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder="One JSON object per line" />
      <button onClick={handle} className={btnClass}>Convert</button>
      <OutputBlock value={out} />
    </div>
  );
}

export function JsonToUrlParams() {
  const [input, setInput] = useState('{"name":"John","age":30,"city":"NYC"}');
  const [out, setOut] = useState('');
  const handle = () => {
    try {
      const obj = JSON.parse(input);
      if (typeof obj !== 'object' || Array.isArray(obj)) { toast.error('Expected a flat object'); return; }
      setOut(new URLSearchParams(obj).toString());
      toast.success('Converted');
    } catch { toast.error('Invalid JSON'); }
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">JSON → URL Params</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} className={inputClass + ' h-24'} placeholder='{"key":"value"}' />
      <button onClick={handle} className={btnClass}>Convert</button>
      <OutputBlock value={out} />
    </div>
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
    toast.success('Generated');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">CSV Row / JSON Generator</h1>
      <div className="flex gap-2">
        {[{ v: 'csv', l: 'CSV Row' }, { v: 'json', l: 'JSON' }].map(({ v, l }) => (
          <button key={v} onClick={() => setType(v)} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${type === v ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{l}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Count</span>
        <input type="range" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} className="flex-1 h-1" />
        <span className="text-sm text-zinc-400 w-5 text-right">{count}</span>
      </div>
      <button onClick={handle} className={btnClass}>Generate</button>
      <OutputBlock value={out} />
    </div>
  );
}
