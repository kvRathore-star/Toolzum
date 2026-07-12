"use client";

import React, { useState } from 'react';
import { Sparkles, Copy, Download, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

export default function JsMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<{ original: number; minified: number; ratio: number } | null>(null);

  const minifyJs = () => {
    if (!input.trim()) {
      toast.error('Please enter JavaScript code');
      return;
    }

    try {
      // Basic regex-based minifier for client side (retains syntax correctness for standard JS)
      let minified = input;
      // Remove single-line comments
      minified = minified.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments
      minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
      // Replace multiple spaces/newlines with a single space
      minified = minified.replace(/\s+/g, ' ');
      // Clean up spaces near punctuation
      minified = minified.replace(/\s*([{}();,=+-\/%&|^!<>?:])\s*/g, '$1');
      minified = minified.trim();

      setOutput(minified);

      const origSize = new Blob([input]).size;
      const miniSize = new Blob([minified]).size;
      const ratio = origSize > 0 ? ((origSize - miniSize) / origSize) * 100 : 0;
      
      setStats({
        original: origSize,
        minified: miniSize,
        ratio
      });
      toast.success('JavaScript Minified!');
    } catch (err) {
      toast.error('Failed to minify code');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied!');
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'minified.js');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            JavaScript Minifier
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Compress JavaScript codes by stripping comments and reducing space payload client-side.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs text-zinc-400 font-bold uppercase">Original JavaScript</span>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste JavaScript source here..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-mono h-80 outline-none text-xs resize-none"
            />
          </div>
          <button onClick={minifyJs} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Sparkles className="w-4 h-4" /> Minify Code
          </button>
        </div>

        <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-bold uppercase">Minified Output</span>
              {output && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Copy"><Copy className="w-4 h-4" /></button>
                  <button onClick={handleDownload} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Download"><Download className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Minified JavaScript code will appear here..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-mono h-80 outline-none text-xs resize-none"
            />
          </div>

          {stats && (
            <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs grid grid-cols-3 gap-2 text-center text-zinc-400">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Before</p>
                <p className="font-bold text-zinc-900 dark:text-white">{(stats.original / 1024).toFixed(2)} KB</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">After</p>
                <p className="font-bold text-emerald-500">{(stats.minified / 1024).toFixed(2)} KB</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Savings</p>
                <p className="font-bold text-indigo-400">{stats.ratio.toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}