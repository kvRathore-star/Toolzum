"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type UnitDef = { key: string; label: string; toBase?: (v: number) => number; fromBase?: (v: number) => number };

type FamilyConfig = {
  title: string;
  desc: string;
  units: UnitDef[];
  baseUnit: string;
  /** For families where all units are linear (multiply to base), provide per-unit multipliers */
  multipliers?: Record<string, number>;
  /** For families needing custom convert (e.g. temperature) */
  customConvert?: (v: number, from: string, to: string) => number;
  /** Show all units in a list (like length/weight) rather than from/to selector */
  showAll?: boolean;
};

const UNIT_FAMILIES: Record<string, FamilyConfig> = {
  "unit-converter": {
    title: "Unit Converter", desc: "Convert between length, weight, volume, area, speed, power, pressure, temperature, time, data size, and everyday units",
    baseUnit: "m", showAll: true,
    units: [
      { key: "mm", label: "Millimeters" }, { key: "cm", label: "Centimeters" },
      { key: "m", label: "Meters" }, { key: "km", label: "Kilometers" },
      { key: "in", label: "Inches" }, { key: "ft", label: "Feet" },
      { key: "yd", label: "Yards" }, { key: "mi", label: "Miles" },
    ],
    multipliers: { mm: 1000, cm: 100, m: 1, km: 0.001, in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371 },
  },
  "length-converter": {
    title: "Length Converter", desc: "Convert between meters, kilometers, miles, feet, and more",
    baseUnit: "m", showAll: true,
    units: [
      { key: "mm", label: "Millimeters" }, { key: "cm", label: "Centimeters" },
      { key: "m", label: "Meters" }, { key: "km", label: "Kilometers" },
      { key: "in", label: "Inches" }, { key: "ft", label: "Feet" },
      { key: "yd", label: "Yards" }, { key: "mi", label: "Miles" },
    ],
    multipliers: { mm: 1000, cm: 100, m: 1, km: 0.001, in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371 },
  },
  "weight-converter": {
    title: "Weight Converter", desc: "Convert between kilograms, pounds, ounces, and more",
    baseUnit: "kg", showAll: true,
    units: [
      { key: "mg", label: "Milligrams" }, { key: "g", label: "Grams" },
      { key: "kg", label: "Kilograms" }, { key: "t", label: "Metric Tons" },
      { key: "lb", label: "Pounds" }, { key: "oz", label: "Ounces" },
      { key: "st", label: "Stone" },
    ],
    multipliers: { mg: 1e6, g: 1000, kg: 1, t: 0.001, lb: 2.20462, oz: 35.274, st: 0.157473 },
  },
  "volume-converter": {
    title: "Volume Converter", desc: "Convert between liters, gallons, cups, and more",
    baseUnit: "L", showAll: true,
    units: [
      { key: "ml", label: "Milliliters" }, { key: "l", label: "Liters" },
      { key: "gal", label: "Gallons (US)" }, { key: "qt", label: "Quarts" },
      { key: "pt", label: "Pints" }, { key: "cup", label: "Cups" },
      { key: "floz", label: "Fluid Ounces" },
    ],
    multipliers: { ml: 1000, l: 1, gal: 0.264172, qt: 1.05669, pt: 2.11338, cup: 4.22675, floz: 33.814 },
  },
  "area-converter": {
    title: "Area Converter", desc: "Convert between square meters, acres, hectares, and more",
    baseUnit: "m²", showAll: true,
    units: [
      { key: "sqmm", label: "mm²" }, { key: "sqcm", label: "cm²" },
      { key: "sqm", label: "m²" }, { key: "sqkm", label: "km²" },
      { key: "sqft", label: "ft²" }, { key: "ac", label: "Acres" },
      { key: "ha", label: "Hectares" },
    ],
    multipliers: { sqmm: 1e6, sqcm: 10000, sqm: 1, sqkm: 0.000001, sqft: 10.7639, ac: 0.000247105, ha: 0.0001 },
  },
  "speed-converter": {
    title: "Speed Converter", desc: "Convert between km/h, mph, knots, and more",
    baseUnit: "km/h", showAll: false,
    units: [
      { key: "kmh", label: "km/h" }, { key: "mph", label: "mph" },
      { key: "ms", label: "m/s" }, { key: "knots", label: "Knots" },
      { key: "fps", label: "ft/s" },
    ],
    multipliers: { kmh: 1, mph: 0.621371, ms: 0.277778, knots: 0.539957, fps: 0.911344 },
  },
  "power-converter": {
    title: "Power Converter", desc: "Convert between kilowatts, horsepower, BTU/hr, and more",
    baseUnit: "kW", showAll: false,
    units: [
      { key: "kw", label: "kW" }, { key: "hp", label: "hp" },
      { key: "bhp", label: "bhp" }, { key: "watt", label: "W" },
      { key: "mw", label: "MW" }, { key: "btu", label: "BTU/hr" },
    ],
    multipliers: { kw: 1, hp: 1.34102, bhp: 1.34102, watt: 1000, mw: 0.001, btu: 3412.14 },
  },
  "pressure-converter": {
    title: "Pressure Converter", desc: "Convert between kPa, psi, bar, atm, and more",
    baseUnit: "kPa", showAll: false,
    units: [
      { key: "kpa", label: "kPa" }, { key: "psi", label: "psi" },
      { key: "bar", label: "bar" }, { key: "atm", label: "atm" },
      { key: "torr", label: "Torr" }, { key: "mbar", label: "mbar" },
    ],
    multipliers: { kpa: 1, psi: 0.145038, bar: 0.01, atm: 0.009869, torr: 7.50062, mbar: 10 },
  },
  "temperature-converter": {
    title: "Temperature Converter", desc: "Convert between Celsius, Fahrenheit, and Kelvin",
    baseUnit: "°C", showAll: false,
    units: [
      { key: "celsius", label: "Celsius" },
      { key: "fahrenheit", label: "Fahrenheit" },
      { key: "kelvin", label: "Kelvin" },
    ],
    customConvert: (v, from, to) => {
      let c: number;
      if (from === "celsius") c = v;
      else if (from === "fahrenheit") c = (v - 32) * 5 / 9;
      else c = v - 273.15;
      if (to === "celsius") return c;
      if (to === "fahrenheit") return c * 9 / 5 + 32;
      return c + 273.15;
    },
  },
  "time-converter": {
    title: "Time Converter", desc: "Convert between seconds, minutes, hours, days, weeks",
    baseUnit: "seconds", showAll: true,
    units: [
      { key: "seconds", label: "Seconds" }, { key: "minutes", label: "Minutes" },
      { key: "hours", label: "Hours" }, { key: "days", label: "Days" },
      { key: "weeks", label: "Weeks" },
    ],
    multipliers: { seconds: 1, minutes: 1 / 60, hours: 1 / 3600, days: 1 / 86400, weeks: 1 / 604800 },
  },
  "data-size-converter": {
    title: "Data Size Converter", desc: "Convert between bytes, kilobytes, megabytes, and more",
    baseUnit: "B", showAll: true,
    units: [
      { key: "b", label: "Bytes" }, { key: "kb", label: "Kilobytes" },
      { key: "mb", label: "Megabytes" }, { key: "gb", label: "Gigabytes" },
      { key: "tb", label: "Terabytes" }, { key: "pb", label: "Petabytes" },
    ],
    multipliers: { b: 1, kb: 1 / 1024, mb: 1 / (1024 * 1024), gb: 1 / (1024 * 1024 * 1024), tb: 1 / (1024 ** 4), pb: 1 / (1024 ** 5) },
  },
  "cooking-measurement-converter": {
    title: "Cooking Measurement Converter", desc: "Convert between teaspoons, tablespoons, cups, and milliliters",
    baseUnit: "mL", showAll: false,
    units: [
      { key: "tsp", label: "Teaspoons" }, { key: "tbsp", label: "Tablespoons" },
      { key: "cup", label: "Cups" }, { key: "floz", label: "Fluid Ounces" },
      { key: "ml", label: "Milliliters" }, { key: "l", label: "Liters" },
    ],
    customConvert: (v, from, to) => {
      const toML: Record<string, number> = { tsp: 4.92892, tbsp: 14.7868, cup: 236.588, floz: 29.5735, ml: 1, l: 1000 };
      const ml = v * toML[from];
      return ml / toML[to];
    },
  },
  "fuel-consumption-converter": {
    title: "Fuel Consumption Converter", desc: "Convert between L/100km, MPG, and km/L",
    baseUnit: "L/100km", showAll: false,
    units: [
      { key: "l100", label: "L/100km" }, { key: "mpgus", label: "MPG (US)" },
      { key: "mpguk", label: "MPG (UK)" }, { key: "kml", label: "km/L" },
    ],
    customConvert: (v, from, to) => {
      let l100: number;
      if (from === "l100") l100 = v;
      else if (from === "mpgus") l100 = 235.215 / v;
      else if (from === "mpguk") l100 = 282.481 / v;
      else l100 = 100 / v;
      if (to === "l100") return l100;
      if (to === "mpgus") return 235.215 / l100;
      if (to === "mpguk") return 282.481 / l100;
      return 100 / l100;
    },
  },
  "paper-size-converter": {
    title: "Paper Size Converter", desc: "Convert between A and B paper series sizes",
    baseUnit: "A0", showAll: false,
    units: [
      { key: "a0", label: "A0" }, { key: "a1", label: "A1" }, { key: "a2", label: "A2" },
      { key: "a3", label: "A3" }, { key: "a4", label: "A4" }, { key: "a5", label: "A5" },
      { key: "a6", label: "A6" }, { key: "b4", label: "B4" }, { key: "b5", label: "B5" },
    ],
    customConvert: (v, from, to) => {
      const area: Record<string, number> = {
        a0: 1, a1: 0.5, a2: 0.25, a3: 0.125, a4: 0.0625, a5: 0.03125, a6: 0.015625,
        b4: 0.088388, b5: 0.044194,
      };
      return (v / area[from]) * area[to];
    },
  },
  "clothing-size-converter": {
    title: "Clothing Size Converter", desc: "Convert between US, UK, EU, and Japanese clothing sizes",
    baseUnit: "US", showAll: false,
    units: [
      { key: "us", label: "US" }, { key: "uk", label: "UK" },
      { key: "eu", label: "EU" }, { key: "jp", label: "Japan" },
    ],
    customConvert: (v, from, to) => {
      let us: number;
      if (from === "us") us = v;
      else if (from === "uk") us = v + 2;
      else if (from === "eu") us = v / 2.54 + 32;
      else us = v - 7;
      if (to === "us") return us;
      if (to === "uk") return us - 2;
      if (to === "eu") return (us - 32) * 2.54;
      return us + 7;
    },
  },
  "degree-radian-converter": {
    title: "Degree / Radian Converter", desc: "Convert between degrees and radians",
    baseUnit: "°", showAll: false,
    units: [
      { key: "deg", label: "Degrees" },
      { key: "rad", label: "Radians" },
    ],
    customConvert: (v, from, to) => {
      if (from === "deg") return v * Math.PI / 180;
      return v * 180 / Math.PI;
    },
  },
  "shoe-size-converter": {
    title: "Shoe Size Converter", desc: "Convert between US and UK men's shoe sizes",
    baseUnit: "US", showAll: false,
    units: [
      { key: "us", label: "US Men" }, { key: "uk", label: "UK" },
    ],
    customConvert: (v, from, to) => {
      const usToUk: Record<number, number> = { 5: 4.5, 6: 5.5, 7: 6.5, 8: 7.5, 9: 8.5, 10: 9.5, 11: 10.5, 12: 11.5 };
      const ukToUs: Record<number, number> = { 4.5: 5, 5.5: 6, 6.5: 7, 7.5: 8, 8.5: 9, 9.5: 10, 10.5: 11, 11.5: 12 };
      if (from === "us") return usToUk[Math.round(v)] ?? v - 0.5;
      return ukToUs[Math.round(v * 2) / 2] ?? v + 0.5;
    },
  },
};

