"use client";
import React, { useState } from 'react';

export default function StringInspector() {
  const [input, setInput] = useState('');

  const len = input.length;
  const chars = [...input];
  const byteLen = new TextEncoder().encode(input).length;
  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const lineCount = input ? input.split('\n').length : 0;
  const spaceCount = (input.match(/ /g) || []).length;

  const stats = [
    { label: 'Characters', value: len.toLocaleString() },
    { label: 'Bytes (UTF-8)', value: byteLen.toLocaleString() },
    { label: 'Words', value: wordCount.toLocaleString() },
    { label: 'Lines', value: lineCount.toLocaleString() },
    { label: 'Spaces', value: spaceCount.toLocaleString() },
    { label: 'Non-ASCII Chars', value: chars.filter(c => c.charCodeAt(0) > 127).length.toLocaleString() },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Type or paste any string to inspect..." className="w-full h-[200px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono focus:border-blue-500 transition-colors" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      {chars.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Character Breakdown</h4>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 max-h-[200px] overflow-y-auto">
            <div className="flex flex-wrap gap-1.5">
              {chars.map((c, i) => {
                const code = c.charCodeAt(0);
                const isNonAscii = code > 127;
                return (
                  <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${isNonAscii ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'}`}>
                    <span className={isNonAscii ? 'text-amber-500' : ''}>{c === ' ' ? '␣' : c === '\n' ? '↵' : c}</span>
                    <span className="opacity-50">{code.toString(16).padStart(4, '0')}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
