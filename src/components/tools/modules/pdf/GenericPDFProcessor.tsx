"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, Rotation, degrees } from 'pdf-lib';
import { Download, FileText, RefreshCw, Sparkles, Settings, RotateCw, FileDown, Hash, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/utils/error';
import { createDownloadBlob } from '@/utils/blob';

type Operation = 'compress' | 'rotate' | 'remove-metadata';

export default function GenericPDFProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [operation, setOperation] = useState<Operation>('compress');
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(90);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOutputUrl(null);
    setProgress(0);
  };

  const processPdf = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setStatusText("Loading PDF...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      if (operation === 'remove-metadata') {
        setStatusText("Removing metadata...");
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        setProgress(50);
      }

      if (operation === 'rotate') {
        setStatusText(`Rotating ${pages.length} pages...`);
        for (let i = 0; i < pages.length; i++) {
          const currentAngle = pdfDoc.getPage(i).getRotation().angle;
          pages[i].setRotation(degrees((currentAngle + rotation) % 360));
          setProgress(Math.round(((i + 1) / pages.length) * 80));
        }
        setProgress(85);
      }

      if (operation === 'compress') {
        setStatusText("Stripping metadata and optimizing...");
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        setProgress(50);
      }

      setStatusText("Saving processed PDF...");
      const pdfBytes = await pdfDoc.save({ useObjectStreams: operation === 'compress' });

      const blob = createDownloadBlob(pdfBytes, 'application/pdf');
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));

      const savings = operation === 'compress' ? ` (${((1 - pdfBytes.length / arrayBuffer.byteLength) * 100).toFixed(1)}% smaller)` : '';
      toast.success(`PDF processed successfully${savings}!`);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to process PDF. The file may be encrypted or corrupted.");
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const clearAll = () => {
    setFile(null);
    setOutputUrl(null);
    setProgress(0);
  };

  const getOperationLabel = (op: Operation) => {
    switch (op) {
      case 'compress': return 'Compress';
      case 'rotate': return 'Rotate';
      case 'remove-metadata': return 'Remove Metadata';
    }
  };

  const getOperationIcon = (op: Operation) => {
    switch (op) {
      case 'compress': return <FileDown className="w-4 h-4" />;
      case 'rotate': return <RotateCw className="w-4 h-4" />;
      case 'remove-metadata': return <Hash className="w-4 h-4" />;
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-[var(--accent)] text-sm flex items-center gap-2">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <span><strong>Multi-Tool PDF Processor:</strong> Compress, rotate pages, or strip metadata — all in your browser using a single upload.</span>
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF to process"
          subtitle="Compress, rotate, or clean metadata"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[var(--accent)]" />
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-[var(--text-primary)]">{file.name}</h3>
            <p className="text-[var(--text-secondary)] text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button
          onClick={clearAll}
          disabled={isProcessing}
          className="text-xs text-[var(--text-secondary)] dark:text-zinc-300 px-3 py-2 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-4">
            <h4 className="text-[var(--text-primary)] font-bold text-base flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
              <Settings className="w-5 h-5 text-[var(--accent)]" />
              Processing Options
            </h4>

            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Operation</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['compress', 'rotate', 'remove-metadata'] as Operation[]).map((op) => (
                  <button
                    key={op}
                    onClick={() => setOperation(op)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      operation === op
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {getOperationIcon(op)}
                      <span>{getOperationLabel(op)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {operation === 'rotate' && (
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Rotation Angle</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {([90, 180, 270] as const).map((angle) => (
                    <button
                      key={angle}
                      onClick={() => setRotation(angle)}
                      className={`py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        rotation === angle
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-indigo-300'
                      }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {operation === 'compress' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-400">
                <p className="font-semibold mb-1">How compression works</p>
                <p className="text-xs">Strips all metadata (title, author, subject, keywords) and re-encodes internal object streams. File size reduction varies depending on the original content.</p>
              </div>
            )}

            {operation === 'remove-metadata' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-400">
                <p className="font-semibold mb-1">What gets removed</p>
                <p className="text-xs">Title, Author, Subject, Keywords, Producer, and Creator fields will be cleared. Page content and structure remain unchanged.</p>
              </div>
            )}
          </div>

          <button
            onClick={processPdf}
            disabled={isProcessing || !!outputUrl}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{statusText} ({progress}%)</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                <span>{getOperationLabel(operation)} PDF</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col justify-center">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300 h-full flex flex-col justify-center">
              <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <Download className="w-16 h-16 mb-4" />
                <p className="font-bold text-center">{file.name.replace('.pdf', `_${operation}`)}.pdf</p>
                <p className="text-xs text-emerald-500/80 mt-1">PDF processed successfully.</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, `${file.name.replace('.pdf', `_${operation}`)}.pdf`)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                Download Processed PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center h-full min-h-[250px] text-[var(--text-muted)] text-center">
              <FileText className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">Processed PDF will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
