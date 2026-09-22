"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '@/lib/pdfjsWorker';
import { clipboardWrite } from "@/lib/clipboard";


setupPdfWorker(pdfjsLib);

export default function PdfToMarkdown() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [fileName, setFileName] = useState('');
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
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      setPageCount(pdfDoc.numPages);
      setFileBytes(arrayBuffer);
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(/\.pdf$/i, ''));
      setMarkdown('');
      setOutputUrl(null);
    } catch {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBytes(null);
    setMarkdown('');
    setPageCount(0);
    setFileName('');
    setOutputUrl(null);
  };

  const extractText = async () => {
    if (!fileBytes) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await pdfjsLib.getDocument({ data: fileBytes.slice(0) }).promise;
      let result = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];
        let maxFontSize = 0;
        for (const item of items) {
          if (item.transform && item.transform[0] > maxFontSize) {
            maxFontSize = item.transform[0];
          }
        }
        let pageText = '';
        for (const item of items) {
          const str = item.str || '';
          if (!str.trim()) continue;
          const fontSize = item.transform ? item.transform[0] : 0;
          if (fontSize >= maxFontSize * 0.85 && str.trim().length < 80 && maxFontSize > 0) {
            pageText += `# ${str.trim()}\n\n`;
          } else {
            pageText += str + ' ';
          }
        }
        if (result) result += '\n\n';
        result += `## Page ${i}\n\n`;
        result += pageText.trim() + '\n';
      }
      setMarkdown(result);
      const blob = new Blob([result], { type: 'text/markdown' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Text extracted successfully!");
    } catch {
      toast.error("Failed to extract text. The PDF may contain scanned images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (await clipboardWrite(markdown)) toast.success("Copied to clipboard!"); else toast.error('Copy blocked by the browser — select the text manually.');
    } catch {
      toast.error("Failed to copy.");
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>PDF to Markdown:</strong> Extract text content from PDF files as clean Markdown. Best for text-based PDFs &mdash; scanned documents need OCR.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF to Convert"
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
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB &bull; {pageCount} Pages</p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Extraction</h4>
          <p className="text-sm text-[var(--text-secondary)]">Extract all readable text as formatted Markdown. Headings are detected from font sizes.</p>
          <button
            onClick={extractText}
            disabled={isProcessing}
            className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {isProcessing ? "Extracting..." : "Extract Text"}
          </button>
        </div>

        <div className="space-y-6">
          {markdown ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Markdown Output</h4>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] px-3 py-1.5 rounded-lg text-[var(--text-secondary)] dark:text-[var(--text-muted)]"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => downloadOrShare(outputUrl!, `${fileName}.md`)}
                    className="text-xs bg-[var(--accent-ink)] hover:opacity-90 text-white px-3 py-1.5 rounded-lg"
                  >
                    Download .md
                  </button>
                </div>
              </div>
              <pre className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs text-[var(--text-primary)] max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
                {markdown}
              </pre>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p>Extracted markdown will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
