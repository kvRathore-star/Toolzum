"use client";
import React, { useState } from 'react';

export default function FeetToMeters() {
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [meters, setMeters] = useState('');
  const [totalFeet, setTotalFeet] = useState('');

  const update = (ft: string, ins: string) => {
    setFeet(ft);
    setInches(ins);
    const ftNum = parseFloat(ft) || 0;
    const inNum = parseFloat(ins) || 0;
    const total = ftNum + inNum / 12;
    setTotalFeet(total.toFixed(4));
    setMeters((total * 0.3048).toFixed(4));
  };

  const handleMeterChange = (value: string) => {
    setMeters(value);
    const total = parseFloat(value) / 0.3048;
    if (!isNaN(total)) {
      const ft = Math.floor(total);
      const ins = (total - ft) * 12;
      setFeet(ft.toString());
      setInches(ins.toFixed(2));
      setTotalFeet(total.toFixed(4));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Feet to Meters Converter</h2>
        <p className="text-zinc-500 text-sm">Convert feet and inches to meters using the exact factor 1 ft = 0.3048 m.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Feet</label>
            <input type="number" value={feet} onChange={e => update(e.target.value, inches)} placeholder="0" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg text-zinc-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Inches</label>
            <input type="number" value={inches} onChange={e => update(feet, e.target.value)} placeholder="0" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg text-zinc-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Meters</label>
            <input type="number" value={meters} onChange={e => handleMeterChange(e.target.value)} placeholder="0" step="any" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg text-zinc-900 dark:text-white outline-none" />
          </div>
        </div>

        {totalFeet && (
          <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center">
            <span className="text-xs text-zinc-500">Decimal feet: </span><span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{totalFeet} ft</span>
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-4">
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            <strong>Reference:</strong> 1 ft = 0.3048 m &nbsp;·&nbsp; 5&apos;10&quot; = 1.778 m &nbsp;·&nbsp; 6&apos;0&quot; = 1.829 m
          </p>
        </div>
      </div>
    </div>
  );
}
