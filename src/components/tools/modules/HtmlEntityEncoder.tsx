"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'encode' | 'decode';

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  const encode = (s: string) => s.replace(/[&<>"'']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c] || c);
  const decode = (s: string) => s.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;|&#x2F;|&#(?:(\d+)|x([0-9a-f]+));/gi, (_, dec, hex) => {
    if (dec) return String.fromCodePoint(parseInt(dec, 10));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&#x2F;': '/' }[_.toLowerCase()] || _;
  });

  const process = (val: string, m: Mode) => { setInput(val); setOutput(val.trim() ? (m === 'encode' ? encode(val) : decode(val)) : ''); };

  const swap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    if (output) process(output, newMode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          <button onClick={() => { setMode('encode'); process(input, 'encode'); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'encode' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>Encode</button>
          <button onClick={() => { setMode('decode'); process(input, 'decode'); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'decode' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>Decode</button>
        </div>
        <button onClick={swap} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">⇄ Swap</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => process(e.target.value, mode)} placeholder={mode === 'encode' ? 'Type or paste HTML...' : 'Type or paste encoded HTML entities...'} className="w-full h-[200px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono focus:border-blue-500 transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Result..." className="w-full h-[200px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
