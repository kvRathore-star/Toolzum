"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function StandardDeviationCalculator() {
  const [numbers, setNumbers] = useState('10, 12, 23, 23, 16, 23, 21, 16');

  const nums = numbers.split(/[,\s]+/).filter(Boolean).map(Number);
  let result = '';
  if (nums.length >= 2 && !nums.some(isNaN)) {
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const sqDiffs = nums.map(n => Math.pow(n - mean, 2));
    const variance = sqDiffs.reduce((a, b) => a + b, 0) / nums.length;
    const sampleVariance = sqDiffs.reduce((a, b) => a + b, 0) / (nums.length - 1);
    const stdDev = Math.sqrt(variance);
    const sampleStdDev = Math.sqrt(sampleVariance);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const median = nums.sort((a, b) => a - b)[Math.floor(nums.length / 2)];
    result = `Count: ${nums.length}\nMean: ${mean.toFixed(4)}\nMedian: ${median}\nRange: ${min} - ${max}\nPopulation Std Dev: ${stdDev.toFixed(4)}\nSample Std Dev: ${sampleStdDev.toFixed(4)}\nVariance: ${variance.toFixed(4)}`;
  } else if (nums.length > 0) {
    result = 'Enter at least 2 numbers.';
  }
  const customResult = (
    <div className="font-mono text-sm whitespace-pre-wrap">
      {result}
    </div>
  );

  const presets = [
    { label: 'Reset example', apply: () => setNumbers('10, 12, 23, 23, 16, 23, 21, 16') },
    { label: '1-10', apply: () => setNumbers('1, 2, 3, 4, 5, 6, 7, 8, 9, 10') },
  ];

  return (
    <CalculatorShell category="Calculator" title="Standard Deviation Calculator" accent="blue" result="" auto customResult={customResult} presets={presets}>
      <div className="max-w-xl">
        <div><label className={labelCls}>Numbers (comma separated)</label><textarea aria-label="Numbers (comma separated)" className={`${inputCls} min-h-[80px] resize-none`} value={numbers} onChange={e => setNumbers(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}
