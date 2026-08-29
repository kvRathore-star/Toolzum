"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function TdsCalculatorIndia() {
  const [income, setIncome] = useState('1200000');
  const [age, setAge] = useState('35');
  const [regime, setRegime] = useState<'old'|'new'>('new');
  const [result, setResult] = useState('');
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
      downloadData={`Income,Age,Regime,Result\n${income},${age},${regime},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="tds-india.csv"
    >
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Annual income (\u20b9)</label><input className={inputCls} type="number" value={income} onChange={e => setIncome(e.target.value)} /></div>
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Regime</label><select className={inputCls} value={regime} onChange={e => setRegime(e.target.value as 'old'|'new')}><option value="new">New (default)</option><option value="old">Old</option></select></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setIncome('500000'); setRegime('new'); }}>5L New</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setIncome('1500000'); setRegime('old'); }}>15L Old</button>
      </div>
    </CalculatorShell>
  );
}
