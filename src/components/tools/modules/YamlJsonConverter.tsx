"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';
import yaml from 'js-yaml';

type Direction = 'yaml-to-json' | 'json-to-yaml';
type InputFormat = 'auto' | 'yaml' | 'json';

export default function YamlJsonConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState<Direction>('yaml-to-json');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputFormat, setInputFormat] = useState<InputFormat>('auto');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const detectFormat = useCallback((text: string): 'yaml' | 'json' => {
    const t = text.trim();
    if (t.startsWith('{') || t.startsWith('[')) return 'json';
    if (t.includes(': ') || t.includes(':\n')) return 'yaml';
    return direction === 'yaml-to-json' ? 'yaml' : 'json';
  }, [direction]);

  const convert = useCallback(async (text: string, dir: Direction) => {
    if (!text.trim()) { setOutput(''); setError(null); return; }
    setIsProcessing(true);
    setError(null);
    try {
      let result = '';
      if (dir === 'yaml-to-json') {
        const parsed = yaml.load(text);
        if (parsed === undefined || parsed === null) throw new Error('Empty YAML content');
        result = JSON.stringify(parsed, null, 2);
      } else {
        const parsed = JSON.parse(text);
        result = yaml.dump(parsed, { indent: 2 });
      }
      setOutput(result);
    } catch (e: any) {
      let msg = e.message || 'Conversion failed';
      const lineMatch = msg.match(/line (\d+)/i);
      if (lineMatch) {
        const ln = parseInt(lineMatch[1]);
        const lines = input.split('\n');
        const context = lines.slice(Math.max(0, ln - 2), ln + 1).join('\n');
        msg = `Error at line ${ln}:\n${context}`;
      }
      setError(msg);
      toast.error('Conversion failed. Check your input.');
    } finally {
      setIsProcessing(false);
    }
  }, [input]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { convert(input, direction); }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, direction, convert]);

  const handleFormatDetect = useCallback(() => {
    if (!input.trim()) return;
    const detected = detectFormat(input);
    setInputFormat(detected);
    const dir: Direction = detected === 'yaml' ? 'yaml-to-json' : 'json-to-yaml';
    setDirection(dir);
  }, [input, detectFormat]);

  const toggleDirection = useCallback(() => {
    setDirection(prev => prev === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json');
  }, []);

  const swapInputOutput = useCallback(() => {
    if (!output) return;
    setInput(output);
    setOutput('');
    setError(null);
  }, [output]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await clipboardWrite(output);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy text.');
    }
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const ext = direction === 'yaml-to-json' ? 'json' : 'yaml';
    const mime = direction === 'yaml-to-json' ? 'application/json' : 'application/x-yaml';
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `converted.${ext}`);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [output, direction]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setInput(text);
      if (file.name.endsWith('.json')) { setInputFormat('json'); setDirection('json-to-yaml'); }
      else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) { setInputFormat('yaml'); setDirection('yaml-to-json'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const inputLineCount = input ? input.split('\n').length : 0;
  const inputCharCount = input.length;
  const outputLineCount = output ? output.split('\n').length : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
        <strong>100% Client-Side Processing:</strong> Convert between YAML and JSON data formats. Perfect for configuration files, API payloads, and data migration.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-1">
          <button
            onClick={() => { setDirection('yaml-to-json'); setInputFormat('yaml'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${direction === 'yaml-to-json' ? 'bg-blue-600 text-white shadow' : 'text-zinc-600 dark:text-[var(--text-muted)] hover:text-zinc-900 dark:hover:text-zinc-200'}`}
          >
            YAML → JSON
          </button>
          <button
            onClick={() => { setDirection('json-to-yaml'); setInputFormat('json'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${direction === 'json-to-yaml' ? 'bg-blue-600 text-white shadow' : 'text-zinc-600 dark:text-[var(--text-muted)] hover:text-zinc-900 dark:hover:text-zinc-200'}`}
          >
            JSON → YAML
          </button>
        </div>

        <button
          onClick={handleFormatDetect}
          disabled={!input.trim()}
          className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
        >
          Auto-Detect Format
        </button>

        <select
          value={inputFormat}
          onChange={(e) => { setInputFormat(e.target.value as InputFormat); }}
          className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none"
        >
          <option value="auto">Auto</option>
          <option value="yaml">YAML</option>
          <option value="json">JSON</option>
        </select>

        <label className="cursor-pointer px-4 py-2 rounded-xl text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
          Upload File
          <input type="file" accept=".yaml,.yml,.json" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col h-[500px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-black/40 px-4 py-3 border-b border-zinc-200 dark:border-[var(--border-subtle)] flex justify-between items-center">
            <span className="text-[var(--text-primary)] font-medium text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              {direction === 'yaml-to-json' ? 'YAML' : 'JSON'} Input
              <span className="text-xs text-[var(--text-secondary)] font-normal">{inputCharCount} chars, {inputLineCount} lines</span>
            </span>
            <div className="flex gap-2 items-center">
              <button onClick={() => { setInput(''); setOutput(''); setError(null); }} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-400/10 rounded-md transition-colors">Clear</button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'yaml-to-json' ? 'Paste YAML here...' : 'Paste JSON here...'}
            className="flex-1 w-full bg-transparent p-4 text-[var(--text-primary)] font-mono text-sm resize-none outline-none focus:ring-1 focus:ring-[var(--accent)]/50"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col h-[500px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="bg-black/40 px-4 py-3 border-b border-zinc-200 dark:border-[var(--border-subtle)] flex flex-wrap gap-2 items-center justify-between">
            <span className="text-[var(--text-primary)] font-medium text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              {direction === 'yaml-to-json' ? 'JSON' : 'YAML'} Output
              <span className="text-xs text-[var(--text-secondary)] font-normal">{outputLineCount} lines</span>
            </span>
            <div className="flex gap-2">
              <button onClick={toggleDirection} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-lg transition-colors" title="Toggle direction" aria-label="Toggle direction">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
              </button>
              <button onClick={swapInputOutput} disabled={!output} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-lg disabled:opacity-50 transition-colors" title="Swap input/output" aria-label="Swap">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </button>
              <button onClick={copyOutput} disabled={!output} className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-colors" title="Copy" aria-label="Copy">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
              <button onClick={downloadOutput} disabled={!output} className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 transition-colors" title="Download" aria-label="Download">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            {isProcessing && (
              <div className="absolute inset-0 bg-black/5 dark:bg-white/5 flex items-center justify-center z-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <textarea
              value={output}
              readOnly
              placeholder="Converted output will appear here..."
              className="absolute inset-0 w-full h-full bg-transparent p-4 text-emerald-400 font-mono text-sm resize-none outline-none"
              spellCheck={false}
            />

            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-500/50 p-4 rounded-xl shadow-xl backdrop-blur-sm animate-in slide-in-from-bottom-2">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div className="font-mono text-sm text-red-200 whitespace-pre-wrap break-all">
                    {error}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">For YAML structural formatting checks (indentation, tab detection, line-level lints), see <a href="/tools/yaml-validator" className="text-blue-600 dark:text-blue-400 hover:underline">YAML Validator</a>.</p>
    </div>
  );
}
