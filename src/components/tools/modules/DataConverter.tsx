"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import Papa from 'papaparse';
import { parseStringPromise, Builder } from 'xml2js';
import * as YAML from 'yaml';
import * as XLSX from 'xlsx';

const FORMATS = ['JSON', 'CSV', 'XML', 'YAML', 'TSV', 'SQL', 'Parquet'];

function parseInput(input: string, format: string): Promise<any> {
  const trimmed = input.trim();
  if (!trimmed) return Promise.resolve(null);

  switch (format) {
    case 'JSON':
      return Promise.resolve(JSON.parse(trimmed));
    case 'CSV':
      return Promise.resolve(Papa.parse(trimmed, { header: true, skipEmptyLines: true }).data);
    case 'TSV':
      return Promise.resolve(Papa.parse(trimmed, { header: true, skipEmptyLines: true, delimiter: '\t' }).data);
    case 'XML':
      return parseStringPromise(trimmed, { explicitArray: false, ignoreAttrs: true });
    case 'YAML':
      return Promise.resolve(YAML.parse(trimmed));
    case 'SQL':
      throw new Error('SQL parsing not supported yet');
    case 'Parquet':
      throw new Error('Parquet parsing requires server-side processing');
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

function stringifyOutput(data: any, format: string): string {
  switch (format) {
    case 'JSON':
      return JSON.stringify(data, null, 2);
    case 'CSV': {
      const csv = Papa.unparse(data, { header: true });
      return csv;
    }
    case 'TSV': {
      const tsv = Papa.unparse(data, { header: true, delimiter: '\t' });
      return tsv;
    }
    case 'XML': {
      const builder = new Builder({ headless: true, renderOpts: { pretty: true, indent: '  ' } });
      const xml = builder.buildObject(data);
      return xml;
    }
    case 'YAML':
      return YAML.stringify(data);
    case 'SQL':
      throw new Error('SQL generation not supported yet');
    case 'Parquet':
      throw new Error('Parquet generation requires server-side processing');
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

function normalizeForFormat(data: any, targetFormat: string): any {
  if (targetFormat === 'XML') {
    if (Array.isArray(data)) {
      return { items: data.map((item, i) => ({ [`item${i}`]: item })) };
    }
    if (typeof data === 'object' && data !== null) {
      return data;
    }
    return { value: data };
  }
  if (targetFormat === 'CSV' || targetFormat === 'TSV') {
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null) return [data];
    return [{ value: data }];
  }
  return data;
}

export function DataConverter({ defaultFrom, defaultTo }: { defaultFrom?: string; defaultTo?: string }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [srcFormat, setSrcFormat] = useState(defaultFrom || 'JSON');
  const [dstFormat, setDstFormat] = useState(defaultTo || 'CSV');
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!input.trim()) { toast.error('Enter data to convert'); return; }
    if (srcFormat === dstFormat) { toast.error('Source and target formats are the same'); return; }

    setIsConverting(true);
    try {
      let parsed: any;
      switch (srcFormat) {
        case 'JSON':
          parsed = JSON.parse(input.trim());
          break;
        case 'CSV':
          parsed = Papa.parse(input.trim(), { header: true, skipEmptyLines: true }).data;
          break;
        case 'TSV':
          parsed = Papa.parse(input.trim(), { header: true, skipEmptyLines: true, delimiter: '\t' }).data;
          break;
        case 'XML':
          parsed = await parseStringPromise(input.trim(), { explicitArray: false, ignoreAttrs: true });
          break;
        case 'YAML':
          parsed = YAML.parse(input.trim());
          break;
        case 'SQL':
          throw new Error('SQL parsing not supported yet');
        case 'Parquet':
          throw new Error('Parquet parsing requires server-side processing');
      }

      const normalized = normalizeForFormat(parsed, dstFormat);
      let result: string;
      switch (dstFormat) {
        case 'JSON':
          result = JSON.stringify(normalized, null, 2);
          break;
        case 'CSV':
          result = Papa.unparse(normalized, { header: true });
          break;
        case 'TSV':
          result = Papa.unparse(normalized, { header: true, delimiter: '\t' });
          break;
        case 'XML': {
          const builder = new Builder({ headless: true, renderOpts: { pretty: true, indent: '  ' } });
          result = builder.buildObject(normalized);
          break;
        }
        case 'YAML':
          result = YAML.stringify(normalized);
          break;
        case 'SQL':
          throw new Error('SQL generation not supported yet');
        case 'Parquet':
          throw new Error('Parquet generation requires server-side processing');
        default:
          throw new Error(`Unknown format: ${dstFormat}`);
      }

      setOutput(result);
      toast.success(`Converted from ${srcFormat} to ${dstFormat}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      toast.error(message);
      setOutput(`Error: ${message}`);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Data Converter</h2>
        <p className="text-sm text-[var(--text-secondary)]">Convert structured data between formats — runs entirely in your browser</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Source</label>
            <select value={srcFormat} onChange={e => setSrcFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm">
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Target</label>
            <select value={dstFormat} onChange={e => setDstFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm">
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Input</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className="w-full mt-1 p-3 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm font-mono" placeholder={`Paste ${srcFormat} data here...`} />
        </div>
        <button onClick={handleConvert} disabled={isConverting} className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-medium transition disabled:opacity-50">
          {isConverting ? 'Converting...' : 'Convert'}
        </button>
        {output && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Output</label>
              <button onClick={() => downloadOrShare(output, `converted.${dstFormat.toLowerCase()}`)} className="text-xs px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] transition-colors">
                Download
              </button>
            </div>
            <pre className="p-3 rounded-lg border dark:border-zinc-700 bg-[var(--bg-overlay)] text-sm font-mono whitespace-pre-wrap max-h-96 overflow-auto">{output}</pre>
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