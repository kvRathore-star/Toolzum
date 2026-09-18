"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function ProportionCalculator() {
  const [a, setA] = useState('2');
  const [b, setB] = useState('5');
  const [c, setC] = useState('8');
  const presets = [
    { label: '2:5 = 8:?', apply: () => { setA('2'); setB('5'); setC('8'); } },
    { label: '3:4 = 12:?', apply: () => { setA('3'); setB('4'); setC('12'); } },
    { label: '1:10 = 5:?', apply: () => { setA('1'); setB('10'); setC('5'); } },
  ];
  const na = parseFloat(a) || 0;
  const nb = parseFloat(b) || 0;
  const nc = parseFloat(c) || 0;
  const hasInput = a !== '' && b !== '' && c !== '' && !isNaN(na) && !isNaN(nb) && !isNaN(nc) && na > 0;
  const d = hasInput ? (nb * nc) / na : 0;
  const customResult = (
    !hasInput ? (
      <div className="text-sm text-[var(--text-muted)]">Enter values to calculate</div>
    ) : (
    <div className="text-center font-mono text-lg">
      <span className="text-[var(--text-primary)]">{na} : {nb} = {nc} : <span className="text-[var(--accent)] font-bold">{d.toFixed(2)}</span></span>
    </div>
    )
  );
  return (
    <CalculatorShell category="Calculator" title="Proportion Calculator" result="" auto presets={presets} accent="indigo" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label htmlFor="lbl-proportioncalculator-a" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">A (first ratio)</label><input id="lbl-proportioncalculator-a" aria-label="A (first ratio)" type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-proportioncalculator-b-first-ratio" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">B (first ratio)</label><input id="lbl-proportioncalculator-b-first-ratio" aria-label="B (first ratio)" type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-proportioncalculator-c-solve-d" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">C (solve D)</label><input id="lbl-proportioncalculator-c-solve-d" aria-label="C (solve D)" type="number" value={c} onChange={e => setC(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
