"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

type Preset = { name: string; monthly: number; rate: number; years: number };
const PRESETS: Preset[] = [
  { name: 'Conservative', monthly: 5000, rate: 8, years: 10 },
  { name: 'Moderate', monthly: 10000, rate: 12, years: 15 },
  { name: 'Aggressive', monthly: 25000, rate: 15, years: 20 },
  { name: 'Short Term', monthly: 15000, rate: 10, years: 3 },
];

export default function SipCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const p = monthly;
  const i = rate / 12 / 100;
  const n = years * 12;

  const totalInvested = p * n;
  const futureValue = i > 0
    ? p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
    : totalInvested;
  const wealthGained = futureValue - totalInvested;

  const yearlyData = Array.from({ length: years }, (_, yr) => {
    const monthsDone = (yr + 1) * 12;
    const fv = i > 0
      ? p * ((Math.pow(1 + i, monthsDone) - 1) / i) * (1 + i)
      : p * monthsDone;
    const invested = p * monthsDone;
    return { year: yr + 1, invested: Math.round(invested), fv: Math.round(fv), gain: Math.round(fv - invested) };
  });

  const csvLines = ['Year,Invested,Value,Gain', ...yearlyData.map(y => `${y.year},${y.invested},${y.fv},${y.gain}`)];
  const csvContent = csvLines.join('\n') + `\n\nTotal Invested,${Math.round(totalInvested)}\nWealth Gained,${Math.round(wealthGained)}\nFinal Value,${Math.round(futureValue)}`;

  const result = `₹${Math.round(futureValue).toLocaleString('en-IN')} future value`;

  return (
    <CalculatorShell
      category="Finance"
      title="SIP Calculator"
      accent="emerald"
      result={result}
      auto
      presets={PRESETS.map(pr => ({ label: pr.name, apply: () => { setMonthly(pr.monthly); setRate(pr.rate); setYears(pr.years); } }))}
      resultStats={[
        { label: 'Total Invested', value: `₹${Math.round(totalInvested).toLocaleString('en-IN')}` },
        { label: 'Wealth Gain', value: `+₹${Math.round(wealthGained).toLocaleString('en-IN')}`, color: 'text-emerald-500' },
      ]}
      resultLabel="Expected Future Value"
      downloadData={csvContent}
      downloadFilename="sip-calculation.csv"
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Monthly Investment (₹)</label>
          <input className={inputCls} type="number" value={monthly} onChange={e => setMonthly(Math.max(0, parseInt(e.target.value) || 0))} />
          <input type="range" min="500" max="100000" step="500" value={monthly} onChange={e => setMonthly(parseInt(e.target.value))} className="w-full accent-emerald-500 mt-1" />
        </div>
        <div>
          <label className={labelCls}>Expected Return Rate (p.a. %)</label>
          <input className={inputCls} type="number" value={rate} onChange={e => setRate(Math.max(0, parseFloat(e.target.value) || 0))} />
          <input type="range" min="1" max="30" step="0.5" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-emerald-500 mt-1" />
        </div>
        <div>
          <label className={labelCls}>Time Period (Years)</label>
          <input className={inputCls} type="number" value={years} onChange={e => setYears(Math.max(1, parseInt(e.target.value) || 1))} />
          <input type="range" min="1" max="40" step="1" value={years} onChange={e => setYears(parseInt(e.target.value))} className="w-full accent-emerald-500 mt-1" />
        </div>
      </div>
    </CalculatorShell>
  );
}
