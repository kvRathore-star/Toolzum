"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

/** Extract readable text + title from an EPUB (zip of XHTML chapters). */
async function epubToChapters(arrayBuf: ArrayBuffer): Promise<{ title: string; chapters: string[] }> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(arrayBuf);
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Not a valid EPUB (missing container.xml)');
  const parser = new DOMParser();
  const rootPath = parser.parseFromString(containerXml, 'text/xml')
    .querySelector('rootfile')?.getAttribute('full-path');
  if (!rootPath) throw new Error('Not a valid EPUB (missing OPF path)');
  const base = rootPath.includes('/') ? rootPath.slice(0, rootPath.lastIndexOf('/') + 1) : '';
  const opfText = await zip.file(rootPath)?.async('text');
  if (!opfText) throw new Error('Not a valid EPUB (missing OPF package)');
  const opf = parser.parseFromString(opfText, 'text/xml');
  const title = opf.querySelector('title')?.textContent?.trim() || 'Untitled';
  const manifest = new Map<string, string>();
  opf.querySelectorAll('manifest item').forEach(item => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) manifest.set(id, base + href);
  });
  const chapters: string[] = [];
  opf.querySelectorAll('spine itemref').forEach(ref => {
    const path = manifest.get(ref.getAttribute('idref') || '');
    if (path) chapters.push(path);
  });
  const texts: string[] = [];
  for (const path of chapters) {
    const html = await zip.file(decodeURIComponent(path))?.async('text');
    if (!html) continue;
    const doc = parser.parseFromString(html, 'text/html');
    const text = (doc.body?.textContent || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    if (text) texts.push(text);
  }
  if (texts.length === 0) throw new Error('EPUB has no readable text (images-only book?)');
  return { title, chapters: texts };
}

/** Lay wrapped text onto letter pages with pdf-lib (Helvetica, real pagination). */
async function chaptersToPdf(title: string, chapters: string[]): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const PAGE_W = 612; const PAGE_H = 792; const MARGIN = 56; const SIZE = 11; const LEAD = 15;
  const maxChars = 92;
  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  const newPage = () => { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; };
  const drawWrapped = (text: string, f = font, size = SIZE) => {
    const words = text.split(/\s+/).filter(Boolean);
    let line = '';
    const flush = () => {
      if (y < MARGIN + LEAD) newPage();
      page.drawText(line, { x: MARGIN, y, size, font: f });
      y -= LEAD;
    };
    for (const word of words) {
      const trial = line ? `${line} ${word}` : word;
      if (trial.length > maxChars) { flush(); line = word; } else line = trial;
    }
    if (line) flush();
    y -= 4;
  };
  page.drawText(title, { x: MARGIN, y, size: 20, font: bold });
  y -= 34;
  for (const chapter of chapters) {
    for (const para of chapter.split('\n')) {
      const t = para.trim();
      if (t) drawWrapped(t);
    }
    y -= 10;
  }
  return pdfDoc.save();
}

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Build a valid EPUB from a title + chapter texts (replaces the old skeleton). */
async function chaptersToEpub(title: string, chapters: string[]): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip');
  zip.file('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  const manifestItems = chapters.map((_, i) => `<item id="ch${i}" href="ch${i}.xhtml" media-type="application/xhtml+xml"/>`).join('');
  const spineItems = chapters.map((_, i) => `<itemref idref="ch${i}"/>`).join('');
  zip.file('content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="2.0"><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${escXml(title)}</dc:title><dc:language xmlns:dc="http://purl.org/dc/elements/1.1/">en</dc:language></metadata><manifest>${manifestItems}</manifest><spine>${spineItems}</spine></package>`);
  chapters.forEach((text, i) => {
    const paras = text.split('\n').map(p => p.trim()).filter(Boolean).map(p => `<p>${escXml(p)}</p>`).join('');
    zip.file(`ch${i}.xhtml`, `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escXml(title)} — Part ${i + 1}</title></head><body>${paras}</body></html>`);
  });
  return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}

/** Extract per-page text from a PDF via pdf.js. */
async function pdfToChapters(arrayBuf: ArrayBuffer): Promise<string[]> {
  const pdfjsLib = await import('pdfjs-dist');
  const pdf = await pdfjsLib.getDocument(arrayBuf.slice(0)).promise;
  const texts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => ('str' in item ? (item.str as string) : '')).join(' ').replace(/[ \t]+/g, ' ').trim();
    if (text) texts.push(text);
  }
  if (texts.length === 0) throw new Error('PDF has no extractable text (scanned images? try the OCR tool first)');
  return texts;
}

export default function BulkEbookConverter() {
  return (
    <BulkToolShell
      toolSlug="bulk-ebook-converter"
      title="Bulk E-Book Converter"
      description="Convert EPUB to paginated PDF, or PDF to EPUB — real text extraction, not a cover page. MOBI is proprietary and unsupported (use Calibre first)."
      accept=".epub,.pdf"
      processFile={async (file, config) => {
        const format = (config as Record<string, string>).format || 'pdf';
        const lower = file.name.toLowerCase();
        if (lower.endsWith('.mobi')) {
          throw new Error('MOBI is a proprietary Amazon format browsers cannot parse — convert it to EPUB in Calibre first');
        }
        const arrayBuf = await file.arrayBuffer();
        if (format === 'pdf') {
          if (!lower.endsWith('.epub')) throw new Error('PDF output needs an EPUB input');
          const { title, chapters } = await epubToChapters(arrayBuf);
          const bytes = await chaptersToPdf(title, chapters);
          return { name: file.name.replace(/\.[^.]+$/, '.pdf'), blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }) };
        }
        if (format === 'epub') {
          if (!lower.endsWith('.pdf')) throw new Error('EPUB output needs a PDF input');
          const title = file.name.replace(/\.[^.]+$/, '');
          const chapters = await pdfToChapters(arrayBuf);
          const epubBlob = await chaptersToEpub(title, chapters);
          return { name: file.name.replace(/\.[^.]+$/, '.epub'), blob: epubBlob };
        }
        throw new Error(`Unsupported output format: ${format}`);
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Output Format</label>
          <select aria-label="Output Format" name="format" defaultValue="pdf" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="pdf">PDF</option>
            <option value="epub">EPUB</option>
          </select>
        </div>
      }
      defaultConfig={{ format: 'pdf' }}
    />
  );
}
