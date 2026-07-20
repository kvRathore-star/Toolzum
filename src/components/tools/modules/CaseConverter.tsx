"use client";

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';
import { ToolPresetBar, type PresetOption } from '@/components/tools/ToolPresetBar';
import { ResultPanel } from '@/components/tools/ResultPanel';

type CaseType = 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab' | 'alternating' | 'sentence' | 'inverse' | 'capitalize';

const CASE_OPTIONS: { id: CaseType; label: string; icon: string }[] = [
  { id: 'upper', label: 'UPPER CASE', icon: 'AA' },
  { id: 'lower', label: 'lower case', icon: 'aa' },
  { id: 'title', label: 'Title Case', icon: 'Aa' },
  { id: 'sentence', label: 'Sentence case', icon: 'A.' },
  { id: 'camel', label: 'camelCase', icon: 'aA' },
  { id: 'snake', label: 'snake_case', icon: 'a_a' },
  { id: 'kebab', label: 'kebab-case', icon: 'a-a' },
  { id: 'alternating', label: 'aLtErNaTiNg', icon: 'aA' },
  { id: 'inverse', label: 'InVeRsE', icon: 'Aa' },
  { id: 'capitalize', label: 'Capitalize', icon: 'A.a' },
];

const PRESETS: PresetOption[] = [
  { label: 'Lorem ipsum', description: 'Sample Latin text' },
  { label: 'Programming', description: 'var functionName = value;' },
  { label: 'JSON data', description: '{"key": "value"}' },
  { label: 'Mixed case', description: 'ThIs Is MiXeD CaSe TeXt' },
];

const CASE_FNS: Record<CaseType, (s: string) => string> = {
  upper: (s) => s.toUpperCase(),
  lower: (s) => s.toLowerCase(),
  title: (s) => s.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  sentence: (s) => {
    const trimmed = s.trim();
    if (!trimmed) return s;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  },
  camel: (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
  snake: (s) => s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
  kebab: (s) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  alternating: (s) => s.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
  inverse: (s) => s.split('').map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
  capitalize: (s) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
};

export default function CaseConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [activeCase, setActiveCase] = useState<CaseType | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const convert = useCallback((type: CaseType) => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      toast.error('Please enter some text first');
      return;
    }
    setActiveCase(type);
    const fn = CASE_FNS[type];
    setOutputText(fn(trimmed));
  }, [inputText]);

  const handlePreset = useCallback((preset: PresetOption) => {
    const examples: Record<string, string> = {
      'Lorem ipsum': 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Programming': 'const myVariableName = "hello world"; function getData() { return null; }',
      'JSON data': '{"firstName": "john", "lastName": "doe", "emailAddress": "john@example.com"}',
      'Mixed case': 'ThIs Is MiXeD CaSe TeXt WiTh SOme UPPER AND SOME lower',
    };
    setInputText(examples[preset.label] || '');
    setActivePreset(preset.label);
    setOutputText('');
    setActiveCase(null);
    toast.success(`Loaded: ${preset.label}`);
  }, []);

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setActiveCase(null);
    setActivePreset(null);
  };

  const charCount = outputText.length;
  const wordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Presets bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <ToolPresetBar presets={PRESETS} onSelect={handlePreset} activeLabel={activePreset} />
        <button
          onClick={clearAll}
          className="text-xs text-[var(--text-muted)] hover:text-red-400 font-semibold transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Input */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Input text</span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {inputText.length} chars &middot; {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
          </span>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setOutputText(''); setActiveCase(null); }}
          placeholder="Type or paste text here, then pick a case..."
          className="w-full h-48 p-5 bg-transparent outline-none resize-none text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] leading-relaxed"
        />
      </div>

      {/* Case buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {CASE_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => convert(opt.id)}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
              activeCase === opt.id
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-sm'
                : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)] active:scale-[0.97]'
            } ${!inputText.trim() ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <span className="block font-mono text-sm mb-0.5">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Output */}
      <ResultPanel
        value={outputText}
        label="Transformed text"
        mono={false}
        placeholder="Pick a case type above to see the result..."
        downloadFilename={`${activeCase || 'case'}-converted.txt`}
      />

      {/* Stats row */}
      {outputText && (
        <div className="flex gap-4 text-[11px] text-[var(--text-muted)] font-medium">
          <span>Characters: {charCount}</span>
          <span>Words: {wordCount}</span>
          {activeCase && <span className="text-[var(--accent)]">Case: {activeCase}</span>}
        </div>
      )}
    </div>
  );
}
