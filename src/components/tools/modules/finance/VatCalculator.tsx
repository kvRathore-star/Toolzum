"use client";
import React, { useState } from 'react';
import { DollarSign, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Preset = { name: string; rate: number };
const PRESETS: Preset[] = [
  { name: 'UK Standard', rate: 20 },
  { name: 'EU Standard', rate: 19 },
  { name: 'India GST 18%', rate: 18 },
  { name: 'India GST 12%', rate: 12 },
  { name: 'UAE 5%', rate: 5 },
  { name: 'Switzerland', rate: 8.1 },
];

type HistoryEntry = { netPrice: number; vatRate: number; vatAmount: number; grossPrice: number; timestamp: string };

export default function VatCalculator() {
  const [netPrice, setNetPrice] = useState(100);
  const [vatRate, setVatRate] = useState(15);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const vatAmount = netPrice * (vatRate / 100);
  const grossPrice = netPrice + vatAmount;
  const totalPercent = 100 + vatRate;
  const exclusiveFromGross = grossPrice > 0 ? (grossPrice / totalPercent) * 100 : 0;
  const exclusiveVat = grossPrice - exclusiveFromGross;

  const applyPreset = (p: Preset) => {
    setVatRate(p.rate);
    toast.success(`Loaded: ${p.name} (${p.rate}%)`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      netPrice, vatRate, vatAmount: Math.round(vatAmount * 100) / 100,
      grossPrice: Math.round(grossPrice * 100) / 100,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nNet Price (Excl. Tax),${netPrice}\nVAT Rate,${vatRate}%\nVAT Amount,${vatAmount.toFixed(2)}\nGross Price (Incl. Tax),${grossPrice.toFixed(2)}`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vat-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">VAT Calculator</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400 transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Net Price / Pre-tax ($)</label>
            <input type="number" value={netPrice} onChange={e => setNetPrice(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">VAT / GST Rate (%)</label>
            <input type="number" value={vatRate} onChange={e => setVatRate(Math.min(99, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
            <input type="range" min="0" max="28" step="0.5" value={vatRate} onChange={e => setVatRate(parseFloat(e.target.value))} className="w-full accent-emerald-500 mt-1" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[var(--text-muted)]">VAT / GST Amount</span>
                <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">${vatAmount.toFixed(2)}</p>
              </div>
              {vatRate > 0 && (
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Reverse Calculation</span>
                  <p className="text-xs text-[var(--text-secondary)]">From gross: VAT = ${exclusiveVat.toFixed(2)}</p>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(grossPrice.toFixed(2)); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Copy gross" aria-label="Copy gross"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs text-[var(--text-muted)]">Gross Price (Inclusive)</span>
            <p className="text-4xl font-extrabold text-emerald-500">${grossPrice.toFixed(2)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Net ${netPrice.toFixed(2)} + VAT ${vatAmount.toFixed(2)}</p>
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
                  <th className="pb-2 pr-3">Net</th>
                  <th className="pb-2 pr-3">Rate</th>
                  <th className="pb-2 pr-3">VAT</th>
                  <th className="pb-2">Gross</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">${h.netPrice.toFixed(2)}</td>
                    <td className="py-1.5 pr-3">{h.vatRate}%</td>
                    <td className="py-1.5 pr-3">${h.vatAmount.toFixed(2)}</td>
                    <td className="py-1.5 font-bold text-emerald-500">${h.grossPrice.toFixed(2)}</td>
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
