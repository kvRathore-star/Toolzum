"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function PregnancyDueDateCalculator() {
  const [lmp, setLmp] = useState('2026-01-01');
  const [cycleLen, setCycleLen] = useState('28');

  let result = '';
  if (lmp) {
    const date = new Date(lmp);
    if (!isNaN(date.getTime())) {
      const cl = parseFloat(cycleLen) || 28;
      const adjustment = cl - 28;
      const due = new Date(date);
      due.setDate(date.getDate() + 280 + adjustment);
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const today = new Date();
      const diff = due.getTime() - today.getTime();
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      const trimester = daysLeft > 180 ? 'First' : daysLeft > 90 ? 'Second' : 'Third';
      result = `Estimated due date: ${fmt(due)}\nDays remaining: ${daysLeft} days\nCurrent trimester: ${trimester}\nWeeks pregnant: ${Math.round((280 - daysLeft) / 7)} weeks`;
    } else {
      result = 'Invalid date.';
    }
  }

  return (
    <CalculatorShell category="Health" title="Pregnancy Due Date" accent="fuchsia" result={result} auto>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>First day of LMP</label><input className={inputCls} type="date" value={lmp} onChange={e => setLmp(e.target.value)} /></div>
        <div><label className={labelCls}>Cycle length (optional)</label><input className={inputCls} type="number" value={cycleLen} onChange={e => setCycleLen(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}
