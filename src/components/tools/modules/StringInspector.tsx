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
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Type or paste any string to inspect..." className="w-full h-[200px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono focus:border-[var(--accent)] transition-colors" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      {chars.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Character Breakdown</h4>
          <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-4 max-h-[200px] overflow-y-auto">
            <div className="flex flex-wrap gap-1.5">
              {chars.map((c, i) => {
                const code = c.charCodeAt(0);
                const isNonAscii = code > 127;
                return (
                  <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${isNonAscii ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' : 'bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]'}`}>
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
