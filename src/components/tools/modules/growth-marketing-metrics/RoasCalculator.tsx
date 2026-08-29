"use client";
import React, { useState } from 'react';
import { Target, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalcActions } from '../shared/CalcActions';

type Preset = { name: string; revenue: number; spend: number };
const PRESETS: Preset[] = [
  { name: 'Google Ads', revenue: 5000, spend: 1000 },
  { name: 'Facebook Ads', revenue: 3000, spend: 800 },
  { name: 'Influencer Marketing', revenue: 12000, spend: 2000 },
  { name: 'Email Marketing', revenue: 8000, spend: 500 },
];

type HistoryEntry = { revenue: number; spend: number; roas: number; profit: number; timestamp: string };

export default function RoasCalculator() {
  const [revenue, setRevenue] = useState(5000);
  const [spend, setSpend] = useState(1000);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const roas = spend > 0 ? revenue / spend : 0;
  const profit = revenue - spend;

  const applyPreset = (p: Preset) => {
    setRevenue(p.revenue);
    setSpend(p.spend);
    toast.success(`Loaded: ${p.name}`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      revenue, spend, roas: Math.round(roas * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nTotal Ad Revenue,${revenue}\nTotal Ad Spend,${spend}\nROAS,${roas.toFixed(2)}x\nNet Profit,${profit}`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roas-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Target className="w-5 h-5 text-violet-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">ROAS Calculator</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-violet-400 transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Ad Revenue ($)</label>
            <input type="number" value={revenue} onChange={e => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-violet-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Marketing Ad Spend ($)</label>
            <input type="number" value={spend} onChange={e => setSpend(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-violet-500 transition-colors" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Net Profit</span>
                <p className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>${profit.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Spend Efficiency</span>
                <p className="text-sm text-[var(--text-secondary)]">${spend.toLocaleString()} spend → ${revenue.toLocaleString()} revenue</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(roas.toFixed(2) + 'x'); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-violet-500/10 text-[var(--text-muted)] hover:text-violet-500 rounded-lg transition-colors" title="Copy ROAS" aria-label="Copy ROAS"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-violet-500/10 text-[var(--text-muted)] hover:text-violet-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-violet-500/10 text-[var(--text-muted)] hover:text-violet-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Return on Ad Spend (ROAS)</span>
            <p className="text-5xl font-extrabold text-violet-500">{roas.toFixed(2)}x</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{roas >= 1 ? 'Profitable campaign' : 'Losing money'} · ${revenue.toLocaleString()} / ${spend.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <CalcActions
        result={`ROAS: ${roas.toFixed(2)}x | Net Profit: $${profit.toFixed(2)}`}
        downloadData={csvContent}
        downloadFilename="roas-calculation.csv"
        accent="violet"
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
                  <th className="pb-2 pr-3">Revenue</th>
                  <th className="pb-2 pr-3">Spend</th>
                  <th className="pb-2 pr-3">Profit</th>
                  <th className="pb-2">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">${h.revenue.toLocaleString()}</td>
                    <td className="py-1.5 pr-3">${h.spend.toLocaleString()}</td>
                    <td className={`py-1.5 pr-3 ${h.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>${h.profit.toFixed(2)}</td>
                    <td className="py-1.5 font-bold text-violet-500">{h.roas}x</td>
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
