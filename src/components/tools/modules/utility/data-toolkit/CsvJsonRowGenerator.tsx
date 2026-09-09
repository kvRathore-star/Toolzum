"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { firstNames, lastNames, domains } from './_shared';

export default function CsvJsonRowGenerator() {
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
          email: `${firstNames[Math.floor(Math.random() * firstNames.length)]!.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
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
