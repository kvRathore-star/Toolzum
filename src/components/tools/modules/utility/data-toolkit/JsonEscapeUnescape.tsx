"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input } from './_shared';

export default function JsonEscapeUnescape() {
  const [input, setInput] = useState('{"name":"John","age":30}');
  const [out, setOut] = useState('');
  const jsonPresets = [
    { label: 'Default', v: '{"name":"John","age":30}' },
    { label: 'Multi-line', v: '{"name":"John","bio":"Line 1\nLine 2\nLine 3"}' },
  ];
  const escape = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    setOut(txt.replace(/"/g, '\\"').replace(/\n/g, '\\n'));
  };
  const unescape = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    setOut(txt.replace(/\\"/g, '"').replace(/\\n/g, '\n'));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => { setInput(p.v); setOut(''); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON Escape / Unescape</h2>
      <Input label="JSON Input" rows={4} value={input} onChange={v => { setInput(v); setOut(''); }} placeholder="JSON input..." />
      <div className="flex gap-2 mb-3">
        <button onClick={() => escape()} className="flex-1 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors">Escape</button>
        <button onClick={() => unescape()} className="flex-1 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Unescape</button>
      </div>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-cyan-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500">Result ({out.length} chars)</span>
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

