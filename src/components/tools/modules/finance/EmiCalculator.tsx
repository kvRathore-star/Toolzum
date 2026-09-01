"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('10');
  const [tenure, setTenure] = useState('12');

  const p = parseFloat(principal);
  const r = parseFloat(rate) / 12 / 100;
  const n = parseFloat(tenure);
  const hasInput = !isNaN(p) && !isNaN(r) && !isNaN(n) && p > 0 && r > 0 && n > 0;

  let emiVal = 0, totalPay = 0, totalInt = 0;
  if (hasInput) {
    const factor = Math.pow(1 + r, n);
    emiVal = (p * r * factor) / (factor - 1);
    totalPay = emiVal * n;
    totalInt = totalPay - p;
  }

  const result = hasInput
    ? `Monthly EMI: $${emiVal.toFixed(2)} | Total Interest: $${totalInt.toFixed(2)} | Total Payment: $${totalPay.toFixed(2)}`
    : '';
  const resultStats = hasInput ? [
    { label: 'Monthly EMI', value: `$${emiVal.toFixed(2)}`, color: 'text-amber-700 dark:text-amber-400' },
    { label: 'Total Interest', value: `$${totalInt.toFixed(2)}`, color: 'text-amber-700 dark:text-amber-400' },
    { label: 'Total Payment', value: `$${totalPay.toFixed(2)}`, color: 'text-amber-700 dark:text-amber-400' },
  ] : undefined;

  const presets = [
    { label: '$100K, 10%, 12mo', apply: () => { setPrincipal('100000'); setRate('10'); setTenure('12'); } },
    { label: '$500K, 8%, 60mo', apply: () => { setPrincipal('500000'); setRate('8'); setTenure('60'); } },
    { label: '$1M, 7%, 120mo', apply: () => { setPrincipal('1000000'); setRate('7'); setTenure('120'); } },
  ];

  return (
    <CalculatorShell
      category="Finance"
      title="EMI Calculator"
      accent="amber"
      result={result}
      resultStats={resultStats}
      onCalculate={() => {}}
      calculateLabel="Calculate EMI"
      presets={presets}
      downloadData={result}
      downloadFilename="emi-calculation.txt"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Loan Amount ($)</label>
          <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Interest Rate (% p.a)</label>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Loan Tenure (Months)</label>
          <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} className={inputCls} />
        </div>
      </div>
    </CalculatorShell>
  );
}
