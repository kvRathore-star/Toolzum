"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

type Utility = 'csv-analyzer' | 'csv-data-generator' | 'json-path-query-builder' | 'json-diff-checker' | 'json-minifier' | 'csv-sorter' | 'json-tree-viewer' | 'csv-preview-generator';

const UTILITY_LABELS: Record<Utility, string> = {
  'csv-analyzer': 'CSV Analyzer',
  'csv-data-generator': 'CSV Data Generator',
  'json-path-query-builder': 'JSON Path Query Builder',
  'json-diff-checker': 'JSON Diff Checker',
  'json-minifier': 'JSON Minifier',
  'csv-sorter': 'CSV Sorter',
  'json-tree-viewer': 'JSON Tree Viewer',
  'csv-preview-generator': 'CSV Preview Generator',
};

function CsvAnalyzerInner() {
  const [csv, setCsv] = useState('');
  const [analysis, setAnalysis] = useState<Record<string, { type: string; count: number; unique: number; empty: number; min?: string; max?: string }> | null>(null);

  const analyze = () => {
    if (!csv.trim()) { toast.error('Paste CSV data first'); return; }
    const lines = csv.trim().split('\n');
    if (lines.length < 2) { toast.error('CSV must have a header and at least one row'); return; }
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(r => r.split(',').map(c => c.trim()));
    const result: Record<string, any> = {};

    headers.forEach((h, i) => {
      const vals = rows.map(r => r[i]).filter(v => v !== undefined);
      const nums = vals.map(Number).filter(n => !isNaN(n));
      const isNumeric = nums.length === vals.length && vals.length > 0;
      result[h] = {
        type: isNumeric ? 'Number' : 'Text',
        count: vals.length,
        unique: new Set(vals).size,
        empty: vals.filter(v => v === '').length,
        ...(isNumeric ? { min: String(Math.min(...nums)), max: String(Math.max(...nums)) } : {}),
      };
    });
    setAnalysis(result);
    toast.success('Analysis complete');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">CSV Analyzer</h3>
      <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={6} className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder="Paste CSV data (first row = headers)..." />
      <button onClick={analyze} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">Analyze</button>
      {analysis && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-zinc-100 dark:bg-zinc-800">{['Column', 'Type', 'Count', 'Unique', 'Empty', 'Min', 'Max'].map(h => <th key={h} className="p-2 border dark:border-zinc-700 text-left">{h}</th>)}</tr></thead>
            <tbody>{Object.entries(analysis).map(([col, data]) => (
              <tr key={col} className="border-b dark:border-zinc-800">
                <td className="p-2 font-medium">{col}</td>
                <td className="p-2">{data.type}</td>
                <td className="p-2">{data.count}</td>
                <td className="p-2">{data.unique}</td>
                <td className="p-2">{data.empty}</td>
                <td className="p-2">{data.min || '—'}</td>
                <td className="p-2">{data.max || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CsvDataGeneratorInner() {
  const [columns, setColumns] = useState('name,email,age');
  const [rows, setRows] = useState('5');
  const [output, setOutput] = useState('');

  const generate = () => {
    const cols = columns.split(',').map(c => c.trim()).filter(Boolean);
    const count = parseInt(rows) || 5;
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
    const lastNames = ['Smith', 'Jones', 'Brown', 'Lee', 'Kim', 'Chen', 'Patel', 'Davis', 'Wilson', 'Moore'];
    const domains = ['example.com', 'test.org', 'demo.net', 'mail.com', 'inbox.io'];
    const result = [cols.join(',')];
    for (let i = 0; i < count; i++) {
      const row = cols.map(col => {
        if (col.toLowerCase().includes('name') || col.toLowerCase().includes('first')) return firstNames[Math.floor(Math.random() * firstNames.length)];
        if (col.toLowerCase().includes('last') || col.toLowerCase().includes('surname')) return lastNames[Math.floor(Math.random() * lastNames.length)];
        if (col.toLowerCase().includes('email')) return `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}.${lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
        if (col.toLowerCase().includes('age')) return String(Math.floor(Math.random() * 60 + 18));
        if (col.toLowerCase().includes('phone')) return `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`;
        if (col.toLowerCase().includes('city')) return ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto', 'Mumbai'][Math.floor(Math.random() * 8)];
        return `value${i}_${col}`;
      });
      result.push(row.join(','));
    }
    setOutput(result.join('\n'));
    toast.success(`Generated ${count} rows`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">CSV Data Generator</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-500">Columns (comma-separated)</label>
          <input value={columns} onChange={e => setColumns(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Rows</label>
          <input type="number" value={rows} onChange={e => setRows(e.target.value)} min={1} max={100} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
        </div>
      </div>
      <button onClick={generate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">Generate</button>
      {output && (
        <div>
          <label className="text-xs font-medium text-zinc-500">Output</label>
          <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}

function JsonPathQueryBuilderInner() {
  const [json, setJson] = useState('{"users":[{"name":"Alice","age":30},{"name":"Bob","age":25}]}');
  const [path, setPath] = useState('$.users[*].name');
  const [result, setResult] = useState('');

  const query = () => {
    try {
      const parsed = JSON.parse(json);
      const parts = path.replace(/^\$\.?/, '').split(/\.|\[/).filter(Boolean);
      let current: any = parsed;
      for (const part of parts) {
        const clean = part.replace(/\]$/, '').replace(/'/g, '"');
        if (clean.includes('*')) {
          if (Array.isArray(current)) {
            const key = clean.replace('*', '');
            current = current.map((item: any) => key ? item[key] : item).flat();
          } else if (typeof current === 'object') {
            current = Object.values(current);
          }
        } else if (clean.match(/^\d+$/)) {
          current = current[parseInt(clean)];
        } else {
          current = current[clean];
        }
      }
      setResult(JSON.stringify(current, null, 2));
      toast.success('Query executed');
    } catch {
      toast.error('Invalid JSON or path expression');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">JSON Path Query Builder</h3>
      <div>
        <label className="text-xs font-medium text-zinc-500">JSON Data</label>
        <textarea value={json} onChange={e => setJson(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">JSON Path</label>
        <input value={path} onChange={e => setPath(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder="$.users[*].name" />
      </div>
      <button onClick={query} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">Execute</button>
      {result && (
        <div>
          <label className="text-xs font-medium text-zinc-500">Result</label>
          <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}

function JsonDiffCheckerInner() {
  const [left, setLeft] = useState('{"a":1,"b":2}');
  const [right, setRight] = useState('{"a":1,"b":3}');
  const [diff, setDiff] = useState('');

  const compare = () => {
    try {
      const l = JSON.parse(left);
      const r = JSON.parse(right);
      const diffLines: string[] = [];
      const allKeys = new Set([...Object.keys(l), ...Object.keys(r)]);
      allKeys.forEach(k => {
        const lv = JSON.stringify(l[k]);
        const rv = JSON.stringify(r[k]);
        if (lv !== rv) diffLines.push(`- ${k}: ${lv}\n+ ${k}: ${rv}`);
      });
      if (diffLines.length === 0) diffLines.push('(no differences)');
      setDiff(diffLines.join('\n'));
      toast.success('Comparison complete');
    } catch {
      toast.error('Invalid JSON in one or both inputs');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">JSON Diff Checker</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-500">Left (original)</label>
          <textarea value={left} onChange={e => setLeft(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Right (modified)</label>
          <textarea value={right} onChange={e => setRight(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" />
        </div>
      </div>
      <button onClick={compare} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">Compare</button>
      {diff && (
        <div>
          <label className="text-xs font-medium text-zinc-500">Differences</label>
          <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono whitespace-pre-wrap">{diff}</pre>
        </div>
      )}
    </div>
  );
}

function JsonMinifierInner() {
  const [input, setInput] = useState('{"a": 1, "b": 2}');
  const [output, setOutput] = useState('');

  const handleMinify = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
      toast.success('Minified');
    } catch {
      toast.error('Invalid JSON');
    }
  };
  const handleFormat = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, 2));
      toast.success('Formatted');
    } catch {
      toast.error('Invalid JSON');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">JSON Minifier</h3>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder="Paste JSON..." />
      <div className="flex gap-2">
        <button onClick={handleMinify} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">Minify</button>
        <button onClick={handleFormat} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-sm transition">Format</button>
      </div>
      {output && (
        <div>
          <label className="text-xs font-medium text-zinc-500">Output</label>
          <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}

function CsvSorterInner() {
  const [csv, setCsv] = useState('');
  const [sortCol, setSortCol] = useState('0');
  const [ascending, setAscending] = useState(true);
  const [sorted, setSorted] = useState('');

  const handleSort = () => {
    if (!csv.trim()) { toast.error('Paste CSV data first'); return; }
    const lines = csv.trim().split('\n');
    if (lines.length < 2) { toast.error('CSV must have a header and at least one row'); return; }
    const colIndex = parseInt(sortCol) || 0;
    const header = lines[0];
    const data = lines.slice(1);
    data.sort((a, b) => {
      const va = a.split(',')[colIndex]?.trim() || '';
      const vb = b.split(',')[colIndex]?.trim() || '';
      const na = parseFloat(va), nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) return ascending ? na - nb : nb - na;
      return ascending ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    setSorted([header, ...data].join('\n'));
    toast.success('Sorted successfully');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">CSV Sorter</h3>
      <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={4} className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder="Paste CSV data..." />
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-zinc-500">Column Index</label>
          <input type="number" value={sortCol} onChange={e => setSortCol(e.target.value)} min={0} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ascending} onChange={e => setAscending(e.target.checked)} className="rounded" />
          Ascending
        </label>
        <button onClick={handleSort} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">Sort</button>
      </div>
      {sorted && (
        <div>
          <label className="text-xs font-medium text-zinc-500">Sorted Output</label>
          <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono whitespace-pre-wrap">{sorted}</pre>
        </div>
      )}
    </div>
  );
}

function JsonTreeViewerInner() {
  const [json, setJson] = useState('{"name":"John","age":30,"address":{"city":"NYC","zip":"10001"},"hobbies":["reading","coding"]}');
  const [error, setError] = useState('');

  const renderTree = (data: any, depth = 0): string => {
    const indent = '  '.repeat(depth);
    if (data === null) return `${indent}null`;
    if (typeof data !== 'object') return `${indent}${typeof data === 'string' ? `"${data}"` : data}`;
    if (Array.isArray(data)) {
      if (data.length === 0) return `${indent}[]`;
      return data.map((item, i) => `${indent}[${i}]: ${typeof item === 'object' ? '\n' + renderTree(item, depth + 1) : renderTree(item, depth)}`).join('\n');
    }
    const keys = Object.keys(data);
    if (keys.length === 0) return `${indent}{}`;
    return keys.map(k => `${indent}${k}: ${typeof data[k] === 'object' ? '\n' + renderTree(data[k], depth + 1) : renderTree(data[k], depth)}`).join('\n');
  };

  const parsed = (() => { try { setError(''); return JSON.parse(json); } catch { setError('Invalid JSON'); return null; }})();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">JSON Tree Viewer</h3>
      <textarea value={json} onChange={e => setJson(e.target.value)} rows={4} className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder="Paste JSON..." />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {parsed && (
        <div>
          <label className="text-xs font-medium text-zinc-500">Tree</label>
          <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono whitespace-pre-wrap">{renderTree(parsed)}</pre>
        </div>
      )}
    </div>
  );
}

function CsvPreviewGeneratorInner() {
  const [csv, setCsv] = useState('Name,Age,City\nAlice,30,NYC\nBob,25,LA\nCharlie,35,Chicago');
  const maxPreviewRows = 10;

  const lines = csv.trim().split('\n');
  const headers = lines[0]?.split(',').map(h => h.trim()) || [];
  const rows = lines.slice(1, 1 + maxPreviewRows).map(r => r.split(',').map(c => c.trim()));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">CSV Preview Generator</h3>
      <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={4} className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder="Paste CSV data..." />
      {headers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-zinc-100 dark:bg-zinc-800">{headers.map(h => <th key={h} className="p-2 border dark:border-zinc-700 text-left">{h}</th>)}</tr></thead>
            <tbody>{rows.map((row, i) => (
              <tr key={i} className="border-b dark:border-zinc-800">
                {row.map((cell, j) => <td key={j} className="p-2 border-r last:border-r-0 dark:border-zinc-800">{cell}</td>)}
              </tr>
            ))}</tbody>
          </table>
          {lines.length - 1 > maxPreviewRows && <p className="text-xs text-zinc-500 mt-2">...and {lines.length - 1 - maxPreviewRows} more rows</p>}
        </div>
      )}
    </div>
  );
}

const UTILITIES: Record<Utility, React.FC> = {
  'csv-analyzer': CsvAnalyzerInner,
  'csv-data-generator': CsvDataGeneratorInner,
  'json-path-query-builder': JsonPathQueryBuilderInner,
  'json-diff-checker': JsonDiffCheckerInner,
  'json-minifier': JsonMinifierInner,
  'csv-sorter': CsvSorterInner,
  'json-tree-viewer': JsonTreeViewerInner,
  'csv-preview-generator': CsvPreviewGeneratorInner,
};

export function DataUtilities() {
  const [active, setActive] = useState<Utility | null>(null);
  const ActiveComponent = active ? UTILITIES[active] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Data Utilities</h2>
        <p className="text-sm text-zinc-500">Analyze, generate, and transform data</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(UTILITY_LABELS) as [Utility, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActive(active === key ? null : key)} className={`px-3 py-1.5 text-sm rounded-lg transition ${active === key ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{label}</button>
          ))}
        </div>
        {ActiveComponent && (
          <div className="p-4 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
            <ActiveComponent />
          </div>
        )}
      </div>
    </div>
  );
}

export function CsvAnalyzer() { return <DataUtilities />; }
export function CsvDataGenerator() { return <DataUtilities />; }
export function JsonPathQueryBuilder() { return <DataUtilities />; }
export function JsonDiffChecker() { return <DataUtilities />; }
export function JsonMinifier() { return <DataUtilities />; }
export function CsvSorter() { return <DataUtilities />; }
export function JsonTreeViewer() { return <DataUtilities />; }
export function CsvPreviewGenerator() { return <DataUtilities />; }
