"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';

export type CsvMode = {
  slug: string;
  name: string;
  description: string;
  outputLabel: string;
  transform: (headers: string[], rows: string[][]) => string;
};

export const parseCsv = (text: string): { headers: string[]; rows: string[][] } => {
  const lines = text.trim().split('\n').filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const parseLine = (l: string) => {
    const parts: string[] = [];
    let cur = '', inQ = false;
    for (const c of l) {
      if (c === '"') inQ = !inQ;
      else if (c === ',' && !inQ) { parts.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    parts.push(cur.trim());
    return parts;
  };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
};

export const MODES: Record<string, CsvMode> = {
  "csv-to-markdown": {
    slug: "csv-to-markdown", name: "CSV → Markdown Table",
    description: "Convert CSV data to a Markdown table",
    outputLabel: "Markdown Table",
    transform: (headers, rows) => {
      const h = `| ${headers.join(' | ')} |`;
      const sep = `| ${headers.map(() => '---').join(' | ')} |`;
      const r = rows.map(r => `| ${headers.map((_, i) => r[i] || '').join(' | ')} |`).join('\n');
      return `${h}\n${sep}\n${r}`;
    },
  },
  "csv-to-ndjson": {
    slug: "csv-to-ndjson", name: "CSV → NDJSON",
    description: "Convert CSV rows to newline-delimited JSON",
    outputLabel: "NDJSON",
    transform: (headers, rows) =>
      rows.map(r => JSON.stringify(Object.fromEntries(headers.map((h, i) => [h, r[i] || ''])))).join('\n'),
  },
  "csv-to-sql": {
    slug: "csv-to-sql", name: "CSV → SQL INSERT",
    description: "Generate SQL INSERT statements from CSV",
    outputLabel: "SQL",
    transform: (headers, rows) => {
      const esc = (s: string) => s.replace(/'/g, "''");
      return rows.map(r =>
        `INSERT INTO data (${headers.join(', ')}) VALUES (${r.map(v => `'${esc(v)}'`).join(', ')});`
      ).join('\n');
    },
  },
  "csv-html-table-converter": {
    slug: "csv-html-table-converter", name: "CSV → HTML Table",
    description: "Convert CSV to an HTML <table>",
    outputLabel: "HTML",
    transform: (headers, rows) =>
      `<table>\n  <thead>\n    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>\n  </thead>\n  <tbody>\n${rows.map(r => `    <tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('\n')}\n  </tbody>\n</table>`,
  },
  "csv-statistics": {
    slug: "csv-statistics", name: "CSV Statistics",
    description: "Compute column-level statistics from CSV data",
    outputLabel: "Statistics",
    transform: (headers, rows) => {
      const lines: string[] = [`Rows: ${rows.length}`, `Columns: ${headers.length}`, ''];
      headers.forEach((h, ci) => {
        const vals = rows.map(r => r[ci]).filter(v => v);
        const nums = vals.map(Number).filter(n => !isNaN(n));
        lines.push(`--- ${h} ---`);
        lines.push(`  Non-empty: ${vals.length}/${rows.length}`);
        if (nums.length) {
          lines.push(`  Numeric: ${nums.length}`);
          lines.push(`  Min: ${Math.min(...nums)}, Max: ${Math.max(...nums)}`);
          const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
          lines.push(`  Avg: ${avg.toFixed(2)}, Sum: ${nums.reduce((a, b) => a + b, 0).toFixed(2)}`);
        } else {
          const uniq = new Set(vals);
          lines.push(`  Unique values: ${uniq.size}`);
          if (vals.length) {
            const top = vals.sort((a, b) => vals.filter(v => v === a).length - vals.filter(v => v === b).length).pop()!;
            lines.push(`  Most common: "${top}" (${vals.filter(v => v === top).length}x)`);
          }
        }
      });
      return lines.join('\n');
    },
  },
  "csv-data-cleaner": {
    slug: "csv-data-cleaner", name: "CSV Data Cleaner",
    description: "Find issues in CSV data (missing values, type mismatches, duplicates)",
    outputLabel: "Issues Found",
    transform: (headers, rows) => {
      const issues: string[] = [];
      if (!rows.length) return 'No data rows found.';
      headers.forEach((h, ci) => {
        const vals = rows.map(r => r[ci]);
        const empty = vals.filter(v => !v).length;
        if (empty) issues.push(`"${h}": ${empty}/${vals.length} cells empty`);
        const nums = vals.map(Number);
        const mixed = vals.filter(v => v && isNaN(Number(v))).length;
        if (mixed && mixed < vals.length - empty) issues.push(`"${h}": ${mixed} non-numeric values in numeric column`);
        const uniq = new Set(vals);
        if (uniq.size === 1 && vals.length > 1) issues.push(`"${h}": All values identical (no variation)`);
      });
      const dups = rows.map((r, i) => [i, r.join(',')] as const).filter(([i, s], _, arr) => arr.filter(([j, t]) => t === s).length > 1);
      if (dups.length) issues.push(`Found ${dups.length} duplicate rows (${new Set(dups.map(([i]) => rows[i].join(','))).size} unique duplicates)`);
      return issues.length ? issues.join('\n') : 'No issues found.';
    },
  },
};

export const CSV_HUB_TABS = [
  { slug: 'csv-to-markdown', label: 'Markdown' },
  { slug: 'csv-to-ndjson', label: 'NDJSON' },
  { slug: 'csv-to-sql', label: 'SQL' },
  { slug: 'csv-html-table-converter', label: 'HTML' },
  { slug: 'csv-statistics', label: 'Stats' },
  { slug: 'csv-data-cleaner', label: 'Clean' },
];

export default function CsvOutputConverter({ slug }: { slug: string; description?: string }) {
  const mode = MODES[slug];
  const [input, setInput] = useState('name,price,stock\nWidget,29.99,100\nGadget,49.99,50\nDoohickey,19.99,200');
  const [output, setOutput] = useState('');

  if (!mode) return <div className="text-red-500">Unknown CSV mode: {slug}</div>;

  const handleConvert = () => {
    try {
      const { headers, rows } = parseCsv(input);
      setOutput(mode.transform(headers, rows));
    } catch (e: unknown) {
      setOutput(`Error: ${getErrorMessage(e)}`);
    }
  };

  const handleCopy = () => {
    clipboardWrite(output);
    toast.success('Copied!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{mode.name}</h2>
        <p className="text-xs text-[var(--text-secondary)]">{mode.description}</p>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-y min-h-[80px]" />
        <button onClick={handleConvert}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.98]">
          Convert
        </button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">{mode.outputLabel}</span>
              <button onClick={handleCopy} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
