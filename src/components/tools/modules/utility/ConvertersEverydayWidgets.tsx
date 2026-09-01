"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Clipboard, ExternalLink, Star, History, ArrowLeftRight } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

export function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

export const LinkCard = ({ title, slug, desc }: { title: string; slug: string; desc: string }) => (
  <Link href={`/tools/${slug}`} className="block bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 rounded-xl space-y-2 hover:border-[var(--accent)] transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-700 dark:text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{desc}</p>
  </Link>
);

export interface ConversionPreset {
  label: string;
  value: string;
  fromUnit: number;
  toUnit: number;
}

export function UnitConv({ title, units, defaultValue = '1', presets = [] }: { title: string; units: { label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]; defaultValue?: string; presets?: ConversionPreset[] }) {
  const [val, setVal] = useState(defaultValue);
  const [fromUnit, setFromUnit] = useState(0);
  const [results, setResults] = useState<{ label: string; value: string }[]>([]);
  const [history, setHistory] = useState<{ value: string; from: string; result: string; time: string }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchValues, setBatchValues] = useState('');

  const convert = useCallback(() => {
    if (batchMode) {
      const values = batchValues.split('\n').filter(v => v.trim());
      const batchResults = values.map(v => {
        const num = parseFloat(v.trim());
        if (isNaN(num)) return { label: v.trim(), value: 'Invalid' };
        const base = units[fromUnit].toBase(num);
        return {
          label: v.trim(),
          value: units.map((u, i) => `${u.label}: ${i === fromUnit ? v.trim() : u.fromBase(base).toFixed(4)}`).join(' | ')
        };
      });
      setResults(batchResults);
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) { toast.error('Enter a valid number'); return; }
    const base = units[fromUnit].toBase(num);
    const newResults = units.map((u, i) => ({
      label: u.label,
      value: i === fromUnit ? val : u.fromBase(base).toFixed(4),
    }));
    setResults(newResults);
    const time = new Date().toLocaleTimeString();
    setHistory(prev => [{ value: val, from: units[fromUnit].label, result: newResults.map(r => `${r.label}: ${r.value}`).join(', '), time }, ...prev].slice(0, 20));
  }, [val, fromUnit, units, batchMode, batchValues]);

  const swapUnits = useCallback(() => {
    if (results.length > 1) {
      const secondUnitIndex = units.findIndex(u => u.label === results[1]?.label);
      if (secondUnitIndex >= 0) {
        setFromUnit(secondUnitIndex);
        setVal(results[1]?.value || defaultValue);
        setResults([]);
      }
    }
  }, [results, units, defaultValue]);

  const toggleFavorite = (key: string) => {
    setFavorites(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
  };

  const favKey = `${title}-${fromUnit}`;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-bold text-[var(--text-primary)]">{title}</h5>
        <div className="flex gap-1">
          <button onClick={() => toggleFavorite(favKey)}
            className={`p-1.5 rounded-lg transition-colors ${favorites.includes(favKey) ? 'text-amber-500' : 'text-[var(--text-muted)] hover:text-amber-400'}`}>
            <Star className="w-4 h-4" fill={favorites.includes(favKey) ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => setBatchMode(!batchMode)}
            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${batchMode ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-[var(--text-muted)] hover:text-blue-400'}`}>
            Batch
          </button>
        </div>
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((p, i) => (
            <button key={i} onClick={() => { setVal(p.value); setFromUnit(p.fromUnit); }}
              className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      )}

      {batchMode ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Values (one per line)</label>
            <textarea value={batchValues} onChange={e => setBatchValues(e.target.value)} rows={4}
              placeholder="100&#10;250&#10;500"
              className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">From</label>
            <select value={fromUnit} onChange={e => setFromUnit(parseInt(e.target.value))}
              className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]">
              {units.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Value</label>
            <input type="number" value={val} onChange={e => setVal(e.target.value)}
              className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">From</label>
            <select value={fromUnit} onChange={e => setFromUnit(parseInt(e.target.value))}
              className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]">
              {units.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={convert} className="flex-1 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {!batchMode && results.length > 0 && (
          <button onClick={swapUnits} className="px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-secondary)] hover:text-blue-500 hover:border-blue-400 transition-colors" title="Swap units">
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.map((r, i) => (
            <div key={i} className="flex justify-between items-center bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm font-mono">
              <span className="text-[var(--text-secondary)]">{r.label}</span>
              <span className="font-bold text-[var(--text-primary)]">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] pt-3">
          <div className="flex items-center gap-1 mb-2">
            <History className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Recent</span>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] text-[var(--text-muted)] py-0.5">
                <span>{h.value} {h.from}</span>
                <span className="font-mono">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const COOKING_UNITS = [
  { label: 'Teaspoon (tsp)', toBase: (v: number) => v * 4.92892, fromBase: (v: number) => v / 4.92892 },
  { label: 'Tablespoon (tbsp)', toBase: (v: number) => v * 14.7868, fromBase: (v: number) => v / 14.7868 },
  { label: 'Fluid Ounce (fl oz)', toBase: (v: number) => v * 29.5735, fromBase: (v: number) => v / 29.5735 },
  { label: 'Cup', toBase: (v: number) => v * 236.588, fromBase: (v: number) => v / 236.588 },
  { label: 'Pint (pt)', toBase: (v: number) => v * 473.176, fromBase: (v: number) => v / 473.176 },
  { label: 'Quart (qt)', toBase: (v: number) => v * 946.353, fromBase: (v: number) => v / 946.353 },
  { label: 'Gallon (gal)', toBase: (v: number) => v * 3785.41, fromBase: (v: number) => v / 3785.41 },
  { label: 'Milliliter (mL)', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'Liter (L)', toBase: (v: number) => v * 1000, fromBase: (v: number) => v / 1000 },
];

const COOKING_PRESETS: ConversionPreset[] = [
  { label: '1 cup → mL', value: '1', fromUnit: 3, toUnit: 7 },
  { label: '2 tbsp → tsp', value: '2', fromUnit: 1, toUnit: 0 },
  { label: '1 gal → L', value: '1', fromUnit: 6, toUnit: 8 },
];

export const FUEL_UNITS = [
  { label: 'L/100km', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'MPG (US)', toBase: (v: number) => 235.215 / v, fromBase: (v: number) => 235.215 / v },
  { label: 'MPG (UK)', toBase: (v: number) => 282.481 / v, fromBase: (v: number) => 282.481 / v },
  { label: 'km/L', toBase: (v: number) => 100 / v, fromBase: (v: number) => 100 / v },
];

const FUEL_PRESETS: ConversionPreset[] = [
  { label: '30 mpg → L/100km', value: '30', fromUnit: 1, toUnit: 0 },
  { label: '8 L/100km → mpg', value: '8', fromUnit: 0, toUnit: 1 },
];

export const PAPER_UNITS = [
  { label: 'A0 (841x1189mm)', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'A1 (594x841mm)', toBase: (v: number) => v * 0.5, fromBase: (v: number) => v * 2 },
  { label: 'A4 (210x297mm)', toBase: (v: number) => v * 0.0625, fromBase: (v: number) => v * 16 },
  { label: 'Letter (216x279mm)', toBase: (v: number) => v * 0.0625, fromBase: (v: number) => v * 16 },
  { label: 'Legal (216x356mm)', toBase: (v: number) => v * 0.075, fromBase: (v: number) => v * 13.33 },
];

const PAPER_PRESETS: ConversionPreset[] = [
  { label: '1 A0 → A4', value: '1', fromUnit: 0, toUnit: 2 },
  { label: '1 A1 → A4', value: '1', fromUnit: 1, toUnit: 2 },
];

export const CLOTHING_UNITS = [
  { label: 'US/Canada', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'UK', toBase: (v: number) => v - 2, fromBase: (v: number) => v + 2 },
  { label: 'EU', toBase: (v: number) => (v - 32) * 2.54, fromBase: (v: number) => v / 2.54 + 32 },
  { label: 'Japan', toBase: (v: number) => v + 7, fromBase: (v: number) => v - 7 },
  { label: 'France', toBase: (v: number) => (v - 34) * 1.5, fromBase: (v: number) => v / 1.5 + 34 },
];

const CLOTHING_PRESETS: ConversionPreset[] = [
  { label: 'US 8 → EU', value: '8', fromUnit: 0, toUnit: 2 },
  { label: 'EU 42 → US', value: '42', fromUnit: 2, toUnit: 0 },
];

export function UnitConvWithCooking() { return <UnitConv title="Cooking Measurement Converter" units={COOKING_UNITS} defaultValue="1" presets={COOKING_PRESETS} />; }
export function UnitConvWithFuel() { return <UnitConv title="Fuel Consumption Converter" units={FUEL_UNITS} defaultValue="8" presets={FUEL_PRESETS} />; }
export function UnitConvWithPaper() { return <UnitConv title="Paper Size Converter" units={PAPER_UNITS} defaultValue="1" presets={PAPER_PRESETS} />; }
export function UnitConvWithClothing() { return <UnitConv title="Clothing Size Converter" units={CLOTHING_UNITS} defaultValue="8" presets={CLOTHING_PRESETS} />; }

export function LargeTextViewer() {
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [matches, setMatches] = useState<number[]>([]);
  const fileSize = useMemo(() => new Blob([text]).size, [text]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setText(content.slice(0, 100000));
      if (content.length > 100000) toast('Showing first 100K characters');
    };
    reader.readAsText(file);
  };

  const doSearch = () => {
    if (!search) { setMatches([]); return; }
    const idxs: number[] = [];
    let idx = text.indexOf(search, 0);
    while (idx !== -1) { idxs.push(idx); idx = text.indexOf(search, idx + 1); }
    setMatches(idxs);
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-xl">
      <h5 className="text-sm font-bold text-[var(--text-primary)]">Large Text File Viewer</h5>
      <input type="file" accept=".txt,.csv,.json,.log,.md,.html,.xml" onChange={handleFile}
        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer" />
      <p className="text-sm text-[var(--text-muted)]">Size: {(fileSize / 1024).toFixed(1)} KB</p>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Search</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
        </div>
        <button onClick={doSearch} className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl self-end">Find</button>
      </div>
      {matches.length > 0 && <p className="text-sm text-[var(--text-muted)]">{matches.length} matches</p>}
      <div className="max-h-60 overflow-auto bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 text-sm font-mono whitespace-pre-wrap">{text || 'No file loaded'}</div>
    </div>
  );
}

export function AvroSchemaGenerator() {
  const [fields, setFields] = useState('[{"name": "id", "type": "int"}, {"name": "name", "type": "string"}]');
  const [namespace, setNamespace] = useState('com.example');
  const [name, setName] = useState('User');
  const [schema, setSchema] = useState('');

  const generate = () => {
    try {
      const parsedFields = JSON.parse(fields);
      const result = { type: 'record', namespace, name, fields: parsedFields };
      setSchema(JSON.stringify(result, null, 2));
    } catch { toast.error('Invalid fields array'); }
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-xl">
      <h5 className="text-sm font-bold text-[var(--text-primary)]">Avro Schema Generator</h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Namespace</label>
          <input type="text" value={namespace} onChange={e => setNamespace(e.target.value)} placeholder="Namespace"
            className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name"
            className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Fields JSON</label>
        <textarea rows={4} value={fields} onChange={e => setFields(e.target.value)}
          className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y" />
      </div>
      <button onClick={generate} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
      {schema && <div className="relative"><pre className="text-sm font-mono bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400">{schema}</pre><div className="mt-1"><CopyBtn text={schema} label="Schema" /></div></div>}
    </div>
  );
}

export function AvroToJsonSample() {
  const [schema, setSchema] = useState('{"type": "record", "name": "User", "fields": [{"name": "id", "type": "int"}, {"name": "name", "type": "string"}]}');
  const [sample, setSample] = useState('');

  const generateSample = () => {
    try {
      const parsed = JSON.parse(schema);
      const fields = parsed.fields || [];
      const sampleObj: Record<string, any> = { id: Date.now(), name: parsed.name || 'sample' };
      fields.forEach((f: any) => {
        if (f.name === 'id') sampleObj[f.name] = 1;
        else if (f.type === 'string') sampleObj[f.name] = 'example';
        else if (f.type === 'int' || f.type === 'long') sampleObj[f.name] = 42;
        else if (f.type === 'float' || f.type === 'double') sampleObj[f.name] = 3.14;
        else if (f.type === 'boolean') sampleObj[f.name] = true;
        else sampleObj[f.name] = null;
      });
      setSample(JSON.stringify(sampleObj, null, 2));
    } catch { toast.error('Invalid Avro schema'); }
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-xl">
      <h5 className="text-sm font-bold text-[var(--text-primary)]">Avro to JSON Sample</h5>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Avro schema</label>
        <textarea rows={4} value={schema} onChange={e => setSchema(e.target.value)}
          className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y" />
      </div>
      <button onClick={generateSample} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
      {sample && <div className="relative"><pre className="text-sm font-mono bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 text-emerald-600 dark:text-emerald-400">{sample}</pre><div className="mt-1"><CopyBtn text={sample} label="Sample" /></div></div>}
    </div>
  );
}

export function IcalEventGenerator() {
  const [summary, setSummary] = useState('Team Meeting');
  const [startDate, setStartDate] = useState('2026-07-20');
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState('2026-07-20');
  const [endTime, setEndTime] = useState('11:00');
  const [desc, setDesc] = useState('Weekly sync');
  const [location, setLocation] = useState('Room 4B');
  const [ical, setIcal] = useState('');

  const generate = () => {
    const fmt = (d: string, t: string) => `${d.replace(/-/g, '')}T${t.replace(/:/g, '')}00`;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const output = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ToolHub//EN',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(startDate, startTime)}`,
      `DTEND:${fmt(endDate, endTime)}`,
      `DTSTAMP:${now}`,
      `SUMMARY:${summary}`,
      desc ? `DESCRIPTION:${desc}` : '',
      location ? `LOCATION:${location}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\n');
    setIcal(output);
  };

  return (
    <div className="md:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-xl">
      <h5 className="text-sm font-bold text-[var(--text-primary)]">iCal Event Generator</h5>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Summary</label><input type="text" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summary" className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Start</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Start time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Location</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">End date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">End time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" /></div>
      </div>
      <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Description</label><textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y" /></div>
      <button onClick={generate} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate .ics</button>
      {ical && <div className="relative"><pre className="text-sm font-mono bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{ical}</pre><div className="mt-1"><CopyBtn text={ical} label=".ics" /></div></div>}
    </div>
  );
}
