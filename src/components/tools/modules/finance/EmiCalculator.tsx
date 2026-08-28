"use client";
import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { CalculatorShell } from '../shared/CalculatorShell';

const labelCls = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";
const inputCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('10');
  const [tenure, setTenure] = useState('12');

  const presets = [
    { label: '$100K, 10%, 12mo', apply: () => { setPrincipal('100000'); setRate('10'); setTenure('12'); } },
    { label: '$500K, 8%, 60mo', apply: () => { setPrincipal('500000'); setRate('8'); setTenure('60'); } },
    { label: '$1M, 7%, 120mo', apply: () => { setPrincipal('1000000'); setRate('7'); setTenure('120'); } },
  ];

  const calc = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure);

    if (!p || !r || !n) return '';

    const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emiValue * n;
    const totalInterest = totalPay - p;

    return `Monthly EMI: $${emiValue.toFixed(2)} | Total Interest: $${totalInterest.toFixed(2)} | Total Payment: $${totalPay.toFixed(2)}`;
  };

  const result = calc();

  const resultStats = (() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure);
    if (!p || !r || !n) return [];
    const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emiValue * n;
    const totalInterest = totalPay - p;
    return [
      { label: 'Monthly EMI', value: `$${emiValue.toFixed(2)}`, color: 'text-amber-500' },
      { label: 'Total Interest', value: `$${totalInterest.toFixed(2)}` },
      { label: 'Total Payment', value: `$${totalPay.toFixed(2)}` },
    ];
  })();

  const csvData = (() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure);
    if (!p || !r || !n) return '';
    const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emiValue * n;
    const totalInterest = totalPay - p;
    return `Loan Amount,$${p.toFixed(2)}\nInterest Rate,${rate}% p.a.\nTenure,${tenure} months\nMonthly EMI,$${emiValue.toFixed(2)}\nTotal Interest,$${totalInterest.toFixed(2)}\nTotal Payment,$${totalPay.toFixed(2)}`;
  })();

  return (
    <CalculatorShell
      title="EMI Calculator"
      icon={<DollarSign className="w-5 h-5" />}
      result={result}
      onCalculate={calc}
      calculateLabel="Calculate EMI"
      presets={presets}
      resultStats={resultStats}
      resultLabel="Monthly EMI"
      accent="amber"
      downloadData={csvData}
      downloadFilename="emi-calculation.csv"
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Loan Amount ($)</label>
          <input
            type="number"
            value={principal}
            onChange={e => setPrincipal(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Interest Rate (% p.a)</label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Loan Tenure (Months)</label>
          <input
            type="number"
            value={tenure}
            onChange={e => setTenure(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </CalculatorShell>
  );
}
