"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const BASES = [2, 8, 10, 16];

export default function NumberBaseConverter() {
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(2);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = (val: string, from: number, to: number) => {
    if (!val.trim()) { setOutput(''); return; }
    try {
      const num = parseInt(val, from);
      if (isNaN(num)) { setOutput(''); toast.error('Invalid number for base ' + from); return; }
      setOutput(num.toString(to).toUpperCase());
    } catch { setOutput(''); toast.error('Conversion failed'); }
  };

  const handleInput = (val: string) => { setInput(val); convert(val, fromBase, toBase); };

  const swap = () => {
    const newFrom = toBase;
    const newTo = fromBase;
    setFromBase(newFrom);
    setToBase(newTo);
    if (output) { setInput(output); convert(output, newFrom, newTo); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">From Base</label>
          <select value={fromBase} onChange={e => { const b = parseInt(e.target.value); setFromBase(b); if (input) convert(input, b, toBase); }} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm outline-none">
            {BASES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <button onClick={swap} className="mt-5 text-xs text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">⇄ Swap</button>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">To Base</label>
          <select value={toBase} onChange={e => { const b = parseInt(e.target.value); setToBase(b); if (input) convert(input, fromBase, b); }} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm outline-none">
            {BASES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder={`Enter number in base ${fromBase}...`} className="w-full h-[120px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder={`Result in base ${toBase}...`} className="w-full h-[120px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
