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
  multipliers?: Record<string, number>;
  customConvert?: (v: number, from: string, to: string) => number;
  showAll?: boolean;
  examples?: { label: string; value: string }[];
  conversionFactors?: string[];
  references?: { label: string; value: string }[];
};

function ConverterExamples({ examples, onSelect }: { examples: { label: string; value: string }[]; onSelect: (v: string) => void }) {
  if (!examples || examples.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {examples.map(ex => (
        <button key={ex.label} onClick={() => onSelect(ex.value)}
          className="px-3 py-1.5 text-xs rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors">
          {ex.label}
        </button>
      ))}
    </div>
  );
}

function ConverterMeta({ family }: { family: FamilyConfig }) {
  if (!family.conversionFactors && !family.references) return null;
  return (
    <div className="space-y-4 pt-2">
      {family.conversionFactors && family.conversionFactors.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Conversion Factors</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {family.conversionFactors.map(f => (
              <div key={f} className="text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-lg px-2.5 py-1.5 font-mono">{f}</div>
            ))}
          </div>
        </div>
      )}
      {family.references && family.references.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Common References</h3>
          <div className="space-y-1">
            {family.references.map(r => (
              <div key={r.label} className="flex justify-between text-xs bg-[var(--bg-surface)] rounded-lg px-2.5 py-1.5">
                <span className="text-[var(--text-secondary)]">{r.label}</span>
                <span className="text-[var(--text-muted)] font-mono">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConverterDropdown({ family, slug }: { family: FamilyConfig; slug: string }) {
  const [value, setValue] = useState('100');
  const [from, setFrom] = useState(family.units[0]!.key);
  const [to, setTo] = useState(family.units[1]?.key ?? family.units[0]!.key);
  const [output, setOutput] = useState('');

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) { toast.error('Enter a valid number'); return; }
    let result: number;
    if (family.customConvert) {
      result = family.customConvert(v, from, to);
    } else if (family.multipliers) {
      result = (v / family.multipliers[from]!) * family.multipliers[to]!;
    } else return;
    const fromLabel = family.units.find(u => u.key === from)?.label ?? from;
    const toLabel = family.units.find(u => u.key === to)?.label ?? to;
    setOutput(`${v} ${fromLabel} = ${result.toFixed(4)} ${toLabel}`);
  };

  const swap = () => { setFrom(to); setTo(from); setOutput(''); };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{family.title}</h2>
      <p className="text-xs text-[var(--text-secondary)]">{family.desc}</p>
      <ConverterExamples examples={family.examples ?? []} onSelect={v => setValue(v)} />
      <div>
        <label htmlFor="lbl-unitconverter-value" className="text-xs text-[var(--text-secondary)] mb-1 block">Quantity</label>
        <input id="lbl-unitconverter-value" aria-label="Quantity" type="number" value={value} onChange={e => setValue(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
        <div>
          <label htmlFor="lbl-unitconverter-from" className="text-xs text-[var(--text-secondary)] mb-1 block">From</label>
          <select id="lbl-unitconverter-from" aria-label="From" value={from} onChange={e => setFrom(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]">
            {family.units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
        <button onClick={swap} className="mb-0.5 px-2 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors text-xs" title="Swap units">
          &#8644;
        </button>
        <div>
          <label htmlFor="lbl-unitconverter-to" className="text-xs text-[var(--text-secondary)] mb-1 block">To</label>
          <select id="lbl-unitconverter-to" aria-label="To" value={to} onChange={e => setTo(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]">
            {family.units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
      </div>
      <button onClick={convert} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-2 rounded-lg text-sm">
        Convert
      </button>
      {output && (
        <div role="button" tabIndex={0} className="mt-4 p-3 bg-[var(--bg-surface)] rounded-lg text-sm text-center font-mono text-emerald-600 dark:text-emerald-400"
          onClick={() => { clipboardWrite(output).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clipboardWrite(output).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); } }}>
          {output}
        </div>
      )}
      <ConverterMeta family={family} />
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
      const base = v / family.multipliers[u.key]!;
      converted = base;
    } else converted = 0;
    return { label: u.label, value: converted };
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{family.title}</h2>
      <p className="text-xs text-[var(--text-secondary)]">{family.desc}</p>
      <ConverterExamples examples={family.examples ?? []} onSelect={v => setValue(v)} />
      <div>
        <label htmlFor="lbl-unitconverter-value-in-family-baseunit" className="text-xs text-[var(--text-secondary)] mb-1 block">Value (in {family.baseUnit})</label>
        <input id="lbl-unitconverter-value-in-family-baseunit" type="number" value={value} onChange={e => setValue(e.target.value)} aria-label={`Value in ${family.baseUnit}`}
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
      <ConverterMeta family={family} />
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
