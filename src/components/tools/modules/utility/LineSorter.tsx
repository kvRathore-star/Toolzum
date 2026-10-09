"use client";
import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';
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
      case 'shuffle': for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lines[i], lines[j]] = [lines[j]!, lines[i]!]; } break;
      case 'dedupe': lines = [...new Set(lines)]; break;
    }
    setOutput(lines.join('\n'));
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sorted-lines.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
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
          <button key={b.id} onClick={() => process(b.id as Mode)} className="px-3 py-1.5 text-xs font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--accent)]/10 rounded-xl transition-colors">{b.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea aria-label="Paste lines of text, one per line..." value={input} onChange={e => setInput(e.target.value)} placeholder="Paste lines of text, one per line..." className="w-full h-[300px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly aria-label="Sorted lines" placeholder="Result..." className="w-full h-[300px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
          {output && (
            <div className="absolute top-3 right-3 flex gap-1">
              <button onClick={() => { clipboardWrite(output).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
              <button onClick={handleDownload} aria-label="Download sorted lines" className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors flex items-center gap-1"><Download className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      </div>
      {input && (
        <div className="text-xs text-[var(--text-muted)] text-right">
          {input.split('\n').length} lines in / {output ? `${output.split('\n').length} lines out` : ''}
        </div>
      )}
    </div>
  );
}
