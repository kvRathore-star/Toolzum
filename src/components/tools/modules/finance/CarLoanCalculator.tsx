"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function CarLoanCalculator() {
  const [loan, setLoan] = useState('35000');
  const [rate, setRate] = useState('4.5');
  const [years, setYears] = useState('5');
  const presets = [
    { label: 'New Car 5yr', apply: () => { setLoan('35000'); setRate('4.5'); setYears('5'); } },
    { label: 'Used Car 3yr', apply: () => { setLoan('18000'); setRate('6.0'); setYears('3'); } },
    { label: 'Luxury 6yr', apply: () => { setLoan('65000'); setRate('5.0'); setYears('6'); } },
  ];
  const r = parseFloat(rate) / 100 / 12;
  const n = parseFloat(years) * 12;
  const p = parseFloat(loan);
  const pmt = p && r ? p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : 0;
  const result = pmt > 0 ? `$${pmt.toFixed(0)}/mo` : '';
  return (
    <CalculatorShell title="Car Loan Calculator" result={result} auto presets={presets} accent="violet" customResult={
      pmt > 0 ? (
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">${pmt.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">per month</div>
          </div>
          <div className="h-12 w-px bg-[var(--border-subtle)]" />
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--text-primary)]">${(pmt * n).toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">total paid</div>
          </div>
          <div className="h-12 w-px bg-[var(--border-subtle)]" />
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">${(pmt * n - p).toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">total interest</div>
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Loan Amount ($)</label><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Loan Term (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
