"use client";
import React, { useState } from 'react';

export default function KgToLbs() {
  const [kg, setKg] = useState('');
  const [lbs, setLbs] = useState('');
  const [stones, setStones] = useState('');

  const handleKgChange = (value: string) => {
    setKg(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const lbsVal = num / 0.45359237;
      setLbs(lbsVal.toFixed(3));
      const stoneWhole = Math.floor(lbsVal / 14);
      const stoneRem = lbsVal % 14;
      setStones(`${stoneWhole} st ${stoneRem.toFixed(1)} lbs`);
    } else {
      setLbs('');
      setStones('');
    }
  };

  const handleLbsChange = (value: string) => {
    setLbs(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const kgVal = num * 0.45359237;
      setKg(kgVal.toFixed(3));
      const stoneWhole = Math.floor(num / 14);
      const stoneRem = num % 14;
      setStones(`${stoneWhole} st ${stoneRem.toFixed(1)} lbs`);
    } else {
      setKg('');
      setStones('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Kg to Lbs Converter</h2>
        <p className="text-zinc-500 text-sm">Convert kilograms to pounds with stone equivalents — UK users, we've got you covered.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Kilograms (kg)</label>
            <input type="number" value={kg} onChange={e => handleKgChange(e.target.value)} placeholder="0" step="any" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg text-zinc-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Pounds (lbs)</label>
            <input type="number" value={lbs} onChange={e => handleLbsChange(e.target.value)} placeholder="0" step="any" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg text-zinc-900 dark:text-white outline-none" />
          </div>
        </div>

        {stones && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
            <p className="text-xs text-emerald-600 dark:text-emerald-400"><strong>Stone equivalent:</strong> {stones}</p>
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-4">
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            <strong>Reference:</strong> 1 kg = 2.205 lbs &nbsp;·&nbsp; 5 kg ≈ 11.02 lbs &nbsp;·&nbsp; 10 kg ≈ 22.05 lbs
          </p>
        </div>
      </div>
    </div>
  );
}
