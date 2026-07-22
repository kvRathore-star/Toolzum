"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function HtmlToJsx() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = (html: string) => {
    if (!html.trim()) { setOutput(''); return; }
    try {
      let jsx = html
        .replace(/\bclass=/g, 'className=')
        .replace(/\bfor=/g, 'htmlFor=')
        .replace(/\btabindex=/g, 'tabIndex=')
        .replace(/\breadonly/g, 'readOnly')
        .replace(/\bchecked/g, 'defaultChecked')
        .replace(/\bmaxlength=/g, 'maxLength=')
        .replace(/\bautocomplete=/g, 'autoComplete=')
        .replace(/\bautofocus/g, 'autoFocus')
        .replace(/\benctype=/g, 'encType=')
        .replace(/\bhref=/g, 'href=')
        .replace(/\bsrc=/g, 'src=')
        .replace(/\bonclick=/g, 'onClick=')
        .replace(/\bonchange=/g, 'onChange=')
        .replace(/\bonblur=/g, 'onBlur=')
        .replace(/\bonfocus=/g, 'onFocus=')
        .replace(/\bonsubmit=/g, 'onSubmit=')
        .replace(/\bonkeydown=/g, 'onKeyDown=')
        .replace(/\bonkeyup=/g, 'onKeyUp=')
        .replace(/\bonmouseenter=/g, 'onMouseEnter=')
        .replace(/\bonmouseleave=/g, 'onMouseLeave=')
        .replace(/\bstyle=/g, 'style={{}} ')
        .replace(/\b(cellpadding|cellepadding)=/g, '')
        .replace(/\/>/g, ' />')
        .replace(/<!DOCTYPE[^>]*>/gi, '');
      setOutput(jsx);
    } catch (e) { console.error(e); setOutput(''); toast.error('Conversion failed'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => { setInput(e.target.value); convert(e.target.value); }} placeholder="Paste HTML..." className="w-full h-[350px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="JSX result..." className="w-full h-[350px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
