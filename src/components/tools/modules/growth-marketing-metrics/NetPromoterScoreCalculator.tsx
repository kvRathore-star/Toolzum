"use client";
import React, { useState } from 'react';
import { BarChart, Copy, Download, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalcActions } from '../shared/CalcActions';

type HistoryEntry = { promoters: number; passives: number; detractors: number; total: number; nps: number; timestamp: string };

export default function NetPromoterScoreCalculator() {
  const [promoters, setPromoters] = useState(70);
  const [passives, setPassives] = useState(20);
  const [detractors, setDetractors] = useState(10);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const total = promoters + passives + detractors;
  const nps = total > 0 ? ((promoters - detractors) / total) * 100 : 0;
  const promoterPct = total > 0 ? (promoters / total) * 100 : 0;
  const passivePct = total > 0 ? (passives / total) * 100 : 0;
  const detractorPct = total > 0 ? (detractors / total) * 100 : 0;

  const npsLabel = nps >= 70 ? 'Excellent' : nps >= 50 ? 'Great' : nps >= 30 ? 'Good' : nps >= 0 ? 'Needs Improvement' : 'Poor';
  const npsColor = nps >= 50 ? 'text-emerald-500' : nps >= 0 ? 'text-amber-500' : 'text-red-500';

  const addToHistory = () => {
    setHistory(prev => [{
      promoters, passives, detractors, total,
      nps: Math.round(nps * 10) / 10,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
    toast.success('Added to history');
  };

  const csvContent = `Metric,Value\nPromoters,${promoters}\nPassives,${passives}\nDetractors,${detractors}\nTotal Respondents,${total}\nNPS Score,${nps.toFixed(1)}\nRating,${npsLabel}\nPromoter %,${promoterPct.toFixed(1)}%\nPassive %,${passivePct.toFixed(1)}%\nDetractor %,${detractorPct.toFixed(1)}%`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nps-calculation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <BarChart className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Net Promoter Score (NPS)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label htmlFor="lbl-netpromoterscorecalculator-promoters-9-10" className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Promoters (9-10)</label>
              <input id="lbl-netpromoterscorecalculator-promoters-9-10" aria-label="Promoters (9-10)" type="number" value={promoters} onChange={e => setPromoters(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-emerald-500 transition-colors" />
            </div>
            <div className="space-y-1">
              <label htmlFor="lbl-netpromoterscorecalculator-passives-7-8" className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Passives (7-8)</label>
              <input id="lbl-netpromoterscorecalculator-passives-7-8" aria-label="Passives (7-8)" type="number" value={passives} onChange={e => setPassives(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] transition-colors" />
            </div>
            <div className="space-y-1">
              <label htmlFor="lbl-netpromoterscorecalculator-detractors-0-6" className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Detractors (0-6)</label>
              <input id="lbl-netpromoterscorecalculator-detractors-0-6" aria-label="Detractors (0-6)" type="number" value={detractors} onChange={e => setDetractors(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-red-500 transition-colors" />
            </div>
          </div>

          {/* Visual bar chart */}
          {total > 0 && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="w-4 h-2.5 rounded bg-emerald-700" />
                <span>Promoters {promoterPct.toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-[var(--bg-overlay)] rounded-full overflow-hidden flex">
                <div style={{ width: `${promoterPct}%` }} className="bg-emerald-700 h-full transition-all duration-300" />
                <div style={{ width: `${passivePct}%` }} className="bg-[var(--bg-elevated)] h-full transition-all duration-300" />
                <div style={{ width: `${detractorPct}%` }} className="bg-red-500 h-full transition-all duration-300" />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>{promoters} promoters</span>
                <span>{passives} passives</span>
                <span>{detractors} detractors</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Total Respondents</h4>
              <p className="text-2xl font-bold text-[var(--text-primary)] dark:text-white">{total.toLocaleString()} ratings</p>
              <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                <div className="text-center">
                  <p className="font-bold text-emerald-500">{promoters}</p>
                  <p className="text-[var(--text-muted)]">Promoters</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-[var(--text-muted)]">{passives}</p>
                  <p className="text-[var(--text-muted)]">Passives</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-red-500">{detractors}</p>
                  <p className="text-[var(--text-muted)]">Detractors</p>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { clipboardWrite(nps.toFixed(1)); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--accent-ink)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] rounded-lg transition-colors" title="Copy NPS" aria-label="Copy NPS"><Copy size={14} /></button>
              <button onClick={handleDownload} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--accent-ink)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] rounded-lg transition-colors" title="Download CSV" aria-label="Download CSV"><Download size={14} /></button>
              <button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--accent-ink)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] rounded-lg transition-colors" title="Save to history" aria-label="Save to history"><History size={14} /></button>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
            <span className="text-xs text-[var(--text-muted)] font-medium">Net Promoter Score</span>
            <p className={`text-5xl font-extrabold ${npsColor}`}>{nps.toFixed(0)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Rating: {npsLabel}</p>
          </div>
        </div>
      </div>

      <CalcActions
        result={`NPS: ${nps.toFixed(0)} (${npsLabel})`}
        downloadData={csvContent}
        downloadFilename="nps-calculation.csv"
        accent="indigo"
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
                  <th className="pb-2 pr-3">P</th>
                  <th className="pb-2 pr-3">Pas</th>
                  <th className="pb-2 pr-3">D</th>
                  <th className="pb-2 pr-3">Total</th>
                  <th className="pb-2">NPS</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-3">{h.timestamp}</td>
                    <td className="py-1.5 pr-3 text-emerald-500">{h.promoters}</td>
                    <td className="py-1.5 pr-3">{h.passives}</td>
                    <td className="py-1.5 pr-3 text-red-500">{h.detractors}</td>
                    <td className="py-1.5 pr-3">{h.total}</td>
                    <td className={`py-1.5 font-bold ${h.nps >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{h.nps.toFixed(1)}</td>
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
