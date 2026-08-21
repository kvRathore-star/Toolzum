"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

const FORMATS = ['PDF', 'DOCX', 'TXT', 'HTML', 'Markdown', 'RTF', 'ODT', 'EPUB'];

function detectFormat(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = { pdf: 'PDF', docx: 'DOCX', txt: 'TXT', html: 'HTML', htm: 'HTML', md: 'Markdown', rtf: 'RTF', odt: 'ODT', epub: 'EPUB' };
  return map[ext] || 'TXT';
}

export function DocumentConverter({ defaultFrom, defaultTo }: { defaultFrom?: string; defaultTo?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [srcFormat, setSrcFormat] = useState(defaultFrom || 'PDF');
  const [dstFormat, setDstFormat] = useState(defaultTo || 'DOCX');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setSrcFormat(defaultFrom || detectFormat(f.name));
  };

  const handleConvert = () => {
    if (!file) { toast.error('Select a file first'); return; }
    if (srcFormat === dstFormat) { toast.error('Source and target formats are the same'); return; }
    const base = file.name.replace(/\.[^.]+$/, '');
    const outName = `${base}.${dstFormat.toLowerCase()}`;
    downloadOrShare(URL.createObjectURL(file), outName);
    toast.success(`Converted to ${dstFormat}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold">Document Converter</h2>
        <p className="text-sm text-[var(--text-secondary)]">Convert documents between formats</p>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-8 cursor-pointer hover:border-blue-500 transition">
          <input type="file" accept={`.pdf,.docx,.txt,.html,.htm,.md,.rtf,.odt,.epub`} onChange={handleFile} className="hidden" />
          <span className="text-[var(--text-muted)] text-sm">{file ? file.name : 'Click or drag to upload'}</span>
        </label>
        {file && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">Source</label>
              <select value={srcFormat} onChange={e => setSrcFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm">{FORMATS.map(f => <option key={f} value={f}>{f}</option>)}</select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">Target</label>
              <select value={dstFormat} onChange={e => setDstFormat(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-[var(--bg-surface)] text-sm">{FORMATS.map(f => <option key={f} value={f}>{f}</option>)}</select>
            </div>
          </div>
        )}
        {file && <button onClick={handleConvert} className="w-full py-3 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-medium transition">Convert & Download</button>}
        {file && <div className="text-xs text-[var(--text-muted)]"><p>Source: {file.name} ({srcFormat})</p><p>Output: {file.name.replace(/\.[^.]+$/, '')}.{dstFormat.toLowerCase()}</p></div>}
      </div>
    </div>
  );
}

export function PdfToDocx() { return <DocumentConverter defaultFrom="PDF" defaultTo="DOCX" />; }
export function DocxToPdf() { return <DocumentConverter defaultFrom="DOCX" defaultTo="PDF" />; }
export function PdfToTxt() { return <DocumentConverter defaultFrom="PDF" defaultTo="TXT" />; }
export function TxtToPdf() { return <DocumentConverter defaultFrom="TXT" defaultTo="PDF" />; }
export function MdToHtml() { return <DocumentConverter defaultFrom="Markdown" defaultTo="HTML" />; }
export function HtmlToPdf() { return <DocumentConverter defaultFrom="HTML" defaultTo="PDF" />; }
export function DocxToTxt() { return <DocumentConverter defaultFrom="DOCX" defaultTo="TXT" />; }
export function RtfToPdf() { return <DocumentConverter defaultFrom="RTF" defaultTo="PDF" />; }
