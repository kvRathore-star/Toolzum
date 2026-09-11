"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { gcd, inputCls } from '../Calculators.shared';

export default function RatioCalculator() {
  const [num1, setNum1] = useState('12');
  const [num2, setNum2] = useState('8');
  const presets = [
    { label: '12:8', apply: () => { setNum1('12'); setNum2('8'); } },
    { label: '16:9 (HD)', apply: () => { setNum1('16'); setNum2('9'); } },
    { label: '100:75', apply: () => { setNum1('100'); setNum2('75'); } },
  ];
  const n1 = parseInt(num1) || 0;
  const n2 = parseInt(num2) || 1;
  const hasInput = num1 !== '' && num2 !== '' && !isNaN(n1) && !isNaN(n2) && n1 > 0 && n2 > 0;
  const g = hasInput ? gcd(n1, n2) : 1;
  const customResult = (
    !hasInput ? (
      <div className="text-sm text-[var(--text-muted)]">Enter numbers</div>
    ) : (
    <div className="text-center">
      <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{n1 / g} : {n2 / g}</div>
    </div>
    )
  );
  return (
    <CalculatorShell category="Calculator" title="Ratio Calculator" result="" auto presets={presets} accent="blue" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="lbl-ratiocalculator-first-number" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">First Number</label><input id="lbl-ratiocalculator-first-number" aria-label="First Number" type="number" value={num1} onChange={e => setNum1(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-ratiocalculator-second-number" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Second Number</label><input id="lbl-ratiocalculator-second-number" aria-label="Second Number" type="number" value={num2} onChange={e => setNum2(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
