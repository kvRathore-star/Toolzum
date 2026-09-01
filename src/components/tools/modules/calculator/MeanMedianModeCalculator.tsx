"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function MeanMedianModeCalculator() {
  const [numbers, setNumbers] = useState('2,4,4,6,8');
  const presets = [
    { label: '2,4,4,6,8', apply: () => { setNumbers('2,4,4,6,8'); } },
    { label: '1,2,3,4,5', apply: () => { setNumbers('1,2,3,4,5'); } },
    { label: '10,20,30', apply: () => { setNumbers('10,20,30'); } },
  ];
  const nums = numbers.split(',').map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
  const hasInput = nums.length > 0;
  const mean = hasInput ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
  const median = hasInput ? (nums.length % 2 ? nums[Math.floor(nums.length / 2)] : ((nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2)) : 0;
  const customResult = !hasInput ? (
    <div className="text-sm text-[var(--text-muted)]">Enter comma-separated numbers</div>
  ) : (
    <div className="grid grid-cols-2 gap-2">
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Mean</div>
        <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{mean.toFixed(2)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Median</div>
        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{median}</div>
      </div>
    </div>
  );
  return (
    <CalculatorShell category="Calculator" title="Mean Median Mode Calculator" result="" auto presets={presets} accent="cyan" customResult={customResult}>
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Numbers (comma-separated)</label><input type="text" value={numbers} onChange={e => setNumbers(e.target.value)} className={inputCls} /></div>
    </CalculatorShell>
  );
}
