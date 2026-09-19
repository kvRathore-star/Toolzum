"use client";
import { useState } from 'react';

export default function PercentageCalculator() {
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [result1, setResult1] = useState<number | null>(null);

  const [val3, setVal3] = useState('');
  const [val4, setVal4] = useState('');
  const [result2, setResult2] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Calc 1 */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6">
           <h2 className="text-xl font-bold text-[var(--text-primary)]">What is X% of Y?</h2>
           <div className="flex items-center space-x-4">
              <input aria-label="What is X% of Y?" 
                type="number" value={val1} onChange={e => { setVal1(e.target.value); if (!e.target.value || !val2) setResult1(null); }}
                placeholder="X" className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
              <span className="font-bold text-[var(--text-secondary)]">% of</span>
              <input aria-label="Y, the base value" 
                type="number" value={val2} onChange={e => { setVal2(e.target.value); if (!e.target.value || !val1) setResult1(null); }}
                placeholder="Y" className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
           </div>
            <button
              onClick={() => { if (val1 === '' || val2 === '') { setResult1(null); return; } setResult1((Number(val1) / 100) * Number(val2)); }}
              className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              Calculate
            </button>
            {result1 !== null && (
              <div className="text-center text-lg font-black text-[var(--accent)] dark:text-[var(--accent)]">{result1}</div>
            )}
        </div>

        {/* Calc 2 */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6">
           <h2 className="text-xl font-bold text-[var(--text-primary)]">X is what % of Y?</h2>
           <div className="flex items-center space-x-4">
              <input aria-label="X is what % of Y?" 
                type="number" value={val3} onChange={e => { setVal3(e.target.value); if (!e.target.value || !val4) setResult2(null); }}
                placeholder="X" className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-emerald-500 rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
              <span className="font-bold text-[var(--text-secondary)]">is what % of</span>
              <input aria-label="is what % of" 
                type="number" value={val4} onChange={e => { setVal4(e.target.value); if (!e.target.value || !val3) setResult2(null); }}
                placeholder="Y" className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-emerald-500 rounded-xl px-4 py-3 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
           </div>
            <button
              onClick={() => { if (val3 === '' || val4 === '') { setResult2(null); return; } const y = Number(val4); setResult2(y === 0 ? null : (Number(val3) / y) * 100); }}
              className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              Calculate
            </button>
            {result2 !== null && (
              <div className="text-center text-lg font-black text-emerald-600 dark:text-emerald-400">{result2.toFixed(2)}%</div>
            )}
        </div>

      </div>
    </div>
  );
}