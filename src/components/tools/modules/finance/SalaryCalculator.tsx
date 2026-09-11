"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function SalaryCalculator() {
  const [ctc, setCtc] = useState('1200000');
  const [deductions, setDeductions] = useState('150000');

  const c = parseFloat(ctc) || 0;
  const d = parseFloat(deductions) || 0;
  const hasInput = c > 0;

  const calculateTax = (income: number, ded: number) => {
    const taxable = Math.max(0, income - ded);
    let tax = 0;
    if (taxable > 1500000) { tax += (taxable - 1500000) * 0.3 + 187500; }
    else if (taxable > 1200000) { tax += (taxable - 1200000) * 0.2 + 127500; }
    else if (taxable > 900000) { tax += (taxable - 900000) * 0.15 + 82500; }
    else if (taxable > 600000) { tax += (taxable - 600000) * 0.1 + 52500; }
    else if (taxable > 300000) { tax += (taxable - 300000) * 0.05; }
    return tax;
  };

  let tax = 0, netAnnual = 0, netMonthly = 0;
  if (hasInput) {
    tax = calculateTax(c, d);
    netAnnual = c - tax;
    netMonthly = netAnnual / 12;
  }

  const result = hasInput
    ? `CTC: ₹${c.toLocaleString('en-IN')} | Tax: ₹${Math.round(tax).toLocaleString('en-IN')} | Annual Take-Home: ₹${Math.round(netAnnual).toLocaleString('en-IN')} | Monthly: ₹${Math.round(netMonthly).toLocaleString('en-IN')}`
    : '';
  const resultStats = hasInput ? [
    { label: 'Income Tax', value: `₹${Math.round(tax).toLocaleString('en-IN')}`, color: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Annual Take-Home', value: `₹${Math.round(netAnnual).toLocaleString('en-IN')}`, color: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Monthly Net', value: `₹${Math.round(netMonthly).toLocaleString('en-IN')}/mo`, color: 'text-emerald-700 dark:text-emerald-400' },
  ] : undefined;

  const presets = [
    { label: '₹12L CTC, ₹1.5L ded', apply: () => { setCtc('1200000'); setDeductions('150000'); } },
    { label: '₹20L CTC, ₹2L ded', apply: () => { setCtc('2000000'); setDeductions('200000'); } },
    { label: '₹30L CTC, ₹3L ded', apply: () => { setCtc('3000000'); setDeductions('300000'); } },
  ];

  return (
    <CalculatorShell
      category="Finance"
      title="Salary Take-Home Calculator"
      accent="emerald"
      result={result}
      resultStats={resultStats}
      auto
      presets={presets}
      downloadData={result}
      downloadFilename="salary-breakdown.txt"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="lbl-salarycalculator-annual-ctc-salary" className={labelCls}>Annual CTC / Salary</label>
          <input id="lbl-salarycalculator-annual-ctc-salary" aria-label="Annual CTC / Salary" type="number" value={ctc} onChange={e => setCtc(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="lbl-salarycalculator-annual-deductions-80c" className={labelCls}>Annual Deductions / 80C</label>
          <input id="lbl-salarycalculator-annual-deductions-80c" aria-label="Annual Deductions / 80C" type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className={inputCls} />
        </div>
      </div>
    </CalculatorShell>
  );
}
