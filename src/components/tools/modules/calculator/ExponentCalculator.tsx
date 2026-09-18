"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function ExponentCalculator() {
  const [base, setBase] = useState('2');
  const [exp, setExp] = useState('10');
  const presets = [
    { label: '2^10 (1024)', apply: () => { setBase('2'); setExp('10'); } },
    { label: '10^3 (1000)', apply: () => { setBase('10'); setExp('3'); } },
    { label: '5^4 (625)', apply: () => { setBase('5'); setExp('4'); } },
  ];
  const b = parseFloat(base);
  const e = parseFloat(exp);
  const hasInput = base.trim() !== '' && exp.trim() !== '' && Number.isFinite(b) && Number.isFinite(e);
  // Guard the display too: hasInput on raw strings let NaN/Infinity render
  // through toLocaleString. Non-finite results get a plain message.
  const val = hasInput ? Math.pow(b, e) : null;
  const valText = val === null ? '' : !Number.isFinite(val) ? 'Result too large to display' : val.toLocaleString();
  const customResult = (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">Result</div>
      {hasInput ? (
        <div className="text-xl font-bold text-[var(--accent)] font-mono break-all">{b}^{e} = {valText}</div>
      ) : (
        <div className="text-xl font-bold text-[var(--text-muted)] font-mono">Enter base and exponent</div>
      )}
    </div>
  );
  return (
    <CalculatorShell category="Calculator" title="Exponent Calculator" result="" auto presets={presets} accent="pink" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="lbl-exponentcalculator-base" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Base</label><input id="lbl-exponentcalculator-base" aria-label="Base" type="number" value={base} onChange={e => setBase(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-exponentcalculator-exponent" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Exponent</label><input id="lbl-exponentcalculator-exponent" aria-label="Exponent" type="number" value={exp} onChange={e => setExp(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
