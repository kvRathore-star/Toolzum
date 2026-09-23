"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

export default function AiChatPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string; confidence: number }[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const chunksRef = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Editor handoff: ?from=pdf-editor + IDB key written by the PDF editor's
  // "Ask doc" button. Consumed (deleted) on read so a stale file never
  // reappears on later visits.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('from') !== 'pdf-editor') return;
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const req = indexedDB.open('toolzum-handoff', 1);
          req.onupgradeneeded = () => req.result.createObjectStore('files');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        const row = await new Promise<{ bytes?: ArrayBuffer; name?: string } | null>((resolve, reject) => {
          const tx = db.transaction('files', 'readwrite');
          const store = tx.objectStore('files');
          const get = store.get('pdf-editor→chat');
          get.onsuccess = () => {
            const val = (get.result as typeof row) || null;
            try { store.delete('pdf-editor→chat'); } catch { /* ignore */ }
            resolve(val);
          };
          get.onerror = () => reject(get.error);
        });
        db.close();
        if (!row || !row.bytes || cancelled) return;
        const f = new File([row.bytes], row.name || 'document.pdf', { type: 'application/pdf' });
        setFile(f);
        toast.success('Document handed off from the PDF editor — analyzing…');
        await analyzeFile(f);
      } catch {
        /* no handoff — normal direct visit */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const extractPdfText = async (f: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    const arrayBuffer = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => 'str' in item ? item.str : '').join(' ') + '\n';
    }
    return text;
  };

  const chunkText = (text: string): string[] => {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    if (paragraphs.length > 0) return paragraphs;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.filter(s => s.trim().length > 10);
  };

  const searchAnswer = (query: string, chunks: string[]): { answer: string; confidence: number } => {
    const stopWords = new Set(['the','and','for','are','but','not','you','all','can','had','her','was','one','our','out','has','have','been','some','what','why','how','who','where','which','this','that','with','from','they','will','would','could','should','about','into','over','such','than','then','these','those','their','there','when','your','its','also','does','did','got','get','may','more','much','must','only','said','see','way','well']);
    const words = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    if (words.length === 0) return { answer: 'Please ask a more specific question with key terms.', confidence: 0 };

    let bestScore = 0;
    let bestChunk = '';
    for (const chunk of chunks) {
      const lower = chunk.toLowerCase();
      let matches = 0;
      for (const w of words) if (lower.includes(w)) matches++;
      const score = matches / words.length;
      if (score > bestScore) { bestScore = score; bestChunk = chunk; }
    }

    if (bestScore === 0) return { answer: 'No relevant information found in the document for your question.', confidence: 0 };

    const sentences = bestChunk.match(/[^.!?]+[.!?]+/g) || [bestChunk];
    let bestSent = '';
    let bestSentScore = 0;
    for (const sent of sentences) {
      const lower = sent.toLowerCase();
      let matches = 0;
      for (const w of words) if (lower.includes(w)) matches++;
      const score = words.length > 0 ? matches / words.length : 0;
      if (score > bestSentScore) { bestSentScore = score; bestSent = sent.trim(); }
    }
    return { answer: bestSent || bestChunk.substring(0, 400).trim(), confidence: Math.round(bestScore * 100) };
  };

  const handleFileSelect = (f: File) => setFile(f);

  const analyzeFile = async (f: File) => {
    setIsProcessing(true);
    try {
      const text = await extractPdfText(f);
      setPdfText(text);
      chunksRef.current = chunkText(text);
      setModelLoaded(true);
      toast.success(`Extracted ${text.length.toLocaleString()} characters from PDF`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to extract text from PDF. Ensure it is not scanned or image-only.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    await analyzeFile(file);
  };

  const handleAsk = async () => {
    if (!question.trim() || !modelLoaded) return;
    const q = question.trim();
    setQuestion('');
    setIsLoading(true);
    try {
      const { answer: ans, confidence: conf } = searchAnswer(q, chunksRef.current);
      setAnswer(ans);
      setConfidence(conf);
      setChatHistory(prev => [...prev, { question: q, answer: ans, confidence: conf }]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to process question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    setAnswer('');
    setConfidence(0);
    setQuestion('');
    toast.success('Chat cleared');
  };

  const handleNewFile = () => {
    setFile(null);
    setPdfText('');
    setQuestion('');
    setAnswer('');
    setConfidence(0);
    setChatHistory([]);
    setModelLoaded(false);
    setShowFullText(false);
  };

  const handleDownloadTranscript = async () => {
    const text = chatHistory.map((h, i) =>
      `Q${i + 1}: ${h.question}\nA: ${h.answer}\nConfidence: ${h.confidence}%\n---`
    ).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    await downloadOrShare(url, `chat-transcript-${Date.now()}.txt`);
  };

  if (!file || !modelLoaded) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>AI Chat with PDF:</strong> Upload a PDF and ask questions about its contents. All processing happens in your browser — no data is uploaded to any server.
        </div>

        {!file ? (
          <FileUploader
            accept="application/pdf"
            onFileSelect={(f) => setFile(f)}
            title="Upload PDF Document"
            subtitle="Browser-based processing — your file stays on your device"
          />
        ) : (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-700/20 text-[var(--accent)] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{file.name}</h3>
              <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-3 text-left text-xs text-[var(--accent)] space-y-2">
              <p className="font-semibold">Browser-Based AI Processing</p>
              <p>This tool uses a local text search engine that runs entirely in your browser. For full AI-powered Q&A, optionally install a local transformer model (e.g., DistilBERT) via your package manager &mdash; no API key required.</p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? 'Extracting Text...' : 'Analyze Document'}
            </button>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto h-[800px] flex flex-col">
      <div className="bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-emerald-700/20 text-[var(--accent)] rounded-lg shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[var(--text-primary)] truncate">{file.name}</h3>
            <p className="text-[var(--accent)] text-xs truncate">{pdfText.length.toLocaleString()} chars extracted</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFullText(!showFullText)}
            className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
          >
            {showFullText ? 'Hide Text' : 'Show Text'}
          </button>
          <button
            onClick={handleNewFile}
            className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
          >
            New Document
          </button>
        </div>
      </div>

      {showFullText && (
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-xl p-4 max-h-48 overflow-y-auto shrink-0">
          <pre className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)] whitespace-pre-wrap font-sans leading-relaxed">
            {pdfText.length > 500 ? pdfText.substring(0, 500) + '...' : pdfText}
          </pre>
        </div>
      )}

      <div className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md space-y-3">
              <div className="w-16 h-16 bg-emerald-700/10 text-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] font-medium">Ask a question about your document</p>
              <p className="text-sm text-[var(--text-muted)]">Type your question below and get answers extracted directly from the PDF text.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto space-y-4" ref={scrollRef}>
            {chatHistory.map((entry, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-emerald-700 text-white rounded-2xl rounded-br-sm p-4">
                    <div className="whitespace-pre-wrap leading-relaxed">{entry.question}</div>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-[var(--bg-surface)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl rounded-bl-sm p-4 shadow-lg">
                    <div className="whitespace-pre-wrap leading-relaxed mb-2">{entry.answer}</div>
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <div className="flex-1 h-1.5 bg-[var(--bg-overlay)] dark:bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            entry.confidence >= 70 ? 'bg-emerald-700' : entry.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${entry.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] shrink-0">
                        {entry.confidence}% match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl rounded-bl-sm p-4 shadow-lg flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-black/40 border-t border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
          {chatHistory.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleClearChat}
                className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
              >
                Clear Chat
              </button>
              <button
                onClick={handleDownloadTranscript}
                className="text-xs text-[var(--text-secondary)] hover:text-emerald-500 transition-colors px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
              >
                Download Transcript
              </button>
            </div>
          )}
          <div className="relative flex items-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-inner focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
            <textarea aria-label="Ask a question about your document..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Ask a question about your document..."
              className="flex-1 bg-transparent p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-[var(--text-primary)] resize-none max-h-32 min-h-[56px] leading-relaxed"
              rows={1}
            />
            <div className="pr-4 shrink-0">
              <button
                onClick={handleAsk}
                disabled={!question.trim() || isLoading}
                className="bg-[var(--accent-ink)] hover:opacity-90 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-emerald-700 shadow-lg active:scale-95"
                aria-label="Ask"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
