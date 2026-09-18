"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/utils/error';
import { DualPanel } from '../shared/DualPanel';
import { CalcActions } from '../shared/CalcActions';

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
      const tag = match[1]!.toLowerCase();
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
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">HTML Linter</h2>
        <DualPanel
          input={<>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">HTML</label>
          <textarea aria-label="HTML" value={htmlInput} onChange={e => setHtmlInput(e.target.value)} placeholder="Paste HTML..."
            className="w-full h-32 bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y" />
        </div>
        <button onClick={lintHtml} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Lint HTML</button>
          </>}
          output={<>
            <pre className="text-sm font-mono bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 text-[var(--text-primary)] min-h-24">{htmlOutput || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={htmlOutput} downloadData={htmlOutput} downloadFilename='html-lint.txt' />}
        />
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
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">XML Minifier / Validator</h2>
        <DualPanel
          input={<>
        <div className="flex gap-2">
          {[{ v: 'minify', l: 'Minify' }, { v: 'validate', l: 'Validate' }].map(({ v, l }) => (
            <button key={v} onClick={() => setMode(v as typeof mode)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${mode === v ? 'bg-[var(--accent-ink)] text-white shadow-sm' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>{l}</button>
          ))}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">XML content</label>
          <textarea aria-label="XML content" value={xmlInput} onChange={e => setXmlInput(e.target.value)} placeholder="Paste XML..."
            className="w-full h-32 bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y" />
        </div>
        <button onClick={process} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Process</button>
          </>}
          output={<>
            <pre className="text-sm font-mono bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 min-h-24">{xmlOutput || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={xmlOutput} downloadData={xmlOutput} downloadFilename='xml-result.txt' />}
        />
      </div>
    </div>
  );
}
