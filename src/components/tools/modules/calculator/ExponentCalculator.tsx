"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Calculator } from 'lucide-react';
import { inputCls } from '../Calculators.shared';

export default function ExponentCalculator() {
  const [base, setBase] = useState('2');
  const [exp, setExp] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const b = parseFloat(base) || 0;
    const e = parseFloat(exp) || 0;
    const val = Math.pow(b, e);
    const log10 = Math.log10(val);
    setResult(`${b}^${e} = ${val.toLocaleString()}\nScientific: ${val.toExponential(4)}\nLog10: ${log10.toFixed(4)}`);
  }, [base, exp]);
  const presets = [
    { label: '2^10 (1024)', apply: () => { setBase('2'); setExp('10'); } },
    { label: '10^3 (1000)', apply: () => { setBase('10'); setExp('3'); } },
    { label: '5^4 (625)', apply: () => { setBase('5'); setExp('4'); } },
  ];
  const b = parseFloat(base) || 0;
  const e = parseFloat(exp) || 0;
  const val = Math.pow(b, e);
  const customResult = result ? (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">Result</div>
      <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400 font-mono break-all">{b}^{e} = {val.toLocaleString()}</div>
    </div>
  ) : null;
  return (
    <CalculatorShell title="Exponent Calculator" icon={<Calculator className="w-5 h-5" />} result={result} onCalculate={calc} presets={presets} accent="pink" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Base</label><input type="number" value={base} onChange={e => setBase(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Exponent</label><input type="number" value={exp} onChange={e => setExp(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
