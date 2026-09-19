"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState('30');
  const [retireAge, setRetireAge] = useState('65');
  const [savings, setSavings] = useState('50000');
  const [monthly, setMonthly] = useState('1000');
  const [rate, setRate] = useState('7');
  const presets = [
    { label: 'Start Late (40)', apply: () => { setCurrentAge('40'); setRetireAge('65'); setSavings('100000'); setMonthly('2000'); setRate('7'); } },
    { label: 'Early Start (25)', apply: () => { setCurrentAge('25'); setRetireAge('60'); setSavings('10000'); setMonthly('1000'); setRate('8'); } },
    { label: 'Aggressive', apply: () => { setCurrentAge('30'); setRetireAge('55'); setSavings('50000'); setMonthly('3000'); setRate('9'); } },
  ];
  const yrs = Math.max(1, parseFloat(retireAge) - parseFloat(currentAge));
  const r = (parseFloat(rate) || 0) / 100 / 12;
  const n = yrs * 12;
  const pv = parseFloat(savings) || 0;
  const pmt = parseFloat(monthly) || 0;
  const fv = pv * Math.pow(1 + r, n) + pmt * (Math.pow(1 + r, n) - 1) / (r || 0.0001);
  const totalContrib = pv + pmt * n;
  const growth = fv - totalContrib;
  const growthPct = totalContrib > 0 ? (growth / totalContrib) * 100 : 0;
  const result = parseFloat(retireAge) > parseFloat(currentAge)
    ? `Total at Retirement: $${fv.toLocaleString()}\nTotal Contributions: $${totalContrib.toLocaleString()}\nInvestment Growth: $${growth.toLocaleString()}\nYears Saving: ${yrs}\n4% Monthly Withdrawal: $${(fv * 0.04 / 12).toLocaleString()}`
    : 'Retirement age must be greater than current age.';
  return (
    <CalculatorShell category="Finance" title="Retirement Calculator" result={result} auto presets={presets} accent="indigo" customResult={
      parseFloat(retireAge) > parseFloat(currentAge) ? (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-xs text-[var(--text-tertiary)]">Retirement Nest Egg</div>
            <div className="text-lg font-bold text-[var(--accent)]">${fv.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-2 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Contributions</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${totalContrib.toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-2 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Growth</div>
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">${growth.toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-2 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Growth %</div>
              <div className="text-sm font-bold text-[var(--accent)]">{growthPct.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-4">
          <div className="flex-1"><label htmlFor="lbl-retirementcalculator-current-age" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Current Age</label><input id="lbl-retirementcalculator-current-age" aria-label="Current Age" type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} className={inputCls} /></div>
          <div className="flex-1"><label htmlFor="lbl-retirementcalculator-retire-age" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Retire Age</label><input id="lbl-retirementcalculator-retire-age" aria-label="Retire Age" type="number" value={retireAge} onChange={e => setRetireAge(e.target.value)} className={inputCls} /></div>
        </div>
        <div><label htmlFor="lbl-retirementcalculator-current-savings" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Current Savings ($)</label><input id="lbl-retirementcalculator-current-savings" aria-label="Current Savings ($)" type="number" value={savings} onChange={e => setSavings(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-retirementcalculator-monthly-contribution" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Monthly Contribution ($)</label><input id="lbl-retirementcalculator-monthly-contribution" aria-label="Monthly Contribution ($)" type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-retirementcalculator-annual-return" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Annual Return (%)</label><input id="lbl-retirementcalculator-annual-return" aria-label="Annual Return (%)" type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
