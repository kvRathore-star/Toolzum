"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function MrrCalculator() {
  const [customers, setCustomers] = useState('100');
  const [avgRevenue, setAvgRevenue] = useState('50');
  const presets = [
    { label: 'Early Stage', apply: () => { setCustomers('100'); setAvgRevenue('50'); } },
    { label: 'Growth Stage', apply: () => { setCustomers('1500'); setAvgRevenue('80'); } },
    { label: 'Enterprise', apply: () => { setCustomers('500'); setAvgRevenue('500'); } },
  ];
  const c = parseFloat(customers) || 0;
  const r = parseFloat(avgRevenue) || 0;
  const mrr = c * r;
  const result = c > 0 && r > 0 ? `$${mrr.toLocaleString()}` : '';
  return (
    <CalculatorShell category="Finance" title="MRR Calculator" result={result} auto presets={presets} accent="fuchsia" customResult={
      c > 0 && r > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3">
            <div className="text-lg font-bold text-[var(--accent)]">${mrr.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Monthly</div>
          </div>
          <div className="text-center p-3">
            <div className="text-lg font-bold text-[var(--accent)]">${(mrr * 12).toLocaleString()}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Annual</div>
          </div>
          <div className="text-center p-3">
            <div className="text-lg font-bold text-[var(--text-primary)]">${r.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">ARPU</div>
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="lbl-mrrcalculator-number-of-customers" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Number of Customers</label><input id="lbl-mrrcalculator-number-of-customers" aria-label="Number of Customers" type="number" value={customers} onChange={e => setCustomers(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-mrrcalculator-avg-revenue-customer" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Avg Revenue/Customer ($)</label><input id="lbl-mrrcalculator-avg-revenue-customer" aria-label="Avg Revenue/Customer ($)" type="number" value={avgRevenue} onChange={e => setAvgRevenue(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
