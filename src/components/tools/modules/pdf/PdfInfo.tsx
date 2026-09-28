"use client";

import React, { useState, useEffect } from 'react';
import { useRovingTabs } from "@/components/useRovingTabs";
import { toast } from 'react-hot-toast';
import { FileUploader } from '../../FileUploader';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '@/lib/pdfjsWorker';
import { downloadOrShare } from '@/utils/nativeShare';

setupPdfWorker(pdfjsLib);

type TabType = 'metadata' | 'dimensions' | 'text' | 'json';

export default function PdfInfo() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('metadata');
  const infoTabs = useRovingTabs(
    ['metadata', 'dimensions', 'text', 'json'] as TabType[],
    activeTab,
    setActiveTab,
    "data-pdfinfo-tab",
  );

  const [metadata, setMetadata] = useState<Record<string, string> | null>(null);
  const [dimensions, setDimensions] = useState<{ page: number; width: number; height: number }[]>([]);
  const [extractedText, setExtractedText] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [fileSize, setFileSize] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (metadata) setMetadata(null);
    };
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setMetadata(null);
    setDimensions([]);
    setExtractedText('');
    setJsonOutput('');
    setIsLoading(true);
    try {
      const buf = await selectedFile.arrayBuffer();
      setArrayBuffer(buf);
      setFileSize(formatFileSize(selectedFile.size));

      const pdfLibDoc = await PDFDocument.load(buf);
      setPageCount(pdfLibDoc.getPageCount());

      const meta: Record<string, string> = {};
      const title = pdfLibDoc.getTitle();
      const author = pdfLibDoc.getAuthor();
      const subject = pdfLibDoc.getSubject();
      const keywords = pdfLibDoc.getKeywords();
      const creator = pdfLibDoc.getCreator();
      const producer = pdfLibDoc.getProducer();
      const creationDate = pdfLibDoc.getCreationDate();
      const modDate = pdfLibDoc.getModificationDate();
      if (title) meta['Title'] = title;
      if (author) meta['Author'] = author;
      if (subject) meta['Subject'] = subject;
      if (keywords) meta['Keywords'] = keywords;
      if (creator) meta['Creator'] = creator;
      if (producer) meta['Producer'] = producer;
      if (creationDate) meta['Created'] = creationDate.toISOString();
      if (modDate) meta['Modified'] = modDate.toISOString();
      meta['Pages'] = String(pdfLibDoc.getPageCount());
      meta['Encrypted'] = pdfLibDoc.isEncrypted ? 'Yes' : 'No';
      meta['File Size'] = formatFileSize(selectedFile.size);
      setMetadata(meta);

      const dims: { page: number; width: number; height: number }[] = [];
      for (let i = 0; i < pdfLibDoc.getPageCount(); i++) {
        const page = pdfLibDoc.getPage(i);
        const { width, height } = page.getSize();
        dims.push({ page: i + 1, width: Math.round(width * 10) / 10, height: Math.round(height * 10) / 10 });
      }
      setDimensions(dims);

      const pdfJsDoc = await pdfjsLib.getDocument(buf).promise;
      let fullText = '';
      for (let i = 1; i <= pdfJsDoc.numPages; i++) {
        const page = await pdfJsDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      setExtractedText(fullText);

      const jsonData = {
        metadata: meta,
        pages: dims,
        textPreview: fullText.slice(0, 5000),
      };
      setJsonOutput(JSON.stringify(jsonData, null, 2));

      toast.success('PDF analyzed successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to analyze PDF. It may be encrypted or corrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setArrayBuffer(null);
    setMetadata(null);
    setDimensions([]);
    setExtractedText('');
    setJsonOutput('');
    setPageCount(0);
  };

  const downloadText = async () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    // Quota-gated saves (1 unit each) — block shows the limit modal.
    await downloadOrShare(url, (file?.name || 'document').replace(/\.pdf$/i, '') + '-extracted-text.txt');
  };

  const downloadJson = async () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    await downloadOrShare(url, (file?.name || 'document').replace(/\.pdf$/i, '') + '-info.json');
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>PDF Info & Analysis:</strong> View document metadata, page dimensions, extract text content, and export structured data as JSON. All processing stays on your device.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={(_f) => handleFileSelect(_f)}
          title="Upload PDF to Analyze"
          subtitle="View metadata, dimensions, and extract text"
        />
      </div>
    );
  }

  const tabClass = (t: TabType) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === t ? 'bg-[var(--accent-ink)] text-white shadow-md' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{fileSize} &middot; {pageCount} pages</p>
        </div>
        <button onClick={clearAll}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">
          Change File
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="PDF info views" onKeyDown={infoTabs.onKeyDown}>
        <button role="tab" {...infoTabs.tabProps('metadata')} aria-selected={activeTab === 'metadata'} onClick={() => setActiveTab('metadata')} className={tabClass('metadata')}>Metadata</button>
        <button role="tab" {...infoTabs.tabProps('dimensions')} aria-selected={activeTab === 'dimensions'} onClick={() => setActiveTab('dimensions')} className={tabClass('dimensions')}>Page Dimensions</button>
        <button role="tab" {...infoTabs.tabProps('text')} aria-selected={activeTab === 'text'} onClick={() => setActiveTab('text')} className={tabClass('text')}>Extract Text</button>
        <button role="tab" {...infoTabs.tabProps('json')} aria-selected={activeTab === 'json'} onClick={() => setActiveTab('json')} className={tabClass('json')}>Export JSON</button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
        </div>
      ) : (
        <div className="">
          {activeTab === 'metadata' && metadata && (
            <div className="space-y-0">
              {Object.entries(metadata).map(([key, val]) => (
                <div key={key} className="flex py-3 border-b border-[var(--border-subtle)] last:border-0">
                  <span className="w-32 text-sm font-medium text-[var(--text-secondary)] shrink-0">{key}</span>
                  <span className="text-sm text-[var(--text-primary)] break-all">{val || '—'}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'dimensions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left py-2 font-medium text-[var(--text-secondary)]">Page</th>
                    <th className="text-right py-2 font-medium text-[var(--text-secondary)]">Width (pts)</th>
                    <th className="text-right py-2 font-medium text-[var(--text-secondary)]">Height (pts)</th>
                    <th className="text-right py-2 font-medium text-[var(--text-secondary)]">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {dimensions.map(d => (
                    <tr key={d.page} className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--text-primary)]">{d.page}</td>
                      <td className="py-2 text-right text-[var(--text-primary)]">{d.width}</td>
                      <td className="py-2 text-right text-[var(--text-primary)]">{d.height}</td>
                      <td className="py-2 text-right text-[var(--text-secondary)]">
                        {d.width >= d.height ? 'Landscape' : 'Portrait'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={downloadText}
                  className="text-sm bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] px-3 py-1.5 rounded-lg font-medium text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
                  Download as TXT
                </button>
              </div>
              <pre className="max-h-96 overflow-y-auto bg-[var(--bg-overlay)] rounded-lg p-4 text-xs font-mono text-[var(--text-primary)] whitespace-pre-wrap">
                {extractedText || 'No text content found in this PDF.'}
              </pre>
            </div>
          )}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={downloadJson}
                  className="text-sm bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] px-3 py-1.5 rounded-lg font-medium text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
                  Download as JSON
                </button>
              </div>
              <pre className="max-h-96 overflow-y-auto bg-[var(--bg-overlay)] rounded-lg p-4 text-xs font-mono text-[var(--text-primary)] whitespace-pre-wrap">
                {jsonOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
