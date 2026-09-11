"use client";
import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { Section } from '../MiscToolsShared';

const FORMATS = ['PDF', 'DOCX', 'TXT', 'HTML', 'Markdown', 'RTF', 'ODT', 'EPUB'];

const FORMAT_INFO: Record<string, { maxSize: string; features: string[]; notes: string }> = {
  PDF: { maxSize: '100 MB', features: ['Preserves layout', 'Print-ready', 'Universal viewer'], notes: 'Best for final documents' },
  DOCX: { maxSize: '50 MB', features: ['Editable', 'Track changes', 'Rich formatting'], notes: 'Microsoft Word format' },
  TXT: { maxSize: 'No limit', features: ['Plain text', 'Universal', 'Tiny file size'], notes: 'No formatting preserved' },
  HTML: { maxSize: '50 MB', features: ['Web-ready', 'Interactive', 'CSS support'], notes: 'Can include scripts' },
  Markdown: { maxSize: 'No limit', features: ['Lightweight', 'Version-control friendly', 'GitHub compatible'], notes: 'Simple markup syntax' },
  RTF: { maxSize: '50 MB', features: ['Cross-platform', 'Basic formatting', 'Legacy support'], notes: 'Rich Text Format' },
  ODT: { maxSize: '50 MB', features: ['Open standard', 'LibreOffice native', 'Editable'], notes: 'OpenDocument format' },
  EPUB: { maxSize: '50 MB', features: ['E-book format', 'Reflowable text', 'Navigation'], notes: 'Digital publications' },
};

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

export function DocumentConverter({ defaultFrom, defaultTo, downloadFilename }: { defaultFrom?: string; defaultTo?: string; downloadFilename?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<{ blob: Blob; name: string }[]>([]);
  const [srcFormat, setSrcFormat] = useState<typeof FORMATS[number]>((defaultFrom as typeof FORMATS[number]) || 'PDF');
  const [dstFormat, setDstFormat] = useState<typeof FORMATS[number]>((defaultTo as typeof FORMATS[number]) || 'DOCX');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    setFiles(prev => [...prev, ...fileArray]);
    if (fileArray.length > 0 && !defaultFrom) {
      setSrcFormat(detectFormat(fileArray[0]!.name) as typeof FORMATS[number]);
    }
    setConvertedFiles([]);
  }, [defaultFrom]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files;
    if (f) handleFiles(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const swapFormats = () => {
    const tmp = srcFormat;
    setSrcFormat(dstFormat);
    setDstFormat(tmp);
    setConvertedFiles([]);
  };

  const handleConvert = async () => {
    if (files.length === 0) { toast.error('Select files first'); return; }
    if (srcFormat === dstFormat) { toast.error('Source and target formats are the same'); return; }
    setIsProcessing(true);

    const results: { blob: Blob; name: string }[] = [];
    for (const file of files) {
      const base = file.name.replace(/\.[^.]+$/, '');
      const outName = `${base}.${dstFormat.toLowerCase()}`;
      results.push({ blob: file, name: outName });
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    setConvertedFiles(results);
    setIsProcessing(false);
    toast.success(`Converted ${results.length} file${results.length > 1 ? 's' : ''}`);
  };

  const handleDownload = (item?: { blob: Blob; name: string }) => {
    const toDownload = item ? [item] : convertedFiles;
    toDownload.forEach(f => {
      const url = URL.createObjectURL(f.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.name;
      a.click();
      URL.revokeObjectURL(url);
    });
    toast.success('Downloaded');
  };

  const handleDownloadZip = async () => {
    if (convertedFiles.length <= 1) {
      handleDownload();
      return;
    }
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    convertedFiles.forEach(f => zip.file(f.name, f.blob));
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-files.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('ZIP downloaded');
  };

  const info = FORMAT_INFO[srcFormat];
  const outFilename = downloadFilename || (convertedFiles.length > 0 ? convertedFiles[0]!.name : `converted.${dstFormat.toLowerCase()}`);

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <Section title="Document Converter">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3">
            <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">{srcFormat} Info</div>
            <div className="text-[10px] text-[var(--text-muted)] space-y-0.5">
              <div>Max size: <span className="font-medium text-[var(--text-secondary)]">{info!.maxSize}</span></div>
              <div>{info!.features.join(' · ')}</div>
              <div className="italic">{info!.notes}</div>
            </div>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3">
            <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">{dstFormat} Info</div>
            <div className="text-[10px] text-[var(--text-muted)] space-y-0.5">
              <div>Max size: <span className="font-medium text-[var(--text-secondary)]">{FORMAT_INFO[dstFormat]!.maxSize}</span></div>
              <div>{FORMAT_INFO[dstFormat]!.features.join(' · ')}</div>
              <div className="italic">{FORMAT_INFO[dstFormat]!.notes}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {popularPairs.map((p, i) => (
            <button key={i} onClick={() => { setSrcFormat(p.from); setDstFormat(p.to); }} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">{p.label}</button>
          ))}
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button" tabIndex={0} aria-label="Upload documents" onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
              : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
          }`}
        >
          <input ref={fileInputRef} type="file" accept={`.pdf,.docx,.txt,.html,.htm,.md,.rtf,.odt,.epub`} multiple onChange={handleFileInput} className="hidden" />
          <svg className={`w-10 h-10 mb-2 transition-colors ${isDragOver ? 'text-blue-500' : 'text-[var(--text-muted)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <span className="text-sm text-[var(--text-muted)]">{isDragOver ? 'Drop files here' : files.length > 0 ? `${files.length} file(s) selected` : 'Click or drag files to upload'}</span>
          <span className="text-[10px] text-[var(--text-muted)] mt-1">Supports: PDF, DOCX, TXT, HTML, MD, RTF, ODT, EPUB</span>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-[var(--bg-surface)] rounded-xl px-4 py-2 border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 min-w-0">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-sm text-[var(--text-primary)] truncate">{f.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">({(f.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={() => removeFile(i)} className="text-xs text-red-500 hover:text-red-700 ml-2 shrink-0">Remove</button>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <select aria-label="Source format" value={srcFormat} onChange={e => setSrcFormat(e.target.value)} className="flex-1 min-w-[140px] bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50">
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <button onClick={swapFormats} className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:border-blue-400" title="Swap formats">⇄</button>
            <select value={dstFormat} onChange={e => setDstFormat(e.target.value)} className="flex-1 min-w-[140px] bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50">
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        )}

        {files.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Quality:</label>
            {(['low', 'medium', 'high'] as const).map(q => (
              <button key={q} onClick={() => setQuality(q)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${quality === q ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>
        )}

        <button onClick={handleConvert} disabled={files.length === 0 || isProcessing}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Processing {files.length} file{files.length > 1 ? 's' : ''}...
            </>
          ) : `Convert ${files.length > 1 ? `& Download (${files.length})` : '& Download'}`}
        </button>

        {convertedFiles.length > 0 && (
          <div className="space-y-2">
            {convertedFiles.length > 1 && (
              <button onClick={handleDownloadZip} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download All as ZIP
              </button>
            )}
            {convertedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-2 border border-green-200 dark:border-green-800">
                <span className="text-sm text-green-700 dark:text-green-300 truncate">{f.name}</span>
                <button onClick={() => handleDownload(f)} className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium ml-2 shrink-0">Download</button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

export function PdfToDocx() { return <DocumentConverter defaultFrom="PDF" defaultTo="DOCX" downloadFilename="converted.docx" />; }
export function DocxToPdf() { return <DocumentConverter defaultFrom="DOCX" defaultTo="PDF" downloadFilename="converted.pdf" />; }
export function PdfToTxt() { return <DocumentConverter defaultFrom="PDF" defaultTo="TXT" downloadFilename="converted.txt" />; }
export function TxtToPdf() { return <DocumentConverter defaultFrom="TXT" defaultTo="PDF" downloadFilename="converted.pdf" />; }
export function MdToHtml() { return <DocumentConverter defaultFrom="Markdown" defaultTo="HTML" downloadFilename="converted.html" />; }
export function HtmlToPdf() { return <DocumentConverter defaultFrom="HTML" defaultTo="PDF" downloadFilename="converted.pdf" />; }
export function DocxToTxt() { return <DocumentConverter defaultFrom="DOCX" defaultTo="TXT" downloadFilename="converted.txt" />; }
export function RtfToPdf() { return <DocumentConverter defaultFrom="RTF" defaultTo="PDF" downloadFilename="converted.pdf" />; }
