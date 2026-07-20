"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { toast } from 'react-hot-toast';

export default function AiDocumentChat() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const processDocument = () => {
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDocumentReady(true);
      setMessages([
        { role: 'ai', content: `AI Document Chat requires a server-side vector database (e.g., Cloudflare Vectorize) and an LLM API. This tool is under development and will be available in a future update.` }
      ]);
    }, 1000);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `This feature is under development. Real document chat will be available once a vector database and LLM API are connected.`
      }]);
      setIsTyping(false);
    }, 800);
  };

  if (!file || !isDocumentReady) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
          <strong>AI Document Chat (Coming Soon):</strong> Upload a PDF or Word document and ask questions. Requires server-side vector database — under development.
        </div>
        
        {!file ? (
          <FileUploader 
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            onFileSelect={(f) => setFile(f)} 
            title="Upload Document"
            subtitle="Supports PDF, DOCX (Max 50MB)"
          />
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{file.name}</h3>
              <p className="text-zinc-600 dark:text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={processDocument}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? "Vectorizing Document..." : "Analyze & Chat"}
            </button>
            <button 
              onClick={() => setFile(null)}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white"
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
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">{file.name}</h3>
            <p className="text-emerald-400 text-xs">Vectorized & Ready</p>
          </div>
        </div>
        <button 
          onClick={() => { setFile(null); setIsDocumentReady(false); setMessages([]); }}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
        >
          Upload New Document
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        <div className="flex-1 p-6 overflow-y-auto space-y-6" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-sm' 
                  : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 text-zinc-800 dark:text-zinc-200 rounded-bl-sm shadow-lg'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-bl-sm p-4 shadow-lg flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-zinc-200 dark:border-white/5">
          <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-inner focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
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
