"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [time, setTime] = useState('3');
  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const t = parseFloat(time) || 0;
  const interest = p * (r / 100) * t;
  const total = p + interest;
  const result = p && r && t ? `Simple Interest: $${interest.toFixed(2)}\nTotal amount: $${total.toFixed(2)}\nAnnual interest: $${(p * r / 100).toFixed(2)}` : '';
  return (
    <CalculatorShell category="Finance"
      title="Simple Interest Calculator"
      accent="indigo"
      result={result}
      auto
      presets={[
        { label: '$10k, 5%, 3yr', apply: () => { setPrincipal('10000'); setRate('5'); setTime('3'); } },
        { label: '$50k, 8%, 5yr', apply: () => { setPrincipal('50000'); setRate('8'); setTime('5'); } },
        { label: '$100k, 6%, 10yr', apply: () => { setPrincipal('100000'); setRate('6'); setTime('10'); } },
      ]}
      downloadData={`Principal,Rate,Time_Years,Interest,Total\n${principal},${rate},${time},${(parseFloat(principal) || 0) * ((parseFloat(rate) || 0) / 100) * (parseFloat(time) || 0)},${(parseFloat(principal) || 0) + (parseFloat(principal) || 0) * ((parseFloat(rate) || 0) / 100) * (parseFloat(time) || 0)}`}
      downloadFilename="simple-interest.csv"
    >
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Principal ($)</label><input className={inputCls} type="number" value={principal} onChange={e => setPrincipal(e.target.value)} /></div>
        <div><label className={labelCls}>Rate (%)</label><input className={inputCls} type="number" value={rate} onChange={e => setRate(e.target.value)} /></div>
        <div><label className={labelCls}>Time (years)</label><input className={inputCls} type="number" value={time} onChange={e => setTime(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}
