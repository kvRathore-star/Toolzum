"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Calculator } from 'lucide-react';
import { inputCls } from '../Calculators.shared';

export default function MeanMedianModeCalculator() {
  const [numbers, setNumbers] = useState('2,4,4,6,8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const nums = numbers.split(',').map(Number).sort((a, b) => a - b);
    if (!nums.length || nums.some(isNaN)) return;
    const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
    const mid = Math.floor(nums.length / 2);
    const median = nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    const freq: Record<number, number> = {};
    nums.forEach(v => freq[v] = (freq[v] || 0) + 1);
    let mode = nums[0];
    let maxFreq = 1;
    Object.entries(freq).forEach(([k, v]) => { if (v > maxFreq) { maxFreq = v; mode = Number(k); } });
    const range = nums[nums.length - 1] - nums[0];
    setResult(`Mean: ${mean.toFixed(4)}\nMedian: ${median}\nMode: ${mode}\nRange: ${range}\nCount: ${nums.length}`);
  }, [numbers]);
  const presets = [
    { label: '2,4,4,6,8', apply: () => { setNumbers('2,4,4,6,8'); } },
    { label: '1,2,3,4,5', apply: () => { setNumbers('1,2,3,4,5'); } },
    { label: '10,20,30', apply: () => { setNumbers('10,20,30'); } },
  ];
  const nums = numbers.split(',').map(Number).sort((a, b) => a - b);
  const mean = nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
  const median = nums.length ? (nums.length % 2 ? nums[Math.floor(nums.length / 2)] : ((nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2)) : 0;
  const customResult = result ? (
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
  ) : null;
  return (
    <CalculatorShell title="Mean Median Mode Calculator" icon={<Calculator className="w-5 h-5" />} result={result} onCalculate={calc} presets={presets} accent="cyan" customResult={customResult}>
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Numbers (comma-separated)</label><input type="text" value={numbers} onChange={e => setNumbers(e.target.value)} className={inputCls} /></div>
    </CalculatorShell>
  );
}
