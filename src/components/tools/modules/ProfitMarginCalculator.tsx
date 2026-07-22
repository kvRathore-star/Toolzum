"use client";
import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

export default function ProfitMarginCalculator() {
  const [cost, setCost] = useState(100);
  const [revenue, setRevenue] = useState(150);

  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const markup = cost > 0 ? (profit / cost) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Profit Margin Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Cost of Goods ($)</label>
            <input type="number" value={cost} onChange={e => setCost(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Sale Revenue ($)</label>
            <input type="number" value={revenue} onChange={e => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Gross Profit</span>
                <p className="text-xl font-bold text-[var(--text-secondary)] dark:text-white">$${profit.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Markup Percentage</span>
                <p className="text-xl font-bold text-emerald-500">${markup.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4 mt-6">
            <span className="text-xs text-[var(--text-muted)]">Gross Profit Margin</span>
            <p className="text-4xl font-extrabold text-emerald-500">${margin.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}