"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { gradePointsMap, inputCls } from '../Calculators.shared';

export default function GradeCalculator() {
  const [percentage, setPercentage] = useState('85');
  const [result, setResult] = useState('');
  const getLetter = (p: number) => { if (p >= 93) return 'A'; if (p >= 90) return 'A-'; if (p >= 87) return 'B+'; if (p >= 83) return 'B'; if (p >= 80) return 'B-'; if (p >= 77) return 'C+'; if (p >= 73) return 'C'; if (p >= 70) return 'C-'; if (p >= 67) return 'D+'; if (p >= 60) return 'D'; return 'F'; };
  const calc = useCallback(() => {
    const p = parseFloat(percentage) || 0;
    const letter = getLetter(p);
    const passed = letter !== 'F';
    setResult(`Letter Grade: ${letter}\nPercentage: ${p}%\n${passed ? 'Passed' : 'Failed'}`);
  }, [percentage]);
  const presets = [
    { label: 'Excellent (A)', apply: () => { setPercentage('95'); } },
    { label: 'Passing (D)', apply: () => { setPercentage('65'); } },
    { label: 'Failing (F)', apply: () => { setPercentage('55'); } },
  ];
  const p = parseFloat(percentage) || 0;
  const letter = getLetter(p);
  const colorMap: Record<string, string> = { 'A': 'text-emerald-700 dark:text-emerald-400', 'A-': 'text-emerald-700 dark:text-emerald-400', 'B+': 'text-blue-700 dark:text-blue-400', 'B': 'text-blue-700 dark:text-blue-400', 'B-': 'text-blue-700 dark:text-blue-400', 'C+': 'text-amber-700 dark:text-amber-400', 'C': 'text-amber-700 dark:text-amber-400', 'C-': 'text-amber-700 dark:text-amber-400', 'D+': 'text-orange-700 dark:text-orange-400', 'D': 'text-orange-700 dark:text-orange-400', 'F': 'text-red-700 dark:text-red-400' };
  return (
    <CalculatorShell title="Grade Calculator" result={result} onCalculate={calc} presets={presets} accent="fuchsia">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Percentage (%)</label><input type="number" value={percentage} onChange={e => setPercentage(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className="space-y-2">
          <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
            <div className={`text-5xl font-bold ${colorMap[letter] || 'text-indigo-700 dark:text-indigo-400'}`}>{letter}</div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${p >= 60 ? 'bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500' : 'bg-red-500'}`} style={{ width: `${p}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
