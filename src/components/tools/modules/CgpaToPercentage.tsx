"use client";

import React, { useState } from 'react';
import { Award, Calculator, Info, RefreshCw, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const FORMULAS = [
  { id: 'cbse', name: 'CBSE Board', formula: 'Percentage = CGPA × 9.5', desc: 'The Central Board of Secondary Education (CBSE) standard multiplication factor.' },
  { id: 'mu', name: 'Mumbai University (MU)', formula: '10-Point Pointer Scale Formula', desc: 'Percentage = 7.25 × CGPA + 11 (if CGPA < 7) or 7.1 × CGPA + 12 (if CGPA ≥ 7).' },
  { id: 'vtu', name: 'VTU', formula: 'Percentage = (CGPA - 0.75) × 10', desc: 'Visvesvaraya Technological University standard engineering conversion formula.' },
  { id: 'aktu', name: 'AKTU', formula: 'Percentage = (CGPA - 0.75) × 10', desc: 'Dr. A.P.J. Abdul Kalam Technical University standard engineering conversion scale.' },
  { id: 'sppu', name: 'SPPU (Pune)', formula: 'Percentage = CGPA × 8.8 (CGPA < 9) or CGPA × 9.0 (CGPA ≥ 9)', desc: 'Savitribai Phule Pune University conversion guidelines.' },
  { id: 'anna', name: 'Anna University', formula: 'Percentage = (CGPA - 0.75) × 10', desc: 'Anna University standard conversion for engineering programmes.' },
  { id: 'jntu', name: 'JNTU', formula: 'Percentage = (CGPA - 0.75) × 10', desc: 'Jawaharlal Nehru Technological University standard engineering conversion.' },
  { id: 'du', name: 'Delhi University (DU)', formula: 'Percentage = CGPA × 9.5', desc: 'University of Delhi follows the CBSE-equivalent 9.5 multiplier for CGPA to percentage.' },
  { id: 'custom', name: 'Custom Scale', formula: 'Percentage = CGPA × Factor', desc: 'Define your own multiplication factor for custom conversions.' }
];

export default function CgpaToPercentage() {
  const [board, setBoard] = useState('cbse');
  const [cgpa, setCgpa] = useState('8.0');
  const [customFactor, setCustomFactor] = useState('9.5');
  const [result, setResult] = useState<{ percentage: number; division: string; description: string } | null>(null);

  const calculate = () => {
    const cgpaVal = parseFloat(cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) { toast.error('Please enter a valid CGPA between 0 and 10'); return; }

    let pct = 0;
    let desc = '';

    if (board === 'cbse' || board === 'du') {
      pct = cgpaVal * 9.5;
      desc = `${board === 'cbse' ? 'CBSE' : 'DU'} Conversion: CGPA ${cgpaVal} × 9.5 = ${pct.toFixed(2)}%`;
    } else if (board === 'mu') {
      if (cgpaVal < 7) { pct = (7.25 * cgpaVal) + 11; desc = `MU Formula (CGPA < 7): (7.25 × ${cgpaVal}) + 11 = ${pct.toFixed(2)}%`; }
      else { pct = (7.1 * cgpaVal) + 12; desc = `MU Formula (CGPA ≥ 7): (7.1 × ${cgpaVal}) + 12 = ${pct.toFixed(2)}%`; }
    } else if (['vtu', 'aktu', 'anna', 'jntu'].includes(board)) {
      pct = (cgpaVal - 0.75) * 10;
      if (pct < 0) pct = 0;
      desc = `${board.toUpperCase()} Formula: (${cgpaVal} - 0.75) × 10 = ${pct.toFixed(2)}%`;
    } else if (board === 'sppu') {
      if (cgpaVal < 9) { pct = cgpaVal * 8.8; desc = `SPPU Formula (CGPA < 9): ${cgpaVal} × 8.8 = ${pct.toFixed(2)}%`; }
      else { pct = cgpaVal * 9.0; desc = `SPPU Formula (CGPA ≥ 9): ${cgpaVal} × 9.0 = ${pct.toFixed(2)}%`; }
    } else {
      const factor = parseFloat(customFactor);
      if (isNaN(factor) || factor <= 0) { toast.error('Please enter a valid multiplication factor'); return; }
      pct = cgpaVal * factor;
      desc = `Custom scale: ${cgpaVal} × ${factor} = ${pct.toFixed(2)}%`;
    }

    let division = 'Pass Class';
    if (pct >= 75) division = 'First Class with Distinction';
    else if (pct >= 60) division = 'First Class';
    else if (pct >= 50) division = 'Second Class';
    else if (pct >= 40) division = 'Pass Class';
    else division = 'Fail / Re-appear';

    setResult({ percentage: Math.min(100, pct), division, description: desc });
    toast.success('Converted successfully!');
  };

  const handleReset = () => { setBoard('cbse'); setCgpa('8.0'); setCustomFactor('9.5'); setResult(null); };

  const currentFormula = FORMULAS.find(f => f.id === board);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-500" />
            CGPA to Percentage Converter
          </h2>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-1">
          Convert 10-point CGPA pointers to equivalent percentage scales officially used by Indian boards and universities — CBSE, MU, VTU, AKTU, SPPU, Anna University, JNTU, DU, and custom scales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Select Board or University Scale</label>
            <select value={board} onChange={e => { setBoard(e.target.value); setResult(null); }}
              className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none">
              {FORMULAS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Enter CGPA / Pointer (out of 10)</label>
            <div className="flex gap-4 items-center">
              <input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={e => setCgpa(e.target.value)}
                className="w-32 bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-lg font-mono text-center text-zinc-900 dark:text-white outline-none" />
              <input type="range" min="0" max="10" step="0.1" value={cgpa} onChange={e => setCgpa(e.target.value)} className="flex-1 accent-indigo-500" />
            </div>
          </div>

          {board === 'custom' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Multiplication Factor</label>
              <input type="number" step="0.1" value={customFactor} onChange={e => setCustomFactor(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none" />
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={calculate} className="flex-1 bg-[var(--accent)] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">Convert to Percentage</button>
            <button onClick={handleReset} className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-[var(--bg-surface)] dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-all cursor-pointer"><RefreshCw className="w-5 h-5" /></button>
          </div>

          {result && (
            <div className="space-y-6 border-t border-zinc-200 dark:border-zinc-800 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center space-y-1">
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block">Percentage Equiv</span>
                  <span className="text-3xl font-black text-indigo-500 block">{result.percentage.toFixed(2)}%</span>
                </div>
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Grading Division</span>
                  <span className="text-lg font-bold text-emerald-400 block mt-1">{result.division}</span>
                </div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl text-xs text-[var(--text-secondary)] dark:text-zinc-400 space-y-1">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Calculation Method:</span>
                <span>{result.description}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl space-y-6">
          <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2"><Award className="w-4 h-4 text-indigo-500" />Conversion Guidelines</h4>
          <div className="space-y-4">
            <div className="space-y-1 text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{currentFormula?.name} Scale</span>
              <span className="font-mono text-indigo-400 block">{currentFormula?.formula}</span>
              <p className="text-[var(--text-secondary)] leading-relaxed mt-1">{currentFormula?.desc}</p>
            </div>
            <div className="p-4 bg-white dark:bg-black/35 rounded-xl border border-zinc-200 dark:border-white/5 text-xs text-zinc-500 space-y-2">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1"><Info className="w-4 h-4 text-indigo-500" />Division Rule (Standard)</span>
              <ul className="space-y-1 font-mono text-[10px]">
                <li>≥ 75%: First Class with Distinction</li><li>60% to 74.9%: First Class</li><li>50% to 59.9%: Second Class</li><li>40% to 49.9%: Pass Class</li><li>&lt; 40%: Fail</li>
              </ul>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Batch convert a semester's worth of CGPAs, export conversion history as CSV, compare across university formulas side-by-side.</p>
              <Link href="/pricing" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline mt-1 inline-block">Upgrade →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
