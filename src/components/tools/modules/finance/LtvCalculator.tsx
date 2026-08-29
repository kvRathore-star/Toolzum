"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function LtvCalculator() {
  const [arpu, setArpu] = useState('50');
  const [churn, setChurn] = useState('5');
  const [result, setResult] = useState('');
  const presets = [
    { label: 'SaaS', apply: () => { setArpu('50'); setChurn('5'); } },
    { label: 'Enterprise', apply: () => { setArpu('500'); setChurn('3'); } },
    { label: 'Consumer', apply: () => { setArpu('10'); setChurn('8'); } },
  ];
  const ltv = parseFloat(arpu) / (parseFloat(churn) / 100 || 0.01);
  return (
    <CalculatorShell title="LTV Calculator" result={result} auto presets={presets} accent="sky" customResult={
      result ? (
        <div className="text-center">
          <div className="text-xs text-[var(--text-tertiary)]">Customer Lifetime Value</div>
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">$${ltv.toFixed(0)}</div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">ARPU ($)</label><input type="number" value={arpu} onChange={e => setArpu(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Churn Rate (%)</label><input type="number" value={churn} onChange={e => setChurn(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
