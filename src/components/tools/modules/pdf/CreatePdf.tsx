"use client";

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type InputMode = 'text' | 'csv' | 'json' | 'xml';

export default function CreatePdf() {
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('document');
  const [includeTitle, setIncludeTitle] = useState(true);
  const [titleText, setTitleText] = useState('Document');
  const [fontSize, setFontSize] = useState(12);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRaw, setCsvRaw] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const parseCSV = (raw: string): string[][] => {
    const lines = raw.split('\n').filter(l => l.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; continue; }
        if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else current += ch;
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCsvFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setCsvRaw(content || '');
    };
    reader.readAsText(f);
  };

  const handleJsonFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content || '');
    };
    reader.readAsText(f);
  };

  const wrapText = (text: string, font: any, size: number, maxWidth: number): string[] => {
    const lines: string[] = [];
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line ? line + ' ' + word : word;
      const w = font.widthOfTextAtSize(testLine, size);
      if (w > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const createPdf = async () => {
    if (!text.trim() && !csvRaw.trim() && mode === 'csv' && !csvRaw.trim()) {
      toast.error('Please provide content to create the PDF.');
      return;
    }
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const margin = 50;
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const maxWidth = pageWidth - 2 * margin;
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      const addNewPage = () => {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      };

      const checkSpace = (needed: number) => {
        if (y - needed < margin) addNewPage();
      };

      const drawLine = (yPos: number) => {
        page.drawLine({
          start: { x: margin, y: yPos },
          end: { x: pageWidth - margin, y: yPos },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
      };

      if (includeTitle && titleText.trim()) {
        checkSpace(30);
        page.drawText(titleText, { x: margin, y, size: 24, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
        y -= 30;
        drawLine(y);
        y -= 20;
      }

      if (mode === 'csv' && csvRaw.trim()) {
        const rows = parseCSV(csvRaw);
        if (rows.length === 0) { toast.error('No CSV data found.'); return; }
        const headers = rows[0];
        const colWidth = Math.min(120, (maxWidth - 10) / headers.length);
        const cellPad = 4;
        const rowHeight = 20;

        const drawTableCell = (text: string, x: number, y: number, isHeader: boolean) => {
          const f = isHeader ? boldFont : font;
          const s = isHeader ? 9 : 8;
          const displayText = text.length > 20 ? text.slice(0, 18) + '…' : text;
          page.drawText(displayText, { x: x + cellPad, y: y + cellPad, size: s, font: f, color: rgb(0.1, 0.1, 0.1) });
        };

        for (let ri = 0; ri < rows.length; ri++) {
          const needed = rowHeight + 4;
          checkSpace(needed);
          if (ri === 0) {
            page.drawRectangle({
              x: margin, y: y - 2, width: maxWidth, height: rowHeight,
              color: rgb(0.9, 0.92, 0.95),
            });
          }
          if (ri % 2 === 1) {
            page.drawRectangle({
              x: margin, y: y - 2, width: maxWidth, height: rowHeight,
              color: rgb(0.97, 0.97, 0.97),
            });
          }
          for (let ci = 0; ci < headers.length; ci++) {
            const cellX = margin + ci * colWidth;
            const cellVal = rows[ri][ci] || '';
            drawTableCell(cellVal, cellX, y, ri === 0);
            page.drawRectangle({
              x: cellX, y: y - 2, width: colWidth, height: rowHeight,
              borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5,
            });
          }
          y -= rowHeight + 2;
        }
      } else if (mode === 'json' && text.trim()) {
        checkSpace(20);
        try {
          const parsed = JSON.parse(text);
          const formatted = JSON.stringify(parsed, null, 2);
          const lines = formatted.split('\n');
          for (const line of lines) {
            const wrapped = wrapText(line, font, 9, maxWidth);
            const needed = wrapped.length * 13;
            checkSpace(needed);
            for (const wl of wrapped) {
              page.drawText(wl, { x: margin, y, size: 9, font, color: rgb(0.2, 0.3, 0.5) });
              y -= 13;
            }
          }
        } catch {
          toast.error('Invalid JSON. Formatting as plain text.');
          const lines = text.split('\n');
          for (const line of lines) {
            const wrapped = wrapText(line, font, fontSize, maxWidth);
            const needed = wrapped.length * (fontSize + 4);
            checkSpace(needed);
            for (const wl of wrapped) {
              page.drawText(wl, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
              y -= fontSize + 4;
            }
          }
        }
      } else {
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.trim() === '') { y -= 8; continue; }
          const wrapped = wrapText(line, font, fontSize, maxWidth);
          const needed = wrapped.length * (fontSize + 4);
          checkSpace(needed);
          for (const wl of wrapped) {
            page.drawText(wl, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
            y -= fontSize + 4;
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('PDF created successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to create PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const tabClass = (m: InputMode) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === m ? 'bg-blue-600 text-white shadow-md' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
        <strong>Create PDF:</strong> Generate a PDF document from text, CSV tables, JSON data, or XML. Fully browser-based.
      </div>

      <div className="flex flex-wrap gap-2">
        {(['text', 'csv', 'json', 'xml'] as InputMode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setOutputUrl(null); }}
            className={tabClass(m)}>
            {m === 'text' ? 'Plain Text' : m === 'csv' ? 'CSV Table' : m === 'json' ? 'JSON' : 'XML'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Document Title</label>
            <input aria-label="Document Title" type="text" value={titleText} onChange={(e) => setTitleText(e.target.value)}
              placeholder="My Document"
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Font Size</label>
            <select aria-label="Font Size" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]">
              <option value={10}>10pt</option>
              <option value={12}>12pt</option>
              <option value={14}>14pt</option>
              <option value={16}>16pt</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={includeTitle} onChange={(e) => setIncludeTitle(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-[var(--text-primary)]">Include title on first page</span>
        </label>

        {mode === 'csv' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-primary)]">
                Upload CSV File
                <input type="file" accept=".csv,.tsv,.txt" onChange={handleCsvFileSelect} className="hidden" />
              </label>
              {csvFile && <span className="text-sm text-[var(--text-secondary)]">{csvFile.name}</span>}
            </div>
            <textarea value={csvRaw} onChange={(e) => setCsvRaw(e.target.value)}
              placeholder="name,email,role&#10;John,john@example.com,Admin&#10;Jane,jane@example.com,Editor"
              className="w-full h-48 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y"
            />
            <p className="text-xs text-[var(--text-secondary)]">First row is treated as table headers. Supports quoted fields.</p>
          </div>
        ) : mode === 'json' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-primary)]">
                Upload JSON File
                <input type="file" accept=".json" onChange={handleJsonFileSelect} className="hidden" />
              </label>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder='{"name": "John", "age": 30}'
              className="w-full h-48 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y"
            />
          </div>
        ) : (
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder={mode === 'text' ? 'Enter your text here...' : '<root><item>XML content</item></root>'}
            className="w-full h-48 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y"
          />
        )}
      </div>

      <button onClick={createPdf} disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
        {isProcessing ? 'Creating PDF...' : 'Create PDF'}
      </button>

      {outputUrl && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
            <h4 className="font-bold text-emerald-500">PDF Ready</h4>
          </div>
          <button onClick={() => downloadOrShare(outputUrl, `${titleText.toLowerCase().replace(/\s+/g, '-') || 'document'}.pdf`)}
            className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
