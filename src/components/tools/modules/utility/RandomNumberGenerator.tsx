"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { randInt, shuffleArray } from './GeneratorsShared';

export default function RandomNumberGenerator() {
  const [min, setMin] = useState('1'); const [max, setMax] = useState('100'); const [count, setCount] = useState('5'); const [unique, setUnique] = useState(false); const [sort, setSort] = useState(false);
  const [result, setResult] = useState<number[]>([]); const [history, setHistory] = useState<{ nums: number[]; timestamp: string }[]>([]);
  const generate = () => {
    const mn = parseInt(min); const mx = parseInt(max); const c = parseInt(count);
    if (isNaN(mn) || isNaN(mx) || isNaN(c)) return;
    const pool = mx - mn + 1; const nums: number[] = [];
    if (unique && c > pool) { for (let i = 0; i < pool; i++) nums.push(mn + i); }
    else if (unique) { const avail = Array.from({ length: pool }, (_, i) => mn + i); const sh = shuffleArray(avail); nums.push(...sh.slice(0, c)); }
    else { for (let i = 0; i < c; i++) nums.push(randInt(mn, mx)); }
    if (sort) nums.sort((a, b) => a - b);
    setResult(nums);
  };

  const presets = [
    { label: 'Dice Roll (1-6)', apply: () => { setMin('1'); setMax('6'); setCount('1'); } },
    { label: 'Lottery (1-49)', apply: () => { setMin('1'); setMax('49'); setCount('6'); setUnique(true); } },
    { label: '100 Numbers (1-1000)', apply: () => { setMin('1'); setMax('1000'); setCount('100'); } },
    { label: 'Clear', apply: () => { setResult([]); setHistory([]); } },
  ];

  const resultText = result.length > 0 ? 'Generated ' + result.length + ' numbers (' + (unique ? 'unique' : 'with repeats') + ')' : 'Configure range and generate';

  return (
    <CalculatorShell category="Utility"
      title="Random Number Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="violet"
      downloadData={JSON.stringify({ min: parseInt(min), max: parseInt(max), count: parseInt(count), unique, sort, numbers: result }, null, 2)}
      downloadFilename="random-numbers.json"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="lbl-randomnumbergenerator-min" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Min</label>
            <input id="lbl-randomnumbergenerator-min" aria-label="Min" type="number" value={min} onChange={e => setMin(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50" />
          </div>
          <div>
            <label htmlFor="lbl-randomnumbergenerator-max" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Max</label>
            <input id="lbl-randomnumbergenerator-max" aria-label="Max" type="number" value={max} onChange={e => setMax(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50" />
          </div>
          <div>
            <label htmlFor="lbl-randomnumbergenerator-count" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Count</label>
            <input id="lbl-randomnumbergenerator-count" aria-label="Count" type="number" min="1" max="10000" value={count} onChange={e => setCount(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50" />
          </div>
        </div>

        <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={unique} onChange={e => setUnique(e.target.checked)} className="accent-[var(--accent)]" />Unique
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sort} onChange={e => setSort(e.target.checked)} className="accent-[var(--accent)]" />Sorted
          </label>
        </div>

        {result.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col justify-center min-h-[160px]">
            <p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all">{result.join(', ')}</p>
            <p className="text-xs text-[var(--text-muted)] mt-2">{result.length} numbers · {sort ? 'sorted' : 'unsorted'} · {unique ? 'unique' : 'repeatable'}</p>
            <div className="flex gap-1 mt-2">
              <button onClick={() => { clipboardWrite(result.join(', ')); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy numbers"><Copy size={14} /></button>
              <button onClick={() => { const blob = new Blob([result.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'random-numbers.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Download as CSV"><Download size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
