"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { gcd, inputCls } from '../Calculators.shared';

export default function RatioCalculator() {
  const [num1, setNum1] = useState('12');
  const [num2, setNum2] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const n1 = parseInt(num1) || 0;
    const n2 = parseInt(num2) || 0;
    if (!n1 || !n2) return;
    const g = gcd(n1, n2);
    const pct = (n1 / n2) * 100;
    setResult(`Simplified Ratio: ${n1 / g} : ${n2 / g}\nProportion: ${pct.toFixed(1)}% (${n1} is ${pct.toFixed(1)}% of ${n2})`);
  }, [num1, num2]);
  const presets = [
    { label: '12:8', apply: () => { setNum1('12'); setNum2('8'); } },
    { label: '16:9 (HD)', apply: () => { setNum1('16'); setNum2('9'); } },
    { label: '100:75', apply: () => { setNum1('100'); setNum2('75'); } },
  ];
  const n1 = parseInt(num1) || 0;
  const n2 = parseInt(num2) || 1;
  const g = gcd(n1, n2);
  const customResult = result ? (
    <div className="text-center">
      <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{n1 / g} : {n2 / g}</div>
    </div>
  ) : null;
  return (
    <CalculatorShell title="Ratio Calculator" result={result} onCalculate={calc} presets={presets} accent="blue" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">First Number</label><input type="number" value={num1} onChange={e => setNum1(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Second Number</label><input type="number" value={num2} onChange={e => setNum2(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
