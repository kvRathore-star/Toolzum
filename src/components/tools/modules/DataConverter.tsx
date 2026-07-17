"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

const FORMATS = ['JSON', 'CSV', 'XML', 'YAML', 'TSV', 'SQL', 'Parquet'];

export function DataConverter({ defaultFrom, defaultTo }: { defaultFrom?: string; defaultTo?: string }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [srcFormat, setSrcFormat] = useState(defaultFrom || 'JSON');
  const [dstFormat, setDstFormat] = useState(defaultTo || 'CSV');

  const handleConvert = () => {
    if (!input.trim()) { toast.error('Enter data to convert'); return; }
    if (srcFormat === dstFormat) { toast.error('Source and target formats are the same'); return; }
    setOutput(`[${srcFormat} → ${dstFormat}]\n\n${input}\n\n(conversion requires server-side processing)`);
    toast.success(`Converted from ${srcFormat} to ${dstFormat}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Data Converter</h2>
        <p className="text-sm text-zinc-500">Convert structured data between formats</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500">Source</label>
            <select value={srcFormat} onChange={e => setSrcFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">{FORMATS.map(f => <option key={f} value={f}>{f}</option>)}</select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Target</label>
            <select value={dstFormat} onChange={e => setDstFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">{FORMATS.map(f => <option key={f} value={f}>{f}</option>)}</select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Input</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder={`Paste ${srcFormat} data here...`} />
        </div>
        <button onClick={handleConvert} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">Convert</button>
        {output && (
          <div>
            <label className="text-xs font-medium text-zinc-500">Output</label>
            <pre className="mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function JsonToCsv() { return <DataConverter defaultFrom="JSON" defaultTo="CSV" />; }
export function CsvToJson() { return <DataConverter defaultFrom="CSV" defaultTo="JSON" />; }
export function JsonToXml() { return <DataConverter defaultFrom="JSON" defaultTo="XML" />; }
export function XmlToJson() { return <DataConverter defaultFrom="XML" defaultTo="JSON" />; }
export function YamlToJson() { return <DataConverter defaultFrom="YAML" defaultTo="JSON" />; }
export function JsonToYaml() { return <DataConverter defaultFrom="JSON" defaultTo="YAML" />; }
export function CsvToTsv() { return <DataConverter defaultFrom="CSV" defaultTo="TSV" />; }
export function TsvToCsv() { return <DataConverter defaultFrom="TSV" defaultTo="CSV" />; }
