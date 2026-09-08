"use client";
import { useState } from 'react';
import NextLink from 'next/link';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function DuplicateWordRemover() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const remove = () => { const words = text.split(/\s+/); const seen = new Set<string>(); const out: string[] = []; words.forEach(w => { const key = w.toLowerCase(); if (!seen.has(key)) { seen.add(key); out.push(w); } }); setResult(out.join(' ')); };
  const inWords = text.trim() ? text.split(/\s+/).length : 0;
  const outWords = result.trim() ? result.split(/\s+/).length : 0;

  const presets = [
    { label: 'Sample', apply: () => { setText('the quick brown fox jumps over the lazy dog the quick brown fox'); } },
    { label: 'Repeated', apply: () => { setText('word word word another another test test test'); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); } },
  ];

  const resultText = result ? `${outWords} unique words (removed ${inWords - outWords} duplicates)` : 'Paste text to remove duplicate words';

  return (
    <CalculatorShell category="SEO" title="Duplicate Word Remover" result={resultText} onCalculate={remove} presets={presets} accent="rose" downloadData={result} downloadFilename="deduplicated.txt">
      <p className="text-sm text-[var(--text-secondary)] mb-3">Removes duplicate words within text. For removing duplicate <em>lines</em>, use <NextLink href="/text/text-deduplicator" className="text-[var(--accent)] hover:underline">Text Deduplicator</NextLink>.</p>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text (${inWords} words)</label>
      <textarea aria-label="Text Deduplicator" value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste text..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-rose-500/50 resize-y" />

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea readOnly value={result} rows={6} aria-label="Result" className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">{outWords} unique words ({inWords - outWords} removed)</span>
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy unique words"><Copy size={14} /></button>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
