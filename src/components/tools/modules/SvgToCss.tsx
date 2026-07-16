"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function SvgToCss() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = (svg: string) => {
    if (!svg.trim()) { setOutput(''); return; }
    try {
      const encoded = btoa(unescape(encodeURIComponent(svg.trim())));
      const dataUri = `data:image/svg+xml;base64,${encoded}`;
      setOutput(`background: url("${dataUri}");`);
    } catch { setOutput(''); toast.error('Conversion failed'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => { setInput(e.target.value); convert(e.target.value); }} placeholder="Paste SVG markup..." className="w-full h-[350px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono focus:border-blue-500 transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="CSS background result..." className="w-full h-[350px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition-colors">Copy</button>}
        </div>
      </div>
      {output && (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex items-center justify-center min-h-[100px]">
          <div className="w-16 h-16 rounded-xl" style={{ background: `url("data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(input)))})` }} />
        </div>
      )}
    </div>
  );
}
