"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function PythagoreanTheoremCalculator() {
  const [a, setA] = useState('3');
  const [b, setB] = useState('4');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;
    if (!na || !nb) return;
    const c = Math.sqrt(na * na + nb * nb);
    const area = 0.5 * na * nb;
    const perimeter = na + nb + c;
    setResult(`Hypotenuse (c) = ${c.toFixed(4)}\nArea: ${area.toFixed(4)}\nPerimeter: ${perimeter.toFixed(4)}`);
  }, [a, b]);
  const presets = [
    { label: '3-4-5', apply: () => { setA('3'); setB('4'); } },
    { label: '5-12-13', apply: () => { setA('5'); setB('12'); } },
    { label: '6-8-10', apply: () => { setA('6'); setB('8'); } },
  ];
  const na = parseFloat(a) || 0;
  const nb = parseFloat(b) || 0;
  const c = Math.sqrt(na * na + nb * nb);
  const customResult = result ? (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">c = √(a² + b²)</div>
      <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{c.toFixed(2)}</div>
    </div>
  ) : null;
  return (
    <CalculatorShell title="Pythagorean Theorem" result={result} onCalculate={calc} presets={presets} accent="teal" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Side a</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Side b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
