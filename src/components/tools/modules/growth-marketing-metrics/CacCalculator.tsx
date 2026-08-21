"use client";
import React, { useState } from 'react';
import { DollarSign, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Preset = { name: string; marketing: number; sales: number; acquired: number };

const PRESETS: Preset[] = [
  { name: 'SaaS Startup', marketing: 8000, sales: 12000, acquired: 50 },
  { name: 'E-commerce', marketing: 15000, sales: 5000, acquired: 200 },
  { name: 'Enterprise B2B', marketing: 25000, sales: 40000, acquired: 30 },
  { name: 'Mobile App', marketing: 5000, sales: 2000, acquired: 150 },
];

type HistoryEntry = { marketing: number; sales: number; acquired: number; cac: number; timestamp: string };

export default function CacCalculator() {
  const [marketing, setMarketing] = useState(5000);
  const [sales, setSales] = useState(3000);
  const [acquired, setAcquired] = useState(100);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const cac = acquired > 0 ? (marketing + sales) / acquired : 0;
  const totalCost = marketing + sales;

  const applyPreset = (p: Preset) => {
    setMarketing(p.marketing);
    setSales(p.sales);
    setAcquired(p.acquired);
    toast.success(`Loaded: ${p.name}`);
  };

  const addToHistory = () => {
    const entry: HistoryEntry = {
      marketing, sales, acquired, cac: Math.round(cac * 100) / 100,
      timestamp: new Date().toLocaleTimeString(),
    };
    setHistory(prev => [entry, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const clearHistory = () => setHistory([]);

  const csvContent = `Metric,Value\nMarketing Expenses,${marketing}\nSales Expenses,${sales}\nNew Customers,${acquired}\nTotal Cost,${totalCost}\nCAC,${cac.toFixed(2)}`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cac-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Customer Acquisition Cost (CAC)</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400 transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Marketing Expenses ($)</label>
            <input type="number" value={marketing} onChange={e => setMarketing(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Sales Expenses / Salaried Overhead ($)</label>
            <input type="number" value={sales} onChange={e => setSales(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">New Customers Acquired</label>
            <input type="number" value={acquired} onChange={e => setAcquired(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-emerald-500 transition-colors" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Total Customer Acquisition Spend</span>
                <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">${totalCost.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Breakdown</span>
                <p className="text-sm text-[var(--text-secondary)]">Marketing {((marketing / totalCost) * 100).toFixed(0)}% · Sales {((sales / totalCost) * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(cac.toFixed(2)); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Copy CAC" aria-label="Copy CAC"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Customer Acquisition Cost (CAC)</span>
            <p className="text-5xl font-extrabold text-emerald-500">${cac.toFixed(2)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Per new customer acquired</p>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">History</h4>
            <button onClick={clearHistory} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><RotateCcw size={12} /> Clear</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <th className="pb-2 pr-3">Time</th>
                  <th className="pb-2 pr-3">Marketing</th>
                  <th className="pb-2 pr-3">Sales</th>
                  <th className="pb-2 pr-3">Customers</th>
                  <th className="pb-2">CAC</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">${h.marketing.toLocaleString()}</td>
                    <td className="py-1.5 pr-3">${h.sales.toLocaleString()}</td>
                    <td className="py-1.5 pr-3">{h.acquired}</td>
                    <td className="py-1.5 font-bold text-emerald-500">${h.cac.toFixed(2)}</td>
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
