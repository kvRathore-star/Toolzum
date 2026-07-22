"use client";
import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

export default function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [variableCost, setVariableCost] = useState(20);
  const [sellingPrice, setSellingPrice] = useState(50);

  const contributionMargin = sellingPrice - variableCost;
  const breakEvenUnits = contributionMargin > 0 ? fixedCosts / contributionMargin : 0;
  const breakEvenSales = breakEvenUnits * sellingPrice;

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Break-Even Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fixed Costs ($)</label>
            <input type="number" value={fixedCosts} onChange={e => setFixedCosts(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Unit Variable Cost ($)</label>
              <input type="number" value={variableCost} onChange={e => setVariableCost(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Unit Selling Price ($)</label>
              <input type="number" value={sellingPrice} onChange={e => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Contribution Margin</span>
                <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">{contributionMargin.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Break-Even Units</span>
                <p className="text-lg font-bold text-[var(--accent)]">{Math.ceil(breakEvenUnits).toLocaleString()} units</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4 mt-6">
            <span className="text-xs text-[var(--text-muted)]">Break-Even Sales Volume</span>
            <p className="text-3xl font-extrabold text-[var(--accent)]">{Math.round(breakEvenSales).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}