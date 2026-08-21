"use client";
import React, { useState } from 'react';
import { DollarSign, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Preset = { name: string; cost: number; margin: number };
const PRESETS: Preset[] = [
  { name: 'Retail (50% margin)', cost: 50, margin: 50 },
  { name: 'Wholesale (20% margin)', cost: 100, margin: 20 },
  { name: 'Premium (70% margin)', cost: 30, margin: 70 },
  { name: 'Loss Leader (10% margin)', cost: 90, margin: 10 },
];

type HistoryEntry = { cost: number; margin: number; revenue: number; profit: number; timestamp: string };

export default function MarginCalculator() {
  const [cost, setCost] = useState(100);
  const [margin, setMargin] = useState(30);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const revenue = margin >= 100 ? Infinity : cost / (1 - margin / 100);
  const profit = isFinite(revenue) ? revenue - cost : 0;
  const markup = cost > 0 && isFinite(revenue) ? ((revenue - cost) / cost) * 100 : 0;

  const applyPreset = (p: Preset) => {
    setCost(p.cost);
    setMargin(p.margin);
    toast.success(`Loaded: ${p.name}`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      cost, margin, revenue: isFinite(revenue) ? Math.round(revenue * 100) / 100 : 0,
      profit: Math.round(profit * 100) / 100,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nItem Cost,${cost}\nTarget Margin,${margin}%\nSelling Price,${isFinite(revenue) ? revenue.toFixed(2) : 'N/A'}\nProfit,${profit.toFixed(2)}\nMarkup,${markup.toFixed(2)}%`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'margin-pricing-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Margin Cost Pricing Calculator</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400 transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Item Cost ($)</label>
            <input type="number" value={cost} onChange={e => setCost(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Margin (%)</label>
            <input type="number" value={margin} onChange={e => setMargin(Math.min(99, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-emerald-500 transition-colors" />
            <input type="range" min="1" max="90" step="1" value={margin} onChange={e => setMargin(parseInt(e.target.value))} className="w-full accent-emerald-500 mt-1" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Total Profit</span>
                <p className="text-lg font-bold text-emerald-500">${profit.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Markup Percentage</span>
                <p className="text-sm text-[var(--text-secondary)]">{markup.toFixed(1)}% on cost</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(isFinite(revenue) ? revenue.toFixed(2) : 'N/A'); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Copy price" aria-label="Copy price"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs text-[var(--text-muted)]">Target Selling Price</span>
            <p className="text-4xl font-extrabold text-emerald-500">{isFinite(revenue) ? `$${revenue.toFixed(2)}` : 'N/A'}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Cost ${cost.toFixed(2)} at {margin}% margin</p>
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
                  <th className="pb-2 pr-3">Cost</th>
                  <th className="pb-2 pr-3">Margin</th>
                  <th className="pb-2 pr-3">Price</th>
                  <th className="pb-2">Profit</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">${h.cost.toFixed(2)}</td>
                    <td className="py-1.5 pr-3">{h.margin}%</td>
                    <td className="py-1.5 pr-3 font-bold text-emerald-500">${h.revenue.toFixed(2)}</td>
                    <td className="py-1.5">${h.profit.toFixed(2)}</td>
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
