"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function GradeCalculator() {
  const [percentage, setPercentage] = useState('85');
  const presets = [
    { label: 'Excellent (A)', apply: () => { setPercentage('95'); } },
    { label: 'Passing (D)', apply: () => { setPercentage('65'); } },
    { label: 'Failing (F)', apply: () => { setPercentage('55'); } },
  ];
  const getLetter = (p: number) => { if (p >= 93) return 'A'; if (p >= 90) return 'A-'; if (p >= 87) return 'B+'; if (p >= 83) return 'B'; if (p >= 80) return 'B-'; if (p >= 77) return 'C+'; if (p >= 73) return 'C'; if (p >= 70) return 'C-'; if (p >= 67) return 'D+'; if (p >= 60) return 'D'; return 'F'; };
  const p = parseFloat(percentage) || 0;
  const letter = getLetter(p);
  const colorMap: Record<string, string> = { 'A': 'text-emerald-700 dark:text-emerald-400', 'A-': 'text-emerald-700 dark:text-emerald-400', 'B+': 'text-blue-700 dark:text-blue-400', 'B': 'text-blue-700 dark:text-blue-400', 'B-': 'text-blue-700 dark:text-blue-400', 'C+': 'text-amber-700 dark:text-amber-400', 'C': 'text-amber-700 dark:text-amber-400', 'C-': 'text-amber-700 dark:text-amber-400', 'D+': 'text-orange-700 dark:text-orange-400', 'D': 'text-orange-700 dark:text-orange-400', 'F': 'text-red-700 dark:text-red-400' };
  const customResult = (
    <div className="space-y-2">
      <div className="text-center">
        <div className={`text-5xl font-bold ${colorMap[letter] || 'text-indigo-700 dark:text-indigo-400'}`}>{letter}</div>
      </div>
      <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${p >= 60 ? 'bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500' : 'bg-red-500'}`} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
  return (
    <CalculatorShell title="Grade Calculator" result="" auto presets={presets} accent="fuchsia" customResult={customResult}>
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Percentage (%)</label><input type="number" value={percentage} onChange={e => setPercentage(e.target.value)} className={inputCls} /></div>
    </CalculatorShell>
  );
}
