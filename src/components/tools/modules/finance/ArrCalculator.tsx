"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function ArrCalculator() {
  const [subRev, setSubRev] = useState('100000');
  const [expRev, setExpRev] = useState('20000');
  const [churnRev, setChurnRev] = useState('5000');

  const hasInput = subRev !== '' && expRev !== '' && churnRev !== '';
  let arr = 0;
  let maxVal = 1;
  let bars: Array<{label: string; value: number; color: string}> = [];
  let result = '';
  if (hasInput) {
    const s = parseFloat(subRev) || 0;
    const e = parseFloat(expRev) || 0;
    const c = parseFloat(churnRev) || 0;
    arr = s + e - c;
    maxVal = Math.max(1, s + e);
    result = `$${arr.toLocaleString()} ARR`;
    bars = [
      { label: 'Subscriptions', value: s, color: 'bg-indigo-500' },
      { label: 'Expansion', value: e, color: 'bg-emerald-700' },
      { label: 'Churn', value: -c, color: 'bg-red-500' },
    ];
  }

  const presets = [
    { label: 'SaaS Startup', apply: () => { setSubRev('50000'); setExpRev('10000'); setChurnRev('3000'); } },
    { label: 'Enterprise', apply: () => { setSubRev('500000'); setExpRev('100000'); setChurnRev('25000'); } },
    { label: 'Hypergrowth', apply: () => { setSubRev('200000'); setExpRev('80000'); setChurnRev('5000'); } },
  ];

  return (
    <CalculatorShell category="Finance" title="ARR Calculator" result={result} auto presets={presets} accent="blue">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Subscription Revenue ($)</label><input type="number" value={subRev} onChange={e => setSubRev(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Expansion Revenue ($)</label><input type="number" value={expRev} onChange={e => setExpRev(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Churn Revenue ($)</label><input type="number" value={churnRev} onChange={e => setChurnRev(e.target.value)} className={inputCls} /></div>
      </div>
      <div className="space-y-2">
        {hasInput && bars.map(bar => (
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
    </CalculatorShell>
  );
}
