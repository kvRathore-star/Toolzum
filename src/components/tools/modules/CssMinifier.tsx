"use client";

import React, { useState } from 'react';
import { Sparkles, Copy, Download, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

export default function CssMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<{ original: number; minified: number; ratio: number } | null>(null);

  const minifyCss = () => {
    if (!input.trim()) {
      toast.error('Please enter CSS code');
      return;
    }

    try {
      let minified = input;
      // Strip comments
      minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
      // Strip white spaces
      minified = minified.replace(/\s+/g, ' ');
      // Compress spacing near punctuation
      minified = minified.replace(/\s*([{}();:,])\s*/g, '$1');
      // Strip last semi-colon in selector block
      minified = minified.replace(/;}/g, '}');
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
      toast.success('CSS Minified!');
    } catch (err) {
      toast.error('Failed to minify CSS');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied!');
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'minified.css');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            CSS Minifier
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Compress your stylesheets by removing redundant indentation, formatting and comment lines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs text-zinc-400 font-bold uppercase">Original CSS</span>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste CSS rules here..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-mono h-80 outline-none text-xs resize-none"
            />
          </div>
          <button onClick={minifyCss} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Sparkles className="w-4 h-4" /> Minify CSS
          </button>
        </div>

        <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-bold uppercase">Minified CSS</span>
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
              placeholder="Minified CSS rules will appear here..."
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