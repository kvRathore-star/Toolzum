"use client";
import React, { useState } from 'react';
import { DollarSign, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalcActions } from '../shared/CalcActions';

type Preset = { name: string; aov: number; frequency: number; lifespan: number };
const PRESETS: Preset[] = [
  { name: 'SaaS Monthly', aov: 29, frequency: 12, lifespan: 3 },
  { name: 'E-commerce', aov: 85, frequency: 4, lifespan: 5 },
  { name: 'Subscription Box', aov: 45, frequency: 12, lifespan: 2 },
  { name: 'Luxury Retail', aov: 500, frequency: 1.5, lifespan: 8 },
];

type HistoryEntry = { aov: number; frequency: number; lifespan: number; ltv: number; timestamp: string };

export default function LtvCalculator() {
  const [aov, setAov] = useState(85);
  const [frequency, setFrequency] = useState(4);
  const [lifespan, setLifespan] = useState(5);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const ltv = aov * frequency * lifespan;

  const applyPreset = (p: Preset) => {
    setAov(p.aov);
    setFrequency(p.frequency);
    setLifespan(p.lifespan);
    toast.success(`Loaded: ${p.name}`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      aov, frequency, lifespan, ltv: Math.round(ltv * 100) / 100,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nAverage Order Value,${aov}\nPurchase Frequency (year),${frequency}\nCustomer Lifespan (years),${lifespan}\nTotal Orders,${(frequency * lifespan).toFixed(1)}\nCustomer LTV,${ltv.toFixed(2)}`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ltv-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Customer Lifetime Value (LTV)</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400 transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Average Order Value ($)</label>
            <input aria-label="Average Order Value ($)" type="number" value={aov} onChange={e => setAov(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Purchase Frequency (per year)</label>
            <input aria-label="Purchase Frequency (per year)" type="number" value={frequency} onChange={e => setFrequency(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Customer Lifespan (Years)</label>
            <input aria-label="Customer Lifespan (Years)" type="number" value={lifespan} onChange={e => setLifespan(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Total Orders per Customer</span>
                <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">{(frequency * lifespan).toFixed(1)}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Annual Value per Customer</span>
                <p className="text-sm text-[var(--text-secondary)]">${(aov * frequency).toLocaleString()}/yr</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(ltv.toFixed(2)); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Copy LTV" aria-label="Copy LTV"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Customer LTV</span>
            <p className="text-5xl font-extrabold text-emerald-500">${ltv.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">AOV × Frequency × Lifespan</p>
          </div>
        </div>
      </div>

      <CalcActions
        result={`Customer LTV: $${ltv.toFixed(2)}`}
        downloadData={csvContent}
        downloadFilename="ltv-calculation.csv"
        accent="emerald"
      />

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
                  <th className="pb-2 pr-3">AOV</th>
                  <th className="pb-2 pr-3">Freq</th>
                  <th className="pb-2 pr-3">Years</th>
                  <th className="pb-2">LTV</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">${h.aov.toFixed(2)}</td>
                    <td className="py-1.5 pr-3">{h.frequency}/yr</td>
                    <td className="py-1.5 pr-3">{h.lifespan}</td>
                    <td className="py-1.5 font-bold text-emerald-500">${h.ltv.toLocaleString()}</td>
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
