"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function MortgageCalculator() {
  const [loan, setLoan] = useState('300000');
  const [rate, setRate] = useState('6.5');
  const [years, setYears] = useState('30');
  const [result, setResult] = useState('');
  const [amort, setAmort] = useState<Array<{year: number; principal: number; interest: number; balance: number}>>([]);
  const calc = useCallback(() => {
    const p = parseFloat(loan);
    const annualRate = parseFloat(rate) / 100;
    const r = annualRate / 12;
    const n = parseFloat(years) * 12;
    if (!p || !r || !n) return;
    const pmt = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const total = pmt * n;
    const table: Array<{year: number; principal: number; interest: number; balance: number}> = [];
    let bal = p;
    for (let yr = 1; yr <= parseFloat(years); yr++) {
      let yrPrincipal = 0;
      let yrInterest = 0;
      for (let m = 0; m < 12; m++) {
        const intPart = bal * r;
        const prinPart = pmt - intPart;
        yrPrincipal += prinPart;
        yrInterest += intPart;
        bal -= prinPart;
      }
      if (bal < 0) bal = 0;
      table.push({ year: yr, principal: Math.round(yrPrincipal * 100) / 100, interest: Math.round(yrInterest * 100) / 100, balance: Math.round(bal * 100) / 100 });
    }
    setAmort(table);
    setResult(`Monthly Payment: $${pmt.toFixed(2)}\nTotal Payment: $${total.toFixed(2)}\nTotal Interest: $${(total - p).toFixed(2)}`);
  }, [loan, rate, years]);
  const presets = [
    { label: '30yr Fixed 6.5%', apply: () => { setLoan('300000'); setRate('6.5'); setYears('30'); } },
    { label: '15yr Fixed 5.5%', apply: () => { setLoan('300000'); setRate('5.5'); setYears('15'); } },
    { label: 'Jumbo 30yr', apply: () => { setLoan('750000'); setRate('6.75'); setYears('30'); } },
  ];
  const downloadData = result ? `Metric,Value\nMonthly Payment,$${result.split('\n')[0].split(': $')[1]}\nTotal Payment,$${result.split('\n')[1].split(': $')[1]}\nTotal Interest,$${result.split('\n')[2].split(': $')[1]}` : undefined;
  return (
    <CalculatorShell title="Mortgage Calculator" result={result} onCalculate={calc} presets={presets} downloadData={downloadData} downloadFilename="mortgage.csv" accent="indigo" customResult={
      amort.length > 0 ? (
        <div>
          <div className="px-4 py-2 border-b border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Amortization Schedule (Yearly)</div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--bg-overlay)]">
                <tr className="text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
                  <th className="text-left px-3 py-2">Year</th><th className="text-right px-3 py-2">Principal</th><th className="text-right px-3 py-2">Interest</th><th className="text-right px-3 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {amort.slice(0, 10).map(row => (
                  <tr key={row.year} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)]/50">
                    <td className="px-3 py-1.5 text-[var(--text-primary)] font-medium">{row.year}</td>
                    <td className="px-3 py-1.5 text-right text-green-700 dark:text-green-400">${row.principal.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-red-700 dark:text-red-400">${row.interest.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-[var(--text-secondary)]">${row.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
