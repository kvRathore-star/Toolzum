"use client";
import React, { useState } from 'react';

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('10');
  const [tenure, setTenure] = useState('12');
  const [emi, setEmi] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);

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

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Loan Amount ($)</label>
              <input 
                type="number" value={principal} onChange={e => setPrincipal(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-amber-500 rounded-xl px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Interest Rate (% p.a)</label>
              <input 
                type="number" value={rate} onChange={e => setRate(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-amber-500 rounded-xl px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Loan Tenure (Months)</label>
              <input 
                type="number" value={tenure} onChange={e => setTenure(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-amber-500 rounded-xl px-4 py-3 outline-none"
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
      </div>
    </div>
  );
}