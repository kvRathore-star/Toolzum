"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '@/lib/pdfjsWorker';
import { FileText, Languages, Download, Copy, Check, ArrowRight, Globe, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '@/utils/error';
import { clipboardWrite } from "@/lib/clipboard";


setupPdfWorker(pdfjsLib);

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ko', name: 'Korean' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'sv', name: 'Swedish' },
  { code: 'el', name: 'Greek' },
];

export default function TranslatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      setIsProcessing(true);
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => 'str' in item ? item.str : '').join(' ');
        fullText += pageText + '\n\n';
      }
      setExtractedText(fullText.trim());
      setFile(selectedFile);
      setTranslatedText('');
      setCopied(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to extract text from PDF. The file may be scanned or image-based.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setExtractedText('');
    setTranslatedText('');
    setSourceLang('auto');
    setTargetLang('en');
    setOutputUrl(null);
  };

  const handleTranslate = async () => {
    if (!extractedText.trim()) {
      toast.error("No text to translate.");
      return;
    }

    setIsTranslating(true);
    try {
      // MyMemory caps a request at 5000 chars — say so when cutting, or
      // the user believes all 20 pages were translated.
      const wasTruncated = extractedText.length > 5000;
      const text = extractedText.slice(0, 5000);
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`, { signal: AbortSignal.timeout(25000) });
      const data: { responseStatus: number; responseData: { translatedText: string }; responseDetails?: string } = await res.json();
      if (data.responseStatus === 200) {
        setTranslatedText(data.responseData.translatedText);
        toast.success(wasTruncated ? `Translation complete — first 5000 of ${extractedText.length} characters (API limit).` : "Translation complete!");
      } else {
        throw new Error(data.responseDetails || "Translation failed");
      }
    } catch (e: unknown) {
      console.error(e);
      toast.error(getErrorMessage(e, "Translation failed. Please try again."));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await clipboardWrite(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `translated_${file?.name?.replace(/\.pdf$/i, '') || 'document'}.txt`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm flex items-center gap-2">
          <Globe className="w-5 h-5 flex-shrink-0" />
          <span><strong>PDF Text Translation:</strong> Extract text from any PDF and translate it into 20+ languages using MyMemory API.</span>
        </div>
        <FileUploader 
          accept="application/pdf"
          onFileSelect={handleFileSelect} 
          title="Upload PDF to Translate"
          subtitle="Extract text and translate into any language"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[var(--accent)]" />
          <div>
            <h3 className="font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)]">{file.name}</h3>
            <p className="text-[var(--text-secondary)] text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button 
          onClick={clearAll}
          className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] px-3 py-2 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
        >
          Change File
        </button>
      </div>

      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm flex items-center gap-2">
        <Globe className="w-5 h-5 flex-shrink-0" />
        <span>Free API translation via MyMemory — limited to 5000 characters per request. Accuracy may vary. For sensitive documents, review translations manually.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl">
            <h4 className="text-[var(--text-primary)] font-medium text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent)]" />
              Extracted Text
              {isProcessing && <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent)] ml-auto" />}
            </h4>
            <textarea aria-label="Extracted text"
              readOnly
              value={extractedText}
              placeholder="Text extracted from PDF will appear here..."
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] text-sm resize-none"
              rows={12}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl">
            <h4 className="text-[var(--text-primary)] font-medium text-sm mb-3 flex items-center gap-2">
              <Languages className="w-4 h-4 text-[var(--accent)]" />
              Translation
            </h4>
            <textarea aria-label="Translation"
              readOnly
              value={translatedText}
              placeholder="Translated text will appear here..."
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] text-sm resize-none"
              rows={12}
            />
            {translatedText && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-[var(--accent)]" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download .txt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="lbl-translatepdf-source-language" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Source Language
            </label>
            <select id="lbl-translatepdf-source-language" aria-label="Source Language"
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
            >
              <option value="auto">Auto Detect</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-center pb-3">
            <ArrowRight className="w-6 h-6 text-[var(--text-muted)]" />
          </div>

          <div className="space-y-2">
            <label htmlFor="lbl-translatepdf-target-language" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
              <Languages className="w-3 h-3" />
              Target Language
            </label>
            <select id="lbl-translatepdf-target-language" aria-label="Target Language"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !extractedText.trim()}
          className="w-full mt-5 bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isTranslating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4" />
              Translate
            </>
          )}
        </button>
      </div>
    </div>
  );
}
