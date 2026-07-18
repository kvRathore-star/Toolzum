"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Table2, FileJson, Repeat, Database } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'csv' | 'json' | 'convert' | 'diff';

export default function DataToolkit() {
  const [tab, setTab] = useState<Tab>('csv');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="csv" label="CSV Tools" icon={Table2} />
        <TabBtn v="json" label="JSON Tools" icon={FileJson} />
        <TabBtn v="convert" label="Data Converters" icon={Repeat} />
        <TabBtn v="diff" label="Data Generator" icon={Database} />
      </div>
      {tab === 'csv' && <CsvTools />}
      {tab === 'json' && <JsonTools />}
      {tab === 'convert' && <DataConverters />}
      {tab === 'diff' && <DataGenerator />}
    </div>
  );
}

const CsvCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Inp = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
  </div>
);

const Sel = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500">
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

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

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function CsvTools() {
  const [csvInput, setCsvInput] = useState('name,email,role,age,salary\nJohn,john@example.com,Admin,35,75000\nJane,jane@test.com,Editor,28,62000\nBob,bob@test.com,Admin,42,82000\nAlice,alice@test.com,Editor,31,58000\nEve,eve@test.com,Viewer,25,45000');
  const [csvInput2, setCsvInput2] = useState('name,department\nJohn,Engineering\nJane,Marketing\nBob,Sales');
  const [csvOut, setCsvOut] = useState('');
  const [colName, setColName] = useState('name');
  const [colRename, setColRename] = useState('name:full_name');
  const [filterCol, setFilterCol] = useState('role');
  const [filterVal, setFilterVal] = useState('Admin');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [nullReplace, setNullReplace] = useState('N/A');
  const [pivotCol, setPivotCol] = useState('role');
  const [pivotVal, setPivotVal] = useState('salary');
  const [splitCount, setSplitCount] = useState('2');
  const [mergeCol, setMergeCol] = useState('name');
  const [dedupCol, setDedupCol] = useState('name');
  const [typeCol, setTypeCol] = useState('age');
  const [typeTarget, setTypeTarget] = useState('number');

  const getCsv = () => {
    const p = parseCSV(csvInput);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return null; }
    return p;
  };

  const setOut = (v: string) => { setCsvOut(v); };
  const copyOut = () => { if (csvOut) { clipboardWrite(csvOut); toast.success('Copied!'); } };

  const colExtract = () => {
    const p = getCsv(); if (!p) return;
    const cols = colName.split(',').map(c => c.trim()).filter(c => c);
    const idxs = cols.map(c => p.headers.indexOf(c)).filter(i => i >= 0);
    if (!idxs.length) { toast.error('No matching columns'); return; }
    const nh = cols.filter(c => p.headers.includes(c));
    const nr = p.rows.map(r => idxs.map(i => r[i] || ''));
    setOut(formatCSV(nh, nr));
    toast.success(`Extracted ${nh.length} columns`);
  };

  const colRename_ = () => {
    const p = getCsv(); if (!p) return;
    const mappings = colRename.split(',').map(m => m.split(':').map(s => s.trim()));
    const nh = p.headers.map(h => { const m = mappings.find(([k]) => k === h); return m ? m[1] : h; });
    setOut(formatCSV(nh, p.rows));
    toast.success('Columns renamed');
  };

  const typeConvert = () => {
    const p = getCsv(); if (!p) return;
    const ci = p.headers.indexOf(typeCol);
    if (ci < 0) { toast.error('Column not found'); return; }
    const nr = p.rows.map(r => {
      const n = [...r];
      if (typeTarget === 'number') n[ci] = String(Number(n[ci]));
      else if (typeTarget === 'string') n[ci] = String(n[ci]);
      else if (typeTarget === 'int') n[ci] = String(parseInt(n[ci], 10) || 0);
      else if (typeTarget === 'float') n[ci] = String(parseFloat(n[ci]) || 0);
      return n;
    });
    setOut(formatCSV(p.headers, nr));
    toast.success(`Converted ${typeCol} to ${typeTarget}`);
  };

  const dedup = () => {
    const p = getCsv(); if (!p) return;
    const ci = p.headers.indexOf(dedupCol);
    if (ci < 0) { toast.error('Column not found'); return; }
    const seen = new Set<string>();
    const nr = p.rows.filter(r => { const v = r[ci] || ''; if (seen.has(v)) return false; seen.add(v); return true; });
    setOut(formatCSV(p.headers, nr));
    toast.success(`Deduped: ${p.rows.length} → ${nr.length} rows`);
  };

  const validate = () => {
    const p = getCsv(); if (!p) return;
    const issues: string[] = [];
    const colCount = p.headers.length;
    p.rows.forEach((r, i) => {
      if (r.length !== colCount) issues.push(`Row ${i + 2}: ${r.length} cols (expected ${colCount})`);
      if (r.some(c => !c.trim())) issues.push(`Row ${i + 2}: empty cell`);
    });
    setOut(issues.length ? issues.join('\n') : '✓ Valid CSV – ' + p.rows.length + ' rows, ' + colCount + ' cols');
    toast.success(issues.length ? `Found ${issues.length} issues` : 'Valid!');
  };

  const merge = () => {
    const p1 = getCsv(); if (!p1) return;
    const p2 = parseCSV(csvInput2);
    if (!p2.headers.length) { toast.error('Enter second CSV'); return; }
    const ci1 = p1.headers.indexOf(mergeCol);
    const ci2 = p2.headers.indexOf(mergeCol);
    if (ci1 < 0 || ci2 < 0) { toast.error('Merge column not found in both'); return; }
    const map2 = new Map(p2.rows.map(r => [r[ci2], r]));
    const nh = [...p1.headers, ...p2.headers.filter(h => h !== mergeCol)];
    const nr = p1.rows.map(r => {
      const match = map2.get(r[ci1]);
      return match ? [...r, ...match.filter((_, i) => i !== ci2)] : [...r, ...Array(p2.headers.length - 1).fill('')];
    });
    setOut(formatCSV(nh, nr));
    toast.success('Merged');
  };

  const nullHandler = () => {
    const p = getCsv(); if (!p) return;
    const nr = p.rows.map(r => r.map(c => c.trim() ? c : nullReplace));
    setOut(formatCSV(p.headers, nr));
    toast.success('Nulls replaced');
  };

  const pivot = () => {
    const p = getCsv(); if (!p) return;
    const ci = p.headers.indexOf(pivotCol);
    const vi = p.headers.indexOf(pivotVal);
    if (ci < 0 || vi < 0) { toast.error('Columns not found'); return; }
    const groups: Record<string, number[]> = {};
    p.rows.forEach(r => {
      const k = r[ci] || 'unknown';
      if (!groups[k]) groups[k] = [];
      groups[k].push(Number(r[vi]) || 0);
    });
    const out = Object.entries(groups).map(([k, vals]) => `${k},${vals.length},${vals.reduce((a, b) => a + b, 0).toFixed(2)},${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)}`);
    setOut(['group,count,sum,avg', ...out].join('\n'));
    toast.success('Pivot generated');
  };

  const rowFilter = () => {
    const p = getCsv(); if (!p) return;
    const ci = p.headers.indexOf(filterCol);
    if (ci < 0) { toast.error('Column not found'); return; }
    const nr = p.rows.filter(r => (r[ci] || '').toLowerCase().includes(filterVal.toLowerCase()));
    setOut(formatCSV(p.headers, nr));
    toast.success(`Filtered: ${nr.length} rows match`);
  };

  const sorter = () => {
    const p = getCsv(); if (!p) return;
    const ci = p.headers.indexOf(sortCol);
    if (ci < 0) { toast.error('Column not found'); return; }
    const nr = [...p.rows].sort((a, b) => {
      const va = a[ci] || '', vb = b[ci] || '';
      const na = Number(va), nb = Number(vb);
      const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : va.localeCompare(vb);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    setOut(formatCSV(p.headers, nr));
    toast.success(`Sorted by ${sortCol} (${sortDir})`);
  };

  const splitter = () => {
    const p = getCsv(); if (!p) return;
    const n = Math.max(1, parseInt(splitCount, 10) || 2);
    const chunk = Math.ceil(p.rows.length / n);
    const parts: string[] = [];
    for (let i = 0; i < n; i++) {
      const chunkRows = p.rows.slice(i * chunk, (i + 1) * chunk);
      parts.push(`=== Part ${i + 1} (${chunkRows.length} rows) ===\n${formatCSV(p.headers, chunkRows)}`);
    }
    setOut(parts.join('\n\n'));
    toast.success(`Split into ${n} parts`);
  };

  const toMd = () => {
    const p = getCsv(); if (!p) return;
    const sep = `|${p.headers.map(() => '---').join('|')}|`;
    const head = `|${p.headers.join('|')}|`;
    const rows = p.rows.map(r => `|${r.join('|')}|`).join('\n');
    setOut([head, sep, rows].join('\n'));
    toast.success('Markdown table generated');
  };

  const toNdjson = () => {
    const p = getCsv(); if (!p) return;
    const objs = p.rows.map(r => {
      const o: Record<string, string> = {};
      p.headers.forEach((h, i) => o[h] = r[i] || '');
      return JSON.stringify(o);
    }).join('\n');
    setOut(objs);
    toast.success('NDJSON generated');
  };

  const toSql = () => {
    const p = getCsv(); if (!p) return;
    const inserts = p.rows.map(r => `INSERT INTO data (${p.headers.join(', ')}) VALUES (${r.map(c => `'${c.replace(/'/g, "''")}'`).join(', ')});`);
    setOut(inserts.join('\n'));
    toast.success('SQL generated');
  };

  const toExcel = () => {
    const p = getCsv(); if (!p) return;
    const rows = p.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
    const html = `<html><table>${p.headers.map(h => `<th>${h}</th>`).join('')}${rows}</table></html>`;
    downloadFile(html, 'export.xls', 'application/vnd.ms-excel');
    setOut(html);
    toast.success('Excel file downloaded');
  };

  const toParquet = () => {
    setOut('⚠️ Parquet export requires a desktop tool. Try:\n1. Use Python: pandas.read_csv("file.csv").to_parquet("output.parquet")\n2. Use DuckDB: COPY tbl TO "output.parquet" (FORMAT PARQUET)');
    toast.error('Parquet not supported in browser');
  };

  const transpose = () => {
    const p = getCsv(); if (!p) return;
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
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">CSV Input</span>
          <div className="flex gap-2">
            <button onClick={() => { clipboardWrite(csvInput); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline">Copy</button>
            <button onClick={() => { setCsvOut(''); }} className="text-[10px] text-zinc-400 hover:underline">Clear Output</button>
          </div>
        </div>
        <textarea value={csvInput} onChange={e => setCsvInput(e.target.value)}
          className="w-full h-32 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <CsvCard title="Column Extractor">
          <Inp label="Columns" value={colName} onChange={setColName} placeholder="name,email" />
          <CalcBtn onClick={colExtract} label="Extract" />
        </CsvCard>

        <CsvCard title="Column Renamer">
          <Inp label="old:new" value={colRename} onChange={setColRename} placeholder="name:full_name" />
          <CalcBtn onClick={colRename_} label="Rename" />
        </CsvCard>

        <CsvCard title="CSV Data Cleaner">
          <p className="text-[10px] text-zinc-400">Trim, dedup, lowercase emails, strip phone digits</p>
          <a href="/tools/csv-data-cleaner" className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg text-center transition-all active:scale-[0.98]">Open →</a>
        </CsvCard>

        <CsvCard title="Data Type Converter">
          <Inp label="Column" value={typeCol} onChange={setTypeCol} />
          <Sel label="Type" value={typeTarget} onChange={setTypeTarget} options={[{v:'number',l:'Number'},{v:'string',l:'String'},{v:'int',l:'Integer'},{v:'float',l:'Float'}]} />
          <CalcBtn onClick={typeConvert} label="Convert" />
        </CsvCard>

        <CsvCard title="Deduplicator">
          <Inp label="Column" value={dedupCol} onChange={setDedupCol} placeholder="name" />
          <CalcBtn onClick={dedup} label="Deduplicate" />
        </CsvCard>

        <CsvCard title="Format Validator">
          <p className="text-[10px] text-zinc-400">Checks column counts &amp; empty cells</p>
          <CalcBtn onClick={validate} label="Validate" />
        </CsvCard>

        <CsvCard title="CSV Merger">
          <Inp label="Key col" value={mergeCol} onChange={setMergeCol} placeholder="name" />
          <textarea value={csvInput2} onChange={e => setCsvInput2(e.target.value)}
            className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Second CSV..." />
          <CalcBtn onClick={merge} label="Merge" />
        </CsvCard>

        <CsvCard title="Null Value Handler">
          <Inp label="Replace" value={nullReplace} onChange={setNullReplace} placeholder="N/A" />
          <CalcBtn onClick={nullHandler} label="Replace Nulls" />
        </CsvCard>

        <CsvCard title="Pivot Generator">
          <Inp label="Group col" value={pivotCol} onChange={setPivotCol} placeholder="role" />
          <Inp label="Value col" value={pivotVal} onChange={setPivotVal} placeholder="salary" />
          <CalcBtn onClick={pivot} label="Pivot" />
        </CsvCard>

        <CsvCard title="Row Filter">
          <Inp label="Column" value={filterCol} onChange={setFilterCol} placeholder="role" />
          <Inp label="Value" value={filterVal} onChange={setFilterVal} placeholder="Admin" />
          <CalcBtn onClick={rowFilter} label="Filter" />
        </CsvCard>

        <CsvCard title="Sorter">
          <Inp label="Column" value={sortCol} onChange={setSortCol} placeholder="name" />
          <Sel label="Dir" value={sortDir} onChange={setSortDir} options={[{v:'asc',l:'Asc'},{v:'desc',l:'Desc'}]} />
          <CalcBtn onClick={sorter} label="Sort" />
        </CsvCard>

        <CsvCard title="Splitter">
          <Inp label="Parts" value={splitCount} onChange={setSplitCount} placeholder="2" />
          <CalcBtn onClick={splitter} label="Split" />
        </CsvCard>

        <CsvCard title="CSV Statistics">
          <p className="text-[10px] text-zinc-400">Count, sum, avg, min, max per column</p>
          <a href="/tools/csv-statistics" className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg text-center transition-all active:scale-[0.98]">Open →</a>
        </CsvCard>

        <CsvCard title="Transpose">
          <p className="text-[10px] text-zinc-400">Swap rows &amp; columns</p>
          <CalcBtn onClick={transpose} label="Transpose" />
        </CsvCard>

        <CsvCard title="→ Excel (.xls)">
          <p className="text-[10px] text-zinc-400">Downloads as .xls file</p>
          <CalcBtn onClick={toExcel} label="Export XLS" />
        </CsvCard>

        <CsvCard title="CSV ↔ HTML Table">
          <p className="text-[10px] text-zinc-400">Bidirectional converter</p>
          <a href="/tools/csv-html-table-converter" className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg text-center transition-all active:scale-[0.98]">Open →</a>
        </CsvCard>

        <CsvCard title="→ Markdown Table">
          <CalcBtn onClick={toMd} label="Generate MD" />
        </CsvCard>

        <CsvCard title="→ NDJSON">
          <p className="text-[10px] text-zinc-400">Newline-delimited JSON</p>
          <CalcBtn onClick={toNdjson} label="Convert" />
        </CsvCard>

        <CsvCard title="→ SQL INSERT">
          <p className="text-[10px] text-zinc-400">Generates INSERT statements</p>
          <CalcBtn onClick={toSql} label="Generate SQL" />
        </CsvCard>

        <CsvCard title="TSV ↔ CSV">
          <p className="text-[10px] text-zinc-400">Bidirectional converter</p>
          <a href="/tools/tsv-csv-converter" className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg text-center transition-all active:scale-[0.98]">Open →</a>
        </CsvCard>

        <CsvCard title="→ Parquet">
          <p className="text-[10px] text-zinc-400">⚠️ Not supported in-browser</p>
          <CalcBtn onClick={toParquet} label="Info" />
        </CsvCard>
      </div>

      {csvOut && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Output</span>
            <button onClick={copyOut} className="text-[10px] text-blue-500 hover:underline">Copy</button>
          </div>
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-80 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap break-all">{csvOut}</pre>
        </div>
      )}
    </div>
  );
}

const JsonCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

function JsonTools() {
  const [jsonIn1, setJsonIn1] = useState('{"name":"John","age":30,"city":"NYC","address":{"street":"123 Main","zip":"10001"}}');
  const [jsonIn2, setJsonIn2] = useState('{"name":"Jane","age":25,"city":"LA","address":{"street":"456 Oak","zip":"90001"}}');
  const [jsonOut, setJsonOut] = useState('');
  const [jPath, setJPath] = useState('$.name');
  const [jKeySize, setJKeySize] = useState('name');
  const [jDepth, setJDepth] = useState('1');
  const [nsCount, setNsCount] = useState('3');

  const copyJsOut = () => { if (jsonOut) { clipboardWrite(jsonOut); toast.success('Copied!'); } };
  const setJsOut = (v: string, msg?: string) => { setJsonOut(v); if (msg) toast.success(msg); };
  const parseJ = (s: string) => { try { return JSON.parse(s); } catch { toast.error('Invalid JSON'); return null; } };

  const jsonDiff = () => {
    const a = parseJ(jsonIn1), b = parseJ(jsonIn2);
    if (!a || !b) return;
    const diff: string[] = [];
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    allKeys.forEach(k => {
      if (!(k in a)) diff.push(`+ added: ${k} = ${JSON.stringify(b[k])}`);
      else if (!(k in b)) diff.push(`- removed: ${k} = ${JSON.stringify(a[k])}`);
      else if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) diff.push(`~ changed: ${k}: ${JSON.stringify(a[k])} → ${JSON.stringify(b[k])}`);
    });
    setJsOut(diff.length ? diff.join('\n') : '✓ Identical', `Diff: ${diff.length} changes`);
  };

  const jsonEscape = (esc: boolean) => {
    if (esc) setJsOut(jsonIn1.replace(/"/g, '\\"').replace(/\n/g, '\\n'), 'Escaped');
    else setJsOut(jsonIn1.replace(/\\"/g, '"').replace(/\\n/g, '\n'), 'Unescaped');
  };

  const jsonFlatten = () => {
    const obj = parseJ(jsonIn1); if (!obj) return;
    const flat: Record<string, any> = {};
    const go = (o: any, prefix: string) => {
      if (typeof o !== 'object' || o === null) { flat[prefix] = o; return; }
      if (Array.isArray(o)) o.forEach((v, i) => go(v, `${prefix}[${i}]`));
      else Object.entries(o).forEach(([k, v]) => go(v, prefix ? `${prefix}.${k}` : k));
    };
    go(obj, '');
    setJsOut(JSON.stringify(flat, null, 2), 'Flattened');
  };

  const jsonLd = () => {
    const ctx = jsonIn1;
    try {
      const parsed = JSON.parse(ctx);
      const ld: Record<string, any> = { "@context": "https://schema.org", "@type": "WebPage" };
      if (typeof parsed === 'object' && !Array.isArray(parsed)) Object.assign(ld, parsed);
      setJsOut(JSON.stringify(ld, null, 2), 'JSON-LD generated');
    } catch { toast.error('Invalid JSON'); }
  };

  const mergePatch = () => {
    const a = parseJ(jsonIn1), b = parseJ(jsonIn2);
    if (!a || !b) return;
    const patch: Record<string, any> = {};
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    allKeys.forEach(k => {
      if (!(k in a)) patch[k] = b[k];
      else if (!(k in b)) patch[k] = null;
      else if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) patch[k] = b[k];
    });
    setJsOut(JSON.stringify(patch, null, 2), 'Merge patch generated');
  };

  const jsonPath = () => {
    const obj = parseJ(jsonIn1); if (!obj) return;
    const parts = jPath.replace(/^\$\.?/, '').split('.');
    let cur: any = obj;
    for (const p of parts) {
      if (p.includes('[')) {
        const m = p.match(/(\w+)\[(\d+)\]/);
        if (m) cur = cur[m[1]]?.[parseInt(m[2])];
        else cur = cur[p.replace('[', '').replace(']', '')];
      } else {
        cur = cur?.[p];
      }
      if (cur === undefined) break;
    }
    setJsOut(cur !== undefined ? JSON.stringify(cur, null, 2) : `✗ Path "${jPath}" not found`, cur !== undefined ? 'Found' : 'Not found');
  };

  const schemaGen = () => {
    const obj = parseJ(jsonIn1); if (!obj) return;
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
    setJsOut(JSON.stringify({ $schema: 'http://json-schema.org/draft-07/schema#', ...infer(obj) }, null, 2), 'Schema generated');
  };

  const sizeAnalyze = () => {
    const obj = parseJ(jsonIn1); if (!obj) return;
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
    setJsOut(lines.join('\n'), 'Analysis done');
  };

  const jsonToTs = () => {
    const obj = parseJ(jsonIn1); if (!obj) return;
    const toTs = (o: any, name = 'Root'): string => {
      if (o === null) return `type ${name} = null;\n`;
      if (Array.isArray(o)) {
        const itemType = o.length ? toTs(o[0], `${name}Item`) : 'any';
        return `type ${name} = ${itemType.includes('type ') ? `${name}Item` : itemType}[];\n${itemType.includes('type ') ? itemType : ''}`;
      }
      if (typeof o === 'object') {
        const props = Object.entries(o).map(([k, v]) => {
          const vt = toTs(v, `${name}_${k}`);
          const tn = vt.includes('type ') ? `${name}_${k}` : vt.trim();
          return `  ${k}: ${tn};`;
        }).join('\n');
        return `type ${name} = {\n${props}\n};\n`;
      }
      if (typeof o === 'string') return 'string';
      if (typeof o === 'number') return 'number';
      if (typeof o === 'boolean') return 'boolean';
      return 'any';
    };
    setJsOut(toTs(obj).trim(), 'TypeScript generated');
  };

  const jsonToZod = () => {
    const obj = parseJ(jsonIn1); if (!obj) return;
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
    setJsOut(`import { z } from 'zod';\n\nexport const schema = ${toZod(obj).trim()};`, 'Zod schema generated');
  };

  const jwkGen = () => {
    const bits = parseInt(jKeySize, 10) || 256;
    const keyBytes = bits / 8;
    const randBytes = Array.from({ length: keyBytes }, () => Math.floor(Math.random() * 256));
    const b64url = btoa(String.fromCharCode(...randBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwk = {
      kty: 'oct',
      k: b64url,
      alg: bits >= 256 ? 'A256GCM' : 'A128GCM',
      use: 'enc',
      kid: crypto.randomUUID().slice(0, 8),
    };
    setJsOut(JSON.stringify(jwk, null, 2), 'JWK generated');
    toast.success('Symmetric JWK generated');
  };

  const jsonlFormat = () => {
    const lines = jsonIn1.split('\n').filter(l => l.trim());
    const formatted = lines.map(l => { try { return JSON.stringify(JSON.parse(l), null, 2); } catch { return l; } }).join('\n---\n');
    setJsOut(formatted, 'Formatted');
  };

  const ndjsonToJson = () => {
    const lines = jsonIn1.split('\n').filter(l => l.trim());
    const objs: any[] = [];
    for (const l of lines) { try { objs.push(JSON.parse(l)); } catch { /* skip */ } }
    setJsOut(JSON.stringify(objs, null, 2), `Converted ${objs.length} objects`);
  };

  const jsonToExcel = () => {
    const obj = parseJ(jsonIn1); if (!obj) return;
    const arr = Array.isArray(obj) ? obj : [obj];
    const headers = [...new Set(arr.flatMap(o => Object.keys(o)))];
    const rows = arr.map(o => headers.map(h => JSON.stringify(o[h] ?? '')));
    const html = `<html><table><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></html>`;
    downloadFile(html, 'json-export.xls', 'application/vnd.ms-excel');
    setJsOut(html, 'Excel downloaded');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <JsonCard title="JSON Diff">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <textarea value={jsonIn2} onChange={e => setJsonIn2(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={jsonDiff} label="Diff" />
      </JsonCard>

      <JsonCard title="Escape / Unescape">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <div className="flex gap-2">
          <button onClick={() => jsonEscape(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg">Escape</button>
          <button onClick={() => jsonEscape(false)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg">Unescape</button>
        </div>
      </JsonCard>

      <JsonCard title="JSON Flattener">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={jsonFlatten} label="Flatten" />
      </JsonCard>

      <JsonCard title="JSON-LD Generator">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Paste JSON to embed in schema.org context" />
        <CalcBtn onClick={jsonLd} label="Generate JSON-LD" />
      </JsonCard>

      <JsonCard title="Merge Patch Generator">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Original" />
        <textarea value={jsonIn2} onChange={e => setJsonIn2(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Modified" />
        <CalcBtn onClick={mergePatch} label="Generate Patch" />
      </JsonCard>

      <JsonCard title="JSON Path Finder">
        <Inp label="Path" value={jPath} onChange={setJPath} placeholder="$.name" />
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={jsonPath} label="Find" />
      </JsonCard>

      <JsonCard title="JSON Schema Generator">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={schemaGen} label="Generate Schema" />
      </JsonCard>

      <JsonCard title="Size Analyzer">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={sizeAnalyze} label="Analyze" />
      </JsonCard>

      <JsonCard title="→ TypeScript Interfaces">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={jsonToTs} label="Generate TS" />
      </JsonCard>

      <JsonCard title="→ Zod Schema">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={jsonToZod} label="Generate Zod" />
      </JsonCard>

      <JsonCard title="JWK Generator">
        <Sel label="Bits" value={jKeySize} onChange={setJKeySize} options={[{v:'128',l:'128'},{v:'256',l:'256'}]} />
        <p className="text-[10px] text-zinc-400">Generates symmetric JWK (oct)</p>
        <CalcBtn onClick={jwkGen} label="Generate JWK" />
      </JsonCard>

      <JsonCard title="JSONL Formatter">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="One JSON object per line" />
        <CalcBtn onClick={jsonlFormat} label="Format" />
      </JsonCard>

      <JsonCard title="NDJSON → JSON Array">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="One JSON object per line" />
        <CalcBtn onClick={ndjsonToJson} label="Convert" />
      </JsonCard>

      <JsonCard title="→ Excel (.xls)">
        <textarea value={jsonIn1} onChange={e => setJsonIn1(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={jsonToExcel} label="Export XLS" />
      </JsonCard>

      {jsonOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Output</span>
            <button onClick={copyJsOut} className="text-[10px] text-blue-500 hover:underline">Copy</button>
          </div>
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap break-all">{jsonOut}</pre>
        </div>
      )}
    </div>
  );
}

function DataConverters() {
  const [convInput, setConvInput] = useState('{"name":"John","age":30,"city":"NYC"}');
  const [convOutput, setConvOutput] = useState('');
  const [convFrom, setConvFrom] = useState('json');
  const [convTo, setConvTo] = useState('yaml');

  const convert = () => {
    try {
      if (!convInput.trim()) { toast.error('Enter data'); return; }
      if (convFrom === 'json' && convTo === 'yaml') {
        const obj = JSON.parse(convInput);
        const toYaml = (o: any, indent = 0): string => {
          if (typeof o !== 'object' || o === null) return ' '.repeat(indent) + String(o);
          if (Array.isArray(o)) return o.map(v => ' '.repeat(indent) + '- ' + (typeof v === 'object' ? '\n' + toYaml(v, indent + 2) : String(v))).join('\n');
          return Object.entries(o).map(([k, v]) => ' '.repeat(indent) + k + ': ' + (typeof v === 'object' && v !== null && !Array.isArray(v) ? '\n' + toYaml(v, indent + 2) : (Array.isArray(v) ? '\n' + toYaml(v, indent + 2) : String(v)))).join('\n');
        };
        setConvOutput(toYaml(obj));
      } else if (convFrom === 'json' && convTo === 'xml') {
        const obj = JSON.parse(convInput);
        const toXml = (o: any, name = 'root'): string => {
          if (typeof o !== 'object' || o === null) return `<${name}>${o}</${name}>`;
          if (Array.isArray(o)) return o.map(v => toXml(v, name)).join('\n');
          return Object.entries(o).map(([k, v]) => toXml(v, k)).join('\n');
        };
        setConvOutput('<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(obj, 'root'));
      } else if (convFrom === 'json' && convTo === 'url') {
        const obj = JSON.parse(convInput);
        setConvOutput(new URLSearchParams(obj).toString());
      } else if (convFrom === 'json' && convTo === 'toml') {
        const obj = JSON.parse(convInput);
        const toToml = (o: any, prefix = ''): string => {
          if (typeof o !== 'object' || o === null) return '';
          return Object.entries(o).map(([k, v]) => {
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) return `[${prefix}${k}]\n${toToml(v, prefix + k + '.')}`;
            if (Array.isArray(v)) return `${k} = [${v.map(i => JSON.stringify(i)).join(', ')}]`;
            return `${k} = ${JSON.stringify(v)}`;
          }).join('\n');
        };
        setConvOutput(toToml(obj));
      } else if (convFrom === 'yaml' && convTo === 'json') {
        const lines = convInput.split('\n');
        const parseYaml = (lines: string[], start = 0): [any, number] => {
          const obj: Record<string, any> = {};
          let i = start;
          while (i < lines.length) {
            const line = lines[i];
            if (!line.trim()) { i++; continue; }
            const indent = line.search(/\S/);
            if (i > start && indent <= 0) break;
            const match = line.match(/^(\s*)(\w[\w-]*):\s*(.*)/);
            if (!match) { i++; continue; }
            const [, , key, val] = match;
            if (val.trim()) {
              obj[key] = isNaN(Number(val)) ? val.trim().replace(/^['"]|['"]$/g, '') : Number(val);
            } else {
              const [v, ni] = parseYaml(lines, i + 1);
              obj[key] = v;
              i = ni;
              continue;
            }
            i++;
          }
          return [obj, i];
        };
        const [parsed] = parseYaml(lines);
        setConvOutput(JSON.stringify(parsed, null, 2));
      } else {
        const obj = JSON.parse(convInput);
        if (convTo === 'csv') {
          const entries = Object.entries(obj);
          setConvOutput(['key,value', ...entries.map(([k, v]) => `${k},${v}`)].join('\n'));
        } else {
          setConvOutput(JSON.stringify(obj, null, 2));
        }
      }
      toast.success('Converted');
    } catch { toast.error('Invalid input'); }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-xs text-zinc-500">From:</span>
        <select value={convFrom} onChange={e => setConvFrom(e.target.value)}
          className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-white outline-none">
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
        </select>
        <span className="text-zinc-400">→</span>
        <span className="text-xs text-zinc-500">To:</span>
        <select value={convTo} onChange={e => setConvTo(e.target.value)}
          className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-white outline-none">
          <option value="yaml">YAML</option>
          <option value="xml">XML</option>
          <option value="toml">TOML</option>
          <option value="url">URL Params</option>
          <option value="csv">CSV</option>
        </select>
      </div>
      <textarea value={convInput} onChange={e => setConvInput(e.target.value)} placeholder="Enter source data..."
        className="w-full h-28 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Convert</button>
      {convOutput && (
        <div className="relative">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap break-all">{convOutput}</pre>
          <button onClick={() => { clipboardWrite(convOutput); toast.success('Copied!'); }} className="text-xs text-blue-500 hover:underline mt-1">Copy</button>
        </div>
      )}
    </div>
  );
}

function DataGenerator() {
  const [genType, setGenType] = useState('uuid');
  const [genCount, setGenCount] = useState(5);
  const [genOutput, setGenOutput] = useState('');

  const WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'labore', 'dolore', 'magna', 'aliqua'];
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Eve', 'Charlie', 'Diana', 'Frank', 'Grace', 'Henry'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.org'];

  const generate = () => {
    const results: string[] = [];
    for (let i = 0; i < genCount; i++) {
      switch (genType) {
        case 'uuid':
          results.push(crypto.randomUUID());
          break;
        case 'numeric':
          results.push(Math.floor(100000 + Math.random() * 900000).toString());
          break;
        case 'hex':
          results.push(Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
          break;
        case 'base64':
          results.push(btoa(crypto.randomUUID().replace(/-/g, '')).slice(0, 16));
          break;
        case 'words':
          results.push(Array.from({ length: 3 + Math.floor(Math.random() * 5) }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' '));
          break;
        case 'name':
          results.push(`${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`);
          break;
        case 'email':
          results.push(`${(firstNames[Math.floor(Math.random() * firstNames.length)]).toLowerCase()}.${(lastNames[Math.floor(Math.random() * lastNames.length)]).toLowerCase()}${Math.floor(Math.random() * 100)}@${domains[Math.floor(Math.random() * domains.length)]}`);
          break;
        case 'phone':
          results.push(`+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`);
          break;
        case 'date':
          results.push(new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]);
          break;
        case 'ip':
          results.push(`${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`);
          break;
        case 'csv':
          results.push(`${firstNames[Math.floor(Math.random() * firstNames.length)]},${lastNames[Math.floor(Math.random() * lastNames.length)]},${Math.floor(Math.random() * 50 + 20)},${['Active','Inactive','Pending'][Math.floor(Math.random() * 3)]}`);
          break;
        case 'json':
          results.push(JSON.stringify({
            id: crypto.randomUUID().slice(0, 8),
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            age: Math.floor(Math.random() * 50 + 20),
            email: `${(firstNames[Math.floor(Math.random() * firstNames.length)]).toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
            active: Math.random() > 0.3,
          }));
          break;
      }
    }
    setGenOutput(results.join('\n'));
    toast.success('Generated');
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { v: 'uuid', l: 'UUID' },
          { v: 'numeric', l: 'Numeric' },
          { v: 'hex', l: 'Hex' },
          { v: 'base64', l: 'Base64' },
          { v: 'words', l: 'Words' },
          { v: 'name', l: 'Name' },
          { v: 'email', l: 'Email' },
          { v: 'phone', l: 'Phone' },
          { v: 'date', l: 'Date' },
          { v: 'ip', l: 'IP' },
          { v: 'csv', l: 'CSV Row' },
          { v: 'json', l: 'JSON' },
        ].map(({ v, l }) => (
          <button key={v} onClick={() => setGenType(v)}
            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${genType === v ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{l}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">Count:</span>
        <input type="range" min={1} max={50} value={genCount} onChange={e => setGenCount(Number(e.target.value))} className="flex-1" />
        <span className="text-xs text-zinc-400">{genCount}</span>
      </div>
      <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Generate</button>
      {genOutput && (
        <div className="relative">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap break-all">{genOutput}</pre>
          <button onClick={() => { clipboardWrite(genOutput); toast.success('Copied!'); }} className="text-xs text-blue-500 hover:underline mt-1">Copy</button>
        </div>
      )}
    </div>
  );
}
