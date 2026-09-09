"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, rgb } from 'pdf-lib';

let nextId = 1;
const genId = () => `bm-${nextId++}`;

interface Bookmark {
  id: string;
  title: string;
  page: number;
  parentId: string | null;
}

export default function BookmarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState('');
  const [page, setPage] = useState(1);
  const [parentId, setParentId] = useState<string | null>(null);
  const [bulkInput, setBulkInput] = useState('');
  const [showBulk, setShowBulk] = useState(false);
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
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
      setFileBuffer(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
      setBookmarks([]);
    } catch {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setTotalPages(0);
    setBookmarks([]);
  };

  const addBookmark = () => {
    if (!title.trim()) {
      toast.error("Please enter a bookmark title.");
      return;
    }
    if (page < 1 || page > totalPages) {
      toast.error(`Page must be between 1 and ${totalPages}.`);
      return;
    }
    setBookmarks(prev => [...prev, { id: genId(), title: title.trim(), page, parentId }]);
    setTitle('');
    setPage(1);
    setParentId(null);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id && b.parentId !== id));
  };

  const parseBulkImport = () => {
    const lines = bulkInput.trim().split('\n');
    if (!lines.length) { toast.error("Paste bookmark entries first."); return; }
    const newBookmarks: Bookmark[] = [];
    const stack: { id: string; depth: number }[] = [];

    for (const raw of lines) {
      const trimmed = raw.trimEnd();
      const indent = raw.length - trimmed.length;
      const depth = Math.floor(indent / 2);
      const parts = trimmed.split('\t');
      const lastPart = parts[parts.length - 1]?.trim() || '';
      const pageNum = parseInt(lastPart, 10);
      const titleParts = isNaN(pageNum) ? parts : parts.slice(0, -1);
      const bmTitle = titleParts.join(' ').trim();
      if (!bmTitle || isNaN(pageNum) || pageNum < 1) continue;
      while (stack.length && stack[stack.length - 1]!.depth >= depth) stack.pop();
      const parent = stack.length ? stack[stack.length - 1]!.id : null;
      const id = genId();
      newBookmarks.push({ id, title: bmTitle, page: pageNum, parentId: parent });
      stack.push({ id, depth });
    }

    if (!newBookmarks.length) {
      toast.error("No valid bookmarks found. Use tab-indented lines with title and page.");
      return;
    }

    setBookmarks(prev => [...prev, ...newBookmarks]);
    setBulkInput('');
    setShowBulk(false);
    toast.success(`Imported ${newBookmarks.length} bookmark${newBookmarks.length > 1 ? 's' : ''}.`);
  };

  const renderTree = (parent: string | null, depth: number): React.ReactNode => {
    const items = bookmarks.filter(b => b.parentId === parent);
    if (!items.length) return null;
    return items.map(bm => (
      <React.Fragment key={bm.id}>
        <div className="flex items-center gap-2 py-1.5 group rounded-lg transition-colors" style={{ paddingLeft: 8 + depth * 20 }}>
          <span className={`flex-1 text-sm truncate ${depth === 0 ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-[var(--text-muted)]'}`}>
            {bm.title}
            <span className="text-[var(--text-muted)] ml-1.5 text-xs">p.{bm.page}</span>
          </span>
          <button onClick={() => removeBookmark(bm.id)} className="opacity-0 group-hover:opacity-100 text-red-700 dark:text-red-400 hover:text-red-500 text-xs p-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {renderTree(bm.id, depth + 1)}
      </React.Fragment>
    ));
  };

  const applyBookmarks = async () => {
    if (!fileBuffer || !file) return;
    if (!bookmarks.length) { toast.error("Add at least one bookmark first."); return; }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const bold = await pdfDoc.embedFont('Helvetica-Bold');
      const regular = await pdfDoc.embedFont('Helvetica');

      const tocPage = pdfDoc.addPage([612, 792]);
      const { width, height } = tocPage.getSize();

      tocPage.drawText('Table of Contents', { x: 50, y: height - 60, size: 24, color: rgb(0, 0, 0), font: bold });
      tocPage.drawLine({ start: { x: 50, y: height - 75 }, end: { x: width - 50, y: height - 75 }, thickness: 1.5, color: rgb(0.2, 0.2, 0.2) });

      const flatten = (parent: string | null, indent: number): { title: string; page: number; indent: number }[] =>
        bookmarks.filter(b => b.parentId === parent).flatMap(bm => [{ title: bm.title, page: bm.page, indent }, ...flatten(bm.id, indent + 1)]);

      const entries = flatten(null, 0);
      let y = height - 110;

      for (const bm of entries) {
        if (y < 60) break;
        const x = 50 + bm.indent * 20;
        const isBold = bm.indent === 0;
        const font = isBold ? bold : regular;
        const size = isBold ? 14 : 12;
        tocPage.drawText(bm.title, { x, y, size, color: rgb(0.1, 0.1, 0.8), font });
        const tw = font.widthOfTextAtSize(bm.title, size);
        tocPage.drawText(`${bm.page + 1}`, { x: Math.max(x + tw + 8, x + 220), y, size: 12, color: rgb(0.4, 0.4, 0.4), font: regular });
        y -= 22;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(`TOC added with ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}.`);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while generating bookmarks.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>PDF Bookmarks:</strong> Add, edit, or remove bookmarks. A Table of Contents page will be added as the first page.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF to Add Bookmarks"
          subtitle="Drag & drop your document here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} Pages</p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit max-h-[700px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h4 className="text-[var(--text-primary)] font-medium">Bookmarks</h4>
            <button
              onClick={() => { setShowBulk(!showBulk); setBulkInput(''); }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showBulk ? 'Add Single' : 'Bulk Import'}
            </button>
          </div>

          {showBulk ? (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-secondary)]">Tab-indented list: title (tab) page number</p>
              <textarea aria-label="Tab-indented list: title (tab) page number"
                value={bulkInput}
                onChange={e => setBulkInput(e.target.value)}
                className="w-full h-28 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3 text-sm text-zinc-900 dark:text-zinc-100 resize-none focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                placeholder="Chapter 1\t3&#10;&#9;Section 1.1\t5&#10;&#9;&#9;Subsection 1.1.1\t7&#10;Chapter 2\t10"
              />
              <button
                onClick={parseBulkImport}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm"
              >
                Import Bookmarks
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input aria-label="Import Bookmarks"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Bookmark title"
                  className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/30"
                />
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={page}
                  onChange={e => setPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-2 py-2 text-sm text-center text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/30"
                  title="Page number"
                />
              </div>
              <select aria-label="Parent bookmark"
                value={parentId || ''}
                onChange={e => setParentId(e.target.value || null)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              >
                <option value="">— Top Level —</option>
                {bookmarks.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
              <button
                onClick={addBookmark}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm"
              >
                Add Bookmark
              </button>
            </div>
          )}

          {bookmarks.length > 0 && (
            <div className="border-t border-[var(--border-subtle)] pt-4 space-y-0.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-secondary)]">{bookmarks.length} bookmark{bookmarks.length > 1 ? 's' : ''}</p>
                <button
                  onClick={() => setBookmarks([])}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  Clear All
                </button>
              </div>
              {renderTree(null, 0)}
            </div>
          )}

          <button
            onClick={applyBookmarks}
            disabled={isProcessing || bookmarks.length === 0}
            className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Generating...
              </>
            ) : (
              'Apply Bookmarks'
            )}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Bookmarks Applied</h4>
              </div>
              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                <p className="font-bold text-center">bookmarked_{file.name}</p>
              </div>
              <button
                onClick={() => downloadOrShare(outputUrl, `bookmarked_${file.name}`)}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download New PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              <p>Generated PDF with TOC will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
