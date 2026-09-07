"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { gradePointsMap, inputCls } from '../Calculators.shared';

export default function GpaCalculator() {
  const [grades, setGrades] = useState('A,B+,A-');
  const [credits, setCredits] = useState('3,4,3');
  const presets = [
    { label: 'Dean\'s List', apply: () => { setGrades('A,A-,B+'); setCredits('3,4,3'); } },
    { label: 'Average Semester', apply: () => { setGrades('B,B+,C+'); setCredits('3,3,4'); } },
  ];
  const g = grades.split(',').map(g => g.trim().toUpperCase());
  const c = credits.split(',').map(Number);
  let tp = 0, tc = 0;
  for (let i = 0; i < g.length; i++) { tp += (gradePointsMap[g[i]] || 0) * c[i]; tc += c[i]; }
  const hasInput = grades !== '' && credits !== '' && tc > 0;
  const gpa = hasInput ? tp / tc : 0;
  const customResult = (
    !hasInput ? (
      <div className="text-sm text-[var(--text-muted)]">Enter grades and credits</div>
    ) : (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">GPA</div>
      <div className={`text-lg font-bold ${gpa >= 3.5 ? 'text-emerald-700 dark:text-emerald-400' : gpa >= 3.0 ? 'text-blue-700 dark:text-blue-400' : gpa >= 2.0 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>{gpa.toFixed(2)}</div>
    </div>
    )
  );
  return (
    <CalculatorShell category="Calculator" title="GPA Calculator" result="" auto presets={presets} accent="sky" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Grades (e.g., A,B+,A-)</label><input aria-label="Grades (e.g., A,B+,A-)" type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Credits (comma-separated)</label><input aria-label="Credits (comma-separated)" type="text" value={credits} onChange={e => setCredits(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
