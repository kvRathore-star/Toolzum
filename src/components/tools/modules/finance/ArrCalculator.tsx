"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function ArrCalculator() {
  const [subRev, setSubRev] = useState('100000');
  const [expRev, setExpRev] = useState('20000');
  const [churnRev, setChurnRev] = useState('5000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const sub = parseFloat(subRev) || 0;
    const exp = parseFloat(expRev) || 0;
    const churn = parseFloat(churnRev) || 0;
    const netNew = exp - churn;
    const arr = sub + exp - churn;
    setResult(`ARR: $${arr.toLocaleString()}\nSubscriptions: $${sub.toLocaleString()}\nExpansion: $${exp.toLocaleString()}\nChurn: -$${churn.toLocaleString()}\nNet New: $${netNew.toLocaleString()}`);
  }, [subRev, expRev, churnRev]);
  const presets = [
    { label: 'SaaS Startup', apply: () => { setSubRev('50000'); setExpRev('10000'); setChurnRev('3000'); } },
    { label: 'Enterprise', apply: () => { setSubRev('500000'); setExpRev('100000'); setChurnRev('25000'); } },
    { label: 'Hypergrowth', apply: () => { setSubRev('200000'); setExpRev('80000'); setChurnRev('5000'); } },
  ];
  const netNew = (parseFloat(expRev) || 0) - (parseFloat(churnRev) || 0);
  const arr = (parseFloat(subRev) || 0) + (parseFloat(expRev) || 0) - (parseFloat(churnRev) || 0);
  const maxVal = Math.max(1, (parseFloat(subRev) || 0) + (parseFloat(expRev) || 0));
  return (
    <CalculatorShell title="ARR Calculator" result={result} onCalculate={calc} presets={presets} accent="blue">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Subscription Revenue ($)</label><input type="number" value={subRev} onChange={e => setSubRev(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Expansion Revenue ($)</label><input type="number" value={expRev} onChange={e => setExpRev(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Churn Revenue ($)</label><input type="number" value={churnRev} onChange={e => setChurnRev(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          {[
            { label: 'Subscriptions', value: parseFloat(subRev) || 0, color: 'bg-indigo-500' },
            { label: 'Expansion', value: parseFloat(expRev) || 0, color: 'bg-emerald-700' },
            { label: 'Churn', value: -(parseFloat(churnRev) || 0), color: 'bg-red-500' },
          ].map(bar => (
            <div key={bar.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">{bar.label}</span>
                <span className="text-[var(--text-primary)] font-medium">${bar.value.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${bar.color}`} style={{ width: `${Math.abs(bar.value) / maxVal * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-[var(--text-primary)]">ARR</span>
              <span className="text-indigo-700 dark:text-indigo-400">${arr.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
