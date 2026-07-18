"use client";
import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

export default function LtvCalculator() {
  const [aov, setAov] = useState(85); // Avg Order Value
  const [frequency, setFrequency] = useState(4); // Purchases per year
  const [lifespan, setLifespan] = useState(5); // Lifespan in years

  const ltv = aov * frequency * lifespan;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Customer Lifetime Value (LTV)</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Average Order Value ($)</label>
            <input type="number" value={aov} onChange={e => setAov(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Purchase Frequency (per year)</label>
            <input type="number" value={frequency} onChange={e => setFrequency(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Customer Lifespan (Years)</label>
            <input type="number" value={lifespan} onChange={e => setLifespan(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-black/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center items-center min-h-[180px]">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Customer LTV</span>
          <p className="text-5xl font-extrabold text-emerald-500">{ltv.toLocaleString()}</p>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-2">Uses AOV × Frequency × Lifespan (product method). For ARPU ÷ Churn (SaaS method), see <a href="/calculator/customer-ltv-calculator" className="text-blue-600 hover:underline">Customer LTV Calculator</a>.</p>
    </div>
  );
}