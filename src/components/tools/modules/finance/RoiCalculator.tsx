"use client";
import React, { useState } from 'react';
import { Percent, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalcActions } from '../shared/CalcActions';

type Preset = { name: string; initial: number; final: number };
const PRESETS: Preset[] = [
  { name: 'Stock Investment', initial: 10000, final: 15000 },
  { name: 'Real Estate', initial: 200000, final: 260000 },
  { name: 'Small Business', initial: 50000, final: 75000 },
  { name: 'Marketing Campaign', initial: 5000, final: 12000 },
];

type HistoryEntry = { initial: number; final: number; gain: number; roi: number; timestamp: string };

export default function RoiCalculator() {
  const [initial, setInitial] = useState(10000);
  const [final, setFinal] = useState(15000);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const gain = final - initial;
  const roi = initial > 0 ? (gain / initial) * 100 : 0;
  const roiColor = roi >= 0 ? 'text-emerald-500' : 'text-red-500';

  const applyPreset = (p: Preset) => {
    setInitial(p.initial);
    setFinal(p.final);
    toast.success(`Loaded: ${p.name}`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      initial, final, gain: Math.round(gain * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nInitial Investment,${initial}\nFinal Value,${final}\nNet Gain,${gain}\nROI,${roi.toFixed(2)}%`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roi-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Percent className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">ROI Calculator</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400 transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Initial Investment ($)</label>
            <input type="number" value={initial} onChange={e => setInitial(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Final Value ($)</label>
            <input type="number" value={final} onChange={e => setFinal(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Net Return Gain</span>
                <p className={`text-xl font-bold ${gain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>${gain.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Total Return</span>
                <p className="text-sm text-[var(--text-secondary)]">${final.toLocaleString()} from ${initial.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(roi.toFixed(2) + '%'); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Copy ROI" aria-label="Copy ROI"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-emerald-700/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs text-[var(--text-muted)]">Return on Investment (ROI)</span>
            <p className={`text-4xl font-extrabold ${roiColor}`}>{roi.toFixed(2)}%</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{gain >= 0 ? 'Profitable' : 'Loss'}</p>
          </div>
        </div>
      </div>

      <CalcActions
        result={`ROI: ${roi.toFixed(2)}% | Net Gain: $${gain.toFixed(2)}`}
        downloadData={csvContent}
        downloadFilename="roi-calculation.csv"
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
                  <th className="pb-2 pr-3">Initial</th>
                  <th className="pb-2 pr-3">Final</th>
                  <th className="pb-2 pr-3">Gain</th>
                  <th className="pb-2">ROI</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">${h.initial.toLocaleString()}</td>
                    <td className="py-1.5 pr-3">${h.final.toLocaleString()}</td>
                    <td className={`py-1.5 pr-3 ${h.gain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>${h.gain.toFixed(2)}</td>
                    <td className={`py-1.5 font-bold ${h.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{h.roi}%</td>
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
