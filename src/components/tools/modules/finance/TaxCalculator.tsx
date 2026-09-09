"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function TaxCalculator() {
  const [income, setIncome] = useState('80000');
  const [filingStatus, setFilingStatus] = useState<'single'|'married'|'head'>('single');
  const [stateTax, setStateTax] = useState('5');
  const [deductions, setDeductions] = useState('14600');
  const inc = parseFloat(income) || 0;
  const ded = parseFloat(deductions) || 14600;
  const st = parseFloat(stateTax) || 0;
  const taxable = Math.max(0, inc - ded);
  const brackets: Record<string, Array<{min: number; max: number; rate: number}>> = { single: [{min:0,max:11600,rate:0.1},{min:11600,max:47150,rate:0.12},{min:47150,max:100525,rate:0.22},{min:100525,max:191950,rate:0.24},{min:191950,max:243725,rate:0.32},{min:243725,max:609350,rate:0.35},{min:609350,max:Infinity,rate:0.37}], married: [{min:0,max:23200,rate:0.1},{min:23200,max:94300,rate:0.12},{min:94300,max:201050,rate:0.22},{min:201050,max:383900,rate:0.24},{min:383900,max:487450,rate:0.32},{min:487450,max:731200,rate:0.35},{min:731200,max:Infinity,rate:0.37}], head: [{min:0,max:16550,rate:0.1},{min:16550,max:63100,rate:0.12},{min:63100,max:100500,rate:0.22},{min:100500,max:191950,rate:0.24},{min:191950,max:243700,rate:0.32},{min:243700,max:609350,rate:0.35},{min:609350,max:Infinity,rate:0.37}] };
  let federalTax = 0;
  let remaining = taxable;
  for (const b of brackets[filingStatus]!) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, b.max - b.min);
    federalTax += taxableInBracket * b.rate;
    remaining -= taxableInBracket;
  }
  const stateTaxAmount = taxable * (st / 100);
  const fica = inc * 0.0765;
  const totalTax = federalTax + stateTaxAmount + fica;
  const effectiveRate = inc > 0 ? (totalTax / inc) * 100 : 0;
  const takeHome = inc - totalTax;
  const result = inc > 0 ? `Gross income: $${inc.toLocaleString()}\nTaxable income: $${taxable.toLocaleString()}\nFederal: $${Math.round(federalTax).toLocaleString()}\nFICA: $${Math.round(fica).toLocaleString()}\nState: $${Math.round(stateTaxAmount).toLocaleString()}\nTotal tax: $${Math.round(totalTax).toLocaleString()}\nEffective rate: ${effectiveRate.toFixed(1)}%\nTake-home: $${Math.round(takeHome).toLocaleString()} (${(takeHome / inc * 100).toFixed(0)}%)` : '';
  return (
    <CalculatorShell category="Finance"
      title="Tax Calculator (US 2025)"
      accent="indigo"
      result={result}
      auto
      presets={[
        { label: '60k Single', apply: () => { setIncome('60000'); setFilingStatus('single'); setStateTax('5'); setDeductions('14600'); } },
        { label: '150k Married', apply: () => { setIncome('150000'); setFilingStatus('married'); setStateTax('5'); setDeductions('29200'); } },
        { label: '100k Head', apply: () => { setIncome('100000'); setFilingStatus('head'); setStateTax('5'); setDeductions('21900'); } },
      ]}
      downloadData={`Income,FilingStatus,StateTaxPct,Deductions,Result\n${income},${filingStatus},${stateTax},${deductions},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="tax-calculation.csv"
    >
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Annual income ($)</label><input aria-label="Annual income ($)" className={inputCls} type="number" value={income} onChange={e => setIncome(e.target.value)} /></div>
        <div><label className={labelCls}>Filing status</label><select aria-label="Filing status" className={inputCls} value={filingStatus} onChange={e => setFilingStatus(e.target.value as 'single'|'married'|'head')}><option value="single">Single</option><option value="married">Married filing jointly</option><option value="head">Head of household</option></select></div>
        <div><label className={labelCls}>State tax rate (%)</label><input aria-label="State tax rate (%)" className={inputCls} type="number" value={stateTax} onChange={e => setStateTax(e.target.value)} /></div>
        <div><label className={labelCls}>Standard deduction ($)</label><input aria-label="Standard deduction ($)" className={inputCls} type="number" value={deductions} onChange={e => setDeductions(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setIncome('60000'); setFilingStatus('single'); }}>60k Single</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setIncome('150000'); setFilingStatus('married'); }}>150k Married</button>
      </div>
    </CalculatorShell>
  );
}
