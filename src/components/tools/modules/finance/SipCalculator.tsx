"use client";
import React, { useState } from 'react';
import { TrendingUp, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalcActions } from '../shared/CalcActions';

type Preset = { name: string; monthly: number; rate: number; years: number };
const PRESETS: Preset[] = [
  { name: 'Conservative', monthly: 5000, rate: 8, years: 10 },
  { name: 'Moderate', monthly: 10000, rate: 12, years: 15 },
  { name: 'Aggressive', monthly: 25000, rate: 15, years: 20 },
  { name: 'Short Term', monthly: 15000, rate: 10, years: 3 },
];

type HistoryEntry = { monthly: number; rate: number; years: number; totalInvested: number; futureValue: number; timestamp: string };

export default function SipCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const p = monthly;
  const i = rate / 12 / 100;
  const n = years * 12;

  const totalInvested = p * n;
  const futureValue = i > 0
    ? p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
    : totalInvested;
  const wealthGained = futureValue - totalInvested;

  const applyPreset = (pr: Preset) => {
    setMonthly(pr.monthly);
    setRate(pr.rate);
    setYears(pr.years);
    toast.success(`Loaded: ${pr.name}`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      monthly, rate, years,
      totalInvested: Math.round(totalInvested),
      futureValue: Math.round(futureValue),
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  // Year-by-year breakdown
  const yearlyData = Array.from({ length: years }, (_, yr) => {
    const monthsDone = (yr + 1) * 12;
    const fv = i > 0
      ? p * ((Math.pow(1 + i, monthsDone) - 1) / i) * (1 + i)
      : p * monthsDone;
    const invested = p * monthsDone;
    return { year: yr + 1, invested: Math.round(invested), fv: Math.round(fv), gain: Math.round(fv - invested) };
  });

  const csvLines = ['Year,Invested,Value,Gain', ...yearlyData.map(y => `${y.year},${y.invested},${y.fv},${y.gain}`)];
  const csvContent = csvLines.join('\n') + `\n\nTotal Invested,${Math.round(totalInvested)}\nWealth Gained,${Math.round(wealthGained)}\nFinal Value,${Math.round(futureValue)}`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sip-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">SIP Calculator</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(pr => (
          <button key={pr.name} onClick={() => applyPreset(pr)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400 transition-colors">{pr.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Monthly Investment (₹)</label>
            <input type="number" value={monthly} onChange={e => setMonthly(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
            <input type="range" min="500" max="100000" step="500" value={monthly} onChange={e => setMonthly(parseInt(e.target.value))} className="w-full accent-emerald-500 mt-1" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Expected Return Rate (p.a. %)</label>
            <input type="number" value={rate} onChange={e => setRate(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
            <input type="range" min="1" max="30" step="0.5" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-emerald-500 mt-1" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Time Period (Years)</label>
            <input type="number" value={years} onChange={e => setYears(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
            <input type="range" min="1" max="40" step="1" value={years} onChange={e => setYears(parseInt(e.target.value))} className="w-full accent-emerald-500 mt-1" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Investment Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Total Invested</span>
                  <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">₹{Math.round(totalInvested).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Wealth Gain</span>
                  <p className="text-lg font-bold text-emerald-500">+₹{Math.round(wealthGained).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(Math.round(futureValue).toLocaleString('en-IN')); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Copy FV" aria-label="Copy FV"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs text-[var(--text-muted)]">Expected Future Value</span>
            <p className="text-3xl font-extrabold text-emerald-500">₹{Math.round(futureValue).toLocaleString('en-IN')}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">₹{monthly.toLocaleString('en-IN')}/mo × {years}yr at {rate}% p.a.</p>
          </div>
        </div>
      </div>

      <CalcActions
        result={`FV: ₹${Math.round(futureValue).toLocaleString('en-IN')} | Invested: ₹${Math.round(totalInvested).toLocaleString('en-IN')} | Gain: +₹${Math.round(wealthGained).toLocaleString('en-IN')}`}
        downloadData={csvContent}
        downloadFilename="sip-calculation.csv"
        accent="emerald"
      />

      {/* Year-by-year table */}
      <div className="border-t border-[var(--border-subtle)] pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Year-by-Year Breakdown</h4>
        </div>
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-[var(--bg-elevated)]">
              <tr className="text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                <th className="pb-2 pr-3">Year</th>
                <th className="pb-2 pr-3">Invested</th>
                <th className="pb-2 pr-3">Value</th>
                <th className="pb-2">Wealth Gain</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map(y => (
                <tr key={y.year} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]/30">
                  <td className="py-1.5 pr-3 font-bold text-[var(--text-primary)]">{y.year}</td>
                  <td className="py-1.5 pr-3">₹{y.invested.toLocaleString('en-IN')}</td>
                  <td className="py-1.5 pr-3">₹{y.fv.toLocaleString('en-IN')}</td>
                  <td className={`py-1.5 ${y.gain > 0 ? 'text-emerald-500' : ''}`}>+₹{y.gain.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <th className="pb-2 pr-3">Monthly</th>
                  <th className="pb-2 pr-3">Rate</th>
                  <th className="pb-2 pr-3">Years</th>
                  <th className="pb-2 pr-3">Invested</th>
                  <th className="pb-2">FV</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">₹{h.monthly.toLocaleString('en-IN')}</td>
                    <td className="py-1.5 pr-3">{h.rate}%</td>
                    <td className="py-1.5 pr-3">{h.years}</td>
                    <td className="py-1.5 pr-3">₹{h.totalInvested.toLocaleString('en-IN')}</td>
                    <td className="py-1.5 font-bold text-emerald-500">₹{h.futureValue.toLocaleString('en-IN')}</td>
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
