"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function ProbabilityCalculator() {
  const [favorable, setFavorable] = useState('3');
  const [total, setTotal] = useState('10');
  const presets = [
    { label: 'Coin Flip', apply: () => { setFavorable('1'); setTotal('2'); } },
    { label: 'Dice Roll', apply: () => { setFavorable('1'); setTotal('6'); } },
    { label: 'Deck of Cards', apply: () => { setFavorable('13'); setTotal('52'); } },
  ];
  const f = parseFloat(favorable) || 0;
  const t = parseFloat(total) || 1;
  const pct = (f / t) * 100;
  const customResult = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">Probability</span>
        <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
  return (
    <CalculatorShell category="Calculator" title="Probability Calculator" result="" auto presets={presets} accent="green" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Favorable Outcomes</label><input type="number" value={favorable} onChange={e => setFavorable(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Possible Outcomes</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
