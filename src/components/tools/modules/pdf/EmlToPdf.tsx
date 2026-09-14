"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, rgb, StandardFonts, type PDFFont, type RGB } from 'pdf-lib';

interface ParsedEmail {
  headers: Record<string, string>;
  body: string;
  isMsg: boolean;
  fileName: string;
}

function parseEml(text: string): { headers: Record<string, string>; body: string } {
  const lines = text.split('\n');
  const headers: Record<string, string> = {};
  let i = 0;
  for (; i < lines.length; i++) {
    if (lines[i]!.trim() === '') break;
    const colonIdx = lines[i]!.indexOf(':');
    if (colonIdx > 0) {
      const key = lines[i]!.substring(0, colonIdx).trim();
      const val = lines[i]!.substring(colonIdx + 1).trim();
      headers[key.toLowerCase()] = val;
    }
  }
  const body = lines.slice(i + 1).join('\n');
  return { headers, body };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPlainTextFromMultipart(body: string, boundary: string): string {
  const parts = body.split('--' + boundary);
  for (const part of parts) {
    if (part.includes('--')) continue;
    if (part.includes('text/plain')) {
      const bodyStart = part.indexOf('\n\n');
      if (bodyStart > 0) {
        return part.substring(bodyStart + 2).trim();
      }
    }
  }
  return body;
}

function wordWrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    if (para.length === 0) {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let current = '';
    for (const word of words) {
      const candidate = current ? current + ' ' + word : word;
      if (candidate.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export default function EmlToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedEmail, setParsedEmail] = useState<ParsedEmail | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const text = await selectedFile.text();
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'msg') {
        setParsedEmail({ headers: {}, body: '', isMsg: true, fileName: selectedFile.name });
        setFile(selectedFile);
        setPdfUrl(null);
        return;
      }
      const { headers, body } = parseEml(text);
      setParsedEmail({ headers, body, isMsg: false, fileName: selectedFile.name });
      setFile(selectedFile);
      setPdfUrl(null);
    } catch {
      toast.error('Failed to read the file. Please ensure it is a valid .eml or .msg file.');
    }
  };

  const clearAll = () => {
    setFile(null);
    setParsedEmail(null);
    setPdfUrl(null);
  };

  const generatePdf = async () => {
    if (!parsedEmail || !file || parsedEmail.isMsg) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const courier = await pdfDoc.embedFont(StandardFonts.Courier);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 612;
      const pageHeight = 792;
      const margin = 50;
      const maxLineWidth = pageWidth - 2 * margin;
      const charWidth = 7;
      const maxCharsPerLine = Math.floor(maxLineWidth / charWidth);

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - 50;
      const fs = 10;
      const lh = 15;

      const write = (text: string, x: number, y: number, font: PDFFont, size: number, color: RGB) => {
        if (y < 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - 50;
        }
        page.drawText(text, { x, y, font, size, color });
        return y;
      };

      const headerLabels: [string, string][] = [
        ['From', parsedEmail.headers['from'] || 'N/A'],
        ['To', parsedEmail.headers['to'] || 'N/A'],
        ['Subject', parsedEmail.headers['subject'] || 'N/A'],
        ['Date', parsedEmail.headers['date'] || 'N/A'],
        ['CC', parsedEmail.headers['cc'] || 'N/A'],
      ];

      y = write('Email Document', margin, y, helveticaBold, 18, rgb(0.18, 0.38, 0.76));
      y -= 8;

      y = write('─'.repeat(80), margin, y - lh, courier, fs, rgb(0.6, 0.6, 0.6));
      y -= 4;

      for (const [label, value] of headerLabels) {
        page.drawText(label + ':', { x: margin, y: y - lh, font: helveticaBold, size: fs, color: rgb(0, 0, 0) });
        page.drawText(value, { x: margin + 55, y: y - lh, font: helvetica, size: fs, color: rgb(0.25, 0.25, 0.25) });
        y -= lh;
      }

      y -= 10;
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 1,
        color: rgb(0.55, 0.55, 0.55),
      });
      y -= 20;

      let bodyText = parsedEmail.body;
      const ct = (parsedEmail.headers['content-type'] || '').toLowerCase();

      const boundaryMatch = ct.match(/boundary="?([^"\s;]+)"?/);
      if (boundaryMatch) {
        bodyText = extractPlainTextFromMultipart(bodyText, boundaryMatch[1] ?? "");
      } else if (ct.includes('text/html')) {
        bodyText = stripHtml(bodyText);
      }

      page.drawText('--- Body ---', { x: margin, y, font: helveticaBold, size: fs, color: rgb(0.3, 0.3, 0.3) });
      y -= lh + 5;

      const wrapped = wordWrap(bodyText || '(No body content)', maxCharsPerLine);
      for (const line of wrapped) {
        if (y < 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - 50;
          page.drawText('--- Body (continued) ---', { x: margin, y, font: helvetica, size: fs, color: rgb(0.5, 0.5, 0.5) });
          y -= lh + 5;
        }
        page.drawText(line, { x: margin, y, font: courier, size: fs, color: rgb(0.15, 0.15, 0.15) });
        y -= lh;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
      toast.success('PDF generated successfully!');
    } catch {
      toast.error('An error occurred while generating the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>EML/MSG to PDF:</strong> Convert email files (.eml) to formatted PDF documents. All processing happens in your browser.
        </div>
        <FileUploader
          accept=".eml,.msg,message/rfc822,application/vnd.ms-outlook"
          onFileSelect={handleFileSelect}
          title="Upload EML or MSG File"
          subtitle="Drag & drop your email file here"
        />
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
        <button
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      {parsedEmail?.isMsg ? (
        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-2xl text-center space-y-4">
          <svg className="w-12 h-12 mx-auto text-amber-700 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-amber-700 dark:text-amber-400 font-bold text-lg">MSG Format Not Supported</p>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] max-w-md mx-auto">
            .msg files require server-side processing and cannot be converted directly in the browser.
            Please open the file in Microsoft Outlook, export it as <strong>.eml</strong> format, and try again.
          </p>
          <button
            onClick={clearAll}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Upload Different File
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
            <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Email Details</h4>
            {parsedEmail && (
              <div className="space-y-2 text-sm">
                <p className="text-zinc-600 dark:text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text-primary)]">From:</span>{' '}
                  {parsedEmail.headers['from'] || 'N/A'}
                </p>
                <p className="text-zinc-600 dark:text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text-primary)]">To:</span>{' '}
                  {parsedEmail.headers['to'] || 'N/A'}
                </p>
                <p className="text-zinc-600 dark:text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text-primary)]">Subject:</span>{' '}
                  {parsedEmail.headers['subject'] || 'N/A'}
                </p>
                <p className="text-zinc-600 dark:text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text-primary)]">Date:</span>{' '}
                  {parsedEmail.headers['date'] || 'N/A'}
                </p>
                <p className="text-zinc-600 dark:text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text-primary)]">CC:</span>{' '}
                  {parsedEmail.headers['cc'] || 'N/A'}
                </p>
              </div>
            )}
            <button
              onClick={generatePdf}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate PDF'
              )}
            </button>
          </div>

          <div className="space-y-6">
            {pdfUrl ? (
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">PDF Ready</h4>
                </div>
                <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-bold text-center">{file.name.replace(/\.(eml|msg)$/i, '.pdf')}</p>
                </div>
                <button
                  onClick={() => downloadOrShare(pdfUrl, file.name.replace(/\.(eml|msg)$/i, '.pdf'))}
                  className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>
            ) : (
              <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
                <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p>Generated PDF will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
