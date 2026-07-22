"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Clipboard, ExternalLink } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

export function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

export const LinkCard = ({ title, slug, desc }: { title: string; slug: string; desc: string }) => (
  <Link href={`/tools/${slug}`} className="block bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{desc}</p>
  </Link>
);

export function UnitConv({ title, units, defaultValue = '1' }: { title: string; units: { label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]; defaultValue?: string }) {
  const [val, setVal] = useState(defaultValue);
  const [fromUnit, setFromUnit] = useState(0);
  const [results, setResults] = useState<{ label: string; value: string }[]>([]);

  const convert = () => {
    const num = parseFloat(val);
    if (isNaN(num)) { toast.error('Enter a valid number'); return; }
    const base = units[fromUnit].toBase(num);
    setResults(units.map((u, i) => ({
      label: u.label,
      value: i === fromUnit ? val : u.fromBase(base).toFixed(4),
    })));
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Value</label>
          <input type="number" value={val} onChange={e => setVal(e.target.value)}
            className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">From</label>
          <select value={fromUnit} onChange={e => setFromUnit(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
            {units.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
          </select>
        </div>
      </div>
      <button onClick={convert} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.map((r, i) => (
            <div key={i} className="flex justify-between items-center bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm font-mono">
              <span className="text-zinc-600 dark:text-[var(--text-muted)]">{r.label}</span>
              <span className="font-bold text-[var(--text-primary)]">{r.value}</span>
            </div>
          ))}
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

export const FUEL_UNITS = [
  { label: 'L/100km', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'MPG (US)', toBase: (v: number) => 235.215 / v, fromBase: (v: number) => 235.215 / v },
  { label: 'MPG (UK)', toBase: (v: number) => 282.481 / v, fromBase: (v: number) => 282.481 / v },
  { label: 'km/L', toBase: (v: number) => 100 / v, fromBase: (v: number) => 100 / v },
];

export const PAPER_UNITS = [
  { label: 'A0 (841×1189mm)', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'A1 (594×841mm)', toBase: (v: number) => v * 0.5, fromBase: (v: number) => v * 2 },
  { label: 'A4 (210×297mm)', toBase: (v: number) => v * 0.0625, fromBase: (v: number) => v * 16 },
  { label: 'Letter (216×279mm)', toBase: (v: number) => v * 0.0625, fromBase: (v: number) => v * 16 },
  { label: 'Legal (216×356mm)', toBase: (v: number) => v * 0.075, fromBase: (v: number) => v * 13.33 },
];

export const CLOTHING_UNITS = [
  { label: 'US/Canada', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'UK', toBase: (v: number) => v - 2, fromBase: (v: number) => v + 2 },
  { label: 'EU', toBase: (v: number) => (v - 32) * 2.54, fromBase: (v: number) => v / 2.54 + 32 },
  { label: 'Japan', toBase: (v: number) => v + 7, fromBase: (v: number) => v - 7 },
  { label: 'France', toBase: (v: number) => (v - 34) * 1.5, fromBase: (v: number) => v / 1.5 + 34 },
];

export function UnitConvWithCooking() { return <UnitConv title="Cooking Measurement Converter" units={COOKING_UNITS} defaultValue="1" />; }
export function UnitConvWithFuel() { return <UnitConv title="Fuel Consumption Converter" units={FUEL_UNITS} defaultValue="8" />; }
export function UnitConvWithPaper() { return <UnitConv title="Paper Size Converter" units={PAPER_UNITS} defaultValue="1" />; }
export function UnitConvWithClothing() { return <UnitConv title="Clothing Size Converter" units={CLOTHING_UNITS} defaultValue="8" />; }

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
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Large Text File Viewer</h5>
      <input type="file" accept=".txt,.csv,.json,.log,.md,.html,.xml" onChange={handleFile}
        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer" />
      <p className="text-sm text-[var(--text-muted)]">Size: {(fileSize / 1024).toFixed(1)} KB</p>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Search</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
        </div>
        <button onClick={doSearch} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl self-end">Find</button>
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
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Avro Schema Generator</h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Namespace</label>
          <input type="text" value={namespace} onChange={e => setNamespace(e.target.value)} placeholder="Namespace"
            className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name"
            className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Fields JSON</label>
        <textarea rows={4} value={fields} onChange={e => setFields(e.target.value)}
          className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-y" />
      </div>
      <button onClick={generate} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
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
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Avro → JSON Sample</h5>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Avro schema</label>
        <textarea rows={4} value={schema} onChange={e => setSchema(e.target.value)}
          className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-y" />
      </div>
      <button onClick={generateSample} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
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
    <div className="md:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">iCal Event Generator</h5>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Summary</label><input type="text" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summary" className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Start</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Start time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Location</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">End date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">End time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
      </div>
      <div className="space-y-1"><label className="text-xs font-medium text-[var(--text-secondary)]">Description</label><textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-y" /></div>
      <button onClick={generate} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate .ics</button>
      {ical && <div className="relative"><pre className="text-sm font-mono bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{ical}</pre><div className="mt-1"><CopyBtn text={ical} label=".ics" /></div></div>}
    </div>
  );
}
