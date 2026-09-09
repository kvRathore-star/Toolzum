"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import { PDFDocument, rgb } from 'pdf-lib';
import DOMPurify from 'dompurify';

const PAGE_SIZES = [
  { id: 'a4', label: 'A4', width: 595.28, height: 841.89 },
  { id: 'letter', label: 'Letter', width: 612, height: 792 },
  { id: 'book', label: 'Book (6x9")', width: 432, height: 648 },
  { id: 'digest', label: 'Digest (5.5x8.5")', width: 396, height: 612 },
] as const;

const FONT_SIZES = [
  { id: 'small', label: 'Small', size: 10 },
  { id: 'normal', label: 'Normal', size: 12 },
  { id: 'large', label: 'Large', size: 14 },
] as const;

const MARGINS = [
  { id: 'narrow', label: 'Narrow', value: 30 },
  { id: 'normal', label: 'Normal', value: 50 },
  { id: 'wide', label: 'Wide', value: 80 },
] as const;

type PageSizeId = typeof PAGE_SIZES[number]['id'];
type FontSizeId = typeof FONT_SIZES[number]['id'];
type MarginId = typeof MARGINS[number]['id'];

interface EpubInfo {
  title: string;
  author: string;
  fileSize: number;
  estimatedPages: number;
  chapterCount: number;
}

interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
}

interface SpineItem {
  idref: string;
  linear: string;
}

interface ParsedEpub {
  manifest: Record<string, ManifestItem>;
  spine: SpineItem[];
  coverId: string | null;
  images: Map<string, ArrayBuffer>;
  chapters: { idref: string; content: string }[];
  title: string;
  author: string;
}

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  return textarea.value;
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li>/gi, '\n- ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

async function parseEpub(zip: JSZip): Promise<ParsedEpub> {
  const containerXml = await zip.file('META-INF/container.xml')?.async('string');
  if (!containerXml) throw new Error('Invalid EPUB: missing META-INF/container.xml');

  const opfPathMatch = containerXml.match(/full-path="([^"]+)"/);
  if (!opfPathMatch) throw new Error('Invalid EPUB: cannot find OPF path');
  const opfPath = opfPathMatch[1];
  const opfDir = opfPath!.split('/').slice(0, -1).join('/') + '/';

  const opfContent = await zip.file(opfPath!)?.async('string');
  if (!opfContent) throw new Error('Invalid EPUB: cannot read OPF file');

  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/);
  const creatorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/);

  const manifest: Record<string, ManifestItem> = {};
  const manifestRegex = /<item\s+([^>]+)\/>/g;
  let m;
  while ((m = manifestRegex.exec(opfContent)) !== null) {
    const id = m[1]!.match(/id="([^"]+)"/)?.[1];
    const href = m[1]!.match(/href="([^"]+)"/)?.[1];
    const mediaType = m[1]!.match(/media-type="([^"]+)"/)?.[1];
    if (id && href && mediaType) {
      manifest[id] = { id, href, mediaType };
    }
  }

  const spine: SpineItem[] = [];
  const spineRegex = /<itemref\s+([^>]+)\/?>/g;
  while ((m = spineRegex.exec(opfContent)) !== null) {
    const idref = m[1]!.match(/idref="([^"]+)"/)?.[1];
    const linear = m[1]!.match(/linear="([^"]+)"/)?.[1] || 'yes';
    if (idref) {
      spine.push({ idref, linear });
    }
  }

  let coverId: string | null = null;
  const coverMeta = opfContent.match(/<meta\s+[^>]*name="cover"[^>]*content="([^"]+)"/);
  if (coverMeta) coverId = coverMeta[1]!;
  if (!coverId) {
    for (const [id, item] of Object.entries(manifest)) {
      if (id.toLowerCase().includes('cover') || item.href.toLowerCase().includes('cover')) {
        coverId = id;
        break;
      }
    }
  }

  const images = new Map<string, ArrayBuffer>();
  for (const [, item] of Object.entries(manifest)) {
    if (item.mediaType.startsWith('image/')) {
      const fullPath = opfDir + item.href;
      const entry = zip.file(fullPath);
      if (entry) {
        const buf = await entry.async('arraybuffer');
        images.set(item.id, buf);
      }
    }
  }

  const chapters: { idref: string; content: string }[] = [];
  for (const spineItem of spine) {
    const item = manifest[spineItem.idref];
    if (!item) continue;
    if (!item.mediaType.includes('xhtml') && !item.mediaType.includes('html') && !item.href.endsWith('.xhtml') && !item.href.endsWith('.html')) continue;
    const fullPath = opfDir + item.href;
    const entry = zip.file(fullPath);
    if (entry) {
      const htmlContent = await entry.async('string');
      const text = stripHtml(htmlContent);
      chapters.push({ idref: spineItem.idref, content: text });
    }
  }

  return {
    manifest,
    spine,
    coverId,
    images,
    chapters,
    title: titleMatch?.[1] || 'Unknown Title',
    author: creatorMatch?.[1] || 'Unknown Author',
  };
}

