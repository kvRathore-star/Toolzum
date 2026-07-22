"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'escape' | 'unescape';

export default function BackslashEscape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('escape');

  const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  const unescape = (s: string) => s.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

  const process = (val: string, m: Mode) => { setInput(val); setOutput(val.trim() ? (m === 'escape' ? escape(val) : unescape(val)) : ''); };

  const swap = () => {
    const newMode = mode === 'escape' ? 'unescape' : 'escape';
    setMode(newMode);
    if (output) process(output, newMode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          <button onClick={() => { setMode('escape'); process(input, 'escape'); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'escape' ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>Escape</button>
          <button onClick={() => { setMode('unescape'); process(input, 'unescape'); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'unescape' ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>Unescape</button>
        </div>
        <button onClick={swap} className="text-xs text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">⇄ Swap</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => process(e.target.value, mode)} placeholder={mode === 'escape' ? 'Type or paste text with special characters...' : 'Type or paste escaped string...'} className="w-full h-[200px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Result..." className="w-full h-[200px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
