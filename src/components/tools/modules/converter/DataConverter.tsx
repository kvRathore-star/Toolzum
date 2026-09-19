"use client";
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';
import type { ParseResult } from 'papaparse';
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

const FORMAT_INFO: Record<FormatKey, { features: string[]; limitations: string[] }> = {
  JSON: { features: ['Nested objects/arrays', 'Strong schema support', 'Native JS objects'], limitations: ['No comments', 'No trailing commas'] },
  CSV: { features: ['Flat tabular data', 'Excel-compatible', 'Human-readable'], limitations: ['No nested structures', 'No type info'] },
  XML: { features: ['Self-describing', 'Schema validation (XSD)', 'Namespaces'], limitations: ['Verbose syntax', 'Complex parsing'] },
  YAML: { features: ['Human-readable', 'Supports comments', 'Complex nesting'], limitations: ['Indentation-sensitive', 'Can be ambiguous'] },
  TSV: { features: ['Tab-delimited', 'Fast parsing', 'Database-friendly'], limitations: ['No tabs in values', 'Flat structure only'] },
};

const SAMPLE_DATA: Record<string, Record<FormatKey, string>> = {
  'JsonToCsv': {
    JSON: '[{"name":"Alice","age":30,"city":"NYC"},{"name":"Bob","age":25,"city":"LA"}]',
    CSV: 'name,age,city\nAlice,30,NYC\nBob,25,LA',
    XML: '', YAML: '', TSV: '',
  },
  'CsvToJson': {
    CSV: 'name,age,city\nAlice,30,NYC\nBob,25,LA',
    JSON: '[{"name":"Alice","age":"30","city":"NYC"},{"name":"Bob","age":"25","city":"LA"}]',
    XML: '', YAML: '', TSV: '',
  },
  'JsonToXml': {
    JSON: '{"user":{"name":"Alice","age":30}}',
    XML: '',
    CSV: '', YAML: '', TSV: '',
  },
  'XmlToJson': {
    XML: '<user><name>Alice</name><age>30</age></user>',
    JSON: '',
    CSV: '', YAML: '', TSV: '',
  },
  'YamlToJson': {
    YAML: 'user:\n  name: Alice\n  age: 30',
    JSON: '',
    CSV: '', XML: '', TSV: '',
  },
  'JsonToYaml': {
    JSON: '{"user":{"name":"Alice","age":30}}',
    YAML: '',
    CSV: '', XML: '', TSV: '',
  },
  'CsvToTsv': {
    CSV: 'name,age,city\nAlice,30,NYC',
    TSV: 'name\tage\tcity\nAlice\t30\tNYC',
    JSON: '', XML: '', YAML: '',
  },
  'TsvToCsv': {
    TSV: 'name\tage\tcity\nAlice\t30\tNYC',
    CSV: 'name,age,city\nAlice,30,NYC',
    JSON: '', XML: '', YAML: '',
  },
};

const PAIRS = FORMATS.flatMap(f => FORMATS.filter(t => t !== f).map(t => ({ input: f, output: t, slug: `${f.toLowerCase()}-to-${t.toLowerCase()}` })));

function getRelated(slug: string) {
  return PAIRS.filter(p => p.slug !== slug).slice(0, 6);
}

