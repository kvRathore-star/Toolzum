"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { UNIT_FAMILIES } from "./unitFamilies";

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
