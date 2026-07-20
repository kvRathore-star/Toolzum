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
        <textarea value={input} onChange={e => { setInput(e.target.value); convert(e.target.value); }} placeholder="Paste HTML..." className="w-full h-[350px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono focus:border-blue-500 transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="JSX result..." className="w-full h-[350px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
