"use client";

import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';
import { getErrorMessage } from '@/utils/error';

type TabId = 'markdown-to-html' | 'text-to-markdown' | 'html-to-markdown' | 'markdown-to-text';

const TABS: { id: TabId; label: string }[] = [
  { id: 'markdown-to-html', label: 'Preview' },
  { id: 'text-to-markdown', label: 'Text → MD' },
  { id: 'html-to-markdown', label: 'HTML → MD' },
  { id: 'markdown-to-text', label: 'MD → Text' },
];

const PRESETS: Record<TabId, { label: string; input: string }[]> = {
  'markdown-to-html': [
    { label: 'Basic', input: '# Hello World\n\nThis is a **bold** and *italic* text.\n\n## Lists\n- Item 1\n- Item 2\n\n> A blockquote\n\n`inline code`' },
    { label: 'Table', input: '| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |' },
  ],
  'text-to-markdown': [
    { label: 'Article', input: 'Title of Article\n\nFirst paragraph of the article with important information.\n\nSecond paragraph continues the discussion.\n\nFinal thoughts and conclusion.' },
    { label: 'Notes', input: 'Meeting Notes - Jan 1\n\nAction items:\n1. Review proposal\n2. Update timeline\n3. Schedule follow-up' },
  ],
  'html-to-markdown': [
    { label: 'Simple', input: '<h1>Title</h1>\n<p>This is a <strong>bold</strong> paragraph.</p>\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>' },
    { label: 'Article', input: '<article>\n  <h1>My Post</h1>\n  <p>Content with <a href="#">links</a> and <em>emphasis</em>.</p>\n  <blockquote>A wise quote</blockquote>\n</article>' },
  ],
  'markdown-to-text': [
    { label: 'Formatted', input: '# Title\n\n**Bold text** and *italic*.\n\n- List item 1\n- List item 2\n\n> Blockquote\n\n`code`' },
    { label: 'Links', input: 'Check out [this link](https://example.com) and [another](https://test.com).\n\nAlso see the [docs](https://docs.example.com) for more.' },
  ],
};

