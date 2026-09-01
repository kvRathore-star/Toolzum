"use client";
import { useState, useMemo } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function DebtPayoffCalculator() {
  const [balance, setBalance] = useState('10000');
  const [rate, setRate] = useState('18');
  const [payment, setPayment] = useState('500');
  const presets = [
    { label: 'Credit Card', apply: () => { setBalance('10000'); setRate('18'); setPayment('500'); } },
    { label: 'Student Loan', apply: () => { setBalance('35000'); setRate('5.5'); setPayment('400'); } },
    { label: 'Personal Loan', apply: () => { setBalance('15000'); setRate('10'); setPayment('350'); } },
  ];
  const { payoffMonths, result } = useMemo(() => {
    const b = parseFloat(balance) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const p = parseFloat(payment) || 0;
    let payoffMonths = 0;
    if (b && p && p > b * r) {
      let rem = b;
      while (rem > 0 && payoffMonths < 600) {
        const intPart = rem * r;
        rem -= Math.min(p - intPart, rem);
        payoffMonths++;
      }
    }
    const result = payoffMonths > 0 ? `${payoffMonths} months` : '';
    return { payoffMonths, result };
  }, [balance, rate, payment]);
  return (
    <CalculatorShell category="Finance" title="Debt Payoff Calculator" result={result} auto presets={presets} accent="orange" customResult={
      payoffMonths > 0 ? (
        <div>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-tertiary)]">Payoff Timeline</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">{payoffMonths} months ({Math.floor(payoffMonths / 12)} yr {payoffMonths % 12} mo)</span>
            </div>
            <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden relative">
              {[25, 50, 75, 100].map(pct => (
                <div key={pct} className="absolute top-0 h-full w-px bg-[var(--border-subtle)]" style={{ left: `${pct}%` }} />
              ))}
              <div className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
            </div>
            <div className="flex justify-between text-xs mt-1 text-[var(--text-tertiary)]">
              <span>Month 0</span>
              <span>Month {payoffMonths}</span>
            </div>
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Current Balance ($)</label><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Monthly Payment ($)</label><input type="number" value={payment} onChange={e => setPayment(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
