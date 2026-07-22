"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Lang = 'html' | 'css' | 'js' | 'erb' | 'less' | 'scss' | 'xml';
type Action = 'beautify' | 'minify';

const LANGUAGE_LABELS: Record<Lang, string> = { html: 'HTML', css: 'CSS', js: 'JavaScript', erb: 'ERB', less: 'LESS', scss: 'SCSS', xml: 'XML' };

export default function CodeBeautifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState<Lang>('html');
  const [action, setAction] = useState<Action>('beautify');

  const process = (code: string, l: Lang, a: Action) => {
    if (!code.trim()) { setOutput(''); return; }
    try {
      let result = code;
      if (a === 'minify') {
        if (l === 'html') result = code.replace(/\s{2,}/g, ' ').replace(/>\s+</g, '><').replace(/\n/g, '').trim();
        else if (l === 'css') result = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*({|}|;|:|,)\s*/g, '$1').trim();
        else if (l === 'js') result = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*({|}|;|:|,|\(|\)|=>)\s*/g, '$1').trim();
        else if (l === 'xml') result = code.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').replace(/\n/g, '').trim();
        else if (['erb', 'less', 'scss'].includes(l)) result = code.replace(/\s{2,}/g, ' ').replace(/\s*({|}|;|:|,)\s*/g, '$1').trim();
      } else {
        let indent = 0;
        const lines = code.split('\n');
        result = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          if (/^<\//.test(trimmed) || /^[}\]]/.test(trimmed)) indent = Math.max(0, indent - 1);
          const out = '  '.repeat(indent) + trimmed;
          if (/<[^/]/.test(trimmed) && !/\/>$/.test(trimmed) && !/<\/.+>/.test(trimmed)) indent++;
          if (/[{[]/.test(trimmed) && !/[}\]]/.test(trimmed)) indent++;
          if (/^[}\]]/.test(trimmed) && indent > 0) indent--;
          return out;
        }).join('\n');
      }
      setOutput(result);
    } catch { setOutput(''); toast.error('Processing failed'); }
  };

  const handleProcess = () => process(input, lang, action);

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          {(['html', 'css', 'js', 'xml', 'erb', 'less', 'scss'] as Lang[]).map(l => (
            <button key={l} onClick={() => { setLang(l); if (input) process(input, l, action); }} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${lang === l ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)] hover:text-zinc-700'}`}>{LANGUAGE_LABELS[l]}</button>
          ))}
        </div>
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          <button onClick={() => { setAction('beautify'); handleProcess(); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${action === 'beautify' ? 'bg-[var(--bg-elevated)] text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>Beautify</button>
          <button onClick={() => { setAction('minify'); handleProcess(); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${action === 'minify' ? 'bg-[var(--bg-elevated)] text-amber-600 dark:text-amber-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>Minify</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => { setInput(e.target.value); process(e.target.value, lang, action); }} placeholder={`Paste ${LANGUAGE_LABELS[lang]} code...`} className="w-full h-[350px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Result..." className="w-full h-[350px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
