"use client";
import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

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

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">SIP Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Monthly Investment (₹)</label>
            <input type="number" value={monthly} onChange={e => setMonthly(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-zinc-300 dark:focus:border-zinc-700" />
            <input type="range" min="500" max="100000" step="500" value={monthly} onChange={e => setMonthly(parseInt(e.target.value))} className="w-full accent-emerald-500 mt-1" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Expected Return Rate (p.a. %)</label>
            <input type="number" value={rate} onChange={e => setRate(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-zinc-300 dark:focus:border-zinc-700" />
            <input type="range" min="1" max="30" step="0.5" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-emerald-500 mt-1" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Time Period (Years)</label>
            <input type="number" value={years} onChange={e => setYears(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-zinc-300 dark:focus:border-zinc-700" />
            <input type="range" min="1" max="40" step="1" value={years} onChange={e => setYears(parseInt(e.target.value))} className="w-full accent-emerald-500 mt-1" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Investment Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Total Invested</span>
                <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-[var(--text-primary)]">₹${totalInvested.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Wealth Gain</span>
                <p className="text-lg font-bold text-emerald-500">₹${Math.round(wealthGained).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4 mt-6">
            <span className="text-xs text-[var(--text-muted)]">Expected Future Value</span>
            <p className="text-3xl font-extrabold text-emerald-500">₹${Math.round(futureValue).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}