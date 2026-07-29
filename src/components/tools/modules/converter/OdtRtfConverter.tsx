"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import type { PDFFont } from 'pdf-lib';
import JSZip from 'jszip';

function detectFileType(file: File): 'odt' | 'rtf' | null {
  const n = file.name.toLowerCase();
  if (n.endsWith('.odt')) return 'odt';
  if (n.endsWith('.rtf')) return 'rtf';
  return null;
}

async function parseOdt(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const fileEntry = zip.file('content.xml');
  if (!fileEntry) throw new Error('Invalid ODT file: content.xml not found');
  const xml = await fileEntry.async('string');
  const paragraphs: string[] = [];
  const re = /<text:p[^>]*>([\s\S]*?)<\/text:p>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const text = m[1]
      .replace(/<\/?[^>]+>/g, '')
      .replace(/&(amp|lt|gt|quot|#39|#x201[89]|#x201[CD]|#x201[34]|#xa0);/g, (e) => {
        const map: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#x2019': "'", '#x2018': "'", '#x201C': '"', '#x201D': '"', '#x2013': '–', '#x2014': '—', '#xa0': ' ' };
        return map[e.slice(1, -1)] || e;
      })
      .trim();
    if (text) paragraphs.push(text);
  }
  return paragraphs.join('\n\n');
}

interface TextRun { text: string; bold: boolean; italic: boolean }

function parseRtfFormatted(text: string): TextRun[][] {
  const paragraphs: TextRun[][] = [];
  let current: TextRun[] = [];
  let runText = '';
  let bold = false;
  let italic = false;
  const stack: { bold: boolean; italic: boolean }[] = [];
  let i = 0;

  const flush = () => { if (runText) { current.push({ text: runText, bold, italic }); runText = ''; } };

  const newParagraph = () => {
    if (current.length > 0 || paragraphs.length === 0) {
      flush();
      if (current.length > 0 || paragraphs.length > 0) paragraphs.push(current);
    }
    current = [];
    runText = '';
  };

  while (i < text.length) {
    if (text[i] === '{') {
      flush();
      stack.push({ bold, italic });
      i++;
    } else if (text[i] === '}') {
      flush();
      const prev = stack.pop();
      if (prev) { bold = prev.bold; italic = prev.italic; }
      i++;
    } else if (text[i] === '\\') {
      flush();
      i++;
      let cmd = '';
      while (i < text.length && /[a-z]/i.test(text[i])) { cmd += text[i]; i++; }
      while (i < text.length && /[-0-9]/.test(text[i])) i++;
      if (i < text.length && text[i] === ' ') i++;

      if (cmd === 'par' || cmd === 'line') newParagraph();
      else if (cmd === 'b') bold = true;
      else if (cmd === 'b0') bold = false;
      else if (cmd === 'i') italic = true;
      else if (cmd === 'i0') italic = false;
      else if (cmd === 'tab') runText += '    ';
      else if (cmd === "'" && i + 1 < text.length) { runText += String.fromCharCode(parseInt(text.substring(i, i + 2), 16)); i += 2; }
      else if (cmd === 'emdash') runText += '—';
      else if (cmd === 'endash') runText += '–';
      else if (cmd === 'lquote' || cmd === 'rquote') runText += "'";
      else if (cmd === 'ldblquote' || cmd === 'rdblquote') runText += '"';
      else if (cmd === 'bullet') runText += '•';
      else if (cmd === '_') runText += '-';
      else if (cmd === '\\') runText += '\\';
      else if (cmd === '{') runText += '{';
      else if (cmd === '}') runText += '}';
      else if (cmd === '~') runText += '\u00A0';
    } else {
      runText += text[i];
      i++;
    }
  }
  flush();
  if (current.length > 0) paragraphs.push(current);
  return paragraphs.filter(p => p.length > 0 && p.some(r => r.text.trim()));
}

function parseRtfPlain(text: string): string {
  return parseRtfFormatted(text).map(p => p.map(r => r.text).join('')).join('\n\n');
}

interface RenderOptions { width: number; height: number; margin: number; fontSize: number; title: string; paragraphs: TextRun[][] }

const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [595.28, 841.89], Letter: [612, 792], Legal: [612, 1008],
};

function wrapLines(runs: TextRun[], maxWidth: number, font: PDFFont, boldFont: PDFFont, italicFont: PDFFont, boldItalicFont: PDFFont, fontSize: number): { text: string; font: PDFFont; width: number }[][] {
  const lines: { text: string; font: PDFFont; width: number }[][] = [];
  let currentLine: { text: string; font: PDFFont; width: number }[] = [];
  let lineWidth = 0;

  const getFont = (b: boolean, i: boolean) => {
    if (b && i) return boldItalicFont;
    if (b) return boldFont;
    if (i) return italicFont;
    return font;
  };

  const emitWord = (word: string, f: PDFFont) => {
    const w = f.widthOfTextAtSize(word, fontSize);
    const spaceW = f.widthOfTextAtSize(' ', fontSize);
    if (lineWidth + w + (currentLine.length > 0 ? spaceW : 0) > maxWidth && lineWidth > 0) {
      lines.push(currentLine);
      currentLine = [];
      lineWidth = 0;
    }
    if (currentLine.length > 0) { currentLine.push({ text: ' ', font: f, width: spaceW }); lineWidth += spaceW; }
    currentLine.push({ text: word, font: f, width: w });
    lineWidth += w;
  };

  for (const run of runs) {
    const f = getFont(run.bold, run.italic);
    for (const w of run.text.split(/(\s+)/)) {
      if (w.length === 0) continue;
      emitWord(w, f);
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

async function renderPdf(options: RenderOptions): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const boldItalicFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  const { width, height, margin, fontSize, title, paragraphs } = options;
  const usableW = width - margin * 2;
  const titleSize = fontSize + 8;
  const lineHeight = fontSize * 1.4;
  const titleLineH = titleSize * 1.3;
  const pageNumH = 20;

  let page = pdfDoc.addPage([width, height]);
  let y = height - margin;

  const drawWrapped = async (runs: TextRun[], size: number, startY: number, isTitle: boolean): Promise<number> => {
    let currentY = startY;
    const lines = wrapLines(runs, usableW, font, boldFont, italicFont, boldItalicFont, size);
    const lh = size * 1.4;
    for (const line of lines) {
      if (currentY - lh < margin + pageNumH) { page = pdfDoc.addPage([width, height]); currentY = height - margin; }
      let x = margin;
      if (isTitle) {
        const totalW = line.reduce((s, r) => s + r.width, 0);
        x = (width - totalW) / 2;
      }
      for (const seg of line) {
        page.drawText(seg.text, { x, y: currentY - size * 0.25, size, font: seg.font, color: rgb(0, 0, 0) });
        x += seg.width;
      }
      currentY -= lh;
    }
    return currentY;
  };

  const titleRuns: TextRun[] = [{ text: title, bold: true, italic: false }];
  y = await drawWrapped(titleRuns, titleSize, y, true);
  y -= titleLineH * 0.5;

  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.4, 0.4, 0.4) });
  y -= lineHeight;

  for (const para of paragraphs) {
    if (y < margin + pageNumH + lineHeight) { page = pdfDoc.addPage([width, height]); y = height - margin; }
    y = await drawWrapped(para, fontSize, y, false);
    y -= lineHeight * 0.6;
  }

  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i];
    const text = `${i + 1} / ${pages.length}`;
    const w = font.widthOfTextAtSize(text, 8);
    pg.drawText(text, { x: (width - w) / 2, y: margin / 2, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
  }

  return pdfDoc.save();
}

export default function OdtRtfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'odt' | 'rtf' | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [title, setTitle] = useState('');
  const [showAllPreview, setShowAllPreview] = useState(false);
  const [pageSize, setPageSize] = useState('A4');
  const [fontSize, setFontSize] = useState(11);
  const [margins, setMargins] = useState(72);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const type = detectFileType(selectedFile);
      if (!type) { toast.error('Unsupported file type. Please select an ODT or RTF file.'); return; }
      setFileType(type);
      setTitle(selectedFile.name.replace(/\.(odt|rtf)$/i, ''));
      setOutputUrl(null);
      setShowAllPreview(false);
      const text = type === 'odt' ? await parseOdt(selectedFile) : parseRtfPlain(await selectedFile.text());
      if (!text.trim()) { toast.error('No readable text found in the document.'); return; }
      setExtractedText(text);
      setFile(selectedFile);
    } catch (e) {
      console.error(e);
      toast.error('Failed to read document. The file may be corrupted.');
    }
  };

  const clearAll = () => {
    setFile(null); setFileType(null); setExtractedText(''); setTitle(''); setOutputUrl(null); setShowAllPreview(false);
  };

  const convertToPdf = async () => {
    if (!file || !fileType || !extractedText.trim()) return;
    setIsProcessing(true);
    try {
      let paragraphs: TextRun[][];
      if (fileType === 'rtf') {
        paragraphs = parseRtfFormatted(await file.text());
      } else {
        paragraphs = extractedText.split('\n\n').filter(Boolean).map(p => [{ text: p.trim(), bold: false, italic: false }]);
      }
      if (paragraphs.length === 0) { toast.error('No content to convert.'); return; }
      const [pw, ph] = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
      const pdfBytes = await renderPdf({ width: pw, height: ph, margin: margins, fontSize, title, paragraphs });
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('PDF generated successfully!');
    } catch (e) {
      console.error(e);
      toast.error('An error occurred while generating the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>No server uploads — </strong>Your ODT and RTF documents are parsed locally and never leave your device.
        </div>
        <FileUploader accept=".odt,.rtf,application/vnd.oasis.opendocument.text,application/rtf,text/rtf" onFileSelect={handleFileSelect} title="Upload ODT or RTF Document" subtitle="Drag & drop your file here" />
      </div>
    );
  }

  const previewText = showAllPreview ? extractedText : extractedText.slice(0, 500);
  const marginPresets = [{ label: 'Narrow', value: 36 }, { label: 'Normal', value: 72 }, { label: 'Wide', value: 108 }];
  const btnBase = 'py-2 px-3 rounded-xl text-xs font-bold transition-all border';
  const btnActive = 'bg-blue-600 border-blue-500 text-white shadow-md';
  const btnInactive = 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{fileType?.toUpperCase()} • {(file.size / 1024).toFixed(0)} KB</p>
        </div>
        <button onClick={clearAll} className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-[var(--text-primary)] font-medium">Extracted Text Preview</h4>
          {extractedText.length > 500 && (
            <button onClick={() => setShowAllPreview(p => !p)} className="text-xs text-blue-500 hover:text-blue-400 font-medium">
              {showAllPreview ? 'Show Less' : `Show All (${extractedText.length} chars)`}
            </button>
          )}
        </div>
        <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto bg-[var(--bg-overlay)]/50 p-4 rounded-xl border border-[var(--border-subtle)]">
          {previewText}{!showAllPreview && extractedText.length > 500 && <span className="text-[var(--text-muted)]">...</span>}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">PDF Settings</h4>

          <div>
            <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Page Size</label>
            <div className="grid grid-cols-3 gap-2">
              {['A4', 'Letter', 'Legal'].map(s => (
                <button key={s} onClick={() => setPageSize(s)} className={`${btnBase} ${pageSize === s ? btnActive : btnInactive}`}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Font Size: <span className="font-bold text-[var(--text-primary)]">{fontSize}pt</span></label>
            <input type="range" min={8} max={16} step={1} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1"><span>8pt</span><span>16pt</span></div>
          </div>

          <div>
            <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Margins</label>
            <div className="grid grid-cols-3 gap-2">
              {marginPresets.map(m => (
                <button key={m.value} onClick={() => setMargins(m.value)} className={`${btnBase} ${margins === m.value ? btnActive : btnInactive}`}>{m.label}</button>
              ))}
            </div>
          </div>

          <button onClick={convertToPdf} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 mt-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            {isProcessing ? 'Generating PDF...' : 'Convert to PDF'}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">PDF Ready</h4>
              </div>
              <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-bold text-center">{title}.pdf</p>
              </div>
              <button onClick={() => downloadOrShare(outputUrl, `${title}.pdf`)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              <p>Converted PDF will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
