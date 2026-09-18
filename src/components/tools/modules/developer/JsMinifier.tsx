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
      // Single-pass stripper that respects string/template literals (with
      // escapes) and regex literals, and collapses spacing inline so string
      // contents are never touched. The old chain (`//.*$` first, then
      // global whitespace collapse) mangled `https://` URLs, `//` inside
      // strings, and spaces inside string literals.
      const isWordChar = (c: string) => /[A-Za-z0-9_$]/.test(c);
      const isRegexStart = (prev: string): boolean => {
        const t = prev.trimEnd();
        if (!t) return true;
        const ch = t[t.length - 1]!;
        if ('([{,:;!&|?=+-*%<>~^'.includes(ch)) return true;
        return /(?:^|[^A-Za-z0-9_$])(?:return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else)$/.test(t);
      };
      let out = '';
      let pendingSpace = false;
      let i = 0;
      const n = code.length;
      const emitSpaceIfNeeded = (nextIsWord: boolean) => {
        if (!pendingSpace || out.length === 0) return;
        const last = out[out.length - 1]!;
        // Space survives only between two word chars (`return x`); everywhere
        // else around punctuation it is dropped.
        if (nextIsWord && isWordChar(last)) out += ' ';
        pendingSpace = false;
      };
      while (i < n) {
        const c = code[i]!;
        const next = code[i + 1] ?? '';
        if (c === '"' || c === "'" || c === '`') {
          emitSpaceIfNeeded(true);
          const quote = c;
          out += c;
          i++;
          while (i < n) {
            const sc = code[i]!;
            out += sc;
            if (sc === '\\') { if (i + 1 < n) out += code[i + 1]; i += 2; continue; }
            if (sc === quote) { i++; break; }
            i++;
          }
          continue;
        }
        if (c === '/' && next === '/') {
          while (i < n && code[i] !== '\n') i++;
          continue;
        }
        if (c === '/' && next === '*') {
          i += 2;
          while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i++;
          i += 2;
          continue;
        }
        if (c === '/' && isRegexStart(out)) {
          emitSpaceIfNeeded(false);
          out += c;
          i++;
          let inClass = false;
          while (i < n) {
            const rc = code[i]!;
            out += rc;
            if (rc === '\\') { if (i + 1 < n) out += code[i + 1]; i += 2; continue; }
            if (rc === '[') inClass = true;
            else if (rc === ']') inClass = false;
            else if (rc === '/' && !inClass) { i++; break; }
            else if (rc === '\n') break;
            i++;
          }
          continue;
        }
        if (/\s/.test(c)) {
          pendingSpace = true;
          i++;
          continue;
        }
        emitSpaceIfNeeded(isWordChar(c));
        out += c;
        pendingSpace = false;
        i++;
      }
      return out.trim();
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
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--accent)]" />
            {cfg.label} Minifier
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{cfg.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase">Original {cfg.label}</span>
            <textarea value={input} onChange={e => setInput(e.target.value)} aria-label={`Original ${cfg.label}`} placeholder={cfg.placeholder}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono h-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-xs resize-none" />
          </div>
          <button onClick={minify} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Sparkles className="w-4 h-4" /> Minify {cfg.label}
          </button>
        </div>

        <div className="space-y-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase">Minified {cfg.label}</span>
              {output && (
                <div className="flex gap-2">
                  <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-subtle)] rounded-lg" aria-label="Copy minified code"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => { const blob = new Blob([output], { type: cfg.mime }); downloadOrShare(URL.createObjectURL(blob), `minified.${lang === 'javascript' ? 'js' : lang}`); }} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-subtle)] rounded-lg" aria-label="Download minified code"><Download className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <textarea value={output} readOnly aria-label="Minified code" placeholder={`Minified ${cfg.label} code will appear here...`}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono h-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-xs resize-none" />
          </div>
          {stats && (
            <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs grid grid-cols-3 gap-2 text-center text-[var(--text-muted)]">
              <div><p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Before</p><p className="font-bold text-[var(--text-primary)]">{(stats.original / 1024).toFixed(2)} KB</p></div>
              <div><p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">After</p><p className="font-bold text-emerald-500">{(stats.minified / 1024).toFixed(2)} KB</p></div>
              <div><p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Savings</p><p className="font-bold text-[var(--accent)]">{stats.ratio.toFixed(1)}%</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JsMinifier() { return <MinifierTool lang="javascript" />; }
