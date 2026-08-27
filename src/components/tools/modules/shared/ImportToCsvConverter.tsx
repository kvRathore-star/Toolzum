"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';

type ConvertMode = {
  slug: string;
  name: string;
  description: string;
  inputLabel: string;
  outputLabel: string;
  convert: (input: string) => string;
  reverse?: {
    name: string;
    description: string;
    inputLabel: string;
    outputLabel: string;
    convert: (input: string) => string;
  };
};

export const MODES: Record<string, ConvertMode> = {
  "import-to-csv": {
    slug: "import-to-csv", name: "Import to CSV",
    description: "Convert TSV, Excel XLSX, vCard VCF, and iCalendar ICS files to CSV format.",
    inputLabel: "TSV Input",
    outputLabel: "CSV Output",
    convert: (i) => i.replace(/\t/g, ','),
  },
  "tsv-csv-converter": {
    slug: "tsv-csv-converter", name: "TSV → CSV",
    description: "Convert tab-separated values to comma-separated values",
    inputLabel: "TSV Input",
    outputLabel: "CSV Output",
    convert: (i) => i.replace(/\t/g, ','),
    reverse: {
      name: "CSV → TSV",
      description: "Convert comma-separated values to tab-separated values",
      inputLabel: "CSV Input",
      outputLabel: "TSV Output",
      convert: (i) => i.replace(/,/g, '\t'),
    },
  },
  "xlsx-csv-converter": {
    slug: "xlsx-csv-converter", name: "XLSX → CSV",
    description: "Paste XLSX/Excel data as tab-separated text to convert to CSV",
    inputLabel: "Excel Data (tab-separated)",
    outputLabel: "CSV Output",
    convert: (i) => i.replace(/\t/g, ','),
  },
  "vcf-csv-converter": {
    slug: "vcf-csv-converter", name: "VCF → CSV",
    description: "Extract contact fields from vCard files into CSV rows",
    inputLabel: "VCF Input",
    outputLabel: "CSV Output",
    convert: (i) => {
      const records = i.split(/^BEGIN:VCARD$/m).filter(Boolean);
      const rows: Record<string, string>[] = [];
      const headers = new Set<string>();
      records.forEach(block => {
        const row: Record<string, string> = {};
        block.split('\n').forEach(line => {
          const [k, ...v] = line.split(':');
          if (k && v.length) {
            const key = k.split(';')[0].trim();
            row[key] = v.join(':').trim();
            headers.add(key);
          }
        });
        rows.push(row);
      });
      const h = Array.from(headers);
      return [h.join(','), ...rows.map(r => h.map(k => r[k] || '').join(','))].join('\n');
    },
  },
  "ics-csv-converter": {
    slug: "ics-csv-converter", name: "ICS → CSV",
    description: "Extract event fields from iCalendar files into CSV rows",
    inputLabel: "ICS Input",
    outputLabel: "CSV Output",
    convert: (i) => {
      const events = i.split(/^BEGIN:VEVENT$/m).filter(Boolean);
      const rows: string[][] = [];
      events.forEach(block => {
        const row: Record<string, string> = {};
        block.split('\n').forEach(line => {
          const [k, ...v] = line.split(':');
          if (k && v.length) {
            row[k.trim()] = v.join(':').trim();
          }
        });
        if (row.SUMMARY) rows.push([row.SUMMARY, row.DTSTART || '', row.DTEND || '', row.LOCATION || '']);
      });
      return ['SUMMARY,DTSTART,DTEND,LOCATION', ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    },
  },
  };

export default function ImportToCsvConverter({ slug }: { slug: string }) {
  const mode = MODES[slug];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isReverse, setIsReverse] = useState(false);

  const modeList = useMemo(() => Object.values(MODES), []);

  if (!mode) return <div className="text-red-500">Unknown mode: {slug}</div>;

  const active = isReverse && mode.reverse ? mode.reverse : mode;

  const handleConvert = () => {
    try {
      setOutput(active.convert(input));
    } catch (e: unknown) {
      setOutput(`Error: ${getErrorMessage(e)}`);
    }
  };

  const switchMode = (s: string) => {
    setIsReverse(false);
    setInput('');
    setOutput('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 justify-center">
        {modeList.map(m => (
          <Link
            key={m.slug}
            href={`/converter/${m.slug}`}
            onClick={() => switchMode(m.slug)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              m.slug === slug
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
            }`}
          >
            {m.name}
          </Link>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        {mode.reverse && (
          <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)] w-fit">
            {[mode, mode.reverse].map(opt => (
              <button
                key={opt.name}
                onClick={() => { setIsReverse(opt === mode.reverse); setInput(''); setOutput(''); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  (opt === mode.reverse) === isReverse ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        )}
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{active.name}</h2>
        <p className="text-xs text-[var(--text-secondary)]">{active.description}</p>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)} placeholder={`Paste ${active.inputLabel} here...`}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y min-h-[80px]" />
        <button onClick={handleConvert}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.98]">
          Convert to {active.outputLabel.split(' ')[0]}
        </button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">{active.outputLabel}</span>
              <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
