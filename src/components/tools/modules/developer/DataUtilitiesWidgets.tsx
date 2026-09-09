"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export function CsvAnalyzer() {
  const [csv, setCsv] = useState('');
  const [analysis, setAnalysis] = useState<Record<string, { type: string; count: number; unique: number; empty: number; min?: string; max?: string }> | null>(null);

  const analyze = () => {
    if (!csv.trim()) { toast.error('Paste CSV data first'); return; }
    const lines = csv.trim().split('\n');
    if (lines.length < 2) { toast.error('CSV must have a header and at least one row'); return; }
    const headers = lines[0]!.split(',').map(h => h.trim());
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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold">CSV Analyzer</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Analyze CSV structure — column types, counts, unique values, and empty cells.</p>
      </div>
      <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
        <textarea aria-label="Analyze CSV structure — column types, counts, unique values, and empty cells." value={csv} onChange={e => setCsv(e.target.value)} rows={6} className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm font-mono" placeholder="Paste CSV data (first row = headers)..." />
        <button onClick={analyze} className="px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm transition">Analyze</button>
        {analysis && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-[var(--bg-surface)]">{['Column', 'Type', 'Count', 'Unique', 'Empty', 'Min', 'Max'].map(h => <th key={h} className="p-2 border dark:border-zinc-700 text-left">{h}</th>)}</tr></thead>
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
    </div>
  );
}

export function JsonPathQueryBuilder() {
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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold">JSON Path Query Builder</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Query JSON data using dot-notation path expressions with wildcard support.</p>
      </div>
      <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">JSON Data</label>
          <textarea aria-label="JSON Data" value={json} onChange={e => setJson(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm font-mono" />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">JSON Path</label>
          <input aria-label="JSON Path" value={path} onChange={e => setPath(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm font-mono" placeholder="$.users[*].name" />
        </div>
        <button onClick={query} className="px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm transition">Execute</button>
        {result && (
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Result</label>
            <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-[var(--bg-overlay)] text-sm font-mono whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function JsonTreeViewer() {
  const [json, setJson] = useState('{"name":"John","age":30,"address":{"city":"NYC","zip":"10001"},"hobbies":["reading","coding"]}');

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

  const { parsed, error } = (() => {
    try {
      return { parsed: JSON.parse(json), error: '' };
    } catch {
      return { parsed: null, error: 'Invalid JSON' };
    }
  })();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold">JSON Tree Viewer</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Visualize JSON structure as an indented tree — see nested objects and arrays at a glance.</p>
      </div>
      <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
        <textarea aria-label="Result" value={json} onChange={e => setJson(e.target.value)} rows={4} className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm font-mono" placeholder="Paste JSON..." />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {parsed && (
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Tree</label>
            <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-[var(--bg-overlay)] text-sm font-mono whitespace-pre-wrap">{renderTree(parsed)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
