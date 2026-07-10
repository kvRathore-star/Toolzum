"use client";

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

type Tab = 'preview' | 'html';

const SAMPLE_MARKDOWN = `# Markdown Cheat Sheet

Welcome to the editor! Here is some sample markdown to get you started.

## Text Formatting
You can make text **bold**, *italic*, or ~~strikethrough~~.

### Lists
1. First ordered item
2. Second ordered item
   - Unordered sub-item
   - Another sub-item

### Code Block
\`\`\`javascript
function greet(name) {

}
greet("World");
\`\`\`

> Blockquotes are very useful for calling out important highlights.

Have fun formatting!`;

export default function MarkdownToHtml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('preview');

  const processMarkdown = (val: string) => {
    if (!val.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = marked.parse(val);
      if (typeof parsed === 'string') {
        setOutput(parsed);
      } else {
        parsed.then(res => setOutput(res)).catch(() => {
          toast.error("Failed to parse markdown.");
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    processMarkdown(val);
  };

  const loadSample = () => {
    setInput(SAMPLE_MARKDOWN);
    processMarkdown(SAMPLE_MARKDOWN);
    toast.success("Sample markdown loaded!");
  };

  const copyHtml = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("HTML copied to clipboard!");
    } catch {
      toast.error("Failed to copy HTML.");
    }
  };

  const downloadHtml = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `document_${Date.now()}.html`);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 text-sm space-y-1">
        <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
          📝 Real-Time Markdown to HTML Converter
        </h4>
        <p className="text-zinc-600 dark:text-zinc-400">
          Write or paste Markdown syntax on the left, and view the compiled HTML source code or a fully rendered visual preview on the right. Processed entirely locally.
        </p>
      </div>

      {/* Settings Panel */}
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-white/5">
        <button
          onClick={loadSample}
          className="text-xs bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          💡 Load Sample Markdown
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setInput('')}
            className="text-xs text-red-500 hover:text-red-400 font-semibold"
          >
            Clear Editor
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Markdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl flex flex-col h-[550px]">
          <div className="px-4 py-3 bg-black/20 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center shrink-0">
            <span className="text-zinc-700 dark:text-zinc-300 text-sm font-bold uppercase tracking-wider">
              Markdown Editor
            </span>
          </div>
          <textarea
            value={input}
            onChange={handleTextChange}
            placeholder="Type your markdown here... Use standard Markdown tags."
            className="flex-1 p-4 bg-transparent outline-none resize-none font-mono text-sm text-zinc-900 dark:text-white leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output Area */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl flex flex-col h-[550px] overflow-hidden">
          <div className="px-4 bg-black/20 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center shrink-0 h-11">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                👁️ Preview
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'html'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                &lt;/&gt; HTML Source
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={copyHtml}
                disabled={!output}
                className="text-xs text-blue-500 hover:text-blue-400 font-semibold disabled:opacity-50"
              >
                📋 Copy HTML
              </button>
              <button
                onClick={downloadHtml}
                disabled={!output}
                className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold disabled:opacity-50"
              >
                💾 Save File
              </button>
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-transparent">
            {activeTab === 'preview' ? (
              <div 
                className="prose dark:prose-invert max-w-none text-zinc-900 dark:text-zinc-200 text-sm space-y-4
                  [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-zinc-900 [&_h1]:dark:text-white [&_h1]:border-b [&_h1]:border-zinc-200 [&_h1]:dark:border-white/10 [&_h1]:pb-2
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h2]:dark:text-white
                  [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_h3]:dark:text-white
                  [&_a]:text-blue-500 [&_a]:underline
                  [&_strong]:font-bold [&_strong]:text-zinc-900 [&_strong]:dark:text-white
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                  [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 [&_blockquote]:dark:border-zinc-700 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-600 [&_blockquote]:dark:text-zinc-400
                  [&_pre]:bg-zinc-50 [&_pre]:dark:bg-black/50 [&_pre]:border [&_pre]:border-zinc-200 [&_pre]:dark:border-white/5 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto
                  [&_code]:font-mono [&_code]:text-xs [&_code]:bg-zinc-100 [&_code]:dark:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-pink-500
                  [&_pre_code]:p-0 [&_pre_code]:bg-transparent [&_pre_code]:text-zinc-900 [&_pre_code]:dark:text-zinc-200 [&_pre_code]:block [&_pre_code]:overflow-x-visible"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output) || '<p class="text-zinc-500">Live preview will render here...</p>' }}
              />
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder="HTML code will appear here..."
                className="w-full h-full bg-transparent outline-none resize-none font-mono text-sm text-emerald-500 dark:text-emerald-400"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

