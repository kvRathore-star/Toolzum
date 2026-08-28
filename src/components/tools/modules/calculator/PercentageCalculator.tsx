"use client";
import { useState } from 'react';
import { Percent } from 'lucide-react';
import { CalculatorShell } from '../shared/CalculatorShell';

type Mode = 'percentOf' | 'whatPercent';

const labelCls = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";
const inputCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>('percentOf');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = parseFloat(val1) || 0;
    const b = parseFloat(val2) || 0;
    if (mode === 'percentOf') {
      setResult(((a / 100) * b).toString());
    } else {
      if (b === 0) { setResult('0'); return; }
      setResult(((a / b) * 100).toFixed(2) + '%');
    }
  };

  return (
    <CalculatorShell
      title="Percentage Calculator"
      icon={<Percent className="w-5 h-5" />}
      result={result ?? ''}
      onCalculate={calculate}
      calculateLabel="Calculate"
      resultLabel="Result"
      accent="emerald"
      resultStats={result ? [
        { label: 'Mode', value: mode === 'percentOf' ? 'X% of Y' : 'X is what% of Y' },
        { label: 'Input A', value: val1 || '0' },
        { label: 'Input B', value: val2 || '0' },
      ] : []}
      presets={[
        { label: '10% of 200', apply: () => { setMode('percentOf'); setVal1('10'); setVal2('200'); } },
        { label: '15% tip', apply: () => { setMode('percentOf'); setVal1('15'); setVal2('50'); } },
        { label: '20% discount', apply: () => { setMode('percentOf'); setVal1('20'); setVal2('75'); } },
        { label: '25% of 1000', apply: () => { setMode('percentOf'); setVal1('25'); setVal2('1000'); } },
      ]}
    >
      <div className="flex gap-2 mb-2">
        {([
          { key: 'percentOf' as Mode, label: 'X% of Y' },
          { key: 'whatPercent' as Mode, label: 'X is what % of Y' },
        ]).map(opt => (
          <button
            key={opt.key}
            onClick={() => setMode(opt.key)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              mode === opt.key
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {mode === 'percentOf' ? (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Percentage (X)</label>
            <input type="number" className={inputCls} value={val1} onChange={e => setVal1(e.target.value)} placeholder="e.g. 10" />
          </div>
          <div>
            <label className={labelCls}>Of Total (Y)</label>
            <input type="number" className={inputCls} value={val2} onChange={e => setVal2(e.target.value)} placeholder="e.g. 200" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Part (X)</label>
            <input type="number" className={inputCls} value={val1} onChange={e => setVal1(e.target.value)} placeholder="e.g. 30" />
          </div>
          <div>
            <label className={labelCls}>Total (Y)</label>
            <input type="number" className={inputCls} value={val2} onChange={e => setVal2(e.target.value)} placeholder="e.g. 200" />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
