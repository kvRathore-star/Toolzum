"use client"
import React, { useState, useEffect } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, rgb } from 'pdf-lib';

interface Annotation {
  type: string; color: string; opacity: number;
  x: number; y: number; width: number; height: number;
}

const TYPES = [
  { key: 'highlight', label: 'Highlight' }, { key: 'underline', label: 'Underline' },
  { key: 'strikeout', label: 'Strikeout' }, { key: 'rectangle', label: 'Rectangle' },
  { key: 'circle', label: 'Circle' }, { key: 'arrow', label: 'Arrow' },
];

const SWATCHES = ['#FF0000','#00AA00','#0066FF','#FFAA00','#FF00AA','#00CCCC','#FF6600','#9900CC'];

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

export default function PdfAnnotator() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedType, setSelectedType] = useState('highlight');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [selectedOpacity, setSelectedOpacity] = useState(0.5);
  const [pos, setPos] = useState({ x: 50, y: 50, w: 150, h: 20 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => { return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); }; }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File, _dataUrl: string) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      setPdfBytes(arrayBuffer);
      setPageCount(doc.getPageCount());
      setFile(selectedFile);
      setCurrentPage(1);
      setAnnotations([]);
      setShowResult(false);
      setOutputUrl(null);
    } catch (e) {
      toast.error('Failed to load PDF. It might be encrypted or corrupted.');
    }
  };

  const clearAll = () => {
    setFile(null); setPdfBytes(null); setPageCount(0); setCurrentPage(1);
    setAnnotations([]); setShowResult(false);
    if (outputUrl) { URL.revokeObjectURL(outputUrl); setOutputUrl(null); }
  };

  const addAnnotation = () => setAnnotations([...annotations, {
    type: selectedType, color: selectedColor, opacity: selectedOpacity,
    x: pos.x, y: pos.y, width: pos.w, height: pos.h,
  }]);

  const removeAnnotation = (index: number) => setAnnotations(annotations.filter((_, i) => i !== index));

  const applyAnnotations = async () => {
    if (!pdfBytes || !file) return;
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.load(pdfBytes);
      const pages = doc.getPages();
      for (const ann of annotations) {
        const page = pages[currentPage - 1]!;
        const { r, g, b } = hexToRgb(ann.color);
        const color = rgb(r, g, b);
        switch (ann.type) {
          case 'highlight':
            page.drawRectangle({ x: ann.x, y: ann.y, width: ann.width, height: ann.height, color, opacity: Math.min(ann.opacity, 0.3) });
            break;
          case 'underline':
            page.drawLine({ start: { x: ann.x, y: ann.y }, end: { x: ann.x + ann.width, y: ann.y }, color, thickness: 2 });
            break;
          case 'strikeout':
            page.drawLine({ start: { x: ann.x, y: ann.y + ann.height / 2 }, end: { x: ann.x + ann.width, y: ann.y + ann.height / 2 }, color, thickness: 2 });
            break;
          case 'rectangle':
            page.drawRectangle({ x: ann.x, y: ann.y, width: ann.width, height: ann.height, borderColor: color, borderWidth: 2 });
            break;
          case 'circle':
            page.drawEllipse({ x: ann.x + ann.width / 2, y: ann.y + ann.height / 2, xScale: ann.width / 2, yScale: ann.height / 2, borderColor: color, borderWidth: 2 });
            break;
          case 'arrow': {
            const endX = ann.x + ann.width;
            page.drawLine({ start: { x: ann.x, y: ann.y }, end: { x: endX, y: ann.y }, color, thickness: 2 });
            page.drawLine({ start: { x: endX, y: ann.y }, end: { x: endX - 10, y: ann.y - 10 }, color, thickness: 2 });
            page.drawLine({ start: { x: endX, y: ann.y }, end: { x: endX - 10, y: ann.y + 10 }, color, thickness: 2 });
          }
        }
      }
      const resultBytes = await doc.save();
      const blob = new Blob([new Uint8Array(resultBytes)], { type: 'application/pdf' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setShowResult(true);
      toast.success(`Applied ${annotations.length} annotation(s) successfully!`);
    } catch (e) {
      console.error(e);
      toast.error('An error occurred while applying annotations.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>PDF Annotator:</strong> Add highlights, underlines, strikeouts, shapes, and arrows to any PDF page — right in your browser.
        </div>
        <FileUploader accept="application/pdf" onFileSelect={handleFileSelect} title="Upload PDF to Annotate" subtitle="Drag & drop your document here" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} Pages</p>
        </div>
        <button onClick={clearAll} className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Annotation Settings</h4>
          <div>
            <label className="text-xs text-[var(--text-secondary)] font-medium mb-1.5 block">Page</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="px-3 py-1.5 text-xs bg-[var(--bg-surface)] rounded-lg disabled:opacity-30">−</button>
              <span className="text-sm font-bold text-[var(--text-primary)] min-w-[3rem] text-center">{currentPage} / {pageCount}</span>
              <button onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage >= pageCount} className="px-3 py-1.5 text-xs bg-[var(--bg-surface)] rounded-lg disabled:opacity-30">+</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] font-medium mb-1.5 block">Annotation Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button key={t.key} onClick={() => setSelectedType(t.key)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-all border ${selectedType === t.key ? 'bg-[var(--accent-ink)] border-[var(--accent)] text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-[var(--accent)]'}`}
                >{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] font-medium mb-1.5 block">Color</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SWATCHES.map((c) => (
                <button key={c} onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full border-2 ${selectedColor === c ? 'border-[var(--accent)] scale-110' : 'border-transparent'} transition-all`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Hex:</span>
              <input aria-label="Color" type="text" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs font-mono border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-surface)] rounded-lg text-[var(--text-primary)]" placeholder="#FF0000" />
              <div className="w-7 h-7 rounded border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]" style={{ backgroundColor: selectedColor }} />
            </div>
          </div>
          <div>
            <label htmlFor="lbl-pdfannotator-opacity-selectedopacity-tofixed-1" className="text-xs text-[var(--text-secondary)] font-medium mb-1.5 block">Opacity: {selectedOpacity.toFixed(1)}</label>
            <input id="lbl-pdfannotator-opacity-selectedopacity-tofixed-1" type="range" min="0.1" max="1" step="0.1" value={selectedOpacity} aria-label={`Opacity: ${selectedOpacity.toFixed(1)}`}
              onChange={(e) => setSelectedOpacity(parseFloat(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'X', val: pos.x, set: (v: number) => setPos(p => ({ ...p, x: v })) },
              { label: 'Y', val: pos.y, set: (v: number) => setPos(p => ({ ...p, y: v })) },
              { label: 'Width', val: pos.w, set: (v: number) => setPos(p => ({ ...p, w: v })) },
              { label: 'Height', val: pos.h, set: (v: number) => setPos(p => ({ ...p, h: v })) },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs text-[var(--text-secondary)] font-medium mb-1 block">{f.label}</label>
                <input type="number" value={f.val} aria-label={f.label} onChange={(e) => f.set(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-xs border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-surface)] rounded-lg text-[var(--text-primary)]" />
              </div>
            ))}
          </div>
          <button onClick={addAnnotation}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-medium py-2.5 rounded-xl text-sm transition-all active:scale-95"
          >Add Annotation</button>
          {annotations.length > 0 && (
            <div>
              <label className="text-xs text-[var(--text-secondary)] font-medium mb-1.5 block">Annotations ({annotations.length})</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {annotations.map((ann, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[var(--bg-overlay)]/50 p-2 rounded-lg border border-[var(--border-subtle)]">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ann.color }} />
                    <span className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)] flex-1 truncate">{ann.type} (x:{ann.x} y:{ann.y})</span>
                    <button onClick={() => removeAnnotation(i)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-bold px-1.5">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={applyAnnotations} disabled={isProcessing || annotations.length === 0}
            className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >{isProcessing ? 'Applying...' : 'Apply & Download'}</button>
        </div>
        <div className="space-y-6">
          {showResult && outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Annotations Applied</h4>
              </div>
              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-bold text-center">annotated_{file.name}</p>
              </div>
              <button onClick={() => downloadOrShare(outputUrl, `annotated_${file.name}`)}
                className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Annotated PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <p>Annotated PDF will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