function ConverterDropdown({ family, slug }: { family: FamilyConfig; slug: string }) {
  const [value, setValue] = useState('100');
  const [from, setFrom] = useState(family.units[0].key);
  const [to, setTo] = useState(family.units[1]?.key ?? family.units[0].key);
  const [output, setOutput] = useState('');

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) { toast.error('Enter a valid number'); return; }
    let result: number;
    if (family.customConvert) {
      result = family.customConvert(v, from, to);
    } else if (family.multipliers) {
      result = (v / family.multipliers[from]) * family.multipliers[to];
    } else return;
    const fromLabel = family.units.find(u => u.key === from)?.label ?? from;
    const toLabel = family.units.find(u => u.key === to)?.label ?? to;
    setOutput(`${v} ${fromLabel} = ${result.toFixed(4)} ${toLabel}`);
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{family.title}</h2>
      <p className="text-xs text-[var(--text-secondary)]">{family.desc}</p>
      <div>
        <label className="text-xs text-[var(--text-secondary)] mb-1 block">Value</label>
        <input type="number" value={value} onChange={e => setValue(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">From</label>
          <select value={from} onChange={e => setFrom(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]">
            {family.units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">To</label>
          <select value={to} onChange={e => setTo(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]">
            {family.units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
      </div>
      <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">
        Convert
      </button>
      {output && (
        <div className="mt-4 p-3 bg-[var(--bg-surface)] rounded-lg text-sm text-center font-mono text-emerald-600 dark:text-emerald-400"
          onClick={() => { clipboardWrite(output); toast.success('Copied!'); }}>
          {output}
        </div>
      )}
    </div>
  );
}

function ConverterAllOutputs({ family, slug }: { family: FamilyConfig; slug: string }) {
  const [value, setValue] = useState(
    slug === "time-converter" ? "3600" : slug === "weight-converter" ? "70" : slug === "volume-converter" ? "1" : "100"
  );
  const v = parseFloat(value) || 0;

  const results = family.units.map(u => {
    let converted: number;
    if (family.multipliers) {
      const base = v / family.multipliers[u.key];
      converted = base;
    } else converted = 0;
    return { label: u.label, value: converted };
  });

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{family.title}</h2>
      <p className="text-xs text-[var(--text-secondary)]">{family.desc}</p>
      <div>
        <label className="text-xs text-[var(--text-secondary)] mb-1 block">Value (in {family.baseUnit})</label>
        <input type="number" value={value} onChange={e => setValue(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
      </div>
      <div className="text-xs space-y-1.5">
        {results.map(r => (
          <div key={r.label} className="flex justify-between p-2 bg-[var(--bg-surface)] rounded-lg">
            <span className="text-[var(--text-secondary)]">{r.label}</span>
            <span className="font-mono text-[var(--text-primary)]">{r.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UnitConverter({ slug }: { slug: string }) {
  const family = UNIT_FAMILIES[slug];
  if (!family) return <div className="text-red-500">Unknown converter: {slug}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {family.showAll ? <ConverterAllOutputs family={family} slug={slug} /> : <ConverterDropdown family={family} slug={slug} />}
    </div>
  );
}