function MarkdownToHtmlTab() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = useCallback(async () => {
    if (!input.trim()) { setOutput(''); return; }
    setIsProcessing(true);
    try {
      const { marked } = await import('marked');
      const parsed = marked.parse(input);
      setOutput(typeof parsed === 'string' ? parsed : await parsed);
      toast.success('Converted to HTML!');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Conversion failed.'));
    } finally {
      setIsProcessing(false);
    }
  }, [input]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied!');
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'output.html');
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [output]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS['markdown-to-html'].map(function(p) {
          return (
            <button key={p.label} onClick={() => setInput(p.input)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
        <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-[var(--text-primary)] text-sm">Markdown Input</span>
            <button onClick={() => { setInput(''); setOutput(''); }} className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors">Clear</button>
          </div>
          <textarea aria-label="Markdown input (Preview)" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste Markdown here..." className="flex-1 w-full p-4 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-[var(--text-muted)] dark:placeholder:text-zinc-600" spellCheck="false" />
        </div>
        <div className="flex flex-col bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-[var(--text-primary)] text-sm">HTML Output</span>
            <div className="flex gap-2">
              <button onClick={copyOutput} disabled={!output} className="text-xs bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Copy</button>
              <button onClick={downloadOutput} disabled={!output} className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Save .html</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {output ? (
              <pre className="text-emerald-600 dark:text-emerald-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] opacity-50">HTML output will appear here</div>
            )}
          </div>
        </div>
      </div>
      <button onClick={handleConvert} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50">
        {isProcessing ? 'Converting...' : 'Convert Markdown to HTML'}
      </button>
    </div>
  );
}

function TextToMarkdownTab() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) { setOutput(''); return; }
    setIsProcessing(true);
    try {
      const result = input.split('\n').map(line => line.trim()).filter(Boolean).join('\n\n');
      setOutput(result);
      toast.success('Converted to Markdown!');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Conversion failed.'));
    } finally {
      setIsProcessing(false);
    }
  }, [input]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied!');
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'output.md');
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [output]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS['text-to-markdown'].map(function(p) {
          return (
            <button key={p.label} onClick={() => setInput(p.input)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
        <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-[var(--text-primary)] text-sm">Text Input</span>
            <button onClick={() => { setInput(''); setOutput(''); }} className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors">Clear</button>
          </div>
          <textarea aria-label="Plain text input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste plain text here..." className="flex-1 w-full p-4 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-[var(--text-muted)] dark:placeholder:text-zinc-600" spellCheck="false" />
        </div>
        <div className="flex flex-col bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-[var(--text-primary)] text-sm">Markdown Output</span>
            <div className="flex gap-2">
              <button onClick={copyOutput} disabled={!output} className="text-xs bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Copy</button>
              <button onClick={downloadOutput} disabled={!output} className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Save .md</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {output ? (
              <pre className="text-emerald-600 dark:text-emerald-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] opacity-50">Markdown output will appear here</div>
            )}
          </div>
        </div>
      </div>
      <button onClick={handleConvert} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50">
        {isProcessing ? 'Converting...' : 'Convert Text to Markdown'}
      </button>
    </div>
  );
}

function HtmlToMarkdownTab() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = useCallback(async () => {
    if (!input.trim()) { setOutput(''); return; }
    setIsProcessing(true);
    try {
      // @ts-expect-error turndown has no bundled types
      const TurndownService = (await import('turndown')).default;
      const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
      const result = turndown.turndown(input);
      setOutput(result);
      toast.success('Converted to Markdown!');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Conversion failed.'));
    } finally {
      setIsProcessing(false);
    }
  }, [input]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied!');
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'output.md');
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [output]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS['html-to-markdown'].map(function(p) {
          return (
            <button key={p.label} onClick={() => setInput(p.input)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
        <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-[var(--text-primary)] text-sm">HTML Input</span>
            <button onClick={() => { setInput(''); setOutput(''); }} className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors">Clear</button>
          </div>
          <textarea aria-label="HTML input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste HTML here..." className="flex-1 w-full p-4 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-[var(--text-muted)] dark:placeholder:text-zinc-600" spellCheck="false" />
        </div>
        <div className="flex flex-col bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-[var(--text-primary)] text-sm">Markdown Output</span>
            <div className="flex gap-2">
              <button onClick={copyOutput} disabled={!output} className="text-xs bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Copy</button>
              <button onClick={downloadOutput} disabled={!output} className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Save .md</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {output ? (
              <pre className="text-emerald-600 dark:text-emerald-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] opacity-50">Markdown output will appear here</div>
            )}
          </div>
        </div>
      </div>
      <button onClick={handleConvert} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50">
        {isProcessing ? 'Converting...' : 'Convert HTML to Markdown'}
      </button>
    </div>
  );
}

function MarkdownToTextTab() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) { setOutput(''); return; }
    setIsProcessing(true);
    try {
      const result = input
        .replace(/^###\s?/gm, '')
        .replace(/^##\s?/gm, '')
        .replace(/^#\s?/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^[-\*]\s/gm, '')
        .replace(/^\d+\.\s/gm, '')
        .replace(/^>\s/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      setOutput(result);
      toast.success('Converted to Text!');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Conversion failed.'));
    } finally {
      setIsProcessing(false);
    }
  }, [input]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied!');
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'output.txt');
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [output]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS['markdown-to-text'].map(function(p) {
          return (
            <button key={p.label} onClick={() => setInput(p.input)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
        <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="bg-[var(--bg-overlay)]/80 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-[var(--text-primary)] text-sm">Markdown Input</span>
            <button onClick={() => { setInput(''); setOutput(''); }} className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors">Clear</button>
          </div>
          <textarea aria-label="Markdown input (MD to Text)" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste Markdown here..." className="flex-1 w-full p-4 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-[var(--text-muted)] dark:placeholder:text-zinc-600" spellCheck="false" />
        </div>
        <div className="flex flex-col bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-[var(--border-subtle)] px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-[var(--text-primary)] text-sm">Text Output</span>
            <div className="flex gap-2">
              <button onClick={copyOutput} disabled={!output} className="text-xs bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Copy</button>
              <button onClick={downloadOutput} disabled={!output} className="text-xs bg-emerald-700 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Save .txt</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {output ? (
              <pre className="text-emerald-600 dark:text-emerald-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] opacity-50">Text output will appear here</div>
            )}
          </div>
        </div>
      </div>
      <button onClick={handleConvert} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50">
        {isProcessing ? 'Converting...' : 'Convert Markdown to Text'}
      </button>
    </div>
  );
}

const TAB_COMPONENTS: Record<TabId, React.ComponentType> = {
  'markdown-to-html': MarkdownToHtmlTab,
  'text-to-markdown': TextToMarkdownTab,
  'html-to-markdown': HtmlToMarkdownTab,
  'markdown-to-text': MarkdownToTextTab,
};

export default function MarkdownTools() {
  const params = useParams();
  const slug = (params?.tool as string) || '';
  const defaultTab: TabId = TABS.find(t => t.id === slug)?.id || 'markdown-to-html';
  const [activeTab, setActiveTab] = React.useState<TabId>(defaultTab);
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div>
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 mb-6 overflow-x-auto" role="tablist" aria-label="Markdown tools">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ' + (activeTab === tab.id ? 'bg-white dark:bg-[var(--bg-surface)] text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label="Selected markdown tool">
      <ActiveComponent />
      </div>
    </div>
  );
}
