"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Delete } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CalculatorShell } from './shared/CalculatorShell';
import { gradePointsMap, gcd, factorial, inputCls, labelCls, btnCls } from './Calculators.shared';

export function BusinessDaysCalculator() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!start || !end) return;
    let bdCount = 0;
    let totalDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) bdCount++;
      totalDays++;
      current.setDate(current.getDate() + 1);
    }
    const weekends = totalDays - bdCount;
    const weeks = Math.floor(totalDays / 7);
    setResult(`Business Days: ${bdCount}\nWeekend Days: ${weekends}\nTotal Days: ${totalDays}\nWeeks: ~${weeks} weeks`);
  }, [startDate, endDate]);
  const presets = [
    { label: '1 Year', apply: () => { setStartDate('2026-01-01'); setEndDate('2026-12-31'); } },
    { label: '1 Quarter', apply: () => { setStartDate('2026-07-01'); setEndDate('2026-09-30'); } },
    { label: '1 Month', apply: () => { setStartDate('2026-07-01'); setEndDate('2026-07-31'); } },
  ];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let bdCount = 0;
  const current = new Date(start);
  while (current <= end) {
    if (current.getDay() !== 0 && current.getDay() !== 6) bdCount++;
    current.setDate(current.getDate() + 1);
  }
  return (
    <CalculatorShell title="Business Days Calculator" result={result} onCalculate={calc} presets={presets} accent="amber">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xl font-bold text-indigo-400">{bdCount}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Business Days</div>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
            <div className="text-xl font-bold text-amber-400">{(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) - bdCount}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Weekends</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xl font-bold text-emerald-400">{Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Total Days</div>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-xl p-3 text-center border border-[var(--border-subtle)]">
            <div className="text-xl font-bold text-[var(--text-primary)]">{((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)).toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Weeks</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DaysBetweenDates() {
  const [date1, setDate1] = useState('2026-01-01');
  const [date2, setDate2] = useState('2026-12-31');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    const years = days / 365.25;
    setResult(`Days: ${days}\nWeeks: ${weeks}\nMonths: ~${months}\nYears: ~${years.toFixed(2)}`);
  }, [date1, date2]);
  const presets = [
    { label: '1 Year', apply: () => { setDate1('2026-01-01'); setDate2('2026-12-31'); } },
    { label: 'Summer Break', apply: () => { setDate1('2026-06-01'); setDate2('2026-08-31'); } },
    { label: 'Short Trip', apply: () => { setDate1('2026-07-15'); setDate2('2026-07-22'); } },
  ];
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2.getTime() - d1.getTime());
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return (
    <CalculatorShell title="Days Between Dates" result={result} onCalculate={calc} presets={presets} accent="rose">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Date 1</label><input type="date" value={date1} onChange={e => setDate1(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Date 2</label><input type="date" value={date2} onChange={e => setDate2(e.target.value)} className={inputCls} /></div>
      </div>
      {result && days > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xl font-bold text-indigo-400">{days}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Days</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xl font-bold text-emerald-400">{Math.floor(days / 7)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Weeks</div>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
            <div className="text-xl font-bold text-amber-400">~{Math.floor(days / 30.44)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Months</div>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-xl p-3 text-center border border-[var(--border-subtle)]">
            <div className="text-xl font-bold text-[var(--text-primary)]">~{(days / 365.25).toFixed(1)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Years</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DaysUntilCalculator() {
  const [targetDate, setTargetDate] = useState('2027-01-01');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) { setResult('Target date is in the past.'); return; }
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    setResult(`Days Until: ${days}\nHours Until: ${days * 24 + hours}\nTarget: ${target.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`);
  }, [targetDate]);
  const presets = [
    { label: 'New Year', apply: () => { setTargetDate('2027-01-01'); } },
    { label: 'Christmas', apply: () => { setTargetDate('2026-12-25'); } },
    { label: 'Birthday', apply: () => { setTargetDate('2027-06-15'); } },
  ];
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return (
    <CalculatorShell title="Days Until Calculator" result={result} onCalculate={calc} presets={presets} accent="cyan">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Target Date</label><input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputCls} /></div>
      {result && days > 0 && (
        <div className="bg-indigo-500/10 rounded-xl p-4 text-center border border-indigo-500/20">
          <div className="text-xs text-[var(--text-tertiary)]">Countdown</div>
          <div className="text-3xl font-bold text-indigo-400">{days} <span className="text-lg">days</span></div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DayOfWeekCalculator() {
  const [date, setDate] = useState('2026-12-25');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const month = d.toLocaleString('en-US', { month: 'long' });
    setResult(`Day of Week: ${days[d.getDay()]}\nDate: ${month} ${d.getDate()}, ${d.getFullYear()}`);
  }, [date]);
  const presets = [
    { label: 'Christmas', apply: () => { setDate('2026-12-25'); } },
    { label: 'New Year', apply: () => { setDate('2027-01-01'); } },
    { label: 'Today', apply: () => { setDate(new Date().toISOString().split('T')[0]); } },
  ];
  const d = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[d.getDay()];
  const colors: Record<string, string> = { Sunday: 'text-red-400', Monday: 'text-indigo-400', Tuesday: 'text-emerald-400', Wednesday: 'text-amber-400', Thursday: 'text-blue-400', Friday: 'text-teal-400', Saturday: 'text-purple-400' };
  return (
    <CalculatorShell title="Day of Week Calculator" result={result} onCalculate={calc} presets={presets} accent="orange">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className={`text-3xl font-bold ${colors[dayName] || 'text-indigo-400'}`}>{dayName}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DayOfYearCalculator() {
  const [date, setDate] = useState('2026-07-17');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = new Date(date);
    const year = d.getFullYear();
    const start = new Date(year, 0, 0);
    const diff = d.getTime() - start.getTime();
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDays = isLeap ? 366 : 365;
    const pct = (day / totalDays) * 100;
    setResult(`Day of Year: ${day} of ${totalDays}\nYear Progress: ${pct.toFixed(1)}%\nDays Remaining: ${totalDays - day}`);
  }, [date]);
  const presets = [
    { label: 'Mid Year', apply: () => { setDate('2026-07-01'); } },
    { label: 'Year Start', apply: () => { setDate('2026-01-01'); } },
    { label: 'Year End', apply: () => { setDate('2026-12-31'); } },
  ];
  const d = new Date(date);
  const year = d.getFullYear();
  const start = new Date(year, 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDays = isLeap ? 366 : 365;
  const pct = (day / totalDays) * 100;
  return (
    <CalculatorShell title="Day of Year Calculator" result={result} onCalculate={calc} presets={presets} accent="teal">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-tertiary)]">Day {day} of {totalDays}</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
