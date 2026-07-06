"use client";
import React, { useState } from 'react';

export default function LbsToKg() {
  const [lbs, setLbs] = useState('');
  const [kg, setKg] = useState('');

  const handleLbsChange = (value: string) => {
    setLbs(value);
    const num = parseFloat(value);
    if (!isNaN(num)) setKg((num * 0.45359237).toFixed(3));
    else setKg('');
  };

  const handleKgChange = (value: string) => {
    setKg(value);
    const num = parseFloat(value);
    if (!isNaN(num)) setLbs((num / 0.45359237).toFixed(3));
    else setLbs('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Lbs to Kg Converter</h2>
        <p className="text-zinc-500 text-sm">Convert pounds to kilograms and vice versa with 3-decimal precision.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Pounds (lbs)</label>
            <input type="number" value={lbs} onChange={e => handleLbsChange(e.target.value)} placeholder="0" step="any" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg text-zinc-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Kilograms (kg)</label>
            <input type="number" value={kg} onChange={e => handleKgChange(e.target.value)} placeholder="0" step="any" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg text-zinc-900 dark:text-white outline-none" />
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-4">
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            <strong>Reference:</strong> 1 lb = 0.4536 kg &nbsp;·&nbsp; 5 lb ≈ 2.27 kg &nbsp;·&nbsp; 10 lb ≈ 4.54 kg &nbsp;·&nbsp; 100 lb ≈ 45.36 kg
          </p>
        </div>
      </div>
    </div>
  );
}
