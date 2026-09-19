"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function ChurnRateCalculator() {
  const [lost, setLost] = useState('50');
  const [total, setTotal] = useState('1000');

  const hasInput = lost !== '' && total !== '';
  let churnPct = 0;
  let retentionPct = 100;
  let annualChurn = 0;
  let avgLifetime: number = Infinity;
  let retained = 0;
  let result = '';
  let csvData = '';
  if (hasInput) {
    const l = parseFloat(lost) || 0;
    const t = parseFloat(total) || 1;
    churnPct = (l / t) * 100;
    retentionPct = 100 - churnPct;
    annualChurn = 100 - Math.pow(1 - churnPct / 100, 12) * 100;
    avgLifetime = churnPct > 0 ? (1 / (churnPct / 100)) : Infinity;
    retained = Math.round(t - l);

    result = `Churn Rate: ${churnPct.toFixed(2)}% | Retention: ${retentionPct.toFixed(2)}% | Annualized: ${annualChurn.toFixed(2)}% | Avg Lifetime: ${avgLifetime === Infinity ? 'N/A' : avgLifetime.toFixed(1) + ' months'} | Retained: ${retained}`;
    csvData = `Metric,Value\nChurn Rate,${churnPct.toFixed(2)}%\nRetention Rate,${retentionPct.toFixed(2)}%\nAnnualized Churn,${annualChurn.toFixed(2)}%\nAvg Customer Lifetime,${avgLifetime === Infinity ? 'N/A' : avgLifetime.toFixed(1) + ' months'}\nCustomers Lost,${l}\nTotal Customers,${t}\nCustomers Retained,${retained}`;
  }

  const presets = [
    { label: 'SaaS Avg', apply: () => { setLost('50'); setTotal('1000'); } },
    { label: 'High Churn', apply: () => { setLost('150'); setTotal('1000'); } },
    { label: 'Low Churn', apply: () => { setLost('25'); setTotal('1000'); } },
  ];

  return (
    <CalculatorShell category="Finance" title="Churn Rate Calculator" result={result} auto presets={presets} accent="rose" downloadData={csvData} downloadFilename="churn-rate.csv">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="lbl-churnratecalculator-customers-lost" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Customers Lost</label><input id="lbl-churnratecalculator-customers-lost" aria-label="Customers Lost" type="number" value={lost} onChange={e => setLost(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-churnratecalculator-total-customers" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Customers</label><input id="lbl-churnratecalculator-total-customers" aria-label="Total Customers" type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputCls} /></div>
      </div>
      {hasInput && (
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--text-secondary)]">Churn</span>
            <span className="text-red-700 dark:text-red-400 font-medium">{churnPct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(churnPct, 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--text-secondary)]">Retention</span>
            <span className="text-[var(--accent)] font-medium">{retentionPct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${retentionPct}%` }} />
          </div>
        </div>
      </div>
      )}
    </CalculatorShell>
  );
}
