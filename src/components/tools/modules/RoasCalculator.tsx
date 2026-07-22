"use client";
import React, { useState } from 'react';
import { Target } from 'lucide-react';

export default function RoasCalculator() {
  const [revenue, setRevenue] = useState(5000);
  const [spend, setSpend] = useState(1000);

  const roas = spend > 0 ? revenue / spend : 0;

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Target className="w-5 h-5 text-violet-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">ROAS Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Ad Revenue ($)</label>
            <input type="number" value={revenue} onChange={e => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Marketing Ad Spend ($)</label>
            <input type="number" value={spend} onChange={e => setSpend(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-center items-center min-h-[160px]">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Return on Ad Spend (ROAS)</span>
          <p className="text-5xl font-extrabold text-violet-500">{roas.toFixed(2)}x</p>
        </div>
      </div>
    </div>
  );
}