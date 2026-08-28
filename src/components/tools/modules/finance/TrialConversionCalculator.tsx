"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { DollarSign } from 'lucide-react';
import { inputCls, labelCls } from '../Calculators.shared';

export default function TrialConversionCalculator() {
  const [visitors, setVisitors] = useState('1000');
  const [signups, setSignups] = useState('100');
  const [paid, setPaid] = useState('20');
  const [trialLength, setTrialLength] = useState('14');
  const [price, setPrice] = useState('29');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const v = parseFloat(visitors) || 0;
    const s = parseFloat(signups) || 0;
    const p = parseFloat(paid) || 0;
    const tl = parseFloat(trialLength) || 14;
    const pr = parseFloat(price) || 0;
    if (!v || !s || !p) { setResult(''); return; }
    const signupRate = (s / v) * 100;
    const conversionRate = (p / s) * 100;
    const overallRate = (p / v) * 100;
    const revenue = p * pr;
    const monthlyRev = revenue * (30 / tl);
    setResult(`Signup rate: ${signupRate.toFixed(1)}%\nTrial-to-paid: ${conversionRate.toFixed(1)}%\nOverall conversion: ${overallRate.toFixed(2)}%\nRevenue: $${Math.round(revenue)}\nEst. monthly revenue: $${Math.round(monthlyRev)}`);
  }, [visitors, signups, paid, trialLength, price]);
  return (
    <CalculatorShell
      title="Trial Conversion Calculator"
      icon={<DollarSign className="w-5 h-5" />}
      accent="violet"
      result={result}
      onCalculate={calc}
      presets={[
        { label: 'Typical SaaS', apply: () => { setVisitors('10000'); setSignups('500'); setPaid('75'); setTrialLength('14'); setPrice('29'); } },
        { label: 'High conversion', apply: () => { setVisitors('5000'); setSignups('250'); setPaid('50'); setTrialLength('7'); setPrice('49'); } },
        { label: 'Early stage', apply: () => { setVisitors('1000'); setSignups('100'); setPaid('20'); setTrialLength('14'); setPrice('29'); } },
      ]}
      downloadData={`Visitors,Signups,Paid,TrialLength,Price,Result\n${visitors},${signups},${paid},${trialLength},${price},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="trial-conversion.csv"
    >
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Visitors / mo</label><input className={inputCls} type="number" value={visitors} onChange={e => setVisitors(e.target.value)} /></div>
        <div><label className={labelCls}>Trial signups</label><input className={inputCls} type="number" value={signups} onChange={e => setSignups(e.target.value)} /></div>
        <div><label className={labelCls}>Paid conversions</label><input className={inputCls} type="number" value={paid} onChange={e => setPaid(e.target.value)} /></div>
        <div><label className={labelCls}>Trial length (days)</label><input className={inputCls} type="number" value={trialLength} onChange={e => setTrialLength(e.target.value)} /></div>
        <div><label className={labelCls}>Price ($/mo)</label><input className={inputCls} type="number" value={price} onChange={e => setPrice(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setVisitors('10000'); setSignups('500'); setPaid('75'); }}>Typical SaaS</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setVisitors('5000'); setSignups('250'); setPaid('50'); setTrialLength('7'); }}>High conversion</button>
      </div>
    </CalculatorShell>
  );
}
