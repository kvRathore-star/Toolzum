"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CalcActions } from '../shared/CalcActions';

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('10');
  const [tenure, setTenure] = useState('12');
  const [emi, setEmi] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);

  const presets = [
    { label: '$100K, 10%, 12mo', apply: () => { setPrincipal('100000'); setRate('10'); setTenure('12'); } },
    { label: '$500K, 8%, 60mo', apply: () => { setPrincipal('500000'); setRate('8'); setTenure('60'); } },
    { label: '$1M, 7%, 120mo', apply: () => { setPrincipal('1000000'); setRate('7'); setTenure('120'); } },
  ];

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure);

    if (!p || !r || !n) return;

    const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emiValue * n;
    
    setEmi(emiValue);
    setTotalPayment(totalPay);
    setTotalInterest(totalPay - p);
  };

  const resultText = emi !== null ? 'Monthly EMI: $' + emi.toFixed(2) + ' | Total Interest: $' + (totalInterest?.toFixed(2) || '0') + ' | Total Payment: $' + (totalPayment?.toFixed(2) || '0') : '';

  const handleCopy = () => { navigator.clipboard.writeText(resultText); toast.success('Copied!'); };
  const handleDownload = () => { const blob = new Blob([resultText], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='emi-calculation.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Loan Amount ($)</label>
              <input 
                type="number" value={principal} onChange={e => setPrincipal(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-amber-500 rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Interest Rate (% p.a)</label>
              <input 
                type="number" value={rate} onChange={e => setRate(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-amber-500 rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Loan Tenure (Months)</label>
              <input 
                type="number" value={tenure} onChange={e => setTenure(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-amber-500 rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
            </div>
         </div>

         <button
            onClick={calculate}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
          >
            Calculate EMI
          </button>

          {emi !== null && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
               <div className="text-center">
                 <div className="text-xs text-amber-600 font-bold uppercase mb-1">Monthly EMI</div>
                 <div className="text-3xl font-black text-amber-700 dark:text-amber-400">${emi.toFixed(2)}</div>
               </div>
               <div className="text-center">
                 <div className="text-xs text-amber-600 font-bold uppercase mb-1">Total Interest</div>
                 <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-2">${totalInterest?.toFixed(2)}</div>
               </div>
               <div className="text-center">
                 <div className="text-xs text-amber-600 font-bold uppercase mb-1">Total Payment</div>
                 <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-2">${totalPayment?.toFixed(2)}</div>
               </div>
            </div>
          )}

          {emi !== null && (
            <CalcActions
              result={resultText}
              downloadFilename="emi-calculation.txt"
              accent="amber"
            />
          )}
      </div>
    </div>
  );
}