"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { gradePointsMap, inputCls } from '../Calculators.shared';

export default function GpaCalculator() {
  const [grades, setGrades] = useState('A,B+,A-');
  const [credits, setCredits] = useState('3,4,3');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const g = grades.split(',').map(g => g.trim().toUpperCase());
    const c = credits.split(',').map(Number);
    let totalPoints = 0;
    let totalCredits = 0;
    const details: string[] = [];
    for (let i = 0; i < g.length; i++) {
      const gp = gradePointsMap[g[i]] || 0;
      totalPoints += gp * c[i];
      totalCredits += c[i];
      details.push(`${g[i]} (${c[i]} cr) = ${gp.toFixed(1)} \u00d7 ${c[i]}`);
    }
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setResult(`GPA: ${gpa.toFixed(2)}\nTotal Points: ${totalPoints.toFixed(1)}\nTotal Credits: ${totalCredits}`);
  }, [grades, credits]);
  const presets = [
    { label: 'Dean\'s List', apply: () => { setGrades('A,A-,B+'); setCredits('3,4,3'); } },
    { label: 'Average Semester', apply: () => { setGrades('B,B+,C+'); setCredits('3,3,4'); } },
  ];
  return (
    <CalculatorShell title="GPA Calculator" result={result} onCalculate={calc} presets={presets} accent="sky">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Grades (e.g., A,B+,A-)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Credits (comma-separated)</label><input type="text" value={credits} onChange={e => setCredits(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (() => {
        const g = grades.split(',').map(g => g.trim().toUpperCase());
        const c = credits.split(',').map(Number);
        let tp = 0, tc = 0;
        for (let i = 0; i < g.length; i++) { tp += (gradePointsMap[g[i]] || 0) * c[i]; tc += c[i]; }
        const gpa = tc > 0 ? tp / tc : 0;
        return (
          <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-tertiary)]">GPA</div>
            <div className={`text-3xl font-bold ${gpa >= 3.5 ? 'text-emerald-700 dark:text-emerald-400' : gpa >= 3.0 ? 'text-blue-700 dark:text-blue-400' : gpa >= 2.0 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>{gpa.toFixed(2)}</div>
          </div>
        );
      })()}
    </CalculatorShell>
  );
}