export function DataConverter({ defaultFrom, defaultTo, presetOverrides, downloadFilename }: { defaultFrom?: string; defaultTo?: string; presetOverrides?: { label: string; apply: () => void }[]; downloadFilename?: string }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [srcFormat, setSrcFormat] = useState<FormatKey>((defaultFrom as FormatKey) || 'JSON');
  const [dstFormat, setDstFormat] = useState<FormatKey>((defaultTo as FormatKey) || 'CSV');
  const [validationError, setValidationError] = useState('');

  const activeSlug = `${srcFormat.toLowerCase()}-to-${dstFormat.toLowerCase()}`;
  const related = useMemo(() => getRelated(activeSlug), [activeSlug]);

  const swapFormats = () => {
    setSrcFormat(dstFormat);
    setDstFormat(srcFormat);
    setOutput('');
  };

  const validateInput = useCallback(() => {
    if (!input.trim()) { setValidationError(''); return true; }
    try {
      if (srcFormat === 'JSON') JSON.parse(input);
      if (srcFormat === 'XML' && !input.trim().startsWith('<')) throw new Error('XML must start with <');
      setValidationError('');
      return true;
    } catch (e: unknown) {
      setValidationError(getErrorMessage(e, `Invalid ${srcFormat} input`));
      return false;
    }
  }, [input, srcFormat]);

  const handleConvert = useCallback(async () => {
    if (!input.trim()) { setOutput(''); return; }
    if (!validateInput()) { toast.error('Validation failed'); return; }
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
          complete: (r: ParseResult<Record<string, unknown>>) => { result = JSON.stringify(r.data, null, 2); },
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
        const parsed = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
          Papa.parse(input, { header: true, skipEmptyLines: true, complete: (r: ParseResult<Record<string, unknown>>) => resolve(r.data), error: reject });
        });
        const builder = new Builder();
        result = builder.buildObject({ root: { item: parsed } });
      } else if (srcFormat === 'XML' && dstFormat === 'CSV') {
        const { parseStringPromise } = await import('xml2js');
        const { default: Papa } = await import('papaparse');
        const parsed = await parseStringPromise(input, { explicitArray: false, mergeAttrs: true });
        const findArray = (obj: unknown): Record<string, unknown>[] | null => {
          if (Array.isArray(obj)) return obj;
          if (typeof obj === 'object' && obj !== null) {
            for (const key in (obj as Record<string, unknown>)) {
              const val = (obj as Record<string, unknown>)[key];
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
        const parsed: Record<string, unknown>[] = await new Promise((resolve, reject) => {
          Papa.parse(input, { header: true, skipEmptyLines: true, complete: (r: ParseResult<Record<string, unknown>>) => resolve(r.data), error: reject });
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
          complete: (r: ParseResult<Record<string, unknown>>) => { result = JSON.stringify(r.data, null, 2); },
          error: () => { throw new Error('Failed to parse TSV'); }
        });
      } else if (srcFormat === 'TSV' && dstFormat === 'XML') {
        const { default: Papa } = await import('papaparse');
        const { Builder } = await import('xml2js');
        const parsed = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
          Papa.parse(input, { header: true, skipEmptyLines: true, delimiter: '\t', complete: (r: ParseResult<Record<string, unknown>>) => resolve(r.data), error: reject });
        });
        const builder = new Builder();
        result = builder.buildObject({ root: { item: parsed } });
      } else if (srcFormat === 'XML' && dstFormat === 'TSV') {
        const { parseStringPromise } = await import('xml2js');
        const { default: Papa } = await import('papaparse');
        const parsed = await parseStringPromise(input, { explicitArray: false, mergeAttrs: true });
        const findArray = (obj: unknown): Record<string, unknown>[] | null => {
          if (Array.isArray(obj)) return obj;
          if (typeof obj === 'object' && obj !== null) {
            for (const key in (obj as Record<string, unknown>)) {
              const val = (obj as Record<string, unknown>)[key];
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
        const parsed: Record<string, unknown>[] = await new Promise((resolve, reject) => {
          Papa.parse(input, { header: true, skipEmptyLines: true, delimiter: '\t', complete: (r: ParseResult<Record<string, unknown>>) => resolve(r.data), error: reject });
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
        let parsed: unknown;
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
  }, [srcFormat, dstFormat, input, validateInput]);

const copyOutput = useCallback(() => {
    if (!output) return;
    clipboardWrite(output).then(ok => { if (ok) toast.success('Copied to clipboard!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
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

  const formatSpecificPresets = useMemo(() => {
    const slug = `${srcFormat.toLowerCase()}-${dstFormat.toLowerCase()}`;
    const sampleKey = Object.keys(SAMPLE_DATA).find(k => k.toLowerCase().replace(/([A-Z])/g, (m) => m.toLowerCase()) === slug);
    const sample = sampleKey ? SAMPLE_DATA[sampleKey] : null;
    const presets: { label: string; apply: () => void }[] = [];
    if (sample && sample[srcFormat]) {
      presets.push({ label: `Sample ${srcFormat}`, apply: () => setInput(sample[srcFormat]) });
    }
    return presets;
  }, [srcFormat, dstFormat]);

  const presets = [
    ...formatSpecificPresets,
    { label: 'JSON → CSV', apply: () => { setSrcFormat('JSON'); setDstFormat('CSV'); } },
    { label: 'CSV → JSON', apply: () => { setSrcFormat('CSV'); setDstFormat('JSON'); } },
    { label: 'JSON → XML', apply: () => { setSrcFormat('JSON'); setDstFormat('XML'); } },
    { label: 'XML → JSON', apply: () => { setSrcFormat('XML'); setDstFormat('JSON'); } },
    { label: 'CSV → TSV', apply: () => { setSrcFormat('CSV'); setDstFormat('TSV'); } },
    { label: 'JSON → YAML', apply: () => { setSrcFormat('JSON'); setDstFormat('YAML'); } },
    { label: 'Swap', apply: swapFormats },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); setValidationError(''); } },
  ];

  const resultText = output ? `Converted ${srcFormat} → ${dstFormat} (${output.length} chars)` : 'Enter data to convert';

  const formatOptions = FORMATS.map(k => <option key={k} value={k}>{k}</option>);

  const srcInfo = FORMAT_INFO[srcFormat];
  const dstInfo = FORMAT_INFO[dstFormat];

  return (
    <CalculatorShell category="Converter"
      title="Data Format Converter"
      result={resultText}
      onCalculate={handleConvert}
      presets={presets}
      accent="blue"
      downloadData={output}
      downloadFilename={downloadFilename || `converted.${FORMAT_EXT[dstFormat]}`}
    >
      <div className="space-y-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">{srcFormat}</span>
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">{dstFormat}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--text-muted)]">
            <div><span className="font-semibold text-[var(--text-secondary)]">Source:</span> {srcInfo.features.slice(0, 2).join(', ')}</div>
            <div><span className="font-semibold text-[var(--text-secondary)]">Target:</span> {dstInfo.features.slice(0, 2).join(', ')}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Source format"
            value={srcFormat}
            onChange={(e) => { setSrcFormat(e.target.value as FormatKey); setOutput(''); }}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer"
          >
            {formatOptions}
          </select>

          <button
            onClick={swapFormats}
            className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)] transition-all active:scale-95 group"
            aria-label="Swap formats"
          >
            <svg className="w-5 h-5 text-[var(--text-secondary)] dark:text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <select
            value={dstFormat}
            onChange={(e) => { setDstFormat(e.target.value as FormatKey); setOutput(''); }}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer"
          >
            {formatOptions}
          </select>
        </div>

        {validationError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            {validationError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm gap-4">
          <label className="cursor-pointer bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
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
            className="w-full sm:w-auto bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold px-6 py-2 rounded-lg shadow transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 justify-center"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Converting...
              </>
            ) : `Convert to ${dstFormat}`}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                {srcFormat} Input
              </h3>
              <button
                onClick={() => { setInput(''); setOutput(''); setValidationError(''); }}
                className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea aria-label={`${srcFormat} input`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste ${srcFormat} here...`}
              className="flex-1 w-full p-4 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] dark:placeholder:text-[var(--text-secondary)]"
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
                  className="text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  disabled={!output}
                  className="text-xs bg-[var(--accent-ink)] hover:opacity-90 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  .{FORMAT_EXT[dstFormat]}
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all"
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

const CONVERSION_PRESETS: Record<string, { sampleInput: string; description: string }> = {
  'json-to-csv': { sampleInput: '[{"name":"Alice","age":30,"city":"NYC"},{"name":"Bob","age":25,"city":"LA"}]', description: 'Convert JSON array to CSV spreadsheet' },
  'csv-to-json': { sampleInput: 'name,age,city\nAlice,30,NYC\nBob,25,LA', description: 'Parse CSV rows into JSON objects' },
  'json-to-xml': { sampleInput: '{"user":{"name":"Alice","age":30}}', description: 'Transform JSON to XML document' },
  'xml-to-json': { sampleInput: '<user><name>Alice</name><age>30</age></user>', description: 'Parse XML into JSON structure' },
  'yaml-to-json': { sampleInput: 'user:\n  name: Alice\n  age: 30', description: 'Convert YAML to JSON format' },
  'json-to-yaml': { sampleInput: '{"user":{"name":"Alice","age":30}}', description: 'Transform JSON to YAML format' },
  'csv-to-tsv': { sampleInput: 'name,age,city\nAlice,30,NYC', description: 'Convert CSV to tab-separated values' },
  'tsv-to-csv': { sampleInput: 'name\tage\tcity\nAlice\t30\tNYC', description: 'Convert TSV to comma-separated values' },
};

export function JsonToCsv() { const p = CONVERSION_PRESETS['json-to-csv']; return <DataConverter defaultFrom="JSON" defaultTo="CSV" presetOverrides={[{ label: 'Sample JSON Array', apply: () => {} }, { label: 'Clear', apply: () => {} }]} downloadFilename="json-to-csv.csv" />; }
export function CsvToJson() { return <DataConverter defaultFrom="CSV" defaultTo="JSON" presetOverrides={[{ label: 'Sample CSV', apply: () => {} }, { label: 'Headers Only', apply: () => {} }, { label: 'Clear', apply: () => {} }]} downloadFilename="csv-to-json.json" />; }
export function JsonToXml() { return <DataConverter defaultFrom="JSON" defaultTo="XML" presetOverrides={[{ label: 'Sample JSON', apply: () => {} }, { label: 'Nested Object', apply: () => {} }, { label: 'Clear', apply: () => {} }]} downloadFilename="json-to-xml.xml" />; }
export function XmlToJson() { return <DataConverter defaultFrom="XML" defaultTo="JSON" presetOverrides={[{ label: 'Simple XML', apply: () => {} }, { label: 'Nested XML', apply: () => {} }, { label: 'Clear', apply: () => {} }]} downloadFilename="xml-to-json.json" />; }
export function YamlToJson() { return <DataConverter defaultFrom="YAML" defaultTo="JSON" presetOverrides={[{ label: 'Sample YAML', apply: () => {} }, { label: 'Nested YAML', apply: () => {} }, { label: 'Clear', apply: () => {} }]} downloadFilename="yaml-to-json.json" />; }
export function JsonToYaml() { return <DataConverter defaultFrom="JSON" defaultTo="YAML" presetOverrides={[{ label: 'Sample JSON', apply: () => {} }, { label: 'Array', apply: () => {} }, { label: 'Clear', apply: () => {} }]} downloadFilename="json-to-yaml.yaml" />; }
export function CsvToTsv() { return <DataConverter defaultFrom="CSV" defaultTo="TSV" presetOverrides={[{ label: 'Sample CSV', apply: () => {} }, { label: 'Tab-separated', apply: () => {} }, { label: 'Clear', apply: () => {} }]} downloadFilename="csv-to-tsv.tsv" />; }
export function TsvToCsv() { return <DataConverter defaultFrom="TSV" defaultTo="CSV" presetOverrides={[{ label: 'Sample TSV', apply: () => {} }, { label: 'Comma-separated', apply: () => {} }, { label: 'Clear', apply: () => {} }]} downloadFilename="tsv-to-csv.csv" />; }

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
