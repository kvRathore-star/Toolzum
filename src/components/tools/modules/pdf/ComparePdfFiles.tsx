"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '@/lib/pdfjsWorker';
import { diff_match_patch, DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL } from 'diff-match-patch';
import { Files, ArrowLeft, RefreshCw, FileText, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/utils/error';

setupPdfWorker(pdfjsLib);

export default function ComparePdfFiles() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  
  const [textPagesA, setTextPagesA] = useState<string[]>([]);
  const [textPagesB, setTextPagesB] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compared, setCompared] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(0); // 0-indexed
  const [diffResult, setDiffResult] = useState<any[]>([]);

  // Reset comparison on files change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset diff state when a new file is selected
    setCompared(false);
    setTextPagesA([]);
    setTextPagesB([]);
    setDiffResult([]);
  }, [fileA, fileB]);

  // Recalculate page diff on page change
  useEffect(() => {
    if (!compared) return;
    calculatePageDiff();
  }, [currentPage, compared]);

  const extractText = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const pagesText: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item) => 'str' in item ? item.str : '');
      // Join strings with spaces, maintaining simple line structures
      pagesText.push(textItems.join(' '));
    }
    return pagesText;
  };

  const handleCompare = async () => {
    if (!fileA || !fileB) {
      return toast.error("Please upload both PDF files to compare.");
    }

    setIsProcessing(true);
    try {
      const [pagesA, pagesB] = await Promise.all([
        extractText(fileA),
        extractText(fileB)
      ]);

      if (pagesA.length === 0 || pagesB.length === 0) {
        throw new Error("One or both PDF files did not contain extractable text.");
      }

      setTextPagesA(pagesA);
      setTextPagesB(pagesB);
      setCurrentPage(0);
      setCompared(true);
      toast.success("PDFs analyzed successfully!");
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to parse text from the PDF files."));
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatePageDiff = () => {
    const textA = textPagesA[currentPage] || '';
    const textB = textPagesB[currentPage] || '';

    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(textA, textB);
    dmp.diff_cleanupSemantic(diffs);
    setDiffResult(diffs);
  };

  const maxPages = Math.max(textPagesA.length, textPagesB.length);

  const clearAll = () => {
    setFileA(null);
    setFileB(null);
    setCompared(false);
    setTextPagesA([]);
    setTextPagesB([]);
    setDiffResult([]);
  };

  // Helper to render diff markup
  const renderDiff = () => {
    if (diffResult.length === 0) {
      return <div className="text-[var(--text-muted)] italic text-center py-8">No text on this page or identical page contents.</div>;
    }

    return (
      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed p-6 bg-white dark:bg-black/35 border border-[var(--border-subtle)] rounded-xl overflow-y-auto max-h-[500px]">
        {diffResult.map(([type, text], idx) => {
          if (type === DIFF_INSERT) {
            return (
              <span key={idx} className="bg-emerald-700/20 text-emerald-800 dark:text-[var(--success)] px-1 py-0.5 rounded font-medium border border-emerald-500/10">
                {text}
              </span>
            );
          } else if (type === DIFF_DELETE) {
            return (
              <span key={idx} className="bg-rose-500/20 text-rose-800 dark:text-[var(--danger)] line-through px-1 py-0.5 rounded font-medium border border-rose-500/10">
                {text}
              </span>
            );
          } else {
            return <span key={idx} className="text-[var(--text-primary)]">{text}</span>;
          }
        })}
      </div>
    );
  };

  if (!compared) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm flex items-center gap-2">
          <Files className="w-5 h-5 flex-shrink-0" />
          <span><strong>100% Client-Side Comparison:</strong> Your PDF text is extracted and diffed entirely inside your web browser. Nothing goes online.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Original PDF (File A)</h4>
            {fileA ? (
              <div className="flex items-center justify-between p-4 bg-[var(--bg-overlay)] dark:bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-sm font-bold truncate">{fileA.name}</span>
                </div>
                <button onClick={() => setFileA(null)} className="text-xs text-[var(--accent)] font-bold ml-2">Remove</button>
              </div>
            ) : (
              <FileUploader 
                accept="application/pdf"
                onFileSelect={(f) => setFileA(f)}
                title="Select File A"
                subtitle="Primary base PDF"
              />
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Modified PDF (File B)</h4>
            {fileB ? (
              <div className="flex items-center justify-between p-4 bg-[var(--bg-overlay)] dark:bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-sm font-bold truncate">{fileB.name}</span>
                </div>
                <button onClick={() => setFileB(null)} className="text-xs text-[var(--accent)] font-bold ml-2">Remove</button>
              </div>
            ) : (
              <FileUploader 
                accept="application/pdf"
                onFileSelect={(f) => setFileB(f)}
                title="Select File B"
                subtitle="PDF to compare against A"
              />
            )}
          </div>
        </div>

        <button 
          onClick={handleCompare}
          disabled={isProcessing || !fileA || !fileB}
          className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Analyzing & Extracting Text...</span>
            </>
          ) : (
            <>
              <Files className="w-5 h-5" />
              <span>Compare PDF Documents</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* File Info Header */}
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Comparing Documents</h3>
          <div className="flex flex-col sm:flex-row gap-4 text-xs font-semibold text-[var(--text-primary)] dark:text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-[var(--accent)]" /> A: {fileA?.name} ({textPagesA.length} pages)</span>
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-[var(--accent)]" /> B: {fileB?.name} ({textPagesB.length} pages)</span>
          </div>
        </div>
        <button 
          onClick={clearAll}
          className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] px-3 py-2 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>New Comparison</span>
        </button>
      </div>

      {/* Main Diff Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation / Sidebar */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-md space-y-4 h-fit">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pb-2 border-b border-[var(--border-subtle)]">
            Page Selection
          </h4>

          <div className="flex items-center justify-between">
            <button aria-label="Previous page"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-surface)] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[var(--text-primary)]" />
            </button>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              Page {currentPage + 1} of {maxPages}
            </span>
            <button aria-label="Next page"
              disabled={currentPage === maxPages - 1}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-surface)] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-[var(--text-primary)]" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-2 max-h-[220px] overflow-y-auto pr-1">
            {Array.from({ length: maxPages }).map((_, idx) => {
              const hasPageA = idx < textPagesA.length;
              const hasPageB = idx < textPagesB.length;
              const isSelected = idx === currentPage;
              let indicatorColor = "bg-[var(--bg-surface)] text-[var(--text-secondary)]";
              if (isSelected) {
                indicatorColor = "bg-[var(--accent-ink)] text-white font-bold";
              } else if (!hasPageA || !hasPageB) {
                indicatorColor = "bg-rose-500/10 text-[var(--accent)] border border-rose-500/25";
              }
              
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`py-2 rounded-lg text-xs font-semibold text-center hover:bg-[var(--accent-hover)] hover:text-white transition-colors cursor-pointer ${indicatorColor}`}
                  title={`${!hasPageA ? 'File A missing page' : ''} ${!hasPageB ? 'File B missing page' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-[var(--text-muted)] space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-700/25 border border-emerald-500/30 rounded inline-block" /> <span>Green represents insertions (B has, A doesn't)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500/25 border border-rose-500/30 rounded inline-block" /> <span>Red represents deletions (A has, B doesn't)</span></div>
          </div>
        </div>

        {/* Diff View Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center bg-[var(--bg-overlay)] px-4 py-2 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-xl text-xs font-bold text-[var(--text-muted)]">
            <span>VISUAL DIFF</span>
            <span>PAGE {currentPage + 1}</span>
          </div>
          {renderDiff()}
        </div>

      </div>

    </div>
  );
}
