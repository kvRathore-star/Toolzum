"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function SquareRootCalculator() {
  const [number, setNumber] = useState('144');
  const presets = [
    { label: '\u221a144', apply: () => { setNumber('144'); } },
    { label: '\u221a2', apply: () => { setNumber('2'); } },
    { label: '\u221a10000', apply: () => { setNumber('10000'); } },
  ];
  const n = parseFloat(number) || 0;
  const sqrt = Math.sqrt(Math.max(0, n));
  const customResult = (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">√{n}</div>
      <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{sqrt.toFixed(4)}</div>
    </div>
  );
  return (
    <CalculatorShell category="Calculator" title="Square Root Calculator" result="" auto presets={presets} accent="sky" customResult={customResult}>
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Number</label><input type="number" value={number} onChange={e => setNumber(e.target.value)} className={inputCls} /></div>
    </CalculatorShell>
  );
}
