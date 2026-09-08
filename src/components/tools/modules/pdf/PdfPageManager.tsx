"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PDFDocument, degrees } from 'pdf-lib';
import { FileText, Download, Crop, Move, Scissors, RotateCw, Trash2 } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { createDownloadBlob } from '@/utils/blob';

type Tab = 'crop' | 'organize' | 'extract' | 'rotate' | 'delete';

export default function PdfPageManager() {
  const [tab, setTab] = useState<Tab>('organize');
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  // Crop
  const [margin, setMargin] = useState(20);

  // Organize
  const [pages, setPages] = useState<number[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Extract
  const [pageRange, setPageRange] = useState('');

  // Rotate
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);

  // Delete
  const [deleteRange, setDeleteRange] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setOutputUrl(null);
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setTotalPages(count);
      setFileBuffer(buf);
      setPages(Array.from({ length: count }, (_, i) => i));
      await doc.save();
    } catch {
      toast.error('Failed to read PDF');
      setFile(null);
    }
  };

  const parseRange = (input: string, max: number): number[] => {
    const set = new Set<number>();
    for (const part of input.split(',').map(p => p.trim())) {
      if (part.includes('-')) {
        const [s, e] = part.split('-').map(Number);
        if (!isNaN(s) && !isNaN(e) && s <= e) for (let i = s; i <= e; i++) { if (i >= 1 && i <= max) set.add(i - 1); }
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= max) set.add(n - 1);
      }
    }
    return Array.from(set);
  };

  // --- Crop ---
  const processCrop = async () => {
    if (!fileBuffer || !file) return;
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.load(fileBuffer);
      doc.getPages().forEach(p => { const { width, height } = p.getSize(); p.setCropBox(margin, margin, width - margin * 2, height - margin * 2); });
      const bytes = await doc.save();
      const blob = createDownloadBlob(bytes, 'application/pdf');
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, file.name.replace('.pdf', '_cropped.pdf'));
      toast.success('PDF cropped!');
    } catch { toast.error('Failed to crop PDF'); } finally { setIsProcessing(false); }
  };

  // --- Organize ---
  const processOrganize = async () => {
    if (!fileBuffer || !file || pages.length === 0) return;
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.load(fileBuffer);
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(doc, pages);
      copied.forEach(p => newDoc.addPage(p));
      const bytes = await newDoc.save();
      const blob = createDownloadBlob(bytes, 'application/pdf');
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, file.name.replace('.pdf', '_reorganized.pdf'));
      toast.success('PDF reorganized!');
    } catch { toast.error('Failed to reorganize PDF'); } finally { setIsProcessing(false); }
  };

  const handleDragStart = (i: number) => { setDraggedIdx(i); };
  const handleDrop = (ti: number) => {
    if (draggedIdx === null || draggedIdx === ti) return;
    const p = [...pages]; const [m] = p.splice(draggedIdx, 1); p.splice(ti, 0, m);
    setPages(p); setDraggedIdx(null);
  };
  const handleRemove = (i: number) => { const p = [...pages]; p.splice(i, 1); setPages(p); };
  const movePage = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= pages.length) return;
    setPages((prev) => { const next = [...prev]; [next[from], next[to]] = [next[to], next[from]]; return next; });
  };

  // --- Extract ---
  const processExtract = async () => {
    if (!fileBuffer || !file || !pageRange.trim()) return toast.error('Enter page range');
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.load(fileBuffer);
      const idx = parseRange(pageRange, totalPages);
      if (idx.length === 0) { toast.error('Invalid range'); setIsProcessing(false); return; }
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(doc, idx);
      copied.forEach(p => newDoc.addPage(p));
      const bytes = await newDoc.save();
      const blob = createDownloadBlob(bytes, 'application/pdf');
      downloadOrShare(URL.createObjectURL(blob), file.name.replace('.pdf', '_extracted.pdf'));
      toast.success(`Extracted ${idx.length} pages!`);
    } catch { toast.error('Failed to extract'); } finally { setIsProcessing(false); }
  };

  // --- Rotate ---
  const processRotate = async () => {
    if (!fileBuffer || !file) return;
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.load(fileBuffer);
      doc.getPages().forEach(p => { p.setRotation(degrees(p.getRotation().angle + rotation)); });
      const bytes = await doc.save();
      const blob = createDownloadBlob(bytes, 'application/pdf');
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, file.name.replace('.pdf', '_rotated.pdf'));
      toast.success('PDF rotated!');
    } catch { toast.error('Failed to rotate'); } finally { setIsProcessing(false); }
  };

  // --- Delete ---
  const processDelete = async () => {
    if (!fileBuffer || !file) return;
    const toRemove = parseRange(deleteRange, totalPages);
    if (toRemove.length === 0) return toast.error('Enter valid pages to delete');
    if (toRemove.length === totalPages) return toast.error('Cannot delete all pages');
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.load(fileBuffer);
      const sorted = [...toRemove].sort((a, b) => b - a);
      for (const i of sorted) doc.removePage(i);
      const bytes = await doc.save();
      const blob = createDownloadBlob(bytes, 'application/pdf');
      downloadOrShare(URL.createObjectURL(blob), file.name.replace('.pdf', '_cleaned.pdf'));
      toast.success(`${toRemove.length} page(s) deleted!`);
    } catch { toast.error('Failed to delete pages'); } finally { setIsProcessing(false); }
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'crop', label: 'Crop', icon: <Crop className="w-3.5 h-3.5" /> },
    { key: 'organize', label: 'Organize', icon: <Move className="w-3.5 h-3.5" /> },
    { key: 'extract', label: 'Extract', icon: <Scissors className="w-3.5 h-3.5" /> },
    { key: 'rotate', label: 'Rotate', icon: <RotateCw className="w-3.5 h-3.5" /> },
    { key: 'delete', label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-700 dark:text-blue-400" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">PDF Page Manager</h3>
      </div>

      {!file ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-500/10 border-b border-blue-500/20 p-3 px-5 text-blue-700 dark:text-blue-400 text-xs"><strong>All-in-One PDF Page Tool:</strong> Crop, organize, extract, rotate, and delete pages.</div>
          <div className="p-5 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl m-5 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer text-center relative">
            <input type="file" accept="application/pdf" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
            <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-[var(--text-secondary)]">Click or drag PDF here</p>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-[var(--border-subtle)]">
            <div><h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{file.name}</h4><p className="text-[10px] text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} pages</p></div>
            <button onClick={() => { setFile(null); setOutputUrl(null); setFileBuffer(null); }} className="text-[10px] text-red-500 hover:underline">Change</button>
          </div>

          <div className="flex gap-1 bg-[var(--bg-overlay)] px-4 py-2.5 border-b border-[var(--border-subtle)] overflow-x-auto">
            {TABS.map(({ key, label, icon }) => (
              <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${tab === key ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-zinc-800 dark:hover:text-zinc-200'}`}>{icon} {label}</button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'crop' && (
              <div className="space-y-4">
                <p className="text-[10px] text-[var(--text-secondary)]">Remove white margins from all pages.</p>
                <div><label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Crop Margin (points): {margin}pt</label><input type="range" min="0" max="200" value={margin} onChange={e => setMargin(Number(e.target.value))} className="w-full mt-2 accent-blue-600" /></div>
                <button onClick={processCrop} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50">{isProcessing ? 'Processing...' : 'Crop & Download'}</button>
              </div>
            )}

            {tab === 'organize' && (
              <div className="space-y-4">
                <p className="text-[10px] text-[var(--text-secondary)]">Drag pages to reorder, or focus a page and use ← → arrow keys. Click × to remove.</p>
                <div role="listbox" aria-label="Pages. Press left or right arrow on a focused page to reorder it." className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-2 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
                  {pages.map((pn, i) => (
                    <div key={`${pn}-${i}`} draggable onDragStart={() => handleDragStart(i)} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(i)} onDragEnd={() => setDraggedIdx(null)}
                      role="option" tabIndex={0} aria-label={`Page ${pn + 1}. Press left or right arrow to reorder.`}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') { e.preventDefault(); movePage(i, -1); }
                        else if (e.key === 'ArrowRight') { e.preventDefault(); movePage(i, 1); }
                      }}
                      className={`flex flex-col items-center justify-center w-20 h-24 bg-white dark:bg-[var(--bg-surface)] border-2 ${draggedIdx === i ? 'border-dashed border-blue-400 opacity-50' : 'border-[var(--border-subtle)]'} rounded-lg shadow-sm cursor-move hover:border-blue-400 transition-colors group relative`}>
                      <button onClick={() => handleRemove(i)} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-5 h-5 text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      <FileText className="w-6 h-6 text-[var(--text-muted)] mb-1" /><span className="font-bold text-[10px]">Page {pn + 1}</span>
                    </div>
                  ))}
                  {pages.length === 0 && <p className="p-4 w-full text-center text-[10px] text-[var(--text-muted)]">All pages removed</p>}
                </div>
                <button onClick={processOrganize} disabled={isProcessing || pages.length === 0} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50">{isProcessing ? 'Processing...' : 'Apply & Download'}</button>
              </div>
            )}

            {tab === 'extract' && (
              <div className="space-y-4">
                <p className="text-[10px] text-[var(--text-secondary)]">Specify pages to extract (e.g. 1, 3, 5-10).</p>
                <input type="text" placeholder="1, 2-5, 8" value={pageRange} onChange={e => setPageRange(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
                <button onClick={processExtract} disabled={isProcessing || !pageRange.trim()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50">{isProcessing ? 'Processing...' : 'Extract & Download'}</button>
              </div>
            )}

            {tab === 'rotate' && (
              <div className="space-y-4">
                <p className="text-[10px] text-[var(--text-secondary)]">Rotate all pages in the document.</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{ l: 'Right 90°', v: 90 }, { l: 'Upside Down', v: 180 }, { l: 'Left 90°', v: 270 }].map(o => (
                    <button key={o.v} onClick={() => setRotation(o.v as any)} className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${rotation === o.v ? 'bg-blue-600 text-white border-blue-500' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>{o.l}</button>
                  ))}
                </div>
                <button onClick={processRotate} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50">{isProcessing ? 'Processing...' : 'Rotate & Download'}</button>
              </div>
            )}

            {tab === 'delete' && (
              <div className="space-y-4">
                <p className="text-[10px] text-[var(--text-secondary)]">Enter page numbers to delete (e.g. 1, 3, 5-10). Max: {totalPages}.</p>
                <input type="text" placeholder="1, 3, 5-10" value={deleteRange} onChange={e => setDeleteRange(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-red-500" />
                <button onClick={processDelete} disabled={isProcessing || !deleteRange.trim()} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50">{isProcessing ? 'Processing...' : 'Delete Pages & Download'}</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
        <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Batch process multiple PDFs at once, unlimited page count, OCR-powered page splitting, merge PDFs before organizing, cloud storage integration.</p>
      </div>
    </div>
  );
}
