"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'encode' | 'decode';

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  const process = (val: string, m: Mode) => {
    if (!val.trim()) { setOutput(''); return; }
    try {
      setOutput(m === 'encode' ? encodeURIComponent(val) : decodeURIComponent(val));
    } catch { setOutput(''); toast.error(m === 'decode' ? 'Invalid URL-encoded input' : 'Encoding failed'); }
  };

  const handleInput = (val: string) => { setInput(val); process(val, mode); };

  const swap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    if (output) { setInput(output); process(output, newMode); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          <button onClick={() => { setMode('encode'); process(input, 'encode'); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'encode' ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>Encode</button>
          <button onClick={() => { setMode('decode'); process(input, 'decode'); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'decode' ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>Decode</button>
        </div>
        <button onClick={swap} className="text-xs text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">⇄ Swap</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder={mode === 'encode' ? 'Type or paste URL to encode...' : 'Type or paste encoded URL...'} className="w-full h-[200px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Result..." className="w-full h-[200px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
