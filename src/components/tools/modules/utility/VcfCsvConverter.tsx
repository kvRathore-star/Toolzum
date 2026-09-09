"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import * as VP from 'vcard-parser';

type Direction = 'vcf-to-csv' | 'csv-to-vcf';

const VCF_FIELDS = [
  { key: 'fn', label: 'Full Name (FN)' },
  { key: 'tel', label: 'Phone (TEL)' },
  { key: 'email', label: 'Email (EMAIL)' },
  { key: 'adr', label: 'Address (ADR)' },
  { key: 'org', label: 'Organization (ORG)' },
  { key: 'title', label: 'Job Title (TITLE)' },
  { key: 'url', label: 'URL' },
  { key: 'note', label: 'Note (NOTE)' },
];

const CSV_HEADERS = ['Full Name', 'Phone', 'Email', 'Address', 'Organization', 'Title', 'URL', 'Note'];

function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    row.push(current.trim());
    if (row.some(c => c.length > 0)) rows.push(row);
  }
  return rows;
}

function generateCsv(rows: string[][], delimiter: string): string {
  return rows.map(row =>
    row.map(cell => {
      if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(delimiter)
  ).join('\n');
}

function generateVcf(contact: Record<string, string>, version: '3.0' | '4.0'): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:' + version);
  if (contact['Full Name']) lines.push('FN:' + contact['Full Name']);
  if (contact['Phone']) {
    const phones = contact['Phone'].split(';').filter(Boolean);
    phones.forEach(p => {
      if (version === '4.0') lines.push('TEL;TYPE=CELL:' + p.trim());
      else lines.push('TEL;TYPE=CELL:' + p.trim());
    });
  }
  if (contact['Email']) {
    const emails = contact['Email'].split(';').filter(Boolean);
    emails.forEach(e => lines.push('EMAIL:' + e.trim()));
  }
  if (contact['Address']) lines.push('ADR;TYPE=HOME:;;' + contact['Address']);
  if (contact['Organization']) lines.push('ORG:' + contact['Organization']);
  if (contact['Title']) lines.push('TITLE:' + contact['Title']);
  if (contact['URL']) lines.push('URL:' + contact['URL']);
  if (contact['Note']) lines.push('NOTE:' + contact['Note']);
  lines.push('END:VCARD');
  return lines.join('\n');
}

function flattenVcard(vcard: any, selectedFields: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  for (const field of selectedFields) {
    const vals = vcard[field];
    if (Array.isArray(vals)) {
      record[field] = vals.map((v: any) => {
        if (typeof v === 'object' && v !== null) return v.value ?? '';
        return String(v);
      }).join('; ');
    } else if (vals !== undefined && vals !== null) {
      record[field] = String(typeof vals === 'object' ? vals.value ?? vals : vals);
    } else {
      record[field] = '';
    }
  }
  return record;
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] || '';
  const comma = (firstLine.match(/,/g) || []).length;
  const semicolon = (firstLine.match(/;/g) || []).length;
  return semicolon > comma ? ';' : ',';
}

function autoMapColumns(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  const headerMap: Record<string, string> = {
    'full name': 'Full Name', 'name': 'Full Name', 'first name': 'Full Name',
    'phone': 'Phone', 'telephone': 'Phone', 'tel': 'Phone', 'mobile': 'Phone', 'cell': 'Phone',
    'email': 'Email', 'e-mail': 'Email', 'mail': 'Email',
    'address': 'Address', 'adr': 'Address', 'street': 'Address',
    'organization': 'Organization', 'org': 'Organization', 'company': 'Organization',
    'title': 'Title', 'job title': 'Title', 'position': 'Title',
    'url': 'URL', 'website': 'URL', 'web': 'URL',
    'note': 'Note', 'notes': 'Note', 'description': 'Note',
  };
  for (let i = 0; i < headers.length; i++) {
    const h = lowerHeaders[i]!;
    if (headerMap[h]) {
      map[headers[i]!] = headerMap[h];
    } else {
      map[headers[i]!] = headers[i]!;
    }
  }
  return map;
}

export default function VcfCsvConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [direction, setDirection] = useState<Direction>('vcf-to-csv');
  const [selectedFields, setSelectedFields] = useState<string[]>(VCF_FIELDS.map(f => f.key));
  const [csvDelimiter, setCsvDelimiter] = useState(',');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<'3.0' | '4.0'>('3.0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      setError(null);
      setOutputUrl(null);
      setPreview([]);
      setContacts([]);

      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (direction === 'vcf-to-csv' && ext !== 'vcf') {
        toast.error('Please select a .vcf file');
        return;
      }
      if (direction === 'csv-to-vcf' && ext !== 'csv') {
        toast.error('Please select a .csv file');
        return;
      }

      const text = await selectedFile.text();

      if (direction === 'vcf-to-csv') {
        const parsed = VP.parse(text);
        if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
          toast.error('No contacts found in the VCF file');
          return;
        }
        const flat = parsed.map(v => flattenVcard(v, selectedFields));
        setContacts(flat);
        setPreview(flat.slice(0, 10));
        setFile(selectedFile);
        toast.success(`Found ${flat.length} contact(s)`);
      } else {
        const delim = detectDelimiter(text);
        setCsvDelimiter(delim);
        const rows = parseCsv(text, delim);
        if (rows.length < 2) {
          toast.error('CSV must have a header row and at least one data row');
          return;
        }
        const headers = rows[0]!;
        setCsvHeaders(headers);
        const mapping = autoMapColumns(headers);
        setColumnMapping(mapping);
        const data = rows.slice(1).map(row => {
          const rec: Record<string, string> = {};
          headers.forEach((h, i) => { rec[h] = row[i] || ''; });
          return rec;
        });
        setContacts(data);
        setPreview(data.slice(0, 10));
        setFile(selectedFile);
        toast.success(`Found ${data.length} row(s)`);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to parse the file. It may be corrupted or in an unsupported format.');
      toast.error('Failed to parse the file');
    }
  };

  const toggleField = (key: string) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const convert = async () => {
    if (!file || contacts.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (direction === 'vcf-to-csv') {
        const displayFields = selectedFields.map(k => VCF_FIELDS.find(f => f.key === k)!.label.split(' (')[0]!);
        const rows = [displayFields, ...contacts.map(c => displayFields.map(f => c[selectedFields[displayFields.indexOf(f)]!] || ''))];
        const csv = generateCsv(rows, csvDelimiter);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        toast.success(`Converted ${contacts.length} contact(s) to CSV`);
      } else {
        const vcards = contacts.map(row => {
          const mapped: Record<string, string> = {};
          for (const [csvCol, vcfField] of Object.entries(columnMapping)) {
            mapped[vcfField] = row[csvCol] || '';
          }
          return generateVcf(mapped, outputFormat);
        });
        const vcfContent = vcards.join('\n');
        const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        toast.success(`Converted ${contacts.length} row(s) to VCF`);
      }
    } catch (e) {
      console.error(e);
      setError('Conversion failed. Please check your settings and try again.');
      toast.error('Conversion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>No server uploads — </strong>Convert contacts between vCard (VCF) and CSV formats. Import/export address books between any platform.
        </div>
        <div className="flex gap-3">
          <button onClick={() => setDirection('vcf-to-csv')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border ${direction === 'vcf-to-csv' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}>
            VCF → CSV
          </button>
          <button onClick={() => setDirection('csv-to-vcf')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border ${direction === 'csv-to-vcf' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}>
            CSV → VCF
          </button>
        </div>
        <FileUploader accept={direction === 'vcf-to-csv' ? '.vcf,text/vcard' : '.csv,text/csv'} onFileSelect={handleFileSelect} title={direction === 'vcf-to-csv' ? 'Upload VCF File' : 'Upload CSV File'} subtitle="Drag & drop your file here" />
      </div>
    );
  }

  const displayHeaders = direction === 'vcf-to-csv'
    ? selectedFields.map(k => VCF_FIELDS.find(f => f.key === k)!.label.split(' (')[0]!)
    : Object.values(columnMapping).length > 0 ? Object.values(columnMapping) : csvHeaders;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{contacts.length} contact(s) • {(file.size / 1024).toFixed(0)} KB • {direction === 'vcf-to-csv' ? 'VCF → CSV' : 'CSV → VCF'}</p>
        </div>
        <button onClick={() => { setFile(null); setOutputUrl(null); setContacts([]); setPreview([]); setError(null); }} className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
      </div>

      {direction === 'vcf-to-csv' && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h4 className="text-[var(--text-primary)] font-medium">Fields to Export</h4>
          <div className="flex flex-wrap gap-2">
            {VCF_FIELDS.map(f => (
              <button key={f.key} onClick={() => toggleField(f.key)} className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${selectedFields.includes(f.key) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Delimiter:</label>
            <button onClick={() => setCsvDelimiter(',')} className={`py-1 px-3 rounded-lg text-xs font-bold border ${csvDelimiter === ',' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>Comma (,)</button>
            <button onClick={() => setCsvDelimiter(';')} className={`py-1 px-3 rounded-lg text-xs font-bold border ${csvDelimiter === ';' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>Semicolon (;)</button>
          </div>
        </div>
      )}

      {direction === 'csv-to-vcf' && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h4 className="text-[var(--text-primary)] font-medium">Column Mapping</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {csvHeaders.map(h => (
              <div key={h} className="flex items-center gap-2">
                <span className="text-sm text-zinc-600 dark:text-[var(--text-muted)] min-w-[100px]">{h}:</span>
                <select aria-label="Delimiter:" value={columnMapping[h] || ''} onChange={e => setColumnMapping(prev => ({ ...prev, [h]: e.target.value }))} className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100">
                  <option value="">— Skip —</option>
                  {CSV_HEADERS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">VCF Version:</label>
            <button onClick={() => setOutputFormat('3.0')} className={`py-1 px-3 rounded-lg text-xs font-bold border ${outputFormat === '3.0' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>3.0</button>
            <button onClick={() => setOutputFormat('4.0')} className={`py-1 px-3 rounded-lg text-xs font-bold border ${outputFormat === '4.0' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>4.0</button>
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-3">
          <h4 className="text-[var(--text-primary)] font-medium">Preview ({preview.length} of {contacts.length})</h4>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {displayHeaders.map(h => <th key={h} className="text-left py-2 px-3 text-zinc-600 dark:text-[var(--text-muted)] font-medium whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]">
                    {displayHeaders.map(h => {
                      const val = direction === 'vcf-to-csv'
                        ? row[VCF_FIELDS.find(f => f.label.startsWith(h))?.key || '']
                        : row[csvHeaders.find(ch => columnMapping[ch] === h) || ''];
                      return <td key={h} className="py-2 px-3 text-[var(--text-primary)] truncate max-w-[200px]">{val || '-'}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}

      {outputUrl ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
            <h4 className="font-bold text-emerald-500">Conversion Ready</h4>
          </div>
          <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="font-bold text-center">{file.name.replace(/\.(vcf|csv)$/i, direction === 'vcf-to-csv' ? '.csv' : '.vcf')}</p>
          </div>
          <button onClick={() => downloadOrShare(outputUrl, file.name.replace(/\.(vcf|csv)$/i, direction === 'vcf-to-csv' ? '.csv' : '.vcf'))} className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download
          </button>
        </div>
      ) : (
        <button onClick={convert} disabled={isProcessing || contacts.length === 0} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          {isProcessing ? 'Converting...' : `Convert to ${direction === 'vcf-to-csv' ? 'CSV' : 'VCF'}`}
        </button>
      )}
    </div>
  );
}
