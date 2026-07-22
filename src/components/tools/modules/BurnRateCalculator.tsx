"use client";
import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

export default function BurnRateCalculator() {
  const [starting, setStarting] = useState(100000);
  const [ending, setEnding] = useState(70000);
  const [months, setMonths] = useState(3);

  const burn = months > 0 ? (starting - ending) / months : 0;
  const runway = burn > 0 ? ending / burn : 0;

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Startup Burn Rate & Runway</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Starting Cash Balance ($)</label>
            <input type="number" value={starting} onChange={e => setStarting(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ending Cash Balance ($)</label>
            <input type="number" value={ending} onChange={e => setEnding(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Time Period (Months)</label>
            <input type="number" value={months} onChange={e => setMonths(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Monthly Burn</h4>
            <p className="text-3xl font-extrabold text-[var(--text-secondary)] dark:text-white">{Math.round(burn).toLocaleString()}/mo</p>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4 mt-6">
            <span className="text-xs text-[var(--text-muted)]">Cash Runway remaining</span>
            <p className="text-4xl font-extrabold text-emerald-500">{runway.toFixed(1)} Months</p>
          </div>
        </div>
      </div>
    </div>
  );
}