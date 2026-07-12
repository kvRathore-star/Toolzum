"use client";

import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';

export default function MarkdownToHtml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = useCallback(async () => {
    if (!input.trim()) { setOutput(''); return; }
    setIsProcessing(true);
    try {
      const { marked } = await import('marked');
      const parsed = marked.parse(input);
      setOutput(typeof parsed === 'string' ? parsed : await parsed);
      toast.success('Converted to HTML!');
    } catch (e: any) {
      toast.error(e.message || 'Conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [input]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied!');
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'output.html');
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [output]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
        <div className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">Markdown Input</span>
            <button onClick={() => { setInput(''); setOutput(''); }} className="text-xs text-zinc-500 hover:text-red-500 transition-colors">Clear</button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste Markdown here..."
            className="flex-1 w-full p-4 bg-transparent outline-none resize-none font-mono text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            spellCheck="false"
          />
        </div>
        <div className="flex flex-col bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">HTML Output</span>
            <div className="flex gap-2">
              <button onClick={copyOutput} disabled={!output} className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Copy</button>
              <button onClick={downloadOutput} disabled={!output} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Save .html</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {output ? (
              <pre className="text-emerald-600 dark:text-emerald-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 opacity-50">HTML output will appear here</div>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={handleConvert}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
      >
        {isProcessing ? 'Converting...' : 'Convert Markdown to HTML'}
      </button>
    </div>
  );
}
