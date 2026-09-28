"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { createWorker, type Worker, type LoggerMessage } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '@/lib/pdfjsWorker';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { isLowEndDevice } from '@/lib/device';

setupPdfWorker(pdfjsLib);

export default function PdfOcr() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  
  const [language, setLanguage] = useState('eng');

  const handleFileSelect = (f: File) => {
    setFile(f);
    setExtractedText('');
    setProgress(0);
  };

  const processOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setExtractedText('');
    
    let worker: Worker | null = null;
    
    try {
      setStatusText('Initializing OCR Engine...');
      if (isLowEndDevice()) {
        toast.loading('OCR engine is large — this may take a while on your device…', { id: 'ocr-engine-slow' });
      }
      worker = await createWorker(undefined, undefined, {
        logger: (m: LoggerMessage) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        }
      });
      await worker.reinitialize(language);

      let fullText = '';
      
      if (file.type.includes('pdf')) {
        setStatusText('Parsing PDF pages...');
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const totalPages = pdf.numPages;

        for (let i = 1; i <= totalPages; i++) {
          setStatusText(`Processing page ${i} of ${totalPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          
          const imageData = canvas.toDataURL('image/png');
          const { data: { text } } = await worker.recognize(imageData);
          fullText += `\n\n--- Page ${i} ---\n\n` + text;
          
          setProgress(Math.round((i / totalPages) * 100));
        }
      } else {
        // Direct image upload
        setStatusText('Processing Image...');
        const { data: { text } } = await worker.recognize(file);
        fullText = text;
      }

      setExtractedText(fullText.trim());
      setStatusText('Complete!');
      toast.success('OCR Complete!');
    } catch (e) {
      console.error('OCR failed', e);
      toast.error('Failed to run OCR processing.');
      setStatusText('Error occurred');
    } finally {
      if (worker) {
        await worker.terminate();
      }
      toast.dismiss('ocr-engine-slow');
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (await clipboardWrite(extractedText)) toast.success('Copied to clipboard!'); else toast.error('Copy blocked by the browser — select the text manually.');
    } catch (err) {
      toast.error('Failed to copy text.');
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Secure Local OCR:</strong> Extract text from scanned documents using WebAssembly. Processing happens entirely on your device.
        </div>
        <FileUploader 
          accept="application/pdf,image/*" 
          onFileSelect={handleFileSelect} 
          title="Upload Scanned PDF or Image"
          subtitle="Supports PDF, JPG, PNG"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <div className="flex items-center gap-4">
          {!isProcessing && !extractedText && (
            <select aria-label="OCR language" 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] text-sm"
            >
              <option value="eng">English</option>
              <option value="hin">Hindi</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
            </select>
          )}
          <button 
            onClick={() => { setFile(null); setExtractedText(''); }}
            disabled={isProcessing}
            className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg disabled:opacity-50"
          >
            Start Over
          </button>
        </div>
      </div>

      {!extractedText && (
        <div className="space-y-6">
          <p className="text-[var(--text-primary)] text-center text-lg">
            Ready to extract text. Note that processing multi-page PDFs locally may take a few moments depending on your device speed.
          </p>
          
          <button 
            onClick={processOcr}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-[var(--accent-ink)] to-[var(--accent-ink)] hover:from-[var(--accent-ink)] hover:to-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
          >
            {isProcessing && (
              <div 
                className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            )}
            <span className="relative z-10">
              {isProcessing ? `${statusText} (${Math.round(progress)}%)` : "Start OCR Extraction"}
            </span>
          </button>
        </div>
      )}

      {extractedText && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-bold text-[var(--accent)]">Extracted Text</h4>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-lg text-sm transition-colors"
              >
                Copy Text
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([extractedText], { type: 'text/plain' });
                  downloadOrShare(URL.createObjectURL(blob), `ocr_${file.name}.txt`);
                }}
                className="px-4 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white rounded-lg text-sm transition-colors"
              >
                Download .txt
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-black border border-emerald-500/30 rounded-2xl p-6 shadow-xl h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-[var(--text-primary)] leading-relaxed text-sm">
              {extractedText}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
