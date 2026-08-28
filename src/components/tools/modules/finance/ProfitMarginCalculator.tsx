"use client";
import React, { useState } from 'react';
import { DollarSign, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Preset = { name: string; cost: number; revenue: number };
const PRESETS: Preset[] = [
  { name: 'Retail (50% margin)', cost: 50, revenue: 100 },
  { name: 'SaaS (80% margin)', cost: 10, revenue: 50 },
  { name: 'Restaurant (65% margin)', cost: 7, revenue: 20 },
  { name: 'Agency (40% margin)', cost: 3000, revenue: 5000 },
];

type HistoryEntry = { cost: number; revenue: number; profit: number; margin: number; markup: number; timestamp: string };

export default function ProfitMarginCalculator() {
  const [cost, setCost] = useState(100);
  const [revenue, setRevenue] = useState(150);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const markup = cost > 0 ? (profit / cost) * 100 : 0;

  const applyPreset = (p: Preset) => {
    setCost(p.cost);
    setRevenue(p.revenue);
    toast.success(`Loaded: ${p.name}`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      cost, revenue, profit: Math.round(profit * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      markup: Math.round(markup * 100) / 100,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nCost of Goods,${cost}\nSale Revenue,${revenue}\nGross Profit,${profit}\nGross Margin,${margin.toFixed(2)}%\nMarkup Percentage,${markup.toFixed(2)}%`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profit-margin-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Profit Margin Calculator</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400 transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Cost of Goods Sold ($)</label>
            <input type="number" value={cost} onChange={e => setCost(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Sale Revenue ($)</label>
            <input type="number" value={revenue} onChange={e => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Gross Profit</span>
                  <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">${profit.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Markup Percentage</span>
                  <p className="text-lg font-bold text-emerald-500">{markup.toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Cost Ratio</span>
                <p className="text-sm text-[var(--text-secondary)]">{revenue > 0 ? ((cost / revenue) * 100).toFixed(1) : 0}% of revenue</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(margin.toFixed(2) + '%'); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Copy margin" aria-label="Copy margin"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs text-[var(--text-muted)]">Gross Profit Margin</span>
            <p className="text-4xl font-extrabold text-emerald-500">{margin.toFixed(2)}%</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Profit of ${profit.toFixed(2)} on ${revenue.toFixed(2)} revenue</p>
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
                  <th className="pb-2 pr-3">Revenue</th>
                  <th className="pb-2 pr-3">Profit</th>
                  <th className="pb-2 pr-3">Margin</th>
                  <th className="pb-2">Markup</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">${h.cost.toFixed(2)}</td>
                    <td className="py-1.5 pr-3">${h.revenue.toFixed(2)}</td>
                    <td className="py-1.5 pr-3">${h.profit.toFixed(2)}</td>
                    <td className="py-1.5 pr-3 font-bold text-emerald-500">{h.margin}%</td>
                    <td className="py-1.5">{h.markup}%</td>
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
