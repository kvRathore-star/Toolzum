"use client";
import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { CalculatorShell } from '../shared/CalculatorShell';

const labelCls = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";
const inputCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const today = new Date().toISOString().split('T')[0];

  const presets = [
    { label: "Today's Date", apply: () => setTargetDate(today) },
    { label: '18th Birthday', apply: () => {
      if (dob) {
        const d = new Date(dob);
        d.setFullYear(d.getFullYear() + 18);
        setTargetDate(d.toISOString().split('T')[0]);
      }
    }},
    { label: 'Retirement (65)', apply: () => {
      if (dob) {
        const d = new Date(dob);
        d.setFullYear(d.getFullYear() + 65);
        setTargetDate(d.toISOString().split('T')[0]);
      }
    }},
  ];

  const calc = () => {
    if (!dob) return '';
    const d1 = new Date(dob);
    const d2 = new Date(targetDate);

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years} Years, ${months} Months, ${days} Days`;
  };

  const result = calc();

  const resultStats = (() => {
    if (!dob) return [];
    const d1 = new Date(dob);
    const d2 = new Date(targetDate);
    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();
    if (days < 0) { months -= 1; const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years -= 1; months += 12; }
    return [
      { label: 'Years', value: String(years) },
      { label: 'Months', value: String(months) },
      { label: 'Days', value: String(days) },
    ];
  })();

  return (
    <CalculatorShell
      title="Age Calculator"
      icon={<Calendar className="w-5 h-5" />}
      result={result}
      onCalculate={calc}
      calculateLabel="Calculate Exact Age"
      presets={presets}
      resultStats={resultStats}
      resultLabel="Your Exact Age"
      accent="blue"
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Target Date (Defaults to Today)</label>
          <input
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </CalculatorShell>
  );
}