export default function EpubToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [epubInfo, setEpubInfo] = useState<EpubInfo | null>(null);
  const [pageSize, setPageSize] = useState<PageSizeId>('a4');
  const [fontSize, setFontSize] = useState<FontSizeId>('normal');
  const [margin, setMargin] = useState<MarginId>('normal');
  const [includeCover, setIncludeCover] = useState(true);
  const [includeToc, setIncludeToc] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedEpub | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const parsed = await parseEpub(zip);

      const totalChars = parsed.chapters.reduce((sum, ch) => sum + ch.content.length, 0);
      const estimatedPages = Math.max(1, Math.ceil(totalChars / 2500));

      setParsedData(parsed);
      setFile(selectedFile);
      setEpubInfo({
        title: parsed.title,
        author: parsed.author,
        fileSize: selectedFile.size,
        estimatedPages,
        chapterCount: parsed.chapters.length,
      });
      setOutputUrl(null);
      setProgress(0);
    } catch (e) {
      toast.error('Failed to read EPUB file. Ensure it is a valid EPUB.');
    }
  }, []);

  const clearAll = useCallback(() => {
    setFile(null);
    setEpubInfo(null);
    setOutputUrl(null);
    setProgress(0);
    setParsedData(null);
  }, []);

  const convertToPdf = useCallback(async () => {
    if (!file || !parsedData) return;

    setIsProcessing(true);
    setProgress(0);
    try {
      const pdfDoc = await PDFDocument.create();
      const sizeConfig = PAGE_SIZES.find(s => s.id === pageSize)!;
      const fontConfig = FONT_SIZES.find(f => f.id === fontSize)!;
      const marginConfig = MARGINS.find(m => m.id === margin)!;
      const pageWidth = sizeConfig.width;
      const pageHeight = sizeConfig.height;
      const marginPt = marginConfig.value;
      const fontSizePt = fontConfig.size;
      const lineHeight = fontSizePt * 1.5;
      const maxCharsPerLine = Math.floor((pageWidth - marginPt * 2) / (fontSizePt * 0.6));
      const linesPerPage = Math.floor((pageHeight - marginPt * 2 - lineHeight) / lineHeight);
      const usableLines = Math.max(1, linesPerPage);

      const font = await pdfDoc.embedFont('Helvetica');

      let currentY = pageHeight - marginPt - lineHeight;
      let totalProcessed = 0;
      const totalChapters = parsedData.chapters.length;

      const addNewPage = () => {
        const p = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - marginPt - lineHeight;
        return p;
      };

      const writeLine = (page: any, text: string, isBold = false) => {
        page.drawText(text, {
          x: marginPt,
          y: currentY,
          size: fontSizePt,
          font: isBold ? font : font,
          color: rgb(0, 0, 0),
          maxWidth: pageWidth - marginPt * 2,
        });
        currentY -= lineHeight;
      };

      if (includeCover && parsedData.title) {
        const currentPage = addNewPage();
        const titleY = pageHeight / 2 + 40;
        currentPage.drawText(parsedData.title, {
          x: marginPt,
          y: titleY,
          size: fontSizePt + 8,
          font,
          color: rgb(0, 0, 0),
          maxWidth: pageWidth - marginPt * 2,
        });
        if (parsedData.author) {
          currentPage.drawText(`by ${parsedData.author}`, {
            x: marginPt,
            y: titleY - lineHeight * 2,
            size: fontSizePt,
            font,
            color: rgb(0.3, 0.3, 0.3),
            maxWidth: pageWidth - marginPt * 2,
          });
        }
      }

      let currentPage = addNewPage();

      if (includeToc && parsedData.chapters.length > 1) {
        currentPage.drawText('Table of Contents', {
          x: marginPt,
          y: currentY,
          size: fontSizePt + 4,
          font,
          color: rgb(0, 0, 0),
          maxWidth: pageWidth - marginPt * 2,
        });
        currentY -= lineHeight * 2;

        for (const ch of parsedData.chapters) {
          if (currentY < marginPt + lineHeight) {
            currentPage = addNewPage();
          }
          const firstline = ch.content.split('\n').find(l => l.trim()) || `Chapter`;
          const tocText = firstline.length > 50 ? firstline.substring(0, 47) + '...' : firstline;
          currentPage.drawText(tocText, {
            x: marginPt,
            y: currentY,
            size: fontSizePt - 1,
            font,
            color: rgb(0.2, 0.2, 0.4),
            maxWidth: pageWidth - marginPt * 2,
          });
          currentY -= lineHeight * 1.3;
        }

        currentPage = addNewPage();
      }

      for (let ci = 0; ci < parsedData.chapters.length; ci++) {
        const ch = parsedData.chapters[ci];
        const lines = wrapText(ch!.content, maxCharsPerLine);

        const heading = lines.find(l => l.trim()) || '';
        if (heading) {
          if (currentY < marginPt + lineHeight * 2) {
            currentPage = addNewPage();
          }
          currentPage.drawText(heading.length > 60 ? heading.substring(0, 57) + '...' : heading, {
            x: marginPt,
            y: currentY,
            size: fontSizePt + 2,
            font,
            color: rgb(0, 0, 0),
            maxWidth: pageWidth - marginPt * 2,
          });
          currentY -= lineHeight * 1.8;
        }

        for (const line of lines) {
          if (currentY < marginPt) {
            currentPage = addNewPage();
          }
          if (line.trim() === '') {
            currentY -= lineHeight * 0.5;
            continue;
          }
          currentPage.drawText(line, {
            x: marginPt,
            y: currentY,
            size: fontSizePt,
            font,
            color: rgb(0, 0, 0),
            maxWidth: pageWidth - marginPt * 2,
          });
          currentY -= lineHeight;
        }

        totalProcessed++;
        setProgress(Math.round((totalProcessed / totalChapters) * 100));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('EPUB converted to PDF successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to convert EPUB to PDF.');
    } finally {
      setIsProcessing(false);
    }
  }, [file, parsedData, pageSize, fontSize, margin, includeCover, includeToc, outputUrl]);

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>EPUB to PDF:</strong> Convert EPUB e-books to universally compatible PDF format. Perfect for sharing and printing.
        </div>
        <FileUploader
          accept=".epub"
          onFileSelect={handleFileSelect}
          title="Upload EPUB File"
          subtitle="EPUB e-book format"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{epubInfo?.title || file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">
            {epubInfo?.author} &bull; {(epubInfo?.fileSize ?? 0) / 1024 / 1024 > 1
              ? `${((epubInfo?.fileSize ?? 0) / 1024 / 1024).toFixed(2)} MB`
              : `${((epubInfo?.fileSize ?? 0) / 1024).toFixed(1)} KB`}
            &bull; ~{epubInfo?.estimatedPages} pages &bull; {epubInfo?.chapterCount} chapters
          </p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Conversion Settings</h4>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Page Size</label>
            <div className="grid grid-cols-2 gap-2">
              {PAGE_SIZES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setPageSize(s.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${pageSize === s.id ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Font Size</label>
            <div className="grid grid-cols-3 gap-2">
              {FONT_SIZES.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFontSize(f.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${fontSize === f.id ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Margin</label>
            <div className="grid grid-cols-3 gap-2">
              {MARGINS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMargin(m.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${margin === m.id ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={e => setIncludeCover(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-[var(--text-primary)]">Include Cover Page</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeToc}
                onChange={e => setIncludeToc(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-[var(--text-primary)]">Table of Contents</span>
            </label>
          </div>

          <button
            onClick={convertToPdf}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {isProcessing ? 'Converting...' : 'Convert to PDF'}
          </button>
        </div>

        <div className="space-y-6">
          {isProcessing && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-3">
              <h4 className="text-[var(--text-primary)] font-medium">Processing Chapters</h4>
              <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)] text-right">{progress}%</p>
            </div>
          )}

          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Conversion Complete</h4>
              </div>
              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-bold text-center">{file.name.replace(/\.epub$/i, '')}.pdf</p>
              </div>
              <button
                onClick={() => downloadOrShare(outputUrl, file.name.replace(/\.epub$/i, '') + '.pdf')}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <p>PDF will appear here after conversion</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
