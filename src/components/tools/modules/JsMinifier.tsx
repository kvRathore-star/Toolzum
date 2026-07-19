"use client";

import React, { useState } from 'react';
import { Sparkles, Copy, Download, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

type Lang = 'javascript' | 'css' | 'html';

const CONFIG: Record<Lang, { label: string; mime: string; placeholder: string; desc: string; minify: (code: string) => string }> = {
  javascript: {
    label: 'JavaScript',
    mime: 'text/javascript',
    placeholder: 'Paste JavaScript source here...',
    desc: 'Compress JavaScript codes by stripping comments and reducing space payload client-side.',
    minify: (code: string) => {
      let m = code;
      m = m.replace(/\/\/.*$/gm, '');
      m = m.replace(/\/\*[\s\S]*?\*\//g, '');
      m = m.replace(/\s+/g, ' ');
      m = m.replace(/\s*([{}();,=+-\/%&|^!<>?:])\s*/g, '$1');
      return m.trim();
    },
  },
  css: {
    label: 'CSS',
    mime: 'text/css',
    placeholder: 'Paste CSS rules here...',
    desc: 'Compress your stylesheets by removing redundant indentation, formatting and comment lines.',
    minify: (code: string) => {
      let m = code;
      m = m.replace(/\/\*[\s\S]*?\*\//g, '');
      m = m.replace(/\s+/g, ' ');
      m = m.replace(/\s*([{}();:,])\s*/g, '$1');
      m = m.replace(/;}/g, '}');
      return m.trim();
    },
  },
  html: {
    label: 'HTML',
    mime: 'text/html',
    placeholder: 'Paste HTML markup here...',
    desc: 'Compress markup code payload by stripping unused comment lines and wrapping spaces.',
    minify: (code: string) => {
      let m = code;
      m = m.replace(/<!--[\s\S]*?-->/g, '');
      m = m.replace(/>\s+</g, '><');
      m = m.replace(/\s+/g, ' ');
      return m.trim();
    },
  },
};

export function MinifierTool({ lang = 'javascript' }: { lang?: Lang }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<{ original: number; minified: number; ratio: number } | null>(null);
  const cfg = CONFIG[lang];

  const minify = () => {
    if (!input.trim()) { toast.error(`Please enter ${cfg.label} code`); return; }
    try {
      const minified = cfg.minify(input);
      setOutput(minified);
      const origSize = new Blob([input]).size;
      const miniSize = new Blob([minified]).size;
      setStats({ original: origSize, minified: miniSize, ratio: origSize > 0 ? ((origSize - miniSize) / origSize) * 100 : 0 });
      toast.success(`${cfg.label} Minified!`);
    } catch { toast.error('Failed to minify code'); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            {cfg.label} Minifier
          </h2>
          <p className="text-xs text-zinc-500 mt-1">{cfg.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs text-zinc-400 font-bold uppercase">Original {cfg.label}</span>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={cfg.placeholder}
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-mono h-80 outline-none text-xs resize-none" />
          </div>
          <button onClick={minify} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Sparkles className="w-4 h-4" /> Minify {cfg.label}
          </button>
        </div>

        <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-bold uppercase">Minified {cfg.label}</span>
              {output && (
                <div className="flex gap-2">
                  <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Copy"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => { const blob = new Blob([output], { type: cfg.mime }); downloadOrShare(URL.createObjectURL(blob), `minified.${lang === 'javascript' ? 'js' : lang}`); }} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Download"><Download className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <textarea value={output} readOnly placeholder={`Minified ${cfg.label} code will appear here...`}
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-mono h-80 outline-none text-xs resize-none" />
          </div>
          {stats && (
            <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs grid grid-cols-3 gap-2 text-center text-zinc-400">
              <div><p className="text-[10px] uppercase font-bold text-zinc-500">Before</p><p className="font-bold text-zinc-900 dark:text-white">{(stats.original / 1024).toFixed(2)} KB</p></div>
              <div><p className="text-[10px] uppercase font-bold text-zinc-500">After</p><p className="font-bold text-emerald-500">{(stats.minified / 1024).toFixed(2)} KB</p></div>
              <div><p className="text-[10px] uppercase font-bold text-zinc-500">Savings</p><p className="font-bold text-indigo-400">{stats.ratio.toFixed(1)}%</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JsMinifier() { return <MinifierTool lang="javascript" />; }
