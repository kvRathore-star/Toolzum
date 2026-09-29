"use client";

import React, { useState } from 'react';
import { Award, Calculator, Info, RefreshCw, Copy, Check, BarChart3, Sliders } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { clipboardWrite } from "@/lib/clipboard";

const FORMULAS = [
  { id: 'cbse', name: 'CBSE Board', logo: '📚', formula: 'Percentage = CGPA × 9.5', desc: 'The Central Board of Secondary Education (CBSE) standard multiplication factor.' },
  { id: 'mu', name: 'Mumbai University (MU)', logo: '🎓', formula: '10-Point Pointer Scale Formula', desc: 'Percentage = 7.25 × CGPA + 11 (if CGPA < 7) or 7.1 × CGPA + 12 (if CGPA ≥ 7).' },
  { id: 'vtu', name: 'VTU', logo: '⚙️', formula: 'Percentage = (CGPA - 0.75) × 10', desc: 'Visvesvaraya Technological University standard engineering conversion formula.' },
  { id: 'aktu', name: 'AKTU', logo: '🔧', formula: 'Percentage = (CGPA - 0.75) × 10', desc: 'Dr. A.P.J. Abdul Kalam Technical University standard engineering conversion scale.' },
  { id: 'sppu', name: 'SPPU (Pune)', logo: '📖', formula: '% = CGPA × 8.8 (<9) or × 9.0 (≥9)', desc: 'Savitribai Phule Pune University conversion guidelines.' },
  { id: 'anna', name: 'Anna University', logo: '🏛️', formula: 'Percentage = (CGPA - 0.75) × 10', desc: 'Anna University standard conversion for engineering programmes.' },
  { id: 'jntu', name: 'JNTU', logo: '🔬', formula: 'Percentage = (CGPA - 0.75) × 10', desc: 'Jawaharlal Nehru Technological University standard engineering conversion.' },
  { id: 'du', name: 'Delhi University (DU)', logo: '🏫', formula: 'Percentage = CGPA × 9.5', desc: 'University of Delhi follows the CBSE-equivalent 9.5 multiplier for CGPA to percentage.' },
  { id: 'custom', name: 'Custom Scale', logo: '⚡', formula: 'Percentage = CGPA × Factor', desc: 'Define your own multiplication factor for custom conversions.' }
];

const QUICK_CGPA = ['6.5', '7.2', '8.0', '8.5', '9.1', '9.8'];

