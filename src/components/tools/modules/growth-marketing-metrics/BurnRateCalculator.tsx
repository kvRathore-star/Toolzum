"use client";
import React, { useState } from 'react';
import { DollarSign, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalcActions } from '../shared/CalcActions';

type Preset = { name: string; starting: number; ending: number; months: number };
const PRESETS: Preset[] = [
  { name: 'Pre-Seed Startup', starting: 50000, ending: 30000, months: 3 },
  { name: 'Seed Stage', starting: 250000, ending: 150000, months: 4 },
  { name: 'Series A', starting: 1000000, ending: 700000, months: 6 },
  { name: 'Bootstrapped', starting: 30000, ending: 15000, months: 2 },
];

type HistoryEntry = { starting: number; ending: number; months: number; burn: number; runway: number; timestamp: string };

export default function BurnRateCalculator() {
  const [starting, setStarting] = useState(100000);
  const [ending, setEnding] = useState(70000);
  const [months, setMonths] = useState(3);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const totalBurn = starting - ending;
  const burn = months > 0 ? totalBurn / months : 0;
  const runway = burn > 0 ? ending / burn : 0;
  const burnRate = starting > 0 ? (totalBurn / starting) * 100 : 0;

  const applyPreset = (p: Preset) => {
    setStarting(p.starting);
    setEnding(p.ending);
    setMonths(p.months);
    toast.success(`Loaded: ${p.name}`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      starting, ending, months,
      burn: Math.round(burn * 100) / 100,
      runway: Math.round(runway * 10) / 10,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nStarting Cash Balance,${starting}\nEnding Cash Balance,${ending}\nTime Period (Months),${months}\nTotal Burn,${totalBurn}\nMonthly Burn Rate,${burn.toFixed(2)}\nBurn Rate (%),${burnRate.toFixed(1)}%\nCash Runway,${runway.toFixed(1)} months`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'burn-rate-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Startup Burn Rate & Runway</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400 transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="lbl-burnratecalculator-starting-cash-balance" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Starting Cash Balance ($)</label>
            <input id="lbl-burnratecalculator-starting-cash-balance" aria-label="Starting Cash Balance ($)" type="number" value={starting} onChange={e => setStarting(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label htmlFor="lbl-burnratecalculator-ending-cash-balance" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ending Cash Balance ($)</label>
            <input id="lbl-burnratecalculator-ending-cash-balance" aria-label="Ending Cash Balance ($)" type="number" value={ending} onChange={e => setEnding(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Time Period (Months)</label>
            <input aria-label="Time Period (Months)" type="number" value={months} onChange={e => setMonths(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
            <input aria-label="Time Period (Months)" type="range" min="1" max="24" step="1" value={months} onChange={e => setMonths(parseInt(e.target.value))} className="w-full accent-emerald-500 mt-1" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Total Cash Burn</span>
                <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">${totalBurn.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Burn Rate</span>
                <p className="text-sm text-[var(--text-secondary)]">{burnRate.toFixed(1)}% of starting capital</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(burn.toFixed(2)).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Copy burn rate" aria-label="Copy burn rate"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4 mt-4">
            <div>
              <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Monthly Burn</h4>
              <p className="text-3xl font-extrabold text-[var(--text-secondary)] dark:text-white">${Math.round(burn).toLocaleString()}<span className="text-sm font-normal text-[var(--text-muted)]">/mo</span></p>
            </div>
            <div>
              <span className="text-xs text-[var(--text-muted)]">Cash Runway Remaining</span>
              <p className="text-4xl font-extrabold text-emerald-500">{runway.toFixed(1)} <span className="text-sm font-normal">months</span></p>
            </div>
          </div>
        </div>
      </div>

      <CalcActions
        result={`Monthly Burn: $${Math.round(burn).toLocaleString()} | Runway: ${runway.toFixed(1)} months`}
        downloadData={csvContent}
        downloadFilename="burn-rate-calculation.csv"
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
                  <th className="pb-2 pr-3">Start</th>
                  <th className="pb-2 pr-3">End</th>
                  <th className="pb-2 pr-3">Per Mo</th>
                  <th className="pb-2">Runway</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">${h.starting.toLocaleString()}</td>
                    <td className="py-1.5 pr-3">${h.ending.toLocaleString()}</td>
                    <td className="py-1.5 pr-3">${Math.round(h.burn).toLocaleString()}</td>
                    <td className="py-1.5 font-bold text-emerald-500">{h.runway} mo</td>
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
