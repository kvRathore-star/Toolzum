"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function RentVsBuyCalculator() {
  const [homePrice, setHomePrice] = useState('400000');
  const [downPayment, setDownPayment] = useState('80000');
  const [mortgageRate, setMortgageRate] = useState('6.5');
  const [rent, setRent] = useState('2000');
  const [years, setYears] = useState('5');
  const presets = [
    { label: 'HCOL 5yr', apply: () => { setHomePrice('700000'); setDownPayment('140000'); setMortgageRate('6.5'); setRent('3000'); setYears('5'); } },
    { label: 'MCOL 7yr', apply: () => { setHomePrice('400000'); setDownPayment('80000'); setMortgageRate('6.0'); setRent('1800'); setYears('7'); } },
    { label: 'LCOL 3yr', apply: () => { setHomePrice('250000'); setDownPayment('50000'); setMortgageRate('5.5'); setRent('1200'); setYears('3'); } },
  ];
  const hp = parseFloat(homePrice) || 0;
  const dp = parseFloat(downPayment) || 0;
  const mr = (parseFloat(mortgageRate) || 0) / 100 / 12;
  const term = parseFloat(years) || 0;
  const monthlyRent = parseFloat(rent) || 0;
  const n = term * 12;
  const pmt = (hp - dp) > 0 && mr > 0 ? (hp - dp) * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1) : 0;
  const totalMortgage = pmt * n;
  const buyNet = totalMortgage + dp - hp * 0.03 * term;
  const rentTotal = monthlyRent * 12 * term;
  const buyPct = buyNet + rentTotal > 0 ? buyNet / (buyNet + rentTotal) * 100 : 50;
  const result = hp && term
    ? `Buy Net Cost: $${buyNet.toFixed(0)}\nRent Total: $${rentTotal.toFixed(0)}\nDifference: $${Math.abs(buyNet - rentTotal).toFixed(0)} ${(buyNet - rentTotal) < 0 ? '(Buy cheaper)' : '(Rent cheaper)'}\nMonthly Mortgage: $${pmt.toFixed(0)} vs Rent: $${monthlyRent.toFixed(0)}`
    : '';
  return (
    <CalculatorShell category="Finance" title="Rent vs Buy Calculator" result={result} auto presets={presets} accent="green" customResult={
      hp && term ? (
        <div className="space-y-3">
          <div className="flex h-20 gap-3">
            <div className="flex-1 p-3 flex flex-col justify-center items-center">
              <div className="text-xs text-[var(--text-tertiary)]">Buy Net Cost</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">${buyNet.toFixed(0)}</div>
            </div>
            <div className="flex-1 p-3 flex flex-col justify-center items-center">
              <div className="text-xs text-[var(--text-tertiary)]">Rent Total</div>
              <div className="text-xl font-bold text-amber-700 dark:text-amber-400">${rentTotal.toFixed(0)}</div>
            </div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-700 transition-all duration-500" style={{ width: `${Math.min(buyPct, 100)}%` }} />
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${100 - Math.min(buyPct, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
            <span>Buy</span>
            <span>Rent</span>
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Home Price ($)</label><input aria-label="Home Price ($)" type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Down Payment ($)</label><input aria-label="Down Payment ($)" type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Mortgage Rate (%)</label><input aria-label="Mortgage Rate (%)" type="number" value={mortgageRate} onChange={e => setMortgageRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Monthly Rent ($)</label><input aria-label="Monthly Rent ($)" type="number" value={rent} onChange={e => setRent(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Timeframe (years)</label><input aria-label="Timeframe (years)" type="number" value={years} onChange={e => setYears(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
