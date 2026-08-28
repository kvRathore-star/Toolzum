"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function MrrCalculator() {
  const [customers, setCustomers] = useState('100');
  const [avgRevenue, setAvgRevenue] = useState('50');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const c = parseFloat(customers) || 0;
    const r = parseFloat(avgRevenue) || 0;
    const mrr = c * r;
    const arr = mrr * 12;
    setResult(`MRR: $${mrr.toLocaleString()}\nARR: $${arr.toLocaleString()}\nCustomers: ${c}\nARPU: $${r.toFixed(2)}/mo`);
  }, [customers, avgRevenue]);
  const presets = [
    { label: 'Early Stage', apply: () => { setCustomers('100'); setAvgRevenue('50'); } },
    { label: 'Growth Stage', apply: () => { setCustomers('1500'); setAvgRevenue('80'); } },
    { label: 'Enterprise', apply: () => { setCustomers('500'); setAvgRevenue('500'); } },
  ];
  const c = parseFloat(customers) || 0;
  const r = parseFloat(avgRevenue) || 0;
  const mrr = c * r;
  return (
    <CalculatorShell title="MRR Calculator" result={result} onCalculate={calc} presets={presets} accent="fuchsia" customResult={
      result ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3">
            <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">${mrr.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Monthly</div>
          </div>
          <div className="text-center p-3">
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">${(mrr * 12).toLocaleString()}</div>
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
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Number of Customers</label><input type="number" value={customers} onChange={e => setCustomers(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Avg Revenue/Customer ($)</label><input type="number" value={avgRevenue} onChange={e => setAvgRevenue(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
