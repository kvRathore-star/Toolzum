"use client";
import React, { useState } from 'react';
import { BarChart3, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Preset = { name: string; fixedCosts: number; variableCost: number; sellingPrice: number };
const PRESETS: Preset[] = [
  { name: 'Coffee Shop', fixedCosts: 8000, variableCost: 2.5, sellingPrice: 5 },
  { name: 'SaaS Subscription', fixedCosts: 25000, variableCost: 3, sellingPrice: 29 },
  { name: 'Manufacturing', fixedCosts: 100000, variableCost: 45, sellingPrice: 120 },
  { name: 'Online Store', fixedCosts: 5000, variableCost: 15, sellingPrice: 39 },
];

type HistoryEntry = { fixedCosts: number; variableCost: number; sellingPrice: number; breakEvenUnits: number; breakEvenSales: number; timestamp: string };

export default function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [variableCost, setVariableCost] = useState(20);
  const [sellingPrice, setSellingPrice] = useState(50);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const contributionMargin = sellingPrice - variableCost;
  const breakEvenUnits = contributionMargin > 0 ? fixedCosts / contributionMargin : 0;
  const breakEvenSales = breakEvenUnits * sellingPrice;
  const cmRatio = sellingPrice > 0 ? (contributionMargin / sellingPrice) * 100 : 0;

  const applyPreset = (p: Preset) => {
    setFixedCosts(p.fixedCosts);
    setVariableCost(p.variableCost);
    setSellingPrice(p.sellingPrice);
    toast.success(`Loaded: ${p.name}`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      fixedCosts, variableCost, sellingPrice,
      breakEvenUnits: Math.ceil(breakEvenUnits),
      breakEvenSales: Math.round(breakEvenSales),
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nFixed Costs,${fixedCosts}\nUnit Variable Cost,${variableCost}\nUnit Selling Price,${sellingPrice}\nContribution Margin,${contributionMargin.toFixed(2)}\nContribution Margin Ratio,${cmRatio.toFixed(1)}%\nBreak-Even Units,${Math.ceil(breakEvenUnits)}\nBreak-Even Sales,${Math.round(breakEvenSales)}`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'break-even-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Break-Even Calculator</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fixed Costs ($)</label>
            <input type="number" value={fixedCosts} onChange={e => setFixedCosts(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Unit Variable Cost ($)</label>
              <input type="number" value={variableCost} onChange={e => setVariableCost(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Unit Selling Price ($)</label>
              <input type="number" value={sellingPrice} onChange={e => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] transition-colors" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Contribution Margin</span>
                  <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">${contributionMargin.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">CM Ratio</span>
                  <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">{cmRatio.toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Break-Even Units</span>
                <p className="text-lg font-bold text-[var(--accent)]">{Math.ceil(breakEvenUnits).toLocaleString()} units</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(Math.ceil(breakEvenUnits).toString()); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--accent-ink)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] rounded-lg transition-colors" title="Copy" aria-label="Copy"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--accent-ink)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--accent-ink)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs text-[var(--text-muted)]">Break-Even Sales Volume</span>
            <p className="text-3xl font-extrabold text-[var(--accent)]">${Math.round(breakEvenSales).toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Revenue needed to break even</p>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">History</h4>
            <button onClick={() => setHistory([])} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><RotateCcw size={12} /> Clear</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <th className="pb-2 pr-3">Time</th>
                  <th className="pb-2 pr-3">Fixed</th>
                  <th className="pb-2 pr-3">Var/Unit</th>
                  <th className="pb-2 pr-3">Price</th>
                  <th className="pb-2 pr-3">BE Units</th>
                  <th className="pb-2">BE Sales</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">${h.fixedCosts.toLocaleString()}</td>
                    <td className="py-1.5 pr-3">${h.variableCost.toFixed(2)}</td>
                    <td className="py-1.5 pr-3">${h.sellingPrice.toFixed(2)}</td>
                    <td className="py-1.5 pr-3 font-bold text-[var(--accent)]">{h.breakEvenUnits.toLocaleString()}</td>
                    <td className="py-1.5">${h.breakEvenSales.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
