"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';


type FormatDef = {
  key: string;
  label: string;
  ext: string;
  mime: string;
  accept: string;
};

const FORMATS: Record<string, FormatDef> = {
  json: { key: 'json', label: 'JSON', ext: 'json', mime: 'application/json', accept: '.json' },
  csv: { key: 'csv', label: 'CSV', ext: 'csv', mime: 'text/csv;charset=utf-8;', accept: '.csv' },
  xml: { key: 'xml', label: 'XML', ext: 'xml', mime: 'text/xml', accept: '.xml' },
};

type FormatPair = {
  slug: string;
  input: string;
  output: string;
  label: string;
};

const FORMAT_PAIRS: FormatPair[] = [
  { slug: 'json-to-csv', input: 'json', output: 'csv', label: 'JSON \u2192 CSV' },
  { slug: 'csv-to-json', input: 'csv', output: 'json', label: 'CSV \u2192 JSON' },
  { slug: 'json-to-xml', input: 'json', output: 'xml', label: 'JSON \u2192 XML' },
  { slug: 'xml-to-json', input: 'xml', output: 'json', label: 'XML \u2192 JSON' },
  { slug: 'xml-to-csv', input: 'xml', output: 'csv', label: 'XML \u2192 CSV' },
  { slug: 'csv-to-xml', input: 'csv', output: 'xml', label: 'CSV \u2192 XML' },
];

const RELATED: Record<string, string[]> = {
  'json-to-csv': ['csv-to-json', 'json-to-xml', 'xml-to-csv'],
  'csv-to-json': ['json-to-csv', 'csv-to-xml', 'xml-to-csv'],
  'json-to-xml': ['xml-to-json', 'json-to-csv', 'xml-to-csv'],
  'xml-to-json': ['json-to-xml', 'xml-to-csv', 'csv-to-json'],
  'xml-to-csv': ['csv-to-xml', 'xml-to-json', 'json-to-csv'],
  'csv-to-xml': ['xml-to-csv', 'csv-to-json', 'json-to-xml'],
};

const FORMAT_KEYS = Object.keys(FORMATS);

function resolveSlug(input: string, output: string): string {
  return `${input}-to-${output}`;
}

type DataFormatConverterProps = {
  slug: string;
  description?: string;
};

export default function DataFormatConverter({ slug, description }: DataFormatConverterProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const initialPair = useMemo(() => FORMAT_PAIRS.find(p => p.slug === slug) || FORMAT_PAIRS[0], [slug]);

  const [inputKey, setInputKey] = useState<string>(initialPair.input);
  const [outputKey, setOutputKey] = useState<string>(initialPair.output);

  const activeSlug = resolveSlug(inputKey, outputKey);
  const inputFmt = FORMATS[inputKey];
  const outputFmt = FORMATS[outputKey];

  const handleConvert = useCallback(async () => {
    if (!input.trim()) { setOutput(''); return; }
    setIsProcessing(true);
    try {
      let result = '';
      switch (activeSlug) {
        case 'json-to-csv': {
          const { default: Papa } = await import('papaparse');
          const parsed = JSON.parse(input);
          result = Papa.unparse(Array.isArray(parsed) ? parsed : [parsed]);
          break;
        }
        case 'csv-to-json': {
          const { default: Papa } = await import('papaparse');
          Papa.parse(input, {
            header: true, skipEmptyLines: true,
            complete: (r: any) => { result = JSON.stringify(r.data, null, 2); },
            error: () => { throw new Error('Failed to parse CSV'); }
          });
          break;
        }
        case 'json-to-xml': {
          const { Builder } = await import('xml2js');
          const builder = new Builder();
          result = builder.buildObject(JSON.parse(input));
          break;
        }
        case 'xml-to-json': {
          const { parseStringPromise } = await import('xml2js');
          const parsed = await parseStringPromise(input, { explicitArray: false, mergeAttrs: true });
          result = JSON.stringify(parsed, null, 2);
          break;
        }
        case 'xml-to-csv': {
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
          break;
        }
        case 'csv-to-xml': {
          const { default: Papa } = await import('papaparse');
          const { Builder } = await import('xml2js');
          const parsed = await new Promise<any>((resolve, reject) => {
            Papa.parse(input, { header: true, skipEmptyLines: true, complete: (r: any) => resolve(r.data), error: reject });
          });
          const builder = new Builder();
          result = builder.buildObject({ root: { item: parsed } });
          break;
        }
      }
      setOutput(result);
      toast.success('Converted successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Conversion failed. Check your input.');
    } finally {
      setIsProcessing(false);
    }
  }, [activeSlug, input]);

  const swapFormats = () => {
    setInputKey(outputKey);
    setOutputKey(inputKey);
    setOutput('');
  };

  const handleFormatChange = (role: "input" | "output", value: string) => {
    if (role === "input") {
      setInputKey(value);
    } else {
      setOutputKey(value);
    }
    setOutput('');
  };

  const related = useMemo(() => {
    const r = RELATED[activeSlug] || [];
    return r.map(s => FORMAT_PAIRS.find(p => p.slug === s)).filter(Boolean) as FormatPair[];
  }, [activeSlug]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied to clipboard!');
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const ext = outputFmt.ext;
    const blob = new Blob([output], { type: outputFmt.mime });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `converted.${ext}`);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [output, outputFmt]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <select
          value={inputKey}
          onChange={(e) => handleFormatChange("input", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer"
        >
          {FORMAT_KEYS.map(k => (
            <option key={k} value={k}>{FORMATS[k].label}</option>
          ))}
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
          value={outputKey}
          onChange={(e) => handleFormatChange("output", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer"
        >
          {FORMAT_KEYS.map(k => (
            <option key={k} value={k}>{FORMATS[k].label}</option>
          ))}
        </select>
      </div>

      {description && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-500 text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-zinc-800 dark:text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Upload {inputFmt.label} File
            <input type="file" accept={inputFmt.accept} onChange={(e) => {
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
        </div>

        <button
          onClick={handleConvert}
          disabled={isProcessing}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow transition-all active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? 'Converting...' : `Convert to ${outputFmt.label}`}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
              {inputFmt.label} Input
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
            placeholder={`Paste ${inputFmt.label} here...`}
            className="flex-1 w-full p-4 bg-transparent outline-none resize-none font-mono text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-[var(--text-muted)] dark:placeholder:text-zinc-600"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
              {outputFmt.label} Output
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
                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                Save .{outputFmt.ext}
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
                <span>{outputFmt.label} output will appear here</span>
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
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
