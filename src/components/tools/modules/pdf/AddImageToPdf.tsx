"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';

export default function AddImageToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const [pageNum, setPageNum] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'png' | 'jpg' | null>(null);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(200);
  const [addToAllPages, setAddToAllPages] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [outputUrl, imageUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
      setFileBuffer(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
      setPageNum(1);
    } catch (e) {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;

    const isPng = imgFile.type === 'image/png';
    const isJpg = imgFile.type === 'image/jpeg' || imgFile.type === 'image/jpg';

    if (!isPng && !isJpg) {
      toast.error("Only PNG and JPG images are supported.");
      return;
    }

    setImageFile(imgFile);
    setImageType(isPng ? 'png' : 'jpg');
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(imgFile));
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setTotalPages(0);
    setImageFile(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setImageType(null);
    setPageNum(1);
  };

  const addImage = async () => {
    if (!fileBuffer || !file || !imageFile || !imageType) return;

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const imageBytes = await imageFile.arrayBuffer();
      const pages = addToAllPages ? pdfDoc.getPages() : [pdfDoc.getPages()[pageNum - 1]];

      let embeddedImage: any;
      if (imageType === 'png') {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      for (const page of pages) {
        page.drawImage(embeddedImage, { x, y, width, height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Image added to PDF!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while adding image to PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Add Image to PDF:</strong> Stamp logos, signatures, or graphics onto PDF pages. Supports PNG (with transparency) and JPEG images.
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF"
          subtitle="Select document to add image"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Image Settings</h4>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Target Page</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageNum}
                onChange={(e) => setPageNum(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">of {totalPages}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Image (PNG or JPG)</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer bg-[var(--bg-overlay)] hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
              <svg className="w-8 h-8 mb-2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-xs text-[var(--text-secondary)]">{imageFile ? imageFile.name : 'Click to select image'}</span>
              <input type="file" accept="image/png,image/jpeg" onChange={handleImageSelect} className="hidden" />
            </label>
          </div>

          {imageUrl && (
            <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
              <img src={imageUrl} alt="Preview" className="w-full h-40 object-contain" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">X Position</label>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Y Position</label>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Width (px)</label>
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 1)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Height (px)</label>
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 1)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addToAllPages}
              onChange={(e) => setAddToAllPages(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-[var(--text-primary)]">Add to all pages</span>
          </label>

          <button
            onClick={addImage}
            disabled={isProcessing || !imageFile}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {isProcessing ? "Processing..." : "Add Image to PDF"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Image Added</h4>
              </div>

              <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-bold text-center">stamped_{file.name}</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, `stamped_${file.name}`)}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p>Generated PDF will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
