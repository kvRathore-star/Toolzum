"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function SavingsCalculator() {
  const [initial, setInitial] = useState('10000');
  const [monthly, setMonthly] = useState('500');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');
  const [compoundsPerYear, setCompoundsPerYear] = useState('12');
  const [result, setResult] = useState('');
  const [schedule, setSchedule] = useState<Array<{year: number; balance: number; contributions: number; interest: number}>>([]);
  const calc = useCallback(() => {
    const p = parseFloat(initial) || 0;
    const m = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const y = parseFloat(years) || 0;
    const n = parseFloat(compoundsPerYear) || 12;
    if (!r && !y) { setResult(''); return; }
    const periodicRate = r / n;
    const totalPeriods = y * n;
    const future = p * Math.pow(1 + periodicRate, totalPeriods) + m * (Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate;
    const totalContributions = p + m * y * 12;
    const totalInterest = future - totalContributions;
    const sched: Array<{year: number; balance: number; contributions: number; interest: number}> = [];
    for (let yr = 1; yr <= y; yr++) {
      const per = yr * n;
      const bal = p * Math.pow(1 + periodicRate, per) + m * (Math.pow(1 + periodicRate, per) - 1) / periodicRate;
      const contribs = p + m * yr * 12;
      sched.push({ year: yr, balance: Math.round(bal * 100) / 100, contributions: Math.round(contribs * 100) / 100, interest: Math.round((bal - contribs) * 100) / 100 });
    }
    setSchedule(sched);
    setResult(`Future value: $${future.toFixed(2)}\nTotal contributions: $${totalContributions.toFixed(2)}\nTotal interest: $${totalInterest.toFixed(2)}`);
  }, [initial, monthly, rate, years, compoundsPerYear]);
  return (
    <CalculatorShell title="Savings Calculator" accent="emerald" result={result} onCalculate={calc} customResult={
      schedule.length > 0 ? (
        <div className="overflow-hidden max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[var(--bg-overlay)]"><tr className="text-[var(--text-tertiary)]"><th className="text-left px-3 py-2">Year</th><th className="text-right px-3 py-2">Balance</th><th className="text-right px-3 py-2">Contributions</th><th className="text-right px-3 py-2">Interest</th></tr></thead>
            <tbody>{schedule.map(r => <tr key={r.year} className="border-b border-[var(--border-subtle)]"><td className="px-3 py-1.5 text-[var(--text-primary)]">{r.year}</td><td className="px-3 py-1.5 text-right text-emerald-700 dark:text-emerald-400">${r.balance.toLocaleString()}</td><td className="px-3 py-1.5 text-right text-[var(--text-secondary)]">${r.contributions.toLocaleString()}</td><td className="px-3 py-1.5 text-right text-amber-700 dark:text-amber-400">${r.interest.toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Initial deposit ($)</label><input className={inputCls} type="number" value={initial} onChange={e => setInitial(e.target.value)} /></div>
        <div><label className={labelCls}>Monthly contribution ($)</label><input className={inputCls} type="number" value={monthly} onChange={e => setMonthly(e.target.value)} /></div>
        <div><label className={labelCls}>Annual rate (%)</label><input className={inputCls} type="number" value={rate} onChange={e => setRate(e.target.value)} /></div>
        <div><label className={labelCls}>Time (years)</label><input className={inputCls} type="number" value={years} onChange={e => setYears(e.target.value)} /></div>
        <div><label className={labelCls}>Compounds / year</label><select className={inputCls} value={compoundsPerYear} onChange={e => setCompoundsPerYear(e.target.value)}><option value="1">Annual</option><option value="2">Semi-annual</option><option value="4">Quarterly</option><option value="12">Monthly</option><option value="365">Daily</option></select></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setInitial('10000'); setMonthly('500'); setRate('7'); setYears('20'); }}>20yr retirement</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setInitial('0'); setMonthly('1000'); setRate('8'); setYears('30'); }}>30yr max</button>
      </div>
    </CalculatorShell>
  );
}
