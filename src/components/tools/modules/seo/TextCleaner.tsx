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

  const customResult = result ? (
    <div className="flex flex-col min-h-[200px]">
      <textarea aria-label="Cleaned text" readOnly value={result} rows={6} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] resize-none" />
      <button aria-label="Copy cleaned text" onClick={() => { clipboardWrite(result).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="mt-2 p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors self-start"><Copy size={14} /></button>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="SEO" title="Text Cleaner" result={resultText} customResult={customResult} onCalculate={clean} presets={presets} accent="cyan" downloadData={result} downloadFilename="cleaned.txt">
      <label htmlFor="lbl-textcleaner-text" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
      <textarea id="lbl-textcleaner-text" aria-label="Text" value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Enter text to clean..."
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-cyan-500/50 resize-y" />
    </CalculatorShell>
  );
}
