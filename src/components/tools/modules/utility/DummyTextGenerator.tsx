"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { LOREM_WORDS, randItem } from './GeneratorsShared';

export default function DummyTextGenerator() {
  const [length, setLength] = useState(200); const [result, setResult] = useState('');
  const generate = () => { let text = ''; while (text.length < length) { text += randItem(LOREM_WORDS) + ' '; } setResult(text.slice(0, length).replace(/^./, c => c.toUpperCase()).replace(/\s+\S*$/, '') + '.'); };

  const presets = [
    { label: '200 chars', apply: () => { setLength(200); generate(); } },
    { label: '500 chars', apply: () => { setLength(500); generate(); } },
    { label: '1000 chars', apply: () => { setLength(1000); generate(); } },
    { label: '2000 chars', apply: () => { setLength(2000); generate(); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? 'Generated ' + result.length + ' chars dummy text' : 'Configure and generate';

  return (
    <CalculatorShell category="Utility"
      title="Dummy Text Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="sky"
      downloadData={result}
      downloadFilename="dummy-text.txt"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Character Length ({length})</label>
          <input type="range" min={10} max={5000} step={10} value={length} onChange={e => setLength(Number(e.target.value))} className="w-full accent-sky-500" />
          <input type="number" min={10} max={5000} value={length} onChange={e => setLength(Number(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" />
        </div>
        {result ? (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[200px]">
            <textarea readOnly value={result} rows={6} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 font-sans text-xs leading-relaxed resize-none" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[var(--text-muted)]">{result.length} chars</span>
              <div className="flex gap-1">
                <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy dummy text"><Copy size={14} /></button>
                <button onClick={() => { const blob = new Blob([result], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'dummy-text.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Download dummy text"><Download size={14} /></button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-sm text-center">Generate dummy text</p>
        )}
      </div>
    </CalculatorShell>
  );
}
