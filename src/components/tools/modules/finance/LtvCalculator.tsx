"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function LtvCalculator() {
  const [arpu, setArpu] = useState('50');
  const [churn, setChurn] = useState('5');

  const hasInput = arpu.trim() !== '' && churn.trim() !== '';
  const a = parseFloat(arpu);
  const c = parseFloat(churn);
  // Churn of 0 (or blank) means infinite lifetime, not $5000 — the old
  // `|| 0.01` fallback silently computed on empty input. Show empty state.
  const valid = hasInput && Number.isFinite(a) && Number.isFinite(c) && a >= 0 && c > 0;
  const ltv = valid ? a / (c / 100) : 0;
  const ltvFormatted = valid && ltv > 0 ? `$${ltv.toFixed(0)}` : '';

  const presets = [
    { label: 'SaaS', apply: () => { setArpu('50'); setChurn('5'); } },
    { label: 'Enterprise', apply: () => { setArpu('500'); setChurn('3'); } },
    { label: 'Consumer', apply: () => { setArpu('10'); setChurn('8'); } },
  ];

  return (
    <CalculatorShell category="Finance" title="LTV Calculator" result={ltvFormatted} auto presets={presets} accent="sky" customResult={
      valid && ltv > 0 ? (
        <div className="text-center">
          <div className="text-xs text-[var(--text-tertiary)]">Customer Lifetime Value</div>
          <div className="text-lg font-bold text-[var(--accent)]">${ltv.toFixed(0)}</div>
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
