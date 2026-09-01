"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, randItem, shuffleArray } from './GeneratorsShared';

export default function RandomPickerGenerator() {
  const [input, setInput] = useState('Option A\nOption B\nOption C\nOption D'); const [count, setCount] = useState(1); const [allowRepeat, setAllowRepeat] = useState(false); const [result, setResult] = useState<string[]>([]);
  const pick = () => { const items = input.split('\n').map(s => s.trim()).filter(Boolean); if (!items.length) return; if (allowRepeat) { const picked: string[] = []; for (let i = 0; i < count; i++) picked.push(randItem(items)); setResult(picked); } else { const shuffled = shuffleArray(items); setResult(shuffled.slice(0, Math.min(count, items.length))); } };

  const presets = [
    { label: 'Pick 1', apply: () => { setCount(1); pick(); } },
    { label: 'Pick 3', apply: () => { setCount(3); pick(); } },
    { label: 'Pick 5', apply: () => { setCount(5); pick(); } },
    { label: 'Clear', apply: () => { setResult([]); } },
  ];

  const resultText = result.length > 0 ? 'Picked ' + result.length + ' of ' + input.split('\n').filter(Boolean).length + ' items (' + (allowRepeat ? 'with' : 'without') + ' repeats)' : 'Add items and pick';

  return (
    <CalculatorShell category="Utility"
      title="Random Picker Generator"
      result={resultText}
      onCalculate={pick}
      calculateLabel="Generate"
      presets={presets}
      accent="violet"
      downloadData={JSON.stringify({ items: input.split('\n').map(s => s.trim()).filter(Boolean), picked: result, allowRepeat, count }, null, 2)}
      downloadFilename="picked-items.json"
    >
      <div className="space-y-4">
        <Input label="Items (one per line)" value={input} onChange={v => setInput(v)} rows={5} />
        <Input label="Pick Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={allowRepeat} onChange={e => setAllowRepeat(e.target.checked)} className="accent-[var(--accent)]" />Allow repeats</label>
        {result.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col justify-center items-center min-h-[160px]">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-violet-500">{result.join(', ')}</p>
              <button onClick={() => { clipboardWrite(result.join(', ')); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-3" aria-label="Copy picked items"><Copy size={14} /></button>
            </div>
          </div>
        )}
        {!result.length && (
          <p className="text-[var(--text-muted)] text-sm text-center">Add items and pick</p>
        )}
      </div>
    </CalculatorShell>
  );
}
