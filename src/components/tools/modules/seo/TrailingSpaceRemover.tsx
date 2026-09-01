"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function TrailingSpaceRemover() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const trim = () => { setResult(text.split('\n').map(l => l.trimEnd()).join('\n').trim()); };
  const trimmed = result ? text.split('\n').length - result.split('\n').length : 0;

  const presets = [
    { label: 'Sample', apply: () => { setText('Line 1   \nLine 2  \n  Line 3  \n\nLine 4'); } },
    { label: 'Code', apply: () => { setText('function hello() {  \n  console.log("test");  \n}  '); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); } },
  ];

  const resultText = result ? 'Trailing spaces removed' : 'Enter text to remove trailing spaces';

  return (
    <CalculatorShell category="SEO" title="Trailing Space Remover" result={resultText} onCalculate={trim} presets={presets} accent="orange" downloadData={result} downloadFilename="trimmed.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Enter text with trailing spaces..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-orange-500/50 resize-y" />

      {result && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          <textarea readOnly value={result} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 resize-none" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">Trailing spaces removed</span>
            <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy cleaned text"><Copy size={14} /></button>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
