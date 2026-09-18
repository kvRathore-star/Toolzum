"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const CATEGORIES: Record<string, { units: string[]; convert: (val: number, from: string, to: string) => number }> = {
  Length: {
    units: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch', 'Nautical Mile'],
    convert(v, f, t) {
      const toM: Record<string, number> = { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254, 'Nautical Mile': 1852 };
      return v * toM[f]! / toM[t]!;
    },
  },
  Mass: {
    units: ['Kilogram', 'Gram', 'Milligram', 'Metric Ton', 'Pound', 'Ounce', 'Stone'],
    convert(v, f, t) {
      const toKg: Record<string, number> = { Kilogram: 1, Gram: 0.001, Milligram: 0.000001, 'Metric Ton': 1000, Pound: 0.453592, Ounce: 0.0283495, Stone: 6.35029 };
      return v * toKg[f]! / toKg[t]!;
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
      return v * toL[f]! / toL[t]!;
    },
  },
  Area: {
    units: ['Square Meter', 'Square Kilometer', 'Square Mile', 'Square Foot', 'Square Yard', 'Acre', 'Hectare'],
    convert(v, f, t) {
      const toSm: Record<string, number> = { 'Square Meter': 1, 'Square Kilometer': 1e6, 'Square Mile': 2.59e6, 'Square Foot': 0.092903, 'Square Yard': 0.836127, Acre: 4046.86, Hectare: 10000 };
      return v * toSm[f]! / toSm[t]!;
    },
  },
  Speed: {
    units: ['km/h', 'mph', 'm/s', 'ft/s', 'Knot'],
    convert(v, f, t) {
      const toMps: Record<string, number> = { 'km/h': 0.277778, mph: 0.44704, 'm/s': 1, 'ft/s': 0.3048, Knot: 0.514444 };
      return v * toMps[f]! / toMps[t]!;
    },
  },
  Time: {
    units: ['Second', 'Minute', 'Hour', 'Day', 'Week', 'Month', 'Year'],
    convert(v, f, t) {
      const toS: Record<string, number> = { Second: 1, Minute: 60, Hour: 3600, Day: 86400, Week: 604800, Month: 2592000, Year: 31536000 };
      return v * toS[f]! / toS[t]!;
    },
  },
  Digital: {
    units: ['Byte', 'Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte', 'Petabyte', 'Bit', 'Kilobit', 'Megabit', 'Gigabit'],
    convert(v, f, t) {
      const toB: Record<string, number> = { Byte: 1, Kilobyte: 1024, Megabyte: 1048576, Gigabyte: 1073741824, Terabyte: 1099511627776, Petabyte: 1125899906842624, Bit: 0.125, Kilobit: 128, Megabit: 131072, Gigabit: 134217728 };
      return v * toB[f]! / toB[t]!;
    },
  },
  Energy: {
    units: ['Joule', 'Kilojoule', 'Calorie', 'Kilocalorie', 'Watt-hour', 'Kilowatt-hour', 'BTU', 'Electronvolt'],
    convert(v, f, t) {
      const toJ: Record<string, number> = { Joule: 1, Kilojoule: 1000, Calorie: 4.184, Kilocalorie: 4184, 'Watt-hour': 3600, 'Kilowatt-hour': 3600000, BTU: 1055.06, Electronvolt: 1.60218e-19 };
      return v * toJ[f]! / toJ[t]!;
    },
  },
  Power: {
    units: ['Watt', 'Kilowatt', 'Megawatt', 'Horsepower', 'BTU/hour'],
    convert(v, f, t) {
      const toW: Record<string, number> = { Watt: 1, Kilowatt: 1000, Megawatt: 1e6, Horsepower: 745.7, 'BTU/hour': 0.293071 };
      return v * toW[f]! / toW[t]!;
    },
  },
  Pressure: {
    units: ['Pascal', 'Kilopascal', 'Bar', 'PSI', 'Atmosphere', 'mmHg', 'Torr'],
    convert(v, f, t) {
      const toPa: Record<string, number> = { Pascal: 1, Kilopascal: 1000, Bar: 100000, PSI: 6894.76, Atmosphere: 101325, mmHg: 133.322, Torr: 133.322 };
      return v * toPa[f]! / toPa[t]!;
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
    const units = CATEGORIES[c]!.units;
    setCategory(c);
    setFromUnit(units[0]!);
    setToUnit(units[1]! || units[0]!);
  };

  const result = value.trim() !== '' && Number.isFinite(parseFloat(value)) ? cat!.convert(parseFloat(value), fromUnit, toUnit) : null;

  const copyResult = () => {
    if (result === null) return;
    clipboardWrite(`${value} ${fromUnit} = ${result} ${toUnit}`);
    toast.success('Result copied!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Unit Converter</h2>
        <p className="text-sm text-[var(--text-secondary)]">Convert between measurement units</p>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Category</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {Object.keys(CATEGORIES).map(c => (
              <button key={c} onClick={() => handleCategory(c)} className={`px-3 py-1.5 text-sm rounded-lg transition ${category === c ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lbl-unitconverter-from" className="text-xs font-medium text-[var(--text-secondary)]">From unit</label>
            <select id="lbl-unitconverter-from" aria-label="From unit" value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full mt-1 p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm">{cat!.units.map(u => <option key={u} value={u}>{u}</option>)}</select>
          </div>
          <div>
            <label htmlFor="lbl-unitconverter-to" className="text-xs font-medium text-[var(--text-secondary)]">To unit</label>
            <select id="lbl-unitconverter-to" aria-label="To unit" value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full mt-1 p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm">{cat!.units.map(u => <option key={u} value={u}>{u}</option>)}</select>
          </div>
        </div>
        <div>
          <label htmlFor="lbl-unitconverter-value" className="text-xs font-medium text-[var(--text-secondary)]">Quantity</label>
            <input id="lbl-unitconverter-value" aria-label="Quantity" type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full mt-1 p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm" />
        </div>
        <div className="p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <p className="text-xs text-[var(--text-secondary)]">Result</p>
          {result === null ? (
            <p className="text-lg text-[var(--text-muted)]">Enter a quantity to convert</p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-bold">{value} {fromUnit} = {result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toUnit}</p>
              <button onClick={copyResult} aria-label="Copy conversion result" className="shrink-0 px-3 py-1.5 text-xs font-bold bg-[var(--accent-ink)] hover:opacity-90 text-white rounded-lg transition-colors">Copy</button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setFromUnit(toUnit); setToUnit(fromUnit); }} aria-label="Swap units" className="flex-1 py-2 text-sm font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--bg-overlay)] transition-colors">⇅ Swap units</button>
        </div>
      </div>
    </div>
  );
}
