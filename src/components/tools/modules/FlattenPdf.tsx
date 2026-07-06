"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, Layers } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';

export default function FlattenPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  const processFlatten = async () => {
    if (!file) return;
    setIsProcessing(true);
    toast.loading('Flattening PDF...', { id: 'flatten' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const form = pdfDoc.getForm();
      form.flatten();

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      downloadOrShare(url, file.name.replace('.pdf', '_flattened.pdf'));
      toast.success('PDF Flattened Successfully!', { id: 'flatten' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to flatten PDF. Ensure it is a valid PDF file.', { id: 'flatten' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Flatten PDF Forms</h3>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Make interactive PDF forms, annotations, and layers permanent and uneditable. All processing happens locally in your browser.</p>

        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
          <input type="file" accept="application/pdf" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          {file ? (
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-red-500 mb-2" />
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</span>
              <span className="text-[10px] text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          ) : (
            <div className="text-zinc-500 flex flex-col items-center">
               <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-2" />
               Click or Drag PDF Here
            </div>
          )}
        </div>

        {file && (
          <button onClick={processFlatten} disabled={isProcessing}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
            <Download className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Flatten & Download PDF'}
          </button>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Batch flatten multiple PDFs at once — upload a folder of PDF forms and flatten them all in one click.</p>
        </div>
      </div>
    </div>
  );
}
