"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CalcActions } from '../shared/CalcActions';

export default function JSONDiffChecker() {
  const [left, setLeft] = useState('{"a":1,"b":2}');
  const [right, setRight] = useState('{"a":1,"b":3}');
  const [diff, setDiff] = useState('');

  const compare = () => {
    try {
      const l = JSON.parse(left);
      const r = JSON.parse(right);
      const diffLines: string[] = [];
      const walk = (lv: unknown, rv: unknown, path: string): void => {
        if (lv !== null && rv !== null && typeof lv === 'object' && typeof rv === 'object' && !Array.isArray(lv) && !Array.isArray(rv)) {
          const lo = lv as Record<string, unknown>;
          const ro = rv as Record<string, unknown>;
          const allKeys = new Set([...Object.keys(lo), ...Object.keys(ro)]);
          allKeys.forEach(k => walk(lo[k], ro[k], path ? `${path}.${k}` : k));
          return;
        }
        if (Array.isArray(lv) && Array.isArray(rv)) {
          const len = Math.max(lv.length, rv.length);
          for (let i = 0; i < len; i++) walk(lv[i], rv[i], `${path}[${i}]`);
          return;
        }
        if (JSON.stringify(lv) !== JSON.stringify(rv)) diffLines.push(`- ${path}: ${JSON.stringify(lv)}\n+ ${path}: ${JSON.stringify(rv)}`);
      };
      walk(l, r, '');
      if (diffLines.length === 0) diffLines.push('(no differences)');
      setDiff(diffLines.join('\n'));
      toast.success('Comparison complete');
    } catch {
      toast.error('Invalid JSON in one or both inputs');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">JSON Diff Checker</h2>
        <p className="text-[var(--text-muted)] mt-2">Compare two JSON objects side-by-side with color-coded key-level differences.</p>
      </div>
      <div className="w-full space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lbl-jsondiffchecker-left-original" className="text-xs font-medium text-[var(--text-secondary)]">Left (original)</label>
            <textarea id="lbl-jsondiffchecker-left-original" aria-label="Left (original)" value={left} onChange={e => setLeft(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-jsondiffchecker-right-modified" className="text-xs font-medium text-[var(--text-secondary)]">Right (modified)</label>
            <textarea id="lbl-jsondiffchecker-right-modified" aria-label="Right (modified)" value={right} onChange={e => setRight(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-mono" />
          </div>
        </div>
        <button onClick={compare} className="px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm transition">Compare</button>
        {diff && (
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Differences</label>
            <pre className="mt-1 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-sm font-mono whitespace-pre-wrap">{diff}</pre>
            <CalcActions result={diff} downloadData={diff} downloadFilename='json-diff.txt' />
          </div>
        )}
      </div>
    </div>
  );
}
