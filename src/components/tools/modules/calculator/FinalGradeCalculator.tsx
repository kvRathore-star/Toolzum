"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { GraduationCap, Calculator } from 'lucide-react';
import { inputCls } from '../Calculators.shared';

export default function FinalGradeCalculator() {
  const [grades, setGrades] = useState('85,90,78');
  const [weights, setWeights] = useState('20,30,50');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const g = grades.split(',').map(Number);
    const w = weights.split(',').map(Number);
    let total = 0;
    let weightSum = 0;
    for (let i = 0; i < g.length; i++) {
      total += g[i] * w[i] / 100;
      weightSum += w[i];
    }
    const final = weightSum > 0 ? total / (weightSum / 100) : 0;
    setResult(`Final Grade: ${final.toFixed(2)}%\nWeighted Score: ${total.toFixed(2)}\nTotal Weight: ${weightSum}%`);
  }, [grades, weights]);
  const presets = [
    { label: '3 Assignments', apply: () => { setGrades('85,90,78'); setWeights('20,30,50'); } },
    { label: 'Exam Heavy', apply: () => { setGrades('92,80,70'); setWeights('20,20,60'); } },
  ];
  const g = grades.split(',').map(Number);
  const w = weights.split(',').map(Number);
  let total = 0;
  let weightSum = 0;
  for (let i = 0; i < g.length; i++) { total += g[i] * w[i] / 100; weightSum += w[i]; }
  const final = weightSum > 0 ? total / (weightSum / 100) : 0;
  const customResult = result ? (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">Final Grade</div>
      <div className={`text-3xl font-bold ${final >= 90 ? 'text-emerald-700 dark:text-emerald-400' : final >= 80 ? 'text-blue-700 dark:text-blue-400' : final >= 70 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>{final.toFixed(1)}%</div>
    </div>
  ) : null;
  return (
    <CalculatorShell title="Final Grade Calculator" icon={<GraduationCap className="w-5 h-5" />} result={result} onCalculate={calc} presets={presets} accent="lime" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Grades (comma-separated)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Weights (comma-separated, %)</label><input type="text" value={weights} onChange={e => setWeights(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
