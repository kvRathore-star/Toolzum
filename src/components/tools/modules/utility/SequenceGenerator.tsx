"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input } from './GeneratorsShared';

export default function SequenceGenerator() {
  const [type, setType] = useState('arithmetic'); const [start, setStart] = useState('1'); const [diff, setDiff] = useState('2'); const [count, setCount] = useState('10'); const [result, setResult] = useState<number[]>([]);
  const generate = () => { const s = parseFloat(start); const d = parseFloat(diff); const c = parseInt(count); if (isNaN(s) || isNaN(d) || isNaN(c)) return; const seq: number[] = []; if (type === 'arithmetic') { for (let i = 0; i < c; i++) seq.push(s + i * d); } else if (type === 'geometric') { for (let i = 0; i < c; i++) seq.push(s * Math.pow(d, i)); } else { for (let i = 0; i < c; i++) seq.push(s + i + (i * d)); } setResult(seq); };
  const sum = result.reduce((a, b) => a + b, 0);

  const presets = [
    { label: 'Arithmetic 1-10', apply: () => { setType('arithmetic'); setStart('1'); setDiff('1'); setCount('10'); generate(); } },
    { label: 'Geometric 2^n', apply: () => { setType('geometric'); setStart('1'); setDiff('2'); setCount('10'); generate(); } },
    { label: 'Even Numbers', apply: () => { setType('arithmetic'); setStart('2'); setDiff('2'); setCount('10'); generate(); } },
    { label: 'Clear', apply: () => { setResult([]); } },
  ];

  const resultText = result.length > 0 ? 'Generated ' + result.length + ' numbers (' + type + ', sum: ' + sum.toLocaleString() + ')' : 'Configure and generate';

  return (
    <CalculatorShell category="Utility"
      title="Sequence Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="amber"
      downloadData={result.length > 0 ? JSON.stringify({ type, start: parseFloat(start), diff: parseFloat(diff), count: parseInt(count), sequence: result, sum }, null, 2) : ''}
      downloadFilename="sequence.json"
    >
      <div className="space-y-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type</label>
          <select aria-label="Type" value={type} onChange={e => setType(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50"><option value="arithmetic">Arithmetic</option><option value="geometric">Geometric</option><option value="custom">Custom (n + n*r)</option></select>
        </div>
        <div className="grid grid-cols-3 gap-3"><Input label="Start" type="number" value={start} onChange={v => setStart(v)} /><Input label="Diff/Ratio" type="number" value={diff} onChange={v => setDiff(v)} /><Input label="Count" type="number" value={count} onChange={v => setCount(v)} /></div>
        {result.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[120px]">
            <p className="text-sm font-mono font-bold text-[var(--text-primary)] break-all">{result.join(', ')}</p>
            <p className="text-xs text-[var(--text-muted)] mt-2">Sum: {sum.toLocaleString()} · Count: {result.length}</p>
            <div className="flex gap-1 mt-2">
              <button onClick={() => { clipboardWrite(result.join(', ')); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy sequence"><Copy size={14} /></button>
              <button onClick={() => { const blob = new Blob([result.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sequence.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Download sequence"><Download size={14} /></button>
            </div>
          </div>
        )}
        {!result.length && (
          <p className="text-[var(--text-muted)] text-sm text-center">Generate a number sequence</p>
        )}
      </div>
    </CalculatorShell>
  );
}
