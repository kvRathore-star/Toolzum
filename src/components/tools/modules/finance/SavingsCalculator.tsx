"use client";
import { useState, useMemo } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function SavingsCalculator() {
  const [initial, setInitial] = useState('10000');
  const [monthly, setMonthly] = useState('500');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');
  const [compoundsPerYear, setCompoundsPerYear] = useState('12');
  const schedule = useMemo(() => {
    const i0 = parseFloat(initial) || 0;
    const m = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const y = parseInt(years) || 0;
    const n = parseInt(compoundsPerYear) || 12;
    const rows: Array<{year: number; balance: number; contributions: number; interest: number}> = [];
    let balance = i0;
    let totalContributions = i0;
    let totalInterest = 0;
    for (let yr = 1; yr <= y; yr++) {
      for (let period = 0; period < n; period++) {
        const interest = balance * (r / n);
        balance += interest;
        totalInterest += interest;
        const periodContrib = m * (12 / n);
        balance += periodContrib;
        totalContributions += periodContrib;
      }
      rows.push({ year: yr, balance: Math.round(balance), contributions: Math.round(totalContributions), interest: Math.round(totalInterest) });
    }
    return rows;
  }, [initial, monthly, rate, years, compoundsPerYear]);
  const presets = [
    { label: '20yr retirement', apply: () => { setInitial('10000'); setMonthly('500'); setRate('7'); setYears('20'); } },
    { label: '30yr max', apply: () => { setInitial('0'); setMonthly('1000'); setRate('8'); setYears('30'); } },
  ];

  return (
    <CalculatorShell category="Finance" title="Savings Calculator" accent="emerald" result={`${schedule.length} years`} auto presets={presets} customResult={
      schedule.length > 0 ? (
        <div className="overflow-hidden max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[var(--bg-overlay)]"><tr className="text-[var(--text-tertiary)]"><th className="text-left px-3 py-2">Year</th><th className="text-right px-3 py-2">Balance</th><th className="text-right px-3 py-2">Contributions</th><th className="text-right px-3 py-2">Interest</th></tr></thead>
            <tbody>{schedule.map(r => <tr key={r.year} className="border-b border-[var(--border-subtle)]"><td className="px-3 py-1.5 text-[var(--text-primary)]">{r.year}</td><td className="px-3 py-1.5 text-right text-[var(--accent)]">${r.balance.toLocaleString()}</td><td className="px-3 py-1.5 text-right text-[var(--text-secondary)]">${r.contributions.toLocaleString()}</td><td className="px-3 py-1.5 text-right text-[var(--accent)]">${r.interest.toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="lbl-savingscalculator-initial-deposit" className={labelCls}>Initial deposit ($)</label><input id="lbl-savingscalculator-initial-deposit" aria-label="Initial deposit ($)" className={inputCls} type="number" value={initial} onChange={e => setInitial(e.target.value)} /></div>
        <div><label htmlFor="lbl-savingscalculator-monthly-contribution" className={labelCls}>Monthly contribution ($)</label><input id="lbl-savingscalculator-monthly-contribution" aria-label="Monthly contribution ($)" className={inputCls} type="number" value={monthly} onChange={e => setMonthly(e.target.value)} /></div>
        <div><label htmlFor="lbl-savingscalculator-annual-rate" className={labelCls}>Annual rate (%)</label><input id="lbl-savingscalculator-annual-rate" aria-label="Annual rate (%)" className={inputCls} type="number" value={rate} onChange={e => setRate(e.target.value)} /></div>
        <div><label htmlFor="lbl-savingscalculator-time-years" className={labelCls}>Time (years)</label><input id="lbl-savingscalculator-time-years" aria-label="Time (years)" className={inputCls} type="number" value={years} onChange={e => setYears(e.target.value)} /></div>
        <div><label htmlFor="lbl-savingscalculator-compounds-year" className={labelCls}>Compounds / year</label><select id="lbl-savingscalculator-compounds-year" aria-label="Compounds / year" className={inputCls} value={compoundsPerYear} onChange={e => setCompoundsPerYear(e.target.value)}><option value="1">Annual</option><option value="2">Semi-annual</option><option value="4">Quarterly</option><option value="12">Monthly</option><option value="365">Daily</option></select></div>
      </div>
    </CalculatorShell>
  );
}
