"use client";
import React, { useState } from 'react';
import { Target, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalcActions } from '../shared/CalcActions';

type Preset = { name: string; conversions: number; visitors: number };
const PRESETS: Preset[] = [
  { name: 'E-commerce', conversions: 50, visitors: 1000 },
  { name: 'SaaS Landing Page', conversions: 120, visitors: 3000 },
  { name: 'Email Campaign', conversions: 250, visitors: 5000 },
  { name: 'Mobile App Install', conversions: 800, visitors: 20000 },
];

type HistoryEntry = { conversions: number; visitors: number; rate: number; timestamp: string };

export default function ConversionRateCalculator() {
  const [conversions, setConversions] = useState(50);
  const [visitors, setVisitors] = useState(1000);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const rate = visitors > 0 ? (conversions / visitors) * 100 : 0;
  const nonConverters = visitors - conversions;

  const applyPreset = (p: Preset) => {
    setConversions(p.conversions);
    setVisitors(p.visitors);
    toast.success(`Loaded: ${p.name}`);
  };

  const addToHistory = () => {
    setHistory(prev => [{
      conversions, visitors, rate: Math.round(rate * 100) / 100,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nConversions,${conversions}\nTotal Visitors,${visitors}\nNon-Converters,${nonConverters}\nConversion Rate,${rate.toFixed(2)}%`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversion-rate-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Target className="w-5 h-5 text-violet-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Conversion Rate Calculator</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-violet-400 transition-colors">{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="lbl-conversionratecalculator-conversions-count" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Conversions Count</label>
            <input id="lbl-conversionratecalculator-conversions-count" aria-label="Conversions Count" type="number" value={conversions} onChange={e => setConversions(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-violet-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label htmlFor="lbl-conversionratecalculator-total-visitors-traffic" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Visitors / Traffic</label>
            <input id="lbl-conversionratecalculator-total-visitors-traffic" aria-label="Total Visitors / Traffic" type="number" value={visitors} onChange={e => setVisitors(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-violet-500 transition-colors" />
          </div>
          {visitors > 0 && (
            <div className="mt-2 space-y-1">
              <div className="w-full h-2 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                <div style={{ width: `${Math.min(rate, 100)}%` }} className="bg-violet-500 h-full rounded-full transition-all duration-300" />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>{conversions} converted</span>
                <span>{nonConverters} did not convert</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Conversion Breakdown</span>
                <p className="text-sm text-[var(--text-secondary)]">{conversions} of {visitors} visitors</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Non-Converters</span>
                <p className="text-lg font-bold text-[var(--text-secondary)] dark:text-white">{nonConverters.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(rate.toFixed(2) + '%').then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-violet-500/10 text-[var(--text-muted)] hover:text-violet-500 rounded-lg transition-colors" title="Copy rate" aria-label="Copy rate"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-violet-500/10 text-[var(--text-muted)] hover:text-violet-500 rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-violet-500/10 text-[var(--text-muted)] hover:text-violet-500 rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Conversion Rate</span>
            <p className="text-5xl font-extrabold text-violet-500">{rate.toFixed(2)}%</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Visitor-to-conversion ratio</p>
          </div>
        </div>
      </div>

      <CalcActions
        result={`Conversion Rate: ${rate.toFixed(2)}%`}
        downloadData={csvContent}
        downloadFilename="conversion-rate-calculation.csv"
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
                  <th className="pb-2 pr-3">Converted</th>
                  <th className="pb-2 pr-3">Visitors</th>
                  <th className="pb-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3">{h.conversions.toLocaleString()}</td>
                    <td className="py-1.5 pr-3">{h.visitors.toLocaleString()}</td>
                    <td className="py-1.5 font-bold text-violet-500">{h.rate}%</td>
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
