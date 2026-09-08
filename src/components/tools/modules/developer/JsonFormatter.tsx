"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';
// Using standard JSON.parse for basic formatting. jsonlint could be added for detailed error lines if needed.

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatJson = (spaces: number = 2) => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, spaces);
      setOutput(formatted);
      setError(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Invalid JSON format"));
      toast.error("Invalid JSON format");
    }
  };

  const minifyJson = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Invalid JSON format"));
      toast.error("Invalid JSON format");
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await clipboardWrite(output);
      toast.success('JSON copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy text.');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const downloadJson = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `formatted_${Date.now()}.json`);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] p-4 rounded-xl text-[var(--text-secondary)] text-sm">
        <strong>100% Client-Side Processing:</strong> Your JSON data is formatted securely in your browser. Sensitive data never leaves your device.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Section */}
        <div className="flex flex-col h-[600px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-black/40 px-4 py-3 border-b border-[var(--border-subtle)] flex justify-between items-center">
            <span className="text-[var(--text-primary)] font-medium text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              Input JSON
            </span>
            <button 
              onClick={clearAll}
              className="text-xs text-red-700 dark:text-red-400 hover:text-red-300 px-2 py-1 bg-red-400/10 rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea aria-label="Clear" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your unformatted JSON here..."
            className="flex-1 w-full bg-transparent p-4 text-[var(--text-primary)] font-mono text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-1 focus:ring-[var(--accent)]/50"
            spellCheck={false}
          />
        </div>

        {/* Output Section */}
        <div className="flex flex-col h-[600px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="bg-black/40 px-4 py-3 border-b border-[var(--border-subtle)] flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => formatJson(2)} className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors">
                Format (2 spaces)
              </button>
              <button onClick={() => formatJson(4)} className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors">
                Format (4 spaces)
              </button>
              <button onClick={minifyJson} className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors">
                Minify
              </button>
            </div>
            
            <div className="flex gap-2">
              <button onClick={copyToClipboard} disabled={!output} className="p-1.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg disabled:opacity-50 transition-colors" title="Copy" aria-label="Copy">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
              <button onClick={downloadJson} disabled={!output} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-lg disabled:opacity-50 transition-colors" title="Download JSON file" aria-label="Download">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <textarea aria-label="Result" 
              value={output}
              readOnly
              placeholder="Formatted JSON will appear here..."
              className="absolute inset-0 w-full h-full bg-transparent p-4 text-emerald-700 dark:text-emerald-400 font-mono text-sm resize-none focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              spellCheck={false}
            />
            
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-500/50 p-4 rounded-xl shadow-xl backdrop-blur-sm animate-in slide-in-from-bottom-2">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-700 dark:text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div className="font-mono text-sm text-red-200 whitespace-pre-wrap break-all">
                    {error}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
