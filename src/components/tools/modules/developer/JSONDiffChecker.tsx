"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function JSONDiffChecker() {
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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">JSON Diff Checker</h2>
        <p className="text-[var(--text-muted)] mt-2">Compare two JSON objects side-by-side with color-coded key-level differences.</p>
      </div>
      <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lbl-jsondiffchecker-left-original" className="text-xs font-medium text-[var(--text-secondary)]">Left (original)</label>
            <textarea id="lbl-jsondiffchecker-left-original" aria-label="Left (original)" value={left} onChange={e => setLeft(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-jsondiffchecker-right-modified" className="text-xs font-medium text-[var(--text-secondary)]">Right (modified)</label>
            <textarea id="lbl-jsondiffchecker-right-modified" aria-label="Right (modified)" value={right} onChange={e => setRight(e.target.value)} rows={4} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm font-mono" />
          </div>
        </div>
        <button onClick={compare} className="px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm transition">Compare</button>
        {diff && (
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Differences</label>
            <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-[var(--bg-overlay)] text-sm font-mono whitespace-pre-wrap">{diff}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
