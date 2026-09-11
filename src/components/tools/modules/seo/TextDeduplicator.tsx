"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function TextDeduplicator() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const inLines = text.split('\n').filter(l => l.trim()).length;
  const deduplicate = () => { const lines = text.split('\n').map(l => l.trim()).filter(Boolean); setResult([...new Set(lines)].join('\n')); };

  const presets = [
    { label: 'Sample', apply: () => { setText('apple\nbanana\napple\ncherry\nbanana\ndate'); } },
    { label: 'Logs', apply: () => { setText('ERROR: Connection failed\nINFO: Started\nERROR: Connection failed\nWARN: Timeout\nINFO: Started'); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); } },
  ];

  const resultText = result ? `${result.split('\n').length} unique lines (from ${inLines})` : 'Paste lines to deduplicate';

  return (
    <CalculatorShell category="SEO" title="Text Deduplicator" result={resultText} onCalculate={deduplicate} presets={presets} accent="rose" downloadData={result} downloadFilename="deduplicated.txt">
      <label htmlFor="lbl-textdeduplicator-text-lines" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text Lines</label>
      <textarea id="lbl-textdeduplicator-text-lines" aria-label="Text Lines" value={text} onChange={e => setText(e.target.value)} rows={8}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-rose-500/50 resize-y" />

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea aria-label="Result" readOnly value={result} rows={8}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">{result.split('\n').length} unique lines ({inLines - result.split('\n').length} removed)</span>
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy unique lines"><Copy size={14} /></button>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
