"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

const trimNum = (v: number): string => {
  if (!Number.isFinite(v)) return 'undefined';
  const r = Math.round(v * 1e6) / 1e6;
  return String(r);
};

export default function QuadraticEquationSolver() {
  const [a, setA] = useState('1');
  const [b, setB] = useState('-3');
  const [c, setC] = useState('2');
  const presets = [
    { label: 'x\u00b2-3x+2=0', apply: () => { setA('1'); setB('-3'); setC('2'); } },
    { label: 'x\u00b2-4=0', apply: () => { setA('1'); setB('0'); setC('-4'); } },
    { label: 'x\u00b2+x+1=0', apply: () => { setA('1'); setB('1'); setC('1'); } },
  ];
  const A = parseFloat(a);
  const B = parseFloat(b);
  const C = parseFloat(c);
  const hasAll = a.trim() !== '' && b.trim() !== '' && c.trim() !== '' && Number.isFinite(A) && Number.isFinite(B) && Number.isFinite(C);
  // Full solution (the old version showed only the discriminant): linear
  // fallback for a=0, real roots, or complex pair with working shown.
  let disc = NaN;
  let rootsLine = 'Enter a, b, c to solve';
  let stepsLine = '';
  if (hasAll) {
    if (A === 0) {
      if (B === 0) {
        rootsLine = C === 0 ? 'Infinite solutions (0 = 0)' : 'No solution (contradiction)';
      } else {
        const x = -C / B;
        rootsLine = `Linear equation — x = ${trimNum(x)}`;
        stepsLine = `x = −c / b = ${trimNum(-C)} / ${trimNum(B)}`;
      }
    } else {
      disc = B * B - 4 * A * C;
      if (disc > 0) {
        const r1 = (-B + Math.sqrt(disc)) / (2 * A);
        const r2 = (-B - Math.sqrt(disc)) / (2 * A);
        rootsLine = `x₁ = ${trimNum(r1)},  x₂ = ${trimNum(r2)}`;
        stepsLine = `x = (−b ± √${trimNum(disc)}) / 2a`;
      } else if (disc === 0) {
        const r = -B / (2 * A);
        rootsLine = `Double root — x = ${trimNum(r)}`;
        stepsLine = `x = −b / 2a`;
      } else {
        const real = -B / (2 * A);
        const imag = Math.sqrt(-disc) / (2 * A);
        rootsLine = `x₁ = ${trimNum(real)} + ${trimNum(imag)}i,  x₂ = ${trimNum(real)} − ${trimNum(imag)}i`;
        stepsLine = `Discriminant < 0 — complex conjugate pair`;
      }
    }
  }
  const customResult = (
    <div className="text-center space-y-1">
      <div className="text-lg font-bold text-[var(--text-primary)]">{rootsLine}</div>
      {stepsLine && <div className="text-xs text-[var(--text-secondary)]">{stepsLine}</div>}
      {hasAll && A !== 0 && (
        <div className="text-xs text-[var(--text-tertiary)]">Discriminant: <span className={`font-bold ${disc >= 0 ? 'text-[var(--accent)]' : 'text-[var(--accent)]'}`}>{disc.toFixed(2)}</span></div>
      )}
    </div>
  );
  return (
    <CalculatorShell category="Calculator" title="Quadratic Solver" result="" auto presets={presets} accent="pink" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label htmlFor="lbl-quadraticequationsolver-a" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">a (x² coefficient)</label><input id="lbl-quadraticequationsolver-a" aria-label="a, x squared coefficient" type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-quadraticequationsolver-b" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">b (x coefficient)</label><input id="lbl-quadraticequationsolver-b" aria-label="b, x coefficient" type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
        <div><label htmlFor="lbl-quadraticequationsolver-c" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">c (constant)</label><input id="lbl-quadraticequationsolver-c" aria-label="c, constant term" type="number" value={c} onChange={e => setC(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
