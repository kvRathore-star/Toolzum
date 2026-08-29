"use client";

import React, { useState } from 'react';
import { Calendar, Clock, RefreshCw, Milestone, ShieldCheck, Heart } from 'lucide-react';
import { CalcActions } from '../shared/CalcActions';
import { toast } from 'react-hot-toast';

const ELIGIBILITY_RULES = [
  { name: 'School Admission (Class 1)', age: 6, desc: 'Minimum age of 6 years for admission to Class 1 (National Education Policy - NEP).' },
  { name: 'Driving License (Gearless Vehicle)', age: 16, desc: 'Eligible for a learner license to ride gearless motorcycles below 50cc.' },
  { name: 'Voting Rights (Voter ID)', age: 18, desc: 'Eligible for registration on Electoral Rolls (Article 326 of Indian Constitution).' },
  { name: 'Driving License (Geared Vehicle)', age: 18, desc: 'Eligible to apply for a driving license to drive transport and geared motor vehicles.' },
  { name: 'Government Job Entry (Minimum)', age: 18, desc: 'Standard minimum age to apply for most state and union government exams.' },
  { name: 'Senior Citizen Benefits', age: 60, desc: 'Eligible for senior concessions on Indian Railways, taxes, and bank interest.' },
];

export default function IndianAgeCalculator() {
  const [day, setDay] = useState('1');
  const [month, setMonth] = useState('1');
  const [year, setYear] = useState('2000');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const [result, setResult] = useState<any>(null);

  const daysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();

  const handleCalculate = () => {
    const dVal = parseInt(day);
    const mVal = parseInt(month);
    const yVal = parseInt(year);

    // Validate the date (e.g. Feb 31st)
    const maxDays = daysInMonth(mVal, yVal);
    if (dVal > maxDays) {
      toast.error(`Invalid Date: ${month}/${yVal} only has ${maxDays} days.`);
      return;
    }

    const birthDate = new Date(yVal, mVal - 1, dVal);
    const end = new Date(targetDate);

    if (birthDate > end) {
      toast.error('Date of birth cannot be in the future of the target date!');
      return;
    }

    let years = end.getFullYear() - birthDate.getFullYear();
    let months = end.getMonth() - birthDate.getMonth();
    let days = end.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Days lived calculations
    const diffTime = Math.abs(end.getTime() - birthDate.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    // Next Birthday countdown
    const nextBday = new Date(end.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (end > nextBday) {
      nextBday.setFullYear(end.getFullYear() + 1);
    }
    const nextBdayTime = nextBday.getTime() - end.getTime();
    const nextBdayDays = Math.ceil(nextBdayTime / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      nextBdayDays,
      currentAgeYears: years
    });
    toast.success('Age calculated successfully!');
  };

  const handleReset = () => {
    setDay('1');
    setMonth('1');
    setYear('2000');
    setTargetDate(new Date().toISOString().split('T')[0]);
    setResult(null);
  };

  // Generate Year options (1900 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-6 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[var(--accent)]" />
          Indian Age Calculator (DD/MM/YYYY)
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
          Calculate your exact age in years, months, and days and verify your eligibility for school, licenses, voting, and senior benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Date of Birth</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Day</label>
                <select
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-indigo-500"
                >
                  {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => (
                    <option key={d} value={d}>{d.padStart(2, '0')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Month</label>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-indigo-500"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={i + 1} value={String(i + 1)}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Year</label>
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-indigo-500"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[var(--text-primary)]">Target Date (Defaults to Today)</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              Calculate Age
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-3.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold rounded-xl transition-all cursor-pointer"
              aria-label="Reset"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {result && (
            <>
              <div className="space-y-6 border-t border-[var(--border-subtle)] pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center space-y-2">
                  <span className="text-xs text-[var(--accent)] font-bold uppercase tracking-wider block">Your exact age is</span>
                  <span className="text-3xl font-black text-[var(--accent)] block">
                    {result.years} <span className="text-base font-normal">Years</span>, {result.months} <span className="text-base font-normal">Months</span>, {result.days} <span className="text-base font-normal">Days</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Total Days</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">{result.totalDays}</span>
                  </div>
                  <div className="p-3 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Total Weeks</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">{result.totalWeeks}</span>
                  </div>
                  <div className="p-3 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Next Birthday</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">{result.nextBdayDays} Days</span>
                  </div>
                </div>
              </div>

              <CalcActions
                result={`Age: ${result.years} years, ${result.months} months, ${result.days} days`}
                downloadData={`Metric,Value\nYears,${result.years}\nMonths,${result.months}\nDays,${result.days}\nTotal Days,${result.totalDays}\nTotal Weeks,${result.totalWeeks}`}
                downloadFilename="age-result.csv"
              />
            </>
          )}
        </div>

        {/* Right Side: Eligibility Check */}
        <div className="bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-6 rounded-2xl space-y-6">
          <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
            <Milestone className="w-4 h-4 text-[var(--accent)]" />
            Milestones & Eligibility
          </h4>

          <div className="space-y-4">
            {ELIGIBILITY_RULES.map((rule, idx) => {
              const isEligible = result ? result.currentAgeYears >= rule.age : false;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs transition-all space-y-1.5 ${
                    result
                      ? isEligible
                        ? 'bg-emerald-700/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
                      : 'bg-white dark:bg-black border-[var(--border-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-bold">
                    <span>{rule.name} (Age {rule.age}+)</span>
                    {result && (
                      <span className="uppercase text-[9px] font-bold">
                        {isEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{rule.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
