"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function ChurnRateCalculator() {
  const [lost, setLost] = useState('50');
  const [total, setTotal] = useState('1000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const l = parseFloat(lost);
    const t = parseFloat(total);
    if (!t) return;
    const churn = (l / t) * 100;
    const retention = 100 - churn;
    const annualChurn = 100 - Math.pow(1 - churn / 100, 12) * 100;
    const avgLifetime = churn > 0 ? (1 / (churn / 100)) : Infinity;
    setResult(`Churn Rate: ${churn.toFixed(2)}%\nRetention Rate: ${retention.toFixed(2)}%\nAnnualized Churn: ${annualChurn.toFixed(2)}%\nAvg Customer Lifetime: ${avgLifetime === Infinity ? 'N/A' : avgLifetime.toFixed(1) + ' months'}\nCustomers Retained: ${Math.round(t - l)}`);
  }, [lost, total]);
  const presets = [
    { label: 'SaaS Avg', apply: () => { setLost('50'); setTotal('1000'); } },
    { label: 'High Churn', apply: () => { setLost('150'); setTotal('1000'); } },
    { label: 'Low Churn', apply: () => { setLost('25'); setTotal('1000'); } },
  ];
  const l = parseFloat(lost) || 0;
  const t = parseFloat(total) || 1;
  const churnPct = (l / t) * 100;
  return (
    <CalculatorShell title="Churn Rate Calculator" result={result} onCalculate={calc} presets={presets} accent="rose">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Customers Lost</label><input type="number" value={lost} onChange={e => setLost(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Customers</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
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
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">{(100 - churnPct).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${100 - Math.min(churnPct, 100)}%` }} />
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
