"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type ConvertMode = {
  slug: string;
  name: string;
  description: string;
  inputLabel: string;
  convert: (input: string) => string;
};

const MODES: Record<string, ConvertMode> = {
  "tsv-csv-converter": {
    slug: "tsv-csv-converter", name: "TSV → CSV",
    description: "Convert tab-separated values to comma-separated values",
    inputLabel: "TSV Input",
    convert: (i) => i.replace(/\t/g, ','),
  },
  "xlsx-csv-converter": {
    slug: "xlsx-csv-converter", name: "XLSX → CSV",
    description: "Paste XLSX/Excel data as tab-separated text to convert to CSV",
    inputLabel: "Excel Data (tab-separated)",
    convert: (i) => i.replace(/\t/g, ','),
  },
  "vcf-csv-converter": {
    slug: "vcf-csv-converter", name: "VCF → CSV",
    description: "Extract contact fields from vCard files into CSV rows",
    inputLabel: "VCF Input",
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
  "parquet-to-csv-converter": {
    slug: "parquet-to-csv-converter", name: "Parquet → CSV Preview",
    description: "Paste Parquet schema/ data preview as text to convert to CSV",
    inputLabel: "Parquet Preview",
    convert: (i) => i.replace(/\t/g, ','),
  },
};

export default function ImportToCsvConverter({ slug }: { slug: string }) {
  const mode = MODES[slug];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  if (!mode) return <div className="text-red-500">Unknown mode: {slug}</div>;

  const handleConvert = () => {
    try {
      setOutput(mode.convert(input));
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{mode.name}</h2>
        <p className="text-xs text-[var(--text-secondary)]">{mode.description}</p>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)} placeholder={`Paste ${mode.inputLabel} here...`}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-y min-h-[80px]" />
        <button onClick={handleConvert}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.98]">
          Convert to CSV
        </button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">CSV Output</span>
              <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
