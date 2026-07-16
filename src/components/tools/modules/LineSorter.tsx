"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'sort-asc' | 'sort-desc' | 'reverse' | 'shuffle' | 'dedupe';

export default function LineSorter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const process = (mode: Mode) => {
    if (!input.trim()) { setOutput(''); return; }
    let lines = input.split('\n');
    switch (mode) {
      case 'sort-asc': lines = lines.sort((a, b) => a.localeCompare(b)); break;
      case 'sort-desc': lines = lines.sort((a, b) => b.localeCompare(a)); break;
      case 'reverse': lines = lines.reverse(); break;
      case 'shuffle': for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lines[i], lines[j]] = [lines[j], lines[i]]; } break;
      case 'dedupe': lines = [...new Set(lines)]; break;
    }
    setOutput(lines.join('\n'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'sort-asc', label: 'Sort A → Z' },
          { id: 'sort-desc', label: 'Sort Z → A' },
          { id: 'reverse', label: 'Reverse' },
          { id: 'shuffle', label: 'Shuffle' },
          { id: 'dedupe', label: 'Remove Duplicates' },
        ].map(b => (
          <button key={b.id} onClick={() => process(b.id as Mode)} className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors">{b.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste lines of text, one per line..." className="w-full h-[300px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono focus:border-blue-500 transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Result..." className="w-full h-[300px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
