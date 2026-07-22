"use client";
import React, { useState } from 'react';
import { BarChart } from 'lucide-react';

export default function NetPromoterScoreCalculator() {
  const [promoters, setPromoters] = useState(70);
  const [passives, setPassives] = useState(20);
  const [detractors, setDetractors] = useState(10);

  const total = promoters + passives + detractors;
  const nps = total > 0 ? ((promoters - detractors) / total) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <BarChart className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Net Promoter Score (NPS)</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Promoters (9-10)</label>
              <input type="number" value={promoters} onChange={e => setPromoters(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] text-xs outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Passives (7-8)</label>
              <input type="number" value={passives} onChange={e => setPassives(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] text-xs outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Detractors (0-6)</label>
              <input type="number" value={detractors} onChange={e => setDetractors(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] text-xs outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Total Respondents</h4>
            <p className="text-2xl font-bold text-zinc-800 dark:text-white">{total.toLocaleString()} ratings</p>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4 mt-6">
            <span className="text-xs text-[var(--text-muted)] font-medium">Net Promoter Score</span>
            <p className="text-5xl font-extrabold text-[var(--accent)]">{nps.toFixed(0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}