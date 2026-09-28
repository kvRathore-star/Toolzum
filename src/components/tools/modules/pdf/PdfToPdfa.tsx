"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';
export default function PdfToPdfa() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [metadata, setMetadata] = useState({ title: '', author: '', subject: '', keywords: '' });
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const title = pdfDoc.getTitle() || selectedFile.name.replace(/\.pdf$/i, '');
      const author = pdfDoc.getAuthor() || '';
      const subject = pdfDoc.getSubject() || '';
      const keywords = pdfDoc.getKeywords() || '';
      setMetadata({ title, author, subject, keywords });
      setFileBytes(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
    } catch (e) {
      toast.error("Failed to load PDF.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBytes(null);
    setOutputUrl(null);
    setMetadata({ title: '', author: '', subject: '', keywords: '' });
  };

  const convertToPdfa = async () => {
    if (!fileBytes || !file) return;

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBytes);

      if (metadata.title) pdfDoc.setTitle(metadata.title);
      if (metadata.author) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject) pdfDoc.setSubject(metadata.subject);
      if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      pdfDoc.setProducer('Toolzum Archival Prep');
      pdfDoc.setCreator('Toolzum Archival Prep');

      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      // Archival hardening pdf-lib CAN do: strip executable/volatile content
      // (open actions, document JavaScript, embedded files) and normalize
      // the structure. Each step is guarded — absence just means clean.
      const removed: string[] = [];
      try {
        if (pdfDoc.catalog.has(PDFName.of('OpenAction'))) {
          pdfDoc.catalog.delete(PDFName.of('OpenAction'));
          removed.push('open action');
        }
      } catch { /* catalog unreadable — skip */ }
      try {
        const names = pdfDoc.catalog.lookup(PDFName.of('Names'));
        if (names instanceof PDFDict) {
          if (names.has(PDFName.of('JavaScript'))) { names.delete(PDFName.of('JavaScript')); removed.push('embedded JavaScript'); }
          if (names.has(PDFName.of('EmbeddedFiles'))) { names.delete(PDFName.of('EmbeddedFiles')); removed.push('embedded files'); }
        }
      } catch { /* no Names dict — skip */ }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(removed.length > 0 ? `Archival prep complete — removed: ${removed.join(', ')}.` : 'Archival prep complete — no scripts or attachments found, metadata normalized.');
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during archival prep.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Archival Prep (PDF/A-ready):</strong> Normalizes metadata, strips scripts and attachments, and flattens the structure for long-term preservation. Note: certified PDF/A conformance (embedded fonts, OutputIntent) requires desktop tools like Ghostscript — this prepares the file honestly toward that standard.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF for Archival Prep"
          subtitle="Drag & drop your document here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Document Metadata</h4>

          <div className="space-y-4">
            <div>
              <label htmlFor="lbl-pdftopdfa-title" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Title</label>
              <input id="lbl-pdftopdfa-title" aria-label="Title"
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
                placeholder="Document Title"
              />
            </div>
            <div>
              <label htmlFor="lbl-pdftopdfa-author" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Author</label>
              <input id="lbl-pdftopdfa-author" aria-label="Author"
                type="text"
                value={metadata.author}
                onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
                placeholder="Author Name"
              />
            </div>
            <div>
              <label htmlFor="lbl-pdftopdfa-subject" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Subject</label>
              <input id="lbl-pdftopdfa-subject" aria-label="Subject"
                type="text"
                value={metadata.subject}
                onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
                placeholder="Subject"
              />
            </div>
            <div>
              <label htmlFor="lbl-pdftopdfa-keywords" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Keywords</label>
              <input id="lbl-pdftopdfa-keywords" aria-label="Keywords"
                type="text"
                value={metadata.keywords}
                onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
                placeholder="keyword1, keyword2"
              />
            </div>
          </div>

          <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-3 rounded-xl text-[var(--accent)] text-xs">
            Archival prep normalizes metadata and removes scripts/attachments. Full font embedding for certified PDF/A needs a desktop converter.
          </div>

          <button
            onClick={convertToPdfa}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {isProcessing ? "Preparing..." : "Prepare for Archival"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Archival Prep Complete</h4>
              </div>

              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-bold text-center">archival_{file.name}</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, `archival_${file.name}`)}
                className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Archival PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p>Archival-ready document will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
