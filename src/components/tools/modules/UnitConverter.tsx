"use client";
import React, { useState } from 'react';

const CATEGORIES: Record<string, { units: string[]; convert: (val: number, from: string, to: string) => number }> = {
  Length: {
    units: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch', 'Nautical Mile'],
    convert(v, f, t) {
      const toM: Record<string, number> = { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254, 'Nautical Mile': 1852 };
      return v * toM[f] / toM[t];
    },
  },
  Mass: {
    units: ['Kilogram', 'Gram', 'Milligram', 'Metric Ton', 'Pound', 'Ounce', 'Stone'],
    convert(v, f, t) {
      const toKg: Record<string, number> = { Kilogram: 1, Gram: 0.001, Milligram: 0.000001, 'Metric Ton': 1000, Pound: 0.453592, Ounce: 0.0283495, Stone: 6.35029 };
      return v * toKg[f] / toKg[t];
    },
  },
  Temperature: {
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    convert(v, f, t) {
      let c: number;
      if (f === 'Celsius') c = v;
      else if (f === 'Fahrenheit') c = (v - 32) * 5 / 9;
      else c = v - 273.15;
      if (t === 'Celsius') return c;
      if (t === 'Fahrenheit') return c * 9 / 5 + 32;
      return c + 273.15;
    },
  },
  Volume: {
    units: ['Liter', 'Milliliter', 'Gallon (US)', 'Quart', 'Pint', 'Cup', 'Fluid Ounce', 'Cubic Meter'],
    convert(v, f, t) {
      const toL: Record<string, number> = { Liter: 1, Milliliter: 0.001, 'Gallon (US)': 3.78541, Quart: 0.946353, Pint: 0.473176, Cup: 0.236588, 'Fluid Ounce': 0.0295735, 'Cubic Meter': 1000 };
      return v * toL[f] / toL[t];
    },
  },
  Area: {
    units: ['Square Meter', 'Square Kilometer', 'Square Mile', 'Square Foot', 'Square Yard', 'Acre', 'Hectare'],
    convert(v, f, t) {
      const toSm: Record<string, number> = { 'Square Meter': 1, 'Square Kilometer': 1e6, 'Square Mile': 2.59e6, 'Square Foot': 0.092903, 'Square Yard': 0.836127, Acre: 4046.86, Hectare: 10000 };
      return v * toSm[f] / toSm[t];
    },
  },
  Speed: {
    units: ['km/h', 'mph', 'm/s', 'ft/s', 'Knot'],
    convert(v, f, t) {
      const toMps: Record<string, number> = { 'km/h': 0.277778, mph: 0.44704, 'm/s': 1, 'ft/s': 0.3048, Knot: 0.514444 };
      return v * toMps[f] / toMps[t];
    },
  },
  Time: {
    units: ['Second', 'Minute', 'Hour', 'Day', 'Week', 'Month', 'Year'],
    convert(v, f, t) {
      const toS: Record<string, number> = { Second: 1, Minute: 60, Hour: 3600, Day: 86400, Week: 604800, Month: 2592000, Year: 31536000 };
      return v * toS[f] / toS[t];
    },
  },
  Digital: {
    units: ['Byte', 'Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte', 'Petabyte', 'Bit', 'Kilobit', 'Megabit', 'Gigabit'],
    convert(v, f, t) {
      const toB: Record<string, number> = { Byte: 1, Kilobyte: 1024, Megabyte: 1048576, Gigabyte: 1073741824, Terabyte: 1099511627776, Petabyte: 1125899906842624, Bit: 0.125, Kilobit: 128, Megabit: 131072, Gigabit: 134217728 };
      return v * toB[f] / toB[t];
    },
  },
};

export function UnitConverter() {
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState('Meter');
  const [toUnit, setToUnit] = useState('Kilometer');
  const [value, setValue] = useState('1');
  const cat = CATEGORIES[category];

  const handleCategory = (c: string) => {
    const units = CATEGORIES[c].units;
    setCategory(c);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  };

  const result = value ? cat.convert(parseFloat(value) || 0, fromUnit, toUnit) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Unit Converter</h2>
        <p className="text-sm text-zinc-500">Convert between measurement units</p>
        <div>
          <label className="text-xs font-medium text-zinc-500">Category</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {Object.keys(CATEGORIES).map(c => (
              <button key={c} onClick={() => handleCategory(c)} className={`px-3 py-1.5 text-sm rounded-lg transition ${category === c ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500">From</label>
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">{cat.units.map(u => <option key={u} value={u}>{u}</option>)}</select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">To</label>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">{cat.units.map(u => <option key={u} value={u}>{u}</option>)}</select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Value</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30">
          <p className="text-xs text-zinc-500">Result</p>
          <p className="text-2xl font-bold">{value} {fromUnit} = {result.toFixed(6)} {toUnit}</p>
        </div>
      </div>
    </div>
  );
}
