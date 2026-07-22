"use client";
import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

export default function VatCalculator() {
  const [netPrice, setNetPrice] = useState(100);
  const [vatRate, setVatRate] = useState(15);

  const vatAmount = netPrice * (vatRate / 100);
  const grossPrice = netPrice + vatAmount;

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">VAT Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Net Price / Pre-tax ($)</label>
            <input type="number" value={netPrice} onChange={e => setNetPrice(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">VAT Rate (%)</label>
            <input type="number" value={vatRate} onChange={e => setVatRate(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-[var(--text-muted)]">VAT Amount</span>
              <p className="text-xl font-bold text-[var(--text-secondary)] dark:text-white">$${vatAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4 mt-6">
            <span className="text-xs text-[var(--text-muted)]">Gross Price (Inclusive)</span>
            <p className="text-4xl font-extrabold text-emerald-500">$${grossPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}