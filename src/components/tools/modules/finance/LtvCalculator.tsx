"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function LtvCalculator() {
  const [arpu, setArpu] = useState('50');
  const [churn, setChurn] = useState('5');

  const a = parseFloat(arpu) || 0;
  const c = parseFloat(churn) || 0.01;
  const ltv = a / (c / 100);
  const ltvFormatted = ltv > 0 ? `$${ltv.toFixed(0)}` : '';

  const presets = [
    { label: 'SaaS', apply: () => { setArpu('50'); setChurn('5'); } },
    { label: 'Enterprise', apply: () => { setArpu('500'); setChurn('3'); } },
    { label: 'Consumer', apply: () => { setArpu('10'); setChurn('8'); } },
  ];

  return (
    <CalculatorShell category="Finance" title="LTV Calculator" result={ltvFormatted} auto presets={presets} accent="sky" customResult={
      ltv > 0 ? (
        <div className="text-center">
          <div className="text-xs text-[var(--text-tertiary)]">Customer Lifetime Value</div>
          <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">${ltv.toFixed(0)}</div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="lbl-ltvcalculator-arpu" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">ARPU ($)</label><input id="lbl-ltvcalculator-arpu" aria-label="ARPU ($)" type="number" value={arpu} onChange={e => setArpu(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-ltvcalculator-churn-rate" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Churn Rate (%)</label><input id="lbl-ltvcalculator-churn-rate" aria-label="Churn Rate (%)" type="number" value={churn} onChange={e => setChurn(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
