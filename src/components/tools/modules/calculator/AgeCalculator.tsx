"use client";
import { useState } from 'react';

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const calculate = () => {
    if (!dob) return;
    const d1 = new Date(dob);
    const d2 = new Date(targetDate!);
    if (d2 < d1) {
      setResult(null);
      setError('Target date must be on or after the date of birth.');
      return;
    }
    setError('');
    
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

    setResult({ years, months, days });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
         <h2 className="text-2xl font-bold text-[var(--text-primary)]">Age Calculator</h2>
         <p className="text-[var(--text-secondary)]">Calculate your exact age in years, months, and days.</p>
         
         <div className="space-y-4">
            <div>
              <label htmlFor="lbl-agecalculator-date-of-birth" className="block text-sm font-bold text-[var(--text-primary)] mb-2">Date of Birth</label>
              <input id="lbl-agecalculator-date-of-birth" aria-label="Date of Birth" 
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label htmlFor="lbl-agecalculator-target-date-defaults-to-today" className="block text-sm font-bold text-[var(--text-primary)] mb-2">Target Date (Defaults to Today)</label>
              <input id="lbl-agecalculator-target-date-defaults-to-today" aria-label="Target Date (Defaults to Today)" 
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
            </div>
         </div>

         <button
            onClick={calculate}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
          >
            Calculate Exact Age
          </button>

          {error && (
            <div role="alert" className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-center text-sm font-bold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {result && (
            <div className="p-6 bg-[var(--accent)]/10/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center space-y-2">
               <div className="text-sm text-[var(--accent)] font-bold uppercase tracking-wider">Your Exact Age is</div>
               <div className="text-xl font-black text-[var(--accent)]">
                 {result.years} <span className="text-xl">Years</span>, {result.months} <span className="text-xl">Months</span>, {result.days} <span className="text-xl">Days</span>
               </div>
            </div>
          )}
      </div>
    </div>
  );
}