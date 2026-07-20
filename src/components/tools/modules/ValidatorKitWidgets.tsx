"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

export function HtmlLinter() {
  const [htmlInput, setHtmlInput] = useState('<!DOCTYPE html><html><head><title>Test</title></head><body><p>Hello</p></body></html>');
  const [htmlOutput, setHtmlOutput] = useState('');

  const lintHtml = () => {
    const issues: string[] = [];
    if (!/<\!DOCTYPE\s+html>/i.test(htmlInput)) issues.push('Missing DOCTYPE declaration');
    const tagStack: string[] = [];
    const tagRegex = /<\/?(\w+)[^>]*>/g;
    let match;
    while ((match = tagRegex.exec(htmlInput)) !== null) {
      const tag = match[1].toLowerCase();
      if (['br', 'hr', 'img', 'input', 'meta', 'link', '!DOCTYPE'].includes(tag)) continue;
      if (match[0].startsWith('</')) {
        if (tagStack.length && tagStack[tagStack.length - 1] === tag) tagStack.pop();
        else issues.push(`Unexpected closing tag: </${tag}>`);
      } else {
        tagStack.push(tag);
      }
    }
    if (tagStack.length) issues.push(`Unclosed tags: ${tagStack.join(', ')}`);
    if (!issues.length) issues.push('No issues found');
    setHtmlOutput(issues.join('\n'));
    toast.success(`Found ${issues.length} issue(s)`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">HTML Linter</h2>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">HTML</label>
          <textarea value={htmlInput} onChange={e => setHtmlInput(e.target.value)} placeholder="Paste HTML..."
            className="w-full h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        </div>
        <button onClick={lintHtml} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Lint HTML</button>
        {htmlOutput && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-zinc-900 dark:text-white">{htmlOutput}</pre>}
      </div>
    </div>
  );
}

export function XmlMinifierValidator() {
  const [xmlInput, setXmlInput] = useState('<root><item id="1">Hello</item><item id="2">World</item></root>');
  const [xmlOutput, setXmlOutput] = useState('');
  const [mode, setMode] = useState<'minify' | 'validate'>('minify');

  const process = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlInput, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      if (mode === 'validate') {
        setXmlOutput(parseError ? `Invalid XML: ${parseError.textContent}` : 'Valid XML');
        return;
      }
      if (parseError) { setXmlOutput(`Invalid XML: ${parseError.textContent}`); return; }
      setXmlOutput(xmlInput.replace(/>\s+</g, '><').trim());
    } catch (e: unknown) {
      setXmlOutput(`Error: ${e instanceof Error ? e.message : 'XML processing failed'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">XML Minifier / Validator</h2>
        <div className="flex gap-2">
          {[{ v: 'minify', l: 'Minify' }, { v: 'validate', l: 'Validate' }].map(({ v, l }) => (
            <button key={v} onClick={() => setMode(v as typeof mode)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${mode === v ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{l}</button>
          ))}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">XML content</label>
          <textarea value={xmlInput} onChange={e => setXmlInput(e.target.value)} placeholder="Paste XML..."
            className="w-full h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        </div>
        <button onClick={process} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Process</button>
        {xmlOutput && (
          <div className="relative">
            <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400">{xmlOutput}</pre>
            <div className="mt-1"><CopyBtn text={xmlOutput} label="XML result" /></div>
          </div>
        )}
      </div>
    </div>
  );
}
