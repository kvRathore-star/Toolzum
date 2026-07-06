"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';
import heic2any from 'heic2any';
import { FileText, Download, UploadCloud } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';

export default function HeicToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  const processConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    toast.loading('Converting HEIC to PDF...', { id: 'heic' });

    try {
      const blobResult = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      const finalBlob = Array.isArray(blobResult) ? blobResult[0] : blobResult;
      const jpgBuffer = await finalBlob.arrayBuffer();

      const pdfDoc = await PDFDocument.create();
      const image = await pdfDoc.embedJpg(jpgBuffer);
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

      const pdfBytes = await pdfDoc.save();
      const outBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(outBlob);
      downloadOrShare(url, file.name.replace(/\.(heic|heif)$/i, '.pdf'));
      toast.success('HEIC to PDF done!', { id: 'heic' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to convert. Ensure it is a valid HEIC/HEIF file.', { id: 'heic' });
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">HEIC to PDF Converter</h3>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Convert iPhone HEIC/HEIF photos to PDF for document submission — Aadhaar, PAN, NSDL, job applications, and government portals.</p>

        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
          <input type="file" accept=".heic,.heif" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          {file ? (
            <div className="flex flex-col items-center"><FileText className="w-12 h-12 text-emerald-500 mb-2" /><span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</span><span className="text-[10px] text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span></div>
          ) : (
            <div className="text-zinc-500 flex flex-col items-center"><FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-2" />Click or Drop HEIC Here</div>
          )}
        </div>

        {file && (
          <button onClick={processConvert} disabled={isProcessing}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
            <Download className="w-4 h-4" />{isProcessing ? 'Converting...' : 'Convert to PDF'}
          </button>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
          <p className="text-[10px] text-amber-600 dark:text-amber-400"><strong>India Use:</strong> iPhone users — convert HEIC photos to PDF for Aadhaar, PAN card, Voter ID, and other government document uploads that require PDF format. Works entirely offline in your browser.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Batch convert multiple HEIC photos into a single PDF, combine HEIC with other formats, compress output PDF for email-friendly sizes.</p>
        </div>
      </div>
    </div>
  );
}
