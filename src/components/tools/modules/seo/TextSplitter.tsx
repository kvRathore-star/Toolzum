"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function TextSplitter() {
  const [text, setText] = useState(''); const [delimiter, setDelimiter] = useState(','); const [result, setResult] = useState('');
  const split = () => { if (!delimiter) return; const parts = text.split(delimiter).map(s => s.trim()).filter(Boolean); setResult(parts.map((p, i) => `${i + 1}. ${p}`).join('\n')); };
  const count = result ? result.split('\n').length : 0;

  const presets = [
    { label: 'CSV', apply: () => { setText('apple, banana, cherry, date'); setDelimiter(','); } },
    { label: 'Lines', apply: () => { setText('line1\nline2\nline3'); setDelimiter('\n'); } },
    { label: 'Semicolon', apply: () => { setText('a;b;c;d'); setDelimiter(';'); } },
    { label: 'Clear', apply: () => { setText(''); setDelimiter(','); setResult(''); } },
  ];

  const resultText = result ? `Split into ${count} parts` : 'Enter text and delimiter to split';

  return (
    <CalculatorShell category="SEO" title="Text Splitter" result={resultText} onCalculate={split} presets={presets} accent="violet" downloadData={result} downloadFilename="split.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
      <textarea aria-label="Text" value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Enter text to split..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50 resize-y" />

      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Delimiter</label>
      <input type="text" aria-label="Delimiter" value={delimiter} onChange={e => setDelimiter(e.target.value)} placeholder=","
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50" />

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea aria-label="Result" readOnly value={result} rows={8} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">{count} parts</span>
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy split parts"><Copy size={14} /></button>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
