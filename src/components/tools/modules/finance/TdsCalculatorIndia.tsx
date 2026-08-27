"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function TdsCalculatorIndia() {
  const [income, setIncome] = useState('1200000');
  const [age, setAge] = useState('35');
  const [regime, setRegime] = useState<'old'|'new'>('new');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const inc = parseFloat(income) || 0;
    const a = parseFloat(age) || 35;
    if (!inc) { setResult(''); return; }
    let taxable = inc;
    let tax = 0;
    if (regime === 'new') {
      const slabs = [{min:0,max:300000,rate:0},{min:300000,max:600000,rate:0.05},{min:600000,max:900000,rate:0.1},{min:900000,max:1200000,rate:0.15},{min:1200000,max:1500000,rate:0.2},{min:1500000,max:Infinity,rate:0.3}];
      let remaining = Math.max(0, taxable - 50000);
      for (const s of slabs) {
        if (remaining <= 0) break;
        const taxableInSlab = Math.min(remaining, s.max - s.min);
        tax += taxableInSlab * s.rate;
        remaining -= taxableInSlab;
      }
      const rebate = inc <= 700000 ? Math.min(tax, 25000) : 0;
      tax -= rebate;
    } else {
      const deduction80c = 150000;
      const standardDeduction = a < 60 ? 50000 : a < 80 ? 50000 : 50000;
      taxable = Math.max(0, inc - standardDeduction - deduction80c);
      const slabs = [{min:0,max:250000,rate:0},{min:250000,max:500000,rate:0.05},{min:500000,max:1000000,rate:0.2},{min:1000000,max:Infinity,rate:0.3}];
      let remaining = taxable;
      for (const s of slabs) {
        if (remaining <= 0) break;
        const taxableInSlab = Math.min(remaining, s.max - s.min);
        tax += taxableInSlab * s.rate;
        remaining -= taxableInSlab;
      }
    }
    const cess = tax * 0.04;
    const totalTax = tax + cess;
    setResult(`Gross income: \u20b9${inc.toLocaleString('en-IN')}\nTaxable: \u20b9${taxable.toLocaleString('en-IN')}\nTax: \u20b9${Math.round(tax).toLocaleString('en-IN')}\nHealth & edu cess (4%): \u20b9${Math.round(cess).toLocaleString('en-IN')}\nTotal tax: \u20b9${Math.round(totalTax).toLocaleString('en-IN')}\nEffective rate: ${(totalTax / inc * 100).toFixed(1)}%`);
  }, [income, age, regime]);
  return (
    <CalculatorShell title="TDS Calculator (India)" accent="orange" result={result} onCalculate={calc}>
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
