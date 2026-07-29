"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { FileUploader } from '../../FileUploader';
import { PDFDocument } from 'pdf-lib';

export default function PdfAttachments() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [attachDescription, setAttachDescription] = useState('');

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const buf = await selectedFile.arrayBuffer();
      await PDFDocument.load(buf);
      setFileBuffer(buf);
      setFile(selectedFile);
      setOutputUrl(null);
      toast.success('PDF loaded.');
    } catch {
      toast.error('Failed to load PDF.');
    }
  };

  const clearAll = () => {
    setFile(null); setFileBuffer(null); setOutputUrl(null); setAttachFile(null);
  };

  const addAttachment = async () => {
    if (!fileBuffer || !attachFile) {
      toast.error('Select a file to attach.');
      return;
    }
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const attachBytes = await attachFile.arrayBuffer();
      await pdfDoc.attach(attachBytes, attachFile.name, {
        mimeType: attachFile.type || 'application/octet-stream',
        description: attachDescription || `Attached: ${attachFile.name}`,
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setAttachFile(null);
      setAttachDescription('');
      toast.success(`"${attachFile.name}" attached to PDF.`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to add attachment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>PDF Attachments:</strong> Embed any file type as an attachment inside a PDF document. Add images, spreadsheets, archives, or supplementary files.
        </div>
        <FileUploader accept="application/pdf" onFileSelect={(_f) => handleFileSelect(_f)}
          title="Upload PDF" subtitle="Select document to attach files to" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">
          Change File
        </button>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">
          Add Attachment
        </h4>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">File to Attach</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer bg-[var(--bg-overlay)] hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
              <svg className="w-8 h-8 mb-2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-xs text-[var(--text-secondary)]">
                {attachFile ? `${attachFile.name} (${formatSize(attachFile.size)})` : 'Click to select file'}
              </span>
              <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setAttachFile(f); }} />
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Description (optional)</label>
            <input type="text" value={attachDescription} onChange={(e) => setAttachDescription(e.target.value)}
              placeholder="Attached file description"
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setAttachFile(null); setAttachDescription(''); }}
              className="flex-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium py-3 rounded-xl transition-all">
              Clear
            </button>
            <button onClick={addAttachment} disabled={isProcessing || !attachFile}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50">
              {isProcessing ? 'Attaching...' : 'Attach to PDF'}
            </button>
          </div>
        </div>
      </div>

      {outputUrl && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
            <h4 className="font-bold text-emerald-500">Attachment Added</h4>
          </div>
          <button onClick={() => downloadOrShare(outputUrl, `attached_${file.name}`)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
            Download PDF with Attachment
          </button>
        </div>
      )}
    </div>
  );
}
