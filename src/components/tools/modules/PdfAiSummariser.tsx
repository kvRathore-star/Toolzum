"use client";
import React, { useState } from 'react';
import { FileText, Upload, Crown, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '../AiSettings';
import Link from 'next/link';
import { getErrorMessage } from '@/utils/error';
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';

const FREE_PAGE_LIMIT = 3;

export default function PdfAiSummariser() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { generateCompletion } = useAiProvider();
  const [usage, setUsage] = useState(0);
  const [showFullText, setShowFullText] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('pdfSummaryUsage');
    let currentUsage = 0;
    if (stored) {
      try { const { date, count } = JSON.parse(stored); currentUsage = date === today ? count : 0; }
      catch { currentUsage = 0; }
    }
    if (currentUsage >= FREE_PAGE_LIMIT) { toast.error(`You've used all ${FREE_PAGE_LIMIT} free summaries today. Upgrade to Pro for unlimited.`); return; }

    setFile(f);
    setSummary('');
    setExtractedText('');
    setIsExtracting(true);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      setPageCount(totalPages);
      
      if (totalPages > FREE_PAGE_LIMIT && currentUsage >= FREE_PAGE_LIMIT) {
        toast.error(`Free tier: ${FREE_PAGE_LIMIT} pages max. This PDF has ${totalPages} pages.`);
        setIsExtracting(false);
        return;
      }

      const pagesToRead = Math.min(totalPages, FREE_PAGE_LIMIT);
      let fullText = '';
      for (let i = 1; i <= pagesToRead; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      setExtractedText(fullText);
      
      const newUsage = currentUsage + 1;
      localStorage.setItem('pdfSummaryUsage', JSON.stringify({ date: today, count: newUsage }));
      setUsage(newUsage);
      
      toast.success(`Extracted ${pagesToRead} of ${totalPages} pages`);
    } catch (e) {
      toast.error('Failed to extract PDF text. Ensure the PDF is not scanned/image-only.');
    } finally { setIsExtracting(false); }
  };

  const handleSummarize = async () => {
    if (!extractedText.trim()) { toast.error('Extract PDF text first'); return; }
    setIsSummarizing(true);
    try {
      const prompt = `Summarize the following text in 5 key bullet points. Be concise and capture the main ideas:\n\n${extractedText.substring(0, 8000)}`;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.3);
      setSummary(response);
      toast.success('Summary generated!');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to generate summary'));
    } finally { setIsSummarizing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <AiPrivacyBanner />
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">PDF AI Summariser</h2>
              <p className="text-sm text-[var(--text-secondary)]">Upload a PDF and get an AI-generated 5-point summary</p>
            </div>
          </div>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
        </div>

        <div className="flex items-center justify-between bg-[var(--bg-overlay)]/50 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-secondary)]">Free: {FREE_PAGE_LIMIT} pages/summary · Pro: unlimited pages, multi-doc comparison</p>
        </div>

        <AiSettings />

        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer relative text-center">
            <input type="file" accept="application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-[var(--text-secondary)] flex flex-col items-center">
              <Upload className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" />
              Select PDF File
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
              <div>
                <div className="font-semibold text-[var(--text-primary)]">{file.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</div>
              </div>
              <button onClick={() => { setFile(null); setExtractedText(''); setSummary(''); }} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>

            {isExtracting && (
              <div className="text-center py-6 flex items-center justify-center gap-2 text-[var(--text-secondary)]">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <span className="text-sm">Extracting text from PDF...</span>
              </div>
            )}

            {extractedText && !isExtracting && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Extracted Text ({extractedText.length} chars)</h4>
                  <button onClick={() => setShowFullText(!showFullText)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                    {showFullText ? 'Collapse' : 'Show full text'}
                  </button>
                </div>
                <div className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] p-4 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-zinc-600 dark:text-[var(--text-muted)] whitespace-pre-wrap font-sans leading-relaxed">
                    {showFullText ? extractedText : extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '')}
                  </pre>
                </div>

                {!summary && (
                  <button onClick={handleSummarize} disabled={isSummarizing}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg">
                    {isSummarizing ? <><Loader2 className="w-5 h-5 animate-spin" /> Summarizing...</> : <><Sparkles className="w-5 h-5" /> Generate AI Summary (5 bullet points)</>}
                  </button>
                )}

                {summary && (
                  <div className="space-y-4 border-t border-[var(--border-subtle)] pt-6 animate-in fade-in duration-300">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" /> AI Summary
                    </h3>
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-5">
                      <pre className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">{summary}</pre>
                    </div>
                    <button onClick={() => { setSummary(''); setExtractedText(''); setFile(null); }}
                      className="w-full py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold rounded-xl text-xs transition-colors">
                      Summarize Another PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Unlimited pages per PDF, summarize multi-document comparisons, export summaries as PDF/CSV, save summary history, process scanned/image PDFs with OCR.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-[var(--accent)] dark:text-[var(--accent)] underline shrink-0 ml-4">Upgrade →</Link>
        </div>
      </div>
    </div>
  );
}
