"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function TextSorter() {
  const [text, setText] = useState('banana\napple\ndate\ncherry\nelderberry'); const [sorted, setSorted] = useState(''); const [sortMethod, setSortMethod] = useState('');
  const sort = (method: string) => { setSortMethod(method); const lines = text.split('\n'); switch (method) { case 'az': setSorted([...lines].sort((a, b) => a.localeCompare(b)).join('\n')); break; case 'za': setSorted([...lines].sort((a, b) => b.localeCompare(a)).join('\n')); break; case 'length': setSorted([...lines].sort((a, b) => a.length - b.length).join('\n')); break; case 'random': setSorted([...lines].sort(() => Math.random() - 0.5).join('\n')); break; case 'unique': setSorted([...new Set(lines)].join('\n')); break; } };
  const inLines = text.split('\n').filter(l => l.trim()).length;
  const outLines = sorted ? sorted.split('\n').filter(l => l.trim()).length : 0;

  const presets = [
    { label: 'Fruits', apply: () => { setText('banana\napple\ndate\ncherry\nelderberry'); sort('az'); } },
    { label: 'Mixed', apply: () => { setText('zebra\napple\nbanana\ncherry'); sort('az'); } },
    { label: 'Numbers', apply: () => { setText('10\n2\n30\n4\n5'); sort('length'); } },
    { label: 'Clear', apply: () => { setText(''); setSorted(''); setSortMethod(''); } },
  ];

  const resultText = sorted ? `Sorted ${outLines} lines (${sortMethod})` : 'Enter lines to sort';

  const customResult = sorted ? (
    <div className="flex flex-col min-h-[250px]">
      <textarea readOnly value={sorted} rows={8} aria-label="Sorted text"
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] font-mono text-xs resize-none" />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-[var(--text-muted)]">{outLines} lines (was {inLines})</span>
        <button onClick={() => { clipboardWrite(sorted).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy sorted lines"><Copy size={14} /></button>
      </div>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="SEO" title="Text Sorter" result={resultText} customResult={customResult} onCalculate={() => sort('az')} presets={presets} accent="violet" downloadData={sorted} downloadFilename="sorted.txt">
      <div className="space-y-4">
        <label htmlFor="lbl-textsorter-lines-inlines" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Lines ({inLines})</label>
        <textarea id="lbl-textsorter-lines-inlines" aria-label="Lines" value={text} onChange={e => { setText(e.target.value); setSorted(''); setSortMethod(''); }} rows={8}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50 resize-y" />

        <div className="flex flex-wrap gap-2">
          {[
            ['A→Z', 'az'], ['Z→A', 'za'], ['By Length', 'length'], ['Randomize', 'random'], ['Deduplicate', 'unique']
          ].map(([label, id]) => (
            <button key={id} onClick={() => sort(id!)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${sortMethod === id ? 'bg-violet-500/10 border-violet-400 text-violet-500' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </CalculatorShell>
  );
}
