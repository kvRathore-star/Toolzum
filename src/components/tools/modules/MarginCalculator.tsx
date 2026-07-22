"use client";
import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

export default function MarginCalculator() {
  const [cost, setCost] = useState(100);
  const [margin, setMargin] = useState(30); // in percent

  const revenue = cost / (1 - margin / 100);
  const profit = revenue - cost;

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Margin Cost Pricing Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Item Cost ($)</label>
            <input type="number" value={cost} onChange={e => setCost(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Margin (%)</label>
            <input type="number" value={margin} onChange={e => setMargin(Math.min(99, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-[var(--text-muted)]">Total Profit</span>
              <p className="text-xl font-bold text-emerald-500">$${profit.toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4 mt-6">
            <span className="text-xs text-[var(--text-muted)]">Target Selling Price</span>
            <p className="text-4xl font-extrabold text-emerald-500">$${revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}