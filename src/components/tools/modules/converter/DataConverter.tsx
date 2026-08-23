"use client";
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';
import { getErrorMessage } from '@/utils/error';
import { CalculatorShell } from '../shared/CalculatorShell';

const FORMATS = ['JSON', 'CSV', 'XML', 'YAML', 'TSV'] as const;
type FormatKey = typeof FORMATS[number];

const FORMAT_MIME: Record<FormatKey, string> = {
  JSON: 'application/json',
  CSV: 'text/csv',
  XML: 'text/xml',
  YAML: 'text/yaml',
  TSV: 'text/tab-separated-values',
};

const FORMAT_EXT: Record<FormatKey, string> = {
  JSON: 'json',
  CSV: 'csv',
  XML: 'xml',
  YAML: 'yaml',
  TSV: 'tsv',
};

const PAIRS = FORMATS.flatMap(f => FORMATS.filter(t => t !== f).map(t => ({ input: f, output: t, slug: `${f.toLowerCase()}-to-${t.toLowerCase()}` })));

function getRelated(slug: string) {
  return PAIRS.filter(p => p.slug !== slug).slice(0, 6);
}

export function DataConverter({ defaultFrom, defaultTo }: { defaultFrom?: string; defaultTo?: string }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [srcFormat, setSrcFormat] = useState<FormatKey>((defaultFrom as FormatKey) || 'JSON');
  const [dstFormat, setDstFormat] = useState<FormatKey>((defaultTo as FormatKey) || 'CSV');

  const activeSlug = `${srcFormat.toLowerCase()}-to-${dstFormat.toLowerCase()}`;
  const related = useMemo(() => getRelated(activeSlug), [activeSlug]);

  const swapFormats = () => {
    setSrcFormat(dstFormat);
    setDstFormat(srcFormat);
    setOutput('');
  };

  const handleConvert = useCallback(async () => {
    if (!input.trim()) { setOutput(''); return; }
    setIsProcessing(true);
    try {
      let result = '';

      if (srcFormat === 'JSON' && dstFormat === 'CSV') {
        const { default: Papa } = await import('papaparse');
        const parsed = JSON.parse(input);
        result = Papa.unparse(Array.isArray(parsed) ? parsed : [parsed]);
      } else if (srcFormat === 'CSV' && dstFormat === 'JSON') {
        const { default: Papa } = await import('papaparse');
        Papa.parse(input, {
          header: true, skipEmptyLines: true,
          complete: (r: any) => { result = JSON.stringify(r.data, null, 2); },
          error: () => { throw new Error('Failed to parse CSV'); }
        });
      } else if (srcFormat === 'JSON' && dstFormat === 'XML') {
        const { Builder } = await import('xml2js');
        const builder = new Builder();
        result = builder.buildObject(JSON.parse(input));
      } else if (srcFormat === 'XML' && dstFormat === 'JSON') {
        const { parseStringPromise } = await import('xml2js');
        const parsed = await parseStringPromise(input, { explicitArray: false, mergeAttrs: true });
        result = JSON.stringify(parsed, null, 2);
      } else if (srcFormat === 'CSV' && dstFormat === 'XML') {
        const { default: Papa } = await import('papaparse');
        const { Builder } = await import('xml2js');
        const parsed = await new Promise<any>((resolve, reject) => {
          Papa.parse(input, { header: true, skipEmptyLines: true, complete: (r: any) => resolve(r.data), error: reject });
        });
        const builder = new Builder();
        result = builder.buildObject({ root: { item: parsed } });
      } else if (srcFormat === 'XML' && dstFormat === 'CSV') {
        const { parseStringPromise } = await import('xml2js');
        const { default: Papa } = await import('papaparse');
        const parsed = await parseStringPromise(input, { explicitArray: false, mergeAttrs: true });
        const findArray = (obj: any): any[] | null => {
          if (Array.isArray(obj)) return obj;
          if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
              const val = obj[key];
              if (Array.isArray(val)) return val;
              if (typeof val === 'object') { const n = findArray(val); if (n) return n; }
            }
          }
          return null;
        };
        const data = findArray(parsed) || [parsed];
        result = Papa.unparse(data);
      } else if (srcFormat === 'JSON' && dstFormat === 'YAML') {
        const YAML = await import('yaml');
        result = YAML.stringify(JSON.parse(input));
      } else if (srcFormat === 'YAML' && dstFormat === 'JSON') {
        const YAML = await import('yaml');
        const parsed = YAML.parse(input);
        result = JSON.stringify(parsed, null, 2);
      } else if (srcFormat === 'CSV' && dstFormat === 'TSV') {
        const { default: Papa } = await import('papaparse');
        const parsed = Papa.parse(input, { header: true, skipEmptyLines: true }).data;
        result = Papa.unparse(parsed, { delimiter: '\t' });
      } else if (srcFormat === 'TSV' && dstFormat === 'CSV') {
        const { default: Papa } = await import('papaparse');
        const parsed = Papa.parse(input, { header: true, skipEmptyLines: true, delimiter: '\t' }).data;
        result = Papa.unparse(parsed);
      } else if (srcFormat === 'YAML' && dstFormat === 'CSV') {
        const YAML = await import('yaml');
        const { default: Papa } = await import('papaparse');
        const parsed = YAML.parse(input);
        result = Papa.unparse(Array.isArray(parsed) ? parsed : [parsed]);
      } else if (srcFormat === 'CSV' && dstFormat === 'YAML') {
        const { default: Papa } = await import('papaparse');
        const YAML = await import('yaml');
        const parsed: any[] = await new Promise((resolve, reject) => {
          Papa.parse(input, { header: true, skipEmptyLines: true, complete: (r: any) => resolve(r.data), error: reject });
        });
        result = YAML.stringify(parsed);
      } else if (srcFormat === 'XML' && dstFormat === 'YAML') {
        const { parseStringPromise } = await import('xml2js');
        const YAML = await import('yaml');
        const parsed = await parseStringPromise(input, { explicitArray: false, mergeAttrs: true });
        result = YAML.stringify(parsed);
      } else if (srcFormat === 'YAML' && dstFormat === 'XML') {
        const YAML = await import('yaml');
        const { Builder } = await import('xml2js');
        const parsed = YAML.parse(input);
        const builder = new Builder();
        result = builder.buildObject(parsed);
      } else if (srcFormat === 'JSON' && dstFormat === 'TSV') {
        const { default: Papa } = await import('papaparse');
        const parsed = JSON.parse(input);
        result = Papa.unparse(Array.isArray(parsed) ? parsed : [parsed], { delimiter: '\t' });
      } else if (srcFormat === 'TSV' && dstFormat === 'JSON') {
        const { default: Papa } = await import('papaparse');
        Papa.parse(input, {
          header: true, skipEmptyLines: true, delimiter: '\t',
          complete: (r: any) => { result = JSON.stringify(r.data, null, 2); },
          error: () => { throw new Error('Failed to parse TSV'); }
        });
      } else if (srcFormat === 'TSV' && dstFormat === 'XML') {
        const { default: Papa } = await import('papaparse');
        const { Builder } = await import('xml2js');
        const parsed = await new Promise<any>((resolve, reject) => {
          Papa.parse(input, { header: true, skipEmptyLines: true, delimiter: '\t', complete: (r: any) => resolve(r.data), error: reject });
        });
        const builder = new Builder();
        result = builder.buildObject({ root: { item: parsed } });
      } else if (srcFormat === 'XML' && dstFormat === 'TSV') {
        const { parseStringPromise } = await import('xml2js');
        const { default: Papa } = await import('papaparse');
        const parsed = await parseStringPromise(input, { explicitArray: false, mergeAttrs: true });
        const findArray = (obj: any): any[] | null => {
          if (Array.isArray(obj)) return obj;
          if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
              const val = obj[key];
              if (Array.isArray(val)) return val;
              if (typeof val === 'object') { const n = findArray(val); if (n) return n; }
            }
          }
          return null;
        };
        const data = findArray(parsed) || [parsed];
        result = Papa.unparse(data, { delimiter: '\t' });
      } else if (srcFormat === 'TSV' && dstFormat === 'YAML') {
        const { default: Papa } = await import('papaparse');
        const YAML = await import('yaml');
        const parsed: any[] = await new Promise((resolve, reject) => {
          Papa.parse(input, { header: true, skipEmptyLines: true, delimiter: '\t', complete: (r: any) => resolve(r.data), error: reject });
        });
        result = YAML.stringify(parsed);
      } else if (srcFormat === 'YAML' && dstFormat === 'TSV') {
        const YAML = await import('yaml');
        const { default: Papa } = await import('papaparse');
        const parsed = YAML.parse(input);
        result = Papa.unparse(Array.isArray(parsed) ? parsed : [parsed], { delimiter: '\t' });
      } else if (srcFormat === 'XML' && dstFormat === 'XML') {
        result = input;
      } else {
        const YAML = await import('yaml');
        const { default: Papa } = await import('papaparse');
        const { parseStringPromise, Builder } = await import('xml2js');
        let parsed: any;
        switch (srcFormat) {
          case 'JSON': parsed = JSON.parse(input); break;
          case 'CSV': parsed = Papa.parse(input, { header: true, skipEmptyLines: true }).data; break;
          case 'TSV': parsed = Papa.parse(input, { header: true, skipEmptyLines: true, delimiter: '\t' }).data; break;
          case 'XML': parsed = await parseStringPromise(input, { explicitArray: false, ignoreAttrs: true }); break;
          case 'YAML': parsed = YAML.parse(input); break;
        }
        switch (dstFormat) {
          case 'JSON': result = JSON.stringify(parsed, null, 2); break;
          case 'CSV': result = Papa.unparse(Array.isArray(parsed) ? parsed : [parsed]); break;
          case 'TSV': result = Papa.unparse(Array.isArray(parsed) ? parsed : [parsed], { delimiter: '\t' }); break;
          case 'XML': { const b = new Builder(); result = b.buildObject(parsed); break; }
          case 'YAML': result = YAML.stringify(parsed); break;
        }
      }

      setOutput(result);
      toast.success('Converted successfully!');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Conversion failed. Check your input.'));
    } finally {
      setIsProcessing(false);
    }
  }, [srcFormat, dstFormat, input]);

const copyOutput = useCallback(() => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied to clipboard!');
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const ext = FORMAT_EXT[dstFormat];
    const mime = FORMAT_MIME[dstFormat];
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `converted.${ext}`);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [output, dstFormat]);

  const presets = [
    { label: 'JSON → CSV', apply: () => { setSrcFormat('JSON'); setDstFormat('CSV'); } },
    { label: 'CSV → JSON', apply: () => { setSrcFormat('CSV'); setDstFormat('JSON'); } },
    { label: 'JSON → XML', apply: () => { setSrcFormat('JSON'); setDstFormat('XML'); } },
    { label: 'XML → JSON', apply: () => { setSrcFormat('XML'); setDstFormat('JSON'); } },
    { label: 'CSV → TSV', apply: () => { setSrcFormat('CSV'); setDstFormat('TSV'); } },
    { label: 'JSON → YAML', apply: () => { setSrcFormat('JSON'); setDstFormat('YAML'); } },
    { label: 'Swap', apply: swapFormats },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); } },
  ];

  const resultText = output ? `Converted ${srcFormat} → ${dstFormat} (${output.length} chars)` : 'Enter data to convert';

  const formatOptions = FORMATS.map(k => <option key={k} value={k}>{k}</option>);

  return (
    <CalculatorShell
      title="Data Format Converter"
      result={resultText}
      onCalculate={handleConvert}
      presets={presets}
      accent="blue"
      downloadData={output}
      downloadFilename={`converted.${FORMAT_EXT[dstFormat]}`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={srcFormat}
            onChange={(e) => { setSrcFormat(e.target.value as FormatKey); setOutput(''); }}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
          >
            {formatOptions}
          </select>

          <button
            onClick={swapFormats}
            className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-all active:scale-95"
            aria-label="Swap formats"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <select
            value={dstFormat}
            onChange={(e) => { setDstFormat(e.target.value as FormatKey); setOutput(''); }}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
          >
            {formatOptions}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm gap-4">
          <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-zinc-800 dark:text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Upload {srcFormat} File
            <input type="file" accept={`.${FORMAT_EXT[srcFormat].toLowerCase()}`} onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (evt) => {
                setInput(evt.target?.result as string);
                setTimeout(() => handleConvert(), 100);
              };
              reader.readAsText(file);
            }} className="hidden" />
          </label>

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? 'Converting...' : `Convert to ${dstFormat}`}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                {srcFormat} Input
              </h3>
              <button
                onClick={() => { setInput(''); setOutput(''); }}
                className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste ${srcFormat} here...`}
              className="flex-1 w-full p-4 bg-transparent outline-none resize-none font-mono text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-[var(--text-muted)] dark:placeholder:text-zinc-600"
              spellCheck="false"
            />
          </div>

          <div className="flex flex-col bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                {dstFormat} Output
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={copyOutput}
                  disabled={!output}
                  className="text-xs bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  disabled={!output}
                  className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Save .{FORMAT_EXT[dstFormat]}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {output ? (
                <pre className="text-emerald-600 dark:text-emerald-400 m-0 font-mono text-sm whitespace-pre-wrap">
                  {output}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] space-y-2 opacity-50">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span>{dstFormat} output will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="pt-6 border-t border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-secondary)] mb-3 font-medium">Also popular:</p>
            <div className="flex flex-wrap gap-2">
              {related.map(p => (
                <Link
                  key={p.slug}
                  href={`/converter/${p.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-700 dark:hover:text-blue-400 transition-all"
                >
                  {p.input} → {p.output}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
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

export const SLUG_MAP: Record<string, [string, string]> = {
  'json-to-csv': ['JSON', 'CSV'],
  'csv-to-json': ['CSV', 'JSON'],
  'json-to-xml': ['JSON', 'XML'],
  'xml-to-json': ['XML', 'JSON'],
  'csv-to-xml': ['CSV', 'XML'],
  'xml-to-csv': ['XML', 'CSV'],
};

export function DataConverterFromSlug({ slug }: { slug: string }) {
  const pair = SLUG_MAP[slug];
  if (!pair) return <DataConverter />;
  return <DataConverter defaultFrom={pair[0]} defaultTo={pair[1]} />;
}