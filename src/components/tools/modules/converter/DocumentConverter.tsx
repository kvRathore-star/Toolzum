"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { CalculatorShell } from '../shared/CalculatorShell';

const FORMATS = ['PDF', 'DOCX', 'TXT', 'HTML', 'Markdown', 'RTF', 'ODT', 'EPUB'];

function detectFormat(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = { pdf: 'PDF', docx: 'DOCX', txt: 'TXT', html: 'HTML', htm: 'HTML', md: 'Markdown', rtf: 'RTF', odt: 'ODT', epub: 'EPUB' };
  return map[ext] || 'TXT';
}

const popularPairs = [
  { from: 'PDF', to: 'DOCX', label: 'PDF → Word' },
  { from: 'DOCX', to: 'PDF', label: 'Word → PDF' },
  { from: 'PDF', to: 'TXT', label: 'PDF → Text' },
  { from: 'MD', to: 'HTML', label: 'Markdown → HTML' },
  { from: 'HTML', to: 'PDF', label: 'HTML → PDF' },
  { from: 'DOCX', to: 'TXT', label: 'Word → Text' },
  { from: 'RTF', to: 'PDF', label: 'RTF → PDF' },
  { from: 'ODT', to: 'PDF', label: 'ODT → PDF' },
];

export function DocumentConverter({ defaultFrom, defaultTo }: { defaultFrom?: string; defaultTo?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [srcFormat, setSrcFormat] = useState<typeof FORMATS[number]>((defaultFrom as typeof FORMATS[number]) || 'PDF');
  const [dstFormat, setDstFormat] = useState<typeof FORMATS[number]>((defaultTo as typeof FORMATS[number]) || 'DOCX');
  const [converted, setConverted] = useState<{ blob: Blob; name: string } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setSrcFormat(defaultFrom || detectFormat(f.name));
    setConverted(null);
  };

  const swapFormats = () => {
    const tmp = srcFormat;
    setSrcFormat(dstFormat);
    setDstFormat(tmp);
    setConverted(null);
  };

  const handleConvert = async () => {
    if (!file) { toast.error('Select a file first'); return; }
    if (srcFormat === dstFormat) { toast.error('Source and target formats are the same'); return; }
    const base = file.name.replace(/\.[^.]+$/, '');
    const outName = `${base}.${dstFormat.toLowerCase()}`;
    
    // For real conversion, you'd use a server-side API or WASM library
    // For now, we just rename and download (same as before)
    downloadOrShare(URL.createObjectURL(file), outName);
    toast.success(`Downloaded as ${dstFormat}`);
    setConverted({ blob: file, name: outName });
  };

  const handleDownload = () => {
    if (converted) {
      const url = URL.createObjectURL(converted.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = converted.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded');
    }
  };

  const resultText = file ? `Ready: ${file.name} (${srcFormat} → ${dstFormat})` : 'Upload a document to convert';

  return (
    <CalculatorShell
      title="Document Converter"
      result={resultText}
      onCalculate={handleConvert}
      presets={popularPairs.map(p => ({ label: p.label, apply: () => { setSrcFormat(p.from as any); setDstFormat(p.to as any); } }))}
      accent="blue"
      downloadData={converted ? converted.blob : undefined}
      downloadFilename={converted?.name}
    >
      <div className="space-y-4">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-8 cursor-pointer hover:border-blue-500 transition">
          <input type="file" accept={`.pdf,.docx,.txt,.html,.htm,.md,.rtf,.odt,.epub`} onChange={handleFile} className="hidden" />
          <span className="text-[var(--text-muted)] text-sm">{file ? file.name : 'Click or drag to upload'}</span>
        </label>

        {file && (
          <div className="flex flex-wrap gap-2 items-center">
            <select value={srcFormat} onChange={e => setSrcFormat(e.target.value)} className="flex-1 min-w-[140px] bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <button onClick={swapFormats} className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Swap formats">⇄</button>
            <select value={dstFormat} onChange={e => setDstFormat(e.target.value)} className="flex-1 min-w-[140px] bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        )}

        <button onClick={handleConvert} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition">Convert & Download</button>

        {file && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 text-xs text-[var(--text-muted)]">
            <p>Source: {file.name} ({srcFormat})</p>
            <p>Output: {file.name.replace(/\.[^.]+$/, '')}.{dstFormat.toLowerCase()}</p>
            <p className="mt-1 text-amber-600 dark:text-amber-400">Note: This renames the file extension. For true format conversion, use a dedicated service.</p>
          </div>
        )}

        {converted && (
          <button onClick={handleDownload} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition">Download Converted File</button>
        )}
      </div>
    </CalculatorShell>
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
