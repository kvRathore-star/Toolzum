"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function CircleCalculator() {
  const [radius, setRadius] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const r = parseFloat(radius) || 0;
    const area = Math.PI * r * r;
    const circumference = 2 * Math.PI * r;
    const diameter = 2 * r;
    setResult(`Radius: ${r}\nDiameter: ${diameter}\nArea: ${area.toFixed(4)}\nCircumference: ${circumference.toFixed(4)}`);
  }, [radius]);
  const presets = [
    { label: 'r=1', apply: () => { setRadius('1'); } },
    { label: 'r=5', apply: () => { setRadius('5'); } },
    { label: 'r=10', apply: () => { setRadius('10'); } },
  ];
  const r = parseFloat(radius) || 0;
  const area = Math.PI * r * r;
  const customResult = result ? (
    <div className="grid grid-cols-2 gap-2">
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Area</div>
        <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{area.toFixed(1)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Circumference</div>
        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{(2 * Math.PI * r).toFixed(1)}</div>
      </div>
    </div>
  ) : null;
  return (
    <CalculatorShell title="Circle Calculator" result={result} onCalculate={calc} presets={presets} accent="violet" customResult={customResult}>
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Radius</label><input type="number" value={radius} onChange={e => setRadius(e.target.value)} step="0.1" className={inputCls} /></div>
    </CalculatorShell>
  );
}
