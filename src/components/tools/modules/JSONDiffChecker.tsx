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
        <h1 className="text-3xl font-bold tracking-tight">JSON Diff Checker</h1>
        <p className="text-zinc-400 mt-2">Compare two JSON objects side-by-side with color-coded key-level differences.</p>
      </div>
      <div className="space-y-4">
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
    </div>
  );
}
