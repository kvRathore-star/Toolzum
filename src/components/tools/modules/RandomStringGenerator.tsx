"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { RefreshCw } from 'lucide-react';

export default function RandomStringGenerator() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const generate = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let chars = '';
    if (includeUpper) chars += upper;
    if (includeLower) chars += lower;
    if (includeDigits) chars += digits;
    if (includeSymbols) chars += symbols;
    if (!chars) { toast.error('Select at least one character type'); return; }
    const arr = new Uint32Array(length * count);
    crypto.getRandomValues(arr);
    const res: string[] = [];
    for (let i = 0; i < count; i++) {
      let s = '';
      for (let j = 0; j < length; j++) s += chars[arr[i * length + j] % chars.length];
      res.push(s);
    }
    setResults(res);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Length</label>
          <input type="number" value={length} onChange={e => setLength(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Count</label>
          <input type="number" value={count} onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'A–Z (Upper)', key: 'upper', state: includeUpper, set: setIncludeUpper },
          { label: 'a–z (Lower)', key: 'lower', state: includeLower, set: setIncludeLower },
          { label: '0–9 (Digits)', key: 'digits', state: includeDigits, set: setIncludeDigits },
          { label: '!@# (Symbols)', key: 'symbols', state: includeSymbols, set: setIncludeSymbols },
        ].map(opt => (
          <label key={opt.key} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={opt.state} onChange={() => opt.set(!opt.state)} className="rounded border-zinc-300 dark:border-zinc-600 text-blue-500 focus:ring-blue-500" />
            {opt.label}
          </label>
        ))}
      </div>
      <button onClick={generate} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors">
        <RefreshCw className="w-4 h-4" /> Generate
      </button>
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
              <code className="flex-1 text-sm font-mono text-zinc-800 dark:text-zinc-200 break-all">{r}</code>
              <button onClick={() => { clipboardWrite(r); toast.success('Copied!'); }} className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition-colors shrink-0">Copy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
