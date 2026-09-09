"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input } from './_shared';

export default function JsonlFormatter() {
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

