"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { gradePointsMap, inputCls } from '../Calculators.shared';

export default function CollegeGpaCalculator() {
  const [semGrades, setSemGrades] = useState('A,B+,A-');
  const [semCredits, setSemCredits] = useState('3,4,3');
  const [prevGpa, setPrevGpa] = useState('3.5');
  const [prevCredits, setPrevCredits] = useState('30');
  const presets = [
    { label: 'First Semester', apply: () => { setSemGrades('A,B+,A-'); setSemCredits('3,4,3'); setPrevGpa('0'); setPrevCredits('0'); } },
    { label: 'Junior Year', apply: () => { setSemGrades('A-,A,B'); setSemCredits('4,3,3'); setPrevGpa('3.2'); setPrevCredits('60'); } },
  ];
  const g = semGrades.split(',').map(g => g.trim().toUpperCase());
  const c = semCredits.split(',').map(Number);
  let tp = 0, tc = 0;
  for (let i = 0; i < g.length; i++) { tp += (gradePointsMap[g[i]] || 0) * c[i]; tc += c[i]; }
  const semGpa = tc > 0 ? tp / tc : 0;
  const pg = parseFloat(prevGpa) || 0;
  const pc = parseFloat(prevCredits) || 0;
  const hasInput = g.length > 0 && tc > 0;
  const cumGpa = (pc + tc) > 0 ? (pg * pc + tp) / (pc + tc) : 0;
  const customResult = !hasInput ? (
    <div className="text-sm text-[var(--text-muted)]">Enter semester grades and credits</div>
  ) : (
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Semester GPA</div>
        <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{semGpa.toFixed(2)}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[var(--text-tertiary)]">Cumulative GPA</div>
        <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{cumGpa.toFixed(2)}</div>
      </div>
    </div>
  );
  return (
    <CalculatorShell category="Calculator" title="College GPA Calculator" result="" auto presets={presets} accent="purple" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Semester Grades (e.g., A,B+,A-)</label><input aria-label="Semester Grades (e.g., A,B+,A-)" type="text" value={semGrades} onChange={e => setSemGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Semester Credits</label><input aria-label="Semester Credits" type="text" value={semCredits} onChange={e => setSemCredits(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Previous GPA</label><input aria-label="Previous GPA" type="number" value={prevGpa} onChange={e => setPrevGpa(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Previous Credits</label><input aria-label="Previous Credits" type="number" value={prevCredits} onChange={e => setPrevCredits(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
