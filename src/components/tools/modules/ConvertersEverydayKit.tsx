"use client";

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'everyday' | 'file' | 'generators';

const TABS: { key: Tab; label: string }[] = [
  { key: 'everyday', label: 'Everyday' },
  { key: 'file', label: 'File Tools' },
  { key: 'generators', label: 'Generators' },
];

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

function UnitConv({ title, units, defaultValue = '1' }: { title: string; units: { label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]; defaultValue?: string }) {
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Value</label>
          <input type="number" value={val} onChange={e => setVal(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">From</label>
          <select value={fromUnit} onChange={e => setFromUnit(parseInt(e.target.value))}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500">
            {units.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
          </select>
        </div>
      </div>
      <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.map((r, i) => (
            <div key={i} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm font-mono">
              <span className="text-zinc-600 dark:text-zinc-400">{r.label}</span>
              <span className="font-bold text-zinc-900 dark:text-white">{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const AREA_UNITS = [
  { label: 'Square Meter', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'Square Kilometer', toBase: (v: number) => v * 1e6, fromBase: (v: number) => v / 1e6 },
  { label: 'Square Foot', toBase: (v: number) => v * 0.092903, fromBase: (v: number) => v / 0.092903 },
  { label: 'Square Yard', toBase: (v: number) => v * 0.836127, fromBase: (v: number) => v / 0.836127 },
  { label: 'Acre', toBase: (v: number) => v * 4046.86, fromBase: (v: number) => v / 4046.86 },
  { label: 'Hectare', toBase: (v: number) => v * 10000, fromBase: (v: number) => v / 10000 },
  { label: 'Square Mile', toBase: (v: number) => v * 2.59e6, fromBase: (v: number) => v / 2.59e6 },
];

const COOKING_UNITS = [
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

const FUEL_UNITS = [
  { label: 'L/100km', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'MPG (US)', toBase: (v: number) => 235.215 / v, fromBase: (v: number) => 235.215 / v },
  { label: 'MPG (UK)', toBase: (v: number) => 282.481 / v, fromBase: (v: number) => 282.481 / v },
  { label: 'km/L', toBase: (v: number) => 100 / v, fromBase: (v: number) => 100 / v },
];

const PAPER_UNITS = [
  { label: 'A0 (841×1189mm)', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'A1 (594×841mm)', toBase: (v: number) => v * 0.5, fromBase: (v: number) => v * 2 },
  { label: 'A4 (210×297mm)', toBase: (v: number) => v * 0.0625, fromBase: (v: number) => v * 16 },
  { label: 'Letter (216×279mm)', toBase: (v: number) => v * 0.0625, fromBase: (v: number) => v * 16 },
  { label: 'Legal (216×356mm)', toBase: (v: number) => v * 0.075, fromBase: (v: number) => v * 13.33 },
];

const CLOTHING_UNITS = [
  { label: 'US/Canada', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'UK', toBase: (v: number) => v - 2, fromBase: (v: number) => v + 2 },
  { label: 'EU', toBase: (v: number) => (v - 32) * 2.54, fromBase: (v: number) => v / 2.54 + 32 },
  { label: 'Japan', toBase: (v: number) => v + 7, fromBase: (v: number) => v - 7 },
  { label: 'France', toBase: (v: number) => (v - 34) * 1.5, fromBase: (v: number) => v / 1.5 + 34 },
];

const STORAGE_UNITS = [
  { label: 'Byte (B)', toBase: (v: number) => v, fromBase: (v: number) => v },
  { label: 'Kilobyte (KB)', toBase: (v: number) => v * 1024, fromBase: (v: number) => v / 1024 },
  { label: 'Megabyte (MB)', toBase: (v: number) => v * 1024 * 1024, fromBase: (v: number) => v / (1024 * 1024) },
  { label: 'Gigabyte (GB)', toBase: (v: number) => v * 1024 * 1024 * 1024, fromBase: (v: number) => v / (1024 * 1024 * 1024) },
  { label: 'Terabyte (TB)', toBase: (v: number) => v * 1024 * 1024 * 1024 * 1024, fromBase: (v: number) => v / (1024 * 1024 * 1024 * 1024) },
  { label: 'Petabyte (PB)', toBase: (v: number) => v * 1024 * 1024 * 1024 * 1024 * 1024, fromBase: (v: number) => v / (1024 * 1024 * 1024 * 1024 * 1024) },
];

function ZipCompressor() {
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [compressed, setCompressed] = useState<number | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = Array.from(e.target.files || []);
    setFiles(fl.map(f => ({ name: f.name, size: f.size })));
    const total = fl.reduce((s, f) => s + f.size, 0);
    setCompressed(Math.round(total * 0.7));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">File Compressor (ZIP Sim)</h5>
      <input type="file" multiple onChange={handleFiles}
        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer" />
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, i) => <p key={i} className="text-sm text-zinc-400 font-mono">{f.name} ({(f.size / 1024).toFixed(1)} KB)</p>)}
          <p className="text-sm text-zinc-600 font-medium">Estimated ZIP: {(compressed! / 1024).toFixed(1)} KB (~30% reduction)</p>
        </div>
      )}
    </div>
  );
}

function LargeTextViewer() {
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Large Text File Viewer</h5>
      <input type="file" accept=".txt,.csv,.json,.log,.md,.html,.xml" onChange={handleFile}
        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer" />
      <p className="text-sm text-zinc-400">Size: {(fileSize / 1024).toFixed(1)} KB</p>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-zinc-500">Search</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <button onClick={doSearch} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl self-end">Find</button>
      </div>
      {matches.length > 0 && <p className="text-sm text-zinc-400">{matches.length} matches</p>}
      <div className="max-h-60 overflow-auto bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-sm font-mono whitespace-pre-wrap">{text || 'No file loaded'}</div>
    </div>
  );
}

function AvroSchemaGenerator() {
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Avro Schema Generator</h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Namespace</label>
          <input type="text" value={namespace} onChange={e => setNamespace(e.target.value)} placeholder="Namespace"
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name"
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">Fields JSON</label>
        <textarea rows={4} value={fields} onChange={e => setFields(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      </div>
      <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
      {schema && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400">{schema}</pre><div className="mt-1"><CopyBtn text={schema} label="Schema" /></div></div>}
    </div>
  );
}

function AvroToJsonSample() {
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Avro → JSON Sample</h5>
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">Avro schema</label>
        <textarea rows={4} value={schema} onChange={e => setSchema(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      </div>
      <button onClick={generateSample} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
      {sample && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400">{sample}</pre><div className="mt-1"><CopyBtn text={sample} label="Sample" /></div></div>}
    </div>
  );
}

function IcalEventGenerator() {
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
    <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">iCal Event Generator</h5>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-zinc-500">Summary</label><input type="text" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summary" className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-zinc-500">Start</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-zinc-500">Start time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-zinc-500">Location</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-zinc-500">End date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-zinc-500">End time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" /></div>
      </div>
      <div className="space-y-1"><label className="text-xs font-medium text-zinc-500">Description</label><textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" /></div>
      <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate .ics</button>
      {ical && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{ical}</pre><div className="mt-1"><CopyBtn text={ical} label=".ics" /></div></div>}
    </div>
  );
}

export default function ConvertersEverydayKit() {
  const [tab, setTab] = useState<Tab>('everyday');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === t.key ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'everyday' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UnitConv title="Area Converter" units={AREA_UNITS} />
          <UnitConv title="Cooking Measurement" units={COOKING_UNITS} defaultValue="1" />
          <UnitConv title="Fuel Consumption" units={FUEL_UNITS} defaultValue="8" />
          <UnitConv title="Paper Size" units={PAPER_UNITS} defaultValue="1" />
          <UnitConv title="Clothing Size" units={CLOTHING_UNITS} defaultValue="8" />
          <UnitConv title="Data Storage" units={STORAGE_UNITS} defaultValue="1" />
        </div>
      )}
      {tab === 'file' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ZipCompressor />
          <LargeTextViewer />
        </div>
      )}
      {tab === 'generators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AvroSchemaGenerator />
          <AvroToJsonSample />
          <IcalEventGenerator />
        </div>
      )}
    </div>
  );
}