export default function CgpaToPercentage() {
  const [board, setBoard] = useState('cbse');
  const [cgpa, setCgpa] = useState('8.0');
  const [customFactor, setCustomFactor] = useState('9.5');
  const [result, setResult] = useState<{ percentage: number; division: string; description: string } | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);

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

  const allResults = FORMULAS.filter(f => f.id !== 'custom').map(f => {
    const cgpaVal = parseFloat(cgpa);
    if (isNaN(cgpaVal)) return null;
    let pct = 0;
    if (f.id === 'cbse' || f.id === 'du') {
      pct = cgpaVal * 9.5;
    } else if (f.id === 'mu') {
      if (cgpaVal < 7) pct = (7.25 * cgpaVal) + 11;
      else pct = (7.1 * cgpaVal) + 12;
    } else if (['vtu', 'aktu', 'anna', 'jntu'].includes(f.id)) {
      pct = Math.max(0, (cgpaVal - 0.75) * 10);
    } else if (f.id === 'sppu') {
      if (cgpaVal < 9) pct = cgpaVal * 8.8;
      else pct = cgpaVal * 9.0;
    }
    return { ...f, pct: Math.min(100, pct) };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  const circumference = 2 * Math.PI * 54;
  const progress = result ? (result.percentage / 100) * circumference : 0;

  const handleCopyResult = () => {
    if (!result) return;
    const text = `CGPA ${cgpa} → ${result.percentage.toFixed(2)}% (${result.division}) — ${result.description}`;
    clipboardWrite(text).then(ok => { if (ok) { setCopiedResult(true); toast.success('Result copied!'); setTimeout(() => setCopiedResult(false), 2000); } else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-overlay)] p-6 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Calculator className="w-6 h-6" style={{ color: '#8b5cf6' }} />
            CGPA to Percentage Converter
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
          Convert 10-point CGPA pointers to equivalent percentage scales officially used by Indian boards and universities — CBSE, MU, VTU, AKTU, SPPU, Anna University, JNTU, DU, and custom scales.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[var(--text-primary)]">Select Board or University Scale</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {FORMULAS.map(f => (
                <motion.button key={f.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setBoard(f.id); setResult(null); }}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer ${
                    board === f.id ? 'border-transparent shadow-md' : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] hover:border-[var(--accent)]'
                  }`}
                  style={board === f.id ? { borderColor: '#8b5cf6', backgroundColor: '#8b5cf612' } : {}}>
                  <span className="text-xl block mb-0.5">{f.logo}</span>
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] block leading-tight">{f.name.split(' ')[0]}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[var(--text-primary)]">Enter CGPA / Pointer (out of 10)</label>
            <div className="flex gap-4 items-center">
              <div className="relative">
                <input aria-label="Enter CGPA / Pointer (out of 10)" type="number" step="0.01" min="0" max="10" value={cgpa} onChange={e => setCgpa(e.target.value)}
                  className="w-28 bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-3 text-lg font-mono text-center text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-all duration-200"
                  style={{ borderColor: cgpa ? '#8b5cf6' : undefined }}
                  onKeyDown={e => e.key === 'Enter' && calculate()} />
              </div>
              <input aria-label="Enter CGPA / Pointer (out of 10)" type="range" min="0" max="10" step="0.1" value={cgpa} onChange={e => setCgpa(e.target.value)} className="flex-1" style={{ accentColor: '#8b5cf6' }} />
              <div className="flex gap-1 flex-wrap">
                {QUICK_CGPA.map(q => (
                  <button key={q} onClick={() => setCgpa(q)}
                    className="px-2 py-1 text-[10px] font-mono font-bold rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-violet-400 hover:text-violet-500 transition-all cursor-pointer bg-[var(--bg-overlay)]/50">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {board === 'custom' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
              <label htmlFor="lbl-cgpatopercentage-multiplication-factor" className="block text-sm font-bold text-[var(--text-primary)]">Multiplication Factor</label>
              <input id="lbl-cgpatopercentage-multiplication-factor" aria-label="Multiplication Factor" type="number" step="0.1" value={customFactor} onChange={e => setCustomFactor(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-violet-500 rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
            </motion.div>
          )}

          <div className="flex gap-4">
            <button onClick={calculate}
              className="flex-1 bg-gradient-to-r from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-500/25">
              <Calculator className="w-5 h-5" /> Convert to Percentage
            </button>
            <button onClick={handleReset}
              className="px-5 py-3.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold rounded-xl transition-all cursor-pointer"
              aria-label="Reset form">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 border-t border-[var(--border-subtle)] pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl text-center" style={{ backgroundColor: '#8b5cf610', borderColor: '#8b5cf620', borderWidth: 1 }}>
                    <div className="relative w-32 h-32 mb-3">
                      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-zinc-700" />
                        <motion.circle cx="60" cy="60" r="54" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: circumference - progress }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                          className="text-2xl font-black block" style={{ color: '#8b5cf6' }}>
                          {result.percentage.toFixed(1)}%
                        </motion.span>
                      </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: '#8b5cf6' }}>Percentage Equivalent</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl text-center" style={{ backgroundColor: result.percentage >= 75 ? '#10b98110' : result.percentage >= 60 ? '#f59e0b10' : '#ef444410', borderColor: result.percentage >= 75 ? '#10b98120' : result.percentage >= 60 ? '#f59e0b20' : '#ef444420', borderWidth: 1 }}>
                    <span className="text-4xl mb-2">
                      {result.percentage >= 75 ? '🌟' : result.percentage >= 60 ? '⭐' : result.percentage >= 40 ? '📋' : '📝'}
                    </span>
                    <span className="text-lg font-bold block" style={{ color: result.percentage >= 75 ? '#10b981' : result.percentage >= 60 ? '#f59e0b' : '#ef4444' }}>{result.division}</span>
                    <span className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: '#8b5cf6' }}>Division / Grade</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: '#8b5cf608', borderColor: '#8b5cf620', borderWidth: 1 }}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: '#8b5cf6' }}>Formula Used</span>
                      <span className="text-sm text-[var(--text-secondary)]">{result.description}</span>
                    </div>
                    <button aria-label="Copy result" onClick={handleCopyResult}
                      className="p-2 rounded-lg transition-colors ml-3 cursor-pointer" style={{ backgroundColor: copiedResult ? '#10b98120' : '#8b5cf615', color: copiedResult ? '#10b981' : '#8b5cf6' }}>
                      {copiedResult ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" style={{ color: '#8b5cf6' }} /> All Boards Comparison
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {allResults.map((r) => (
                      <div key={r.id} className={`p-2 rounded-lg border text-center transition-all ${r.id === board ? 'border-transparent' : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)]'}`}
                        style={r.id === board ? { borderColor: '#8b5cf6', backgroundColor: '#8b5cf610' } : {}}>
                        <span className="text-xs block mb-0.5">{r.logo}</span>
                        <span className="text-[9px] font-bold text-[var(--text-secondary)] block">{r.name.split(' ')[0]}</span>
                        <span className="text-sm font-black block" style={{ color: r.id === board ? '#8b5cf6' : 'var(--text-primary)' }}>{r.pct.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-6 rounded-2xl space-y-6">
          <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2"><Award className="w-4 h-4" style={{ color: '#8b5cf6' }} />Conversion Guidelines</h4>
          <div className="space-y-4">
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[var(--text-primary)] block">{currentFormula?.name} Scale</span>
              <span className="font-mono block" style={{ color: '#8b5cf6' }}>{currentFormula?.formula}</span>
              <p className="text-[var(--text-secondary)] leading-relaxed mt-1">{currentFormula?.desc}</p>
            </div>
            <div className="p-4 bg-white dark:bg-black/35 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-2">
              <span className="font-bold text-[var(--text-primary)] flex items-center gap-1"><Info className="w-4 h-4" style={{ color: '#8b5cf6' }} />Division Rule (Standard)</span>
              <ul className="space-y-1 font-mono text-[10px]">
                <li>≥ 75%: First Class with Distinction</li><li>60% to 74.9%: First Class</li><li>50% to 59.9%: Second Class</li><li>40% to 49.9%: Pass Class</li><li>&lt; 40%: Fail</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
