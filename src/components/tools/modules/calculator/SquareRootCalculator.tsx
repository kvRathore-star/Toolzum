"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Calculator } from 'lucide-react';
import { inputCls } from '../Calculators.shared';

export default function SquareRootCalculator() {
  const [number, setNumber] = useState('144');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const n = parseFloat(number) || 0;
    if (n < 0) { setResult('Cannot calculate square root of a negative number.'); return; }
    const sqrt = Math.sqrt(n);
    const cubeRoot = Math.cbrt(n);
    setResult(`\u221a${n} = ${sqrt.toFixed(6)}\n\u221b${n} = ${cubeRoot.toFixed(6)}\n${n} = ${sqrt.toFixed(4)}²`);
  }, [number]);
  const presets = [
    { label: '\u221a144', apply: () => { setNumber('144'); } },
    { label: '\u221a2', apply: () => { setNumber('2'); } },
    { label: '\u221a10000', apply: () => { setNumber('10000'); } },
  ];
  const n = parseFloat(number) || 0;
  const sqrt = Math.sqrt(Math.max(0, n));
  const customResult = result && n >= 0 ? (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">√{n}</div>
      <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{sqrt.toFixed(4)}</div>
    </div>
  ) : null;
  return (
    <CalculatorShell title="Square Root Calculator" icon={<Calculator className="w-5 h-5" />} result={result} onCalculate={calc} presets={presets} accent="sky" customResult={customResult}>
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Number</label><input type="number" value={number} onChange={e => setNumber(e.target.value)} className={inputCls} /></div>
    </CalculatorShell>
  );
}
