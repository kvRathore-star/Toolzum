"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function TextReplacer() {
  const [text, setText] = useState(''); const [find, setFind] = useState(''); const [replace, setReplace] = useState(''); const [result, setResult] = useState('');
  const replaceAll = () => { if (!find) return; setResult(text.split(find).join(replace)); };
  const count = result ? (text.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;

  const presets = [
    { label: 'Fix typo', apply: () => { setText('The quik brown fox jumps over the lazy dog'); setFind('quik'); setReplace('quick'); } },
    { label: 'Remove prefix', apply: () => { setText('OLD_item1\nOLD_item2\nOLD_item3'); setFind('OLD_'); setReplace(''); } },
    { label: 'Clear', apply: () => { setText(''); setFind(''); setReplace(''); setResult(''); } },
  ];
  const resultText = result ? `Replaced ${count} occurrence${count !== 1 ? 's' : ''}` : 'Enter text to find and replace';

  return (
    <CalculatorShell category="SEO" title="Text Replacer" result={resultText} onCalculate={replaceAll} presets={presets} accent="amber" downloadData={result} downloadFilename="replaced.txt">
      <div className="space-y-4">
        <label htmlFor="lbl-textreplacer-text" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
        <textarea id="lbl-textreplacer-text" aria-label="Text" value={text} onChange={e => { setText(e.target.value); setResult(''); }} rows={6} placeholder="Enter text..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50 resize-y" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-textreplacer-find" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Find</label>
            <input id="lbl-textreplacer-find" aria-label="Find" type="text" value={find} onChange={e => setFind(e.target.value)} placeholder="Text to find"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label htmlFor="lbl-textreplacer-replace-with" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Replace With</label>
            <input id="lbl-textreplacer-replace-with" aria-label="Replace With" type="text" value={replace} onChange={e => setReplace(e.target.value)} placeholder="Replacement text"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50" />
          </div>
        </div>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">{count} replacement{count !== 1 ? 's' : ''}</span>
              <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">Copy</button>
                <button onClick={() => { const blob = new Blob([result], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'replaced.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">Download</button>
              </div>
            </div>
            <textarea aria-label="Replacement result" readOnly value={result} rows={8} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] resize-none" />
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
