"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [n, setN] = useState('12');
  const [t, setT] = useState('10');
  const P = parseFloat(principal);
  const r = parseFloat(rate) / 100;
  const nPerYear = parseFloat(n);
  const years = parseFloat(t);
  const A = P && r && nPerYear && years ? P * Math.pow(1 + r / nPerYear, nPerYear * years) : 0;
  const yearData = P && r && nPerYear && years ? Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    const val = P * Math.pow(1 + r / nPerYear, nPerYear * y);
    return { year: y, value: Math.round(val * 100) / 100, deposited: P, interest: Math.round((val - P) * 100) / 100 };
  }) : [];
  const result = A > 0 ? `Final Amount: $${A.toFixed(2)}\nTotal Interest: $${(A - P).toFixed(2)}\nEffective Rate: ${((A / P) ** (1 / years) - 1).toFixed(2)}%` : '';
  const presets = [
    { label: 'S&P Avg (10yr)', apply: () => { setPrincipal('10000'); setRate('10'); setN('1'); setT('10'); } },
    { label: 'Monthly Save (5yr)', apply: () => { setPrincipal('5000'); setRate('7'); setN('12'); setT('5'); } },
    { label: 'Retirement (30yr)', apply: () => { setPrincipal('50000'); setRate('8'); setN('12'); setT('30'); } },
  ];
  const maxVal = yearData.length > 0 ? yearData[yearData.length - 1].value : 1;
  return (
    <CalculatorShell title="Compound Interest Calculator" result={result} auto presets={presets} accent="emerald" customResult={
      yearData.length > 0 ? (
        <div>
          <div className="px-4 py-2 border-b border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Year-by-Year Growth</div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--bg-overlay)]">
                <tr className="text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
                  <th className="text-left px-3 py-2">Year</th><th className="text-right px-3 py-2">Value</th><th className="text-right px-3 py-2">Interest</th><th className="text-right px-3 py-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {yearData.map(row => (
                  <tr key={row.year} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)]/50">
                    <td className="px-3 py-1.5 text-[var(--text-primary)] font-medium">{row.year}</td>
                    <td className="px-3 py-1.5 text-right text-indigo-700 dark:text-indigo-400 font-medium">${row.value.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-emerald-700 dark:text-emerald-400">${row.interest.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(row.value / maxVal) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Principal ($)</label><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Annual Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Compounds/Yr</label><input type="number" value={n} onChange={e => setN(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Years</label><input type="number" value={t} onChange={e => setT(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
