"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [time, setTime] = useState('3');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const t = parseFloat(time) || 0;
    if (!p || !r || !t) { setResult(''); return; }
    const interest = p * (r / 100) * t;
    const total = p + interest;
    setResult(`Simple Interest: $${interest.toFixed(2)}\nTotal amount: $${total.toFixed(2)}\nAnnual interest: $${(p * r / 100).toFixed(2)}`);
  }, [principal, rate, time]);
  return (
    <CalculatorShell title="Simple Interest Calculator" accent="indigo" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Principal ($)</label><input className={inputCls} type="number" value={principal} onChange={e => setPrincipal(e.target.value)} /></div>
        <div><label className={labelCls}>Rate (%)</label><input className={inputCls} type="number" value={rate} onChange={e => setRate(e.target.value)} /></div>
        <div><label className={labelCls}>Time (years)</label><input className={inputCls} type="number" value={time} onChange={e => setTime(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}
