"use client";

import React, { useState, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';

type Tab = 'everyday' | 'image' | 'file' | 'generators';

const TABS: { key: Tab; label: string }[] = [
  { key: 'everyday', label: 'Everyday' },
  { key: 'image', label: 'Image & Doc' },
  { key: 'file', label: 'File Tools' },
  { key: 'generators', label: 'Generators' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 ${className}`}>{children}</div>;
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
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">{title}</h4>
      <div className="flex gap-2 mb-2">
        <input type="number" value={val} onChange={e => setVal(e.target.value)} className="w-24 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        <select value={fromUnit} onChange={e => setFromUnit(parseInt(e.target.value))} className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm">
          {units.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
        </select>
      </div>
      <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
      {results.length > 0 && (
        <div className="mt-2 space-y-1">
          {results.map((r, i) => (
            <div key={i} className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              <span>{r.label}</span>
              <span className="font-bold">{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
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
  { label: 'Miles/Gallon (US)', toBase: (v: number) => 235.215 / v, fromBase: (v: number) => 235.215 / v },
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

function ImageToAvifWebp({ format }: { format: 'avif' | 'webp' }) {
  const [preview, setPreview] = useState('');
  const [info, setInfo] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          setPreview(URL.createObjectURL(blob));
          setInfo(`Original: ${(file.size / 1024).toFixed(1)} KB → ${format.toUpperCase()}: ${(blob.size / 1024).toFixed(1)} KB`);
        }
      }, `image/${format}`, 0.8);
    };
    img.src = url;
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Convert to {format.toUpperCase()}</h4>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="w-full text-xs mb-2" />
      {preview && <><img src={preview} alt="Preview" className="w-full max-h-40 object-contain rounded-lg bg-zinc-100" /><p className="text-xs text-zinc-400 mt-1">{info}</p></>}
    </Card>
  );
}

function PdfToPowerpointConv() {
  const [pptText, setPptText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim()).slice(0, 50);
      let ppt = '';
      let slideNum = 1;
      let currentSlide: string[] = [];
      for (const line of lines) {
        if (line.length < 50 && line.trim().length > 0 && !line.startsWith(' ')) {
          if (currentSlide.length > 0) {
            ppt += `--- Slide ${slideNum} ---\n${currentSlide.join('\n')}\n\n`;
            slideNum++;
          }
          currentSlide = [line];
        } else {
          currentSlide.push(line);
        }
      }
      if (currentSlide.length > 0) ppt += `--- Slide ${slideNum} ---\n${currentSlide.join('\n')}`;
      setPptText(ppt || 'No text content found. Try a text-based PDF.');
    } catch {
      toast.error('Could not parse PDF. Try a text-based file.');
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">PDF → PowerPoint</h4>
      <input type="file" accept=".pdf" onChange={handleFile} className="w-full text-xs" />
      {loading && <p className="text-xs text-zinc-400 mt-2">Processing...</p>}
      {pptText && <textarea readOnly rows={8} value={pptText} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

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
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">File Compressor (ZIP Sim)</h4>
      <input type="file" multiple onChange={handleFiles} className="w-full text-xs" />
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((f, i) => <p key={i} className="text-xs text-zinc-400 font-mono">{f.name} ({(f.size / 1024).toFixed(1)} KB)</p>)}
          <p className="text-xs text-zinc-600 mt-1">Estimated ZIP: {(compressed! / 1024).toFixed(1)} KB (~30% reduction)</p>
        </div>
      )}
    </Card>
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
    <Card className="md:col-span-2">
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Large Text File Viewer</h4>
      <input type="file" accept=".txt,.csv,.json,.log,.md,.html,.xml" onChange={handleFile} className="w-full text-xs mb-2" />
      <p className="text-xs text-zinc-400 mb-2">Size: {(fileSize / 1024).toFixed(1)} KB</p>
      <div className="flex gap-2 mb-2">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        <button onClick={doSearch} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-sm">Find</button>
      </div>
      {matches.length > 0 && <p className="text-xs text-zinc-400 mb-1">{matches.length} matches</p>}
      <div className="max-h-60 overflow-auto bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap">{text || 'No file loaded'}</div>
    </Card>
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
      const result = {
        type: 'record',
        namespace,
        name,
        fields: parsedFields,
      };
      setSchema(JSON.stringify(result, null, 2));
    } catch { toast.error('Invalid fields array'); }
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Avro Schema Generator</h4>
      <input type="text" value={namespace} onChange={e => setNamespace(e.target.value)} placeholder="Namespace" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm mb-2" />
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm mb-2" />
      <textarea rows={4} value={fields} onChange={e => setFields(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Generate</button>
      {schema && <textarea readOnly rows={8} value={schema} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
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
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Avro → JSON Sample</h4>
      <textarea rows={4} value={schema} onChange={e => setSchema(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={generateSample} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Generate</button>
      {sample && <textarea readOnly rows={5} value={sample} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
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
    <Card className="md:col-span-2">
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">iCal Event Generator</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <input type="text" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summary" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
      </div>
      <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs mb-2" />
      <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate .ics</button>
      {ical && <textarea readOnly rows={8} value={ical} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

export default function ConvertersEverydayKit() {
  const [tab, setTab] = useState<Tab>('everyday');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>{t.label}</button>
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
      {tab === 'image' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageToAvifWebp format="webp" />
          <ImageToAvifWebp format="avif" />
          <PdfToPowerpointConv />
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
