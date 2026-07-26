"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { toast } from 'react-hot-toast';

export default function AiDocumentChat() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [documentText, setDocumentText] = useState<string>('');

  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const extractTextFromFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    if (file.type === 'application/pdf') {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text.slice(0, 15000);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.slice(0, 15000);
    } else if (file.type === 'text/plain') {
      return new TextDecoder().decode(uint8Array).slice(0, 15000);
    }
    throw new Error('Unsupported file type');
  };

  const processDocument = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const text = await extractTextFromFile(file);
      setDocumentText(text);
      setIsDocumentReady(true);
      setMessages([
        { role: 'ai', content: `Document "${file.name}" processed. I've extracted ${text.length} characters of text. You can now ask questions about its content.\n\nNote: This is a simplified chat - the entire document text is sent with each question (no vector search). For production RAG, a vector database would be needed.` }
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to process document');
      setMessages([
        { role: 'ai', content: `Error processing document: ${err instanceof Error ? err.message : 'Unknown error'}` }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const systemPrompt = documentText 
        ? `You are a helpful assistant answering questions about a document. Here is the document content:\n\n${documentText}\n\nAnswer the user's question based on this document. If the answer isn't in the document, say so.`
        : 'You are a helpful assistant.';

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ],
          temperature: 0.3
        })
      });

      if (!res.ok) throw new Error('AI request failed');
      const data: { content?: string } = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.content || 'No response' }]);
    } catch (err) {
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!file || !isDocumentReady) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
          <strong>AI Document Chat:</strong> Upload a PDF, DOCX, or TXT file and ask questions about its content. Uses Gemini AI with full document context (simplified RAG - no vector search).
        </div>
        
        {!file ? (
          <FileUploader 
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
            onFileSelect={(f) => setFile(f)} 
            title="Upload Document"
            subtitle="Supports PDF, DOCX, TXT (Max 50MB)"
          />
        ) : (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{file.name}</h3>
              <p className="text-zinc-600 dark:text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={processDocument}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? "Extracting Text..." : "Process & Chat"}
            </button>
            <button 
              onClick={() => setFile(null)}
              className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
      <div className="bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">{file.name}</h3>
            <p className="text-emerald-400 text-xs">Ready — {documentText.length} chars loaded</p>
          </div>
        </div>
        <button 
          onClick={() => { setFile(null); setIsDocumentReady(false); setMessages([]); setDocumentText(''); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          New Document
        </button>
      </div>

      <div className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        <div className="flex-1 p-6 overflow-y-auto space-y-6" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-sm' 
                  : 'bg-[var(--bg-surface)] border border-zinc-200 dark:border-[var(--border-subtle)] text-zinc-800 dark:text-zinc-200 rounded-bl-sm shadow-lg'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-surface)] border border-zinc-200 dark:border-[var(--border-subtle)] text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-bl-sm p-4 shadow-lg flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-zinc-200 dark:border-[var(--border-subtle)]">
          <div className="relative flex items-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-inner focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask a question about ${file.name}...`}
              className="flex-1 bg-transparent p-4 outline-none text-zinc-800 dark:text-zinc-200 resize-none max-h-32 min-h-[56px] leading-relaxed"
              rows={1}
            />
            <div className="pr-4 shrink-0">
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-emerald-600 shadow-lg active:scale-95"
                aria-label="Send"
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