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
  const mode = hasInput ? (() => { const freq: Record<number, number> = {}; nums.forEach(n => { freq[n] = (freq[n] || 0) + 1; }); const maxFreq = Math.max(...Object.values(freq)); return maxFreq > 1 ? Object.keys(freq).filter(k => freq[Number(k)] === maxFreq).join(', ') : 'No mode'; })() : '';
  const result = hasInput ? `Mean: ${mean.toFixed(2)} | Median: ${median}${mode !== 'No mode' ? ` | Mode: ${mode}` : ''}` : '';
  const resultStats = hasInput ? [
    { label: 'Mean', value: mean.toFixed(2), color: 'text-indigo-700 dark:text-indigo-400' },
    { label: 'Median', value: String(median), color: 'text-emerald-700 dark:text-emerald-400' },
    ...(mode !== 'No mode' ? [{ label: 'Mode', value: mode, color: 'text-amber-700 dark:text-amber-400' }] : []),
  ] : undefined;
  return (
    <CalculatorShell category="Calculator" title="Mean Median Mode Calculator" result={result} auto presets={presets} accent="cyan" resultStats={resultStats}>
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Numbers (comma-separated)</label><input type="text" value={numbers} onChange={e => setNumbers(e.target.value)} className={inputCls} /></div>
    </CalculatorShell>
  );
}
