"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

function computeTax(income: number, age: number, regime: 'old' | 'new'): number {
  if (regime === 'new') {
    if (income <= 300000) return 0;
    if (income <= 700000) return 0;
    if (income <= 1000000) return (income - 700000) * 0.05;
    if (income <= 1200000) return 15000 + (income - 1000000) * 0.10;
    if (income <= 1500000) return 35000 + (income - 1200000) * 0.15;
    return 80000 + (income - 1500000) * 0.20;
  }
  // Old regime
  const isSenior = age >= 60;
  const exempt = isSenior ? 300000 : 250000;
  if (income <= exempt) return 0;
  if (income <= 500000) return (income - exempt) * 0.05;
  if (income <= 1000000) return 12500 + (income - 500000) * 0.20;
  return 112500 + (income - 1000000) * 0.30;
}

export default function TdsCalculatorIndia() {
  const [income, setIncome] = useState('1200000');
  const [age, setAge] = useState('35');
  const [regime, setRegime] = useState<'old'|'new'>('new');

  const inc = parseFloat(income) || 0;
  const ag = parseFloat(age) || 35;
  const tax = computeTax(inc, ag, regime);
  const effectiveRate = inc > 0 ? (tax / inc) * 100 : 0;
  const inHand = inc - tax;
  const result = inc > 0 ? `Tax: ₹${tax.toLocaleString()} (${effectiveRate.toFixed(1)}%) | In-hand: ₹${inHand.toLocaleString()}` : '';

  return (
    <CalculatorShell
      title="TDS Calculator (India)"
      accent="orange"
      result={result}
      auto
      presets={[
        { label: '5L New Regime', apply: () => { setIncome('500000'); setAge('35'); setRegime('new'); } },
        { label: '12L New Regime', apply: () => { setIncome('1200000'); setAge('35'); setRegime('new'); } },
        { label: '15L Old Regime', apply: () => { setIncome('1500000'); setAge('45'); setRegime('old'); } },
      ]}
      downloadData={`Income,Age,Regime,Tax,EffectiveRate,InHand\n${income},${age},${regime},${tax},${effectiveRate.toFixed(1)},${inHand}`}
      downloadFilename="tds-india.csv"
      customResult={inc > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[var(--bg-overlay)] rounded-xl text-center">
              <div className="text-xs text-[var(--text-muted)]">Tax</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">₹{tax.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-[var(--bg-overlay)] rounded-xl text-center">
              <div className="text-xs text-[var(--text-muted)]">In-hand</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{inHand.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)] text-center">
            Effective rate: {effectiveRate.toFixed(1)}% ({regime === 'new' ? 'New' : 'Old'} Regime)
          </div>
        </div>
      ) : null}
    >
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Annual income (₹)</label><input className={inputCls} type="number" value={income} onChange={e => setIncome(e.target.value)} /></div>
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Regime</label><select className={inputCls} value={regime} onChange={e => setRegime(e.target.value as 'old'|'new')}><option value="new">New (default)</option><option value="old">Old</option></select></div>
      </div>
    </CalculatorShell>
  );
}
