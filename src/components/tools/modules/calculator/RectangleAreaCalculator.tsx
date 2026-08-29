"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function RectangleAreaCalculator() {
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const area = l * w;
    const perimeter = 2 * (l + w);
    const diagonal = Math.sqrt(l * l + w * w);
    setResult(`Area: ${area}\nPerimeter: ${perimeter}\nDiagonal: ${diagonal.toFixed(4)}`);
  }, [length, width]);
  const presets = [
    { label: '10 x 5', apply: () => { setLength('10'); setWidth('5'); } },
    { label: 'A4 (29.7x21)', apply: () => { setLength('29.7'); setWidth('21'); } },
    { label: '3 x 4', apply: () => { setLength('3'); setWidth('4'); } },
  ];
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const customResult = result ? (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Area</div>
        <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{l * w}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Perimeter</div>
        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{2 * (l + w)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Diagonal</div>
        <div className="text-lg font-bold text-[var(--text-primary)]">{Math.sqrt(l * l + w * w).toFixed(1)}</div>
      </div>
    </div>
  ) : null;
  return (
    <CalculatorShell title="Rectangle Calculator" result={result} onCalculate={calc} presets={presets} accent="lime" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Length</label><input type="number" value={length} onChange={e => setLength(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Width</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
