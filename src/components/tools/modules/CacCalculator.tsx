"use client";
import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

export default function CacCalculator() {
  const [marketing, setMarketing] = useState(5000);
  const [sales, setSales] = useState(3000);
  const [acquired, setAcquired] = useState(100);

  const cac = acquired > 0 ? (marketing + sales) / acquired : 0;

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Customer Acquisition Cost (CAC)</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Marketing Expenses ($)</label>
            <input type="number" value={marketing} onChange={e => setMarketing(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Sales Expenses / Salaried Overhead ($)</label>
            <input type="number" value={sales} onChange={e => setSales(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">New Customers Acquired</label>
            <input type="number" value={acquired} onChange={e => setAcquired(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-center items-center min-h-[180px]">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Customer Acquisition Cost (CAC)</span>
          <p className="text-5xl font-extrabold text-emerald-500">{cac.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}