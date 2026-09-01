"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function TextCleaner() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const clean = () => { let t = text; t = t.replace(/\s+/g, ' '); t = t.replace(/\n{3,}/g, '\n\n'); t = t.replace(/[^\S\n]+$/gm, ''); t = t.replace(/^[^\S\n]+/gm, ''); setResult(t.trim()); };

  const presets = [
    { label: 'Messy', apply: () => { setText('  Hello    World  \n\n\n  This   is   a   test  '); } },
    { label: 'Extra newlines', apply: () => { setText('Line 1\n\n\n\nLine 2\n\n\nLine 3'); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); } },
  ];

  const resultText = result ? 'Text cleaned (whitespace normalized)' : 'Enter text to clean';

  return (
    <CalculatorShell category="SEO" title="Text Cleaner" result={resultText} onCalculate={clean} presets={presets} accent="cyan" downloadData={result} downloadFilename="cleaned.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Enter text to clean..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-cyan-500/50 resize-y" />

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea readOnly value={result} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 resize-none" />
          <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="mt-2 p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors self-start"><Copy size={14} /></button>
        </div>
      )}
    </CalculatorShell>
  );
}
