"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function CaseConverter() {
  const [text, setText] = useState('hello world from toolzum');
  const [result, setResult] = useState('');
  const [activeCase, setActiveCase] = useState<string | null>(null);

  const convert = (type: string) => {
    let r = '';
    switch (type) {
      case 'upper': r = text.toUpperCase(); break;
      case 'lower': r = text.toLowerCase(); break;
      case 'title': r = text.replace(/\b\w/g, c => c.toUpperCase()); break;
      case 'sentence': r = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); break;
      case 'camel': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''); break;
      case 'pascal': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''); break;
      case 'snake': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('_'); break;
      case 'kebab': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('-'); break;
      case 'constant': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toUpperCase()).join('_'); break;
      case 'dot': r = text.replace(/[^\w\s]/g, '').split(/\s+/).map(w => w.toLowerCase()).join('.'); break;
    }
    setResult(r);
    setActiveCase(type);
  };

  const cases = [
    { id: 'upper', label: 'UPPERCASE', icon: 'ABC' },
    { id: 'lower', label: 'lowercase', icon: 'abc' },
    { id: 'title', label: 'Title Case', icon: 'Abc' },
    { id: 'sentence', label: 'Sentence', icon: 'Abc' },
    { id: 'camel', label: 'camelCase', icon: 'aBc' },
    { id: 'pascal', label: 'PascalCase', icon: 'Abc' },
    { id: 'snake', label: 'snake_case', icon: 'a_b_c' },
    { id: 'kebab', label: 'kebab-case', icon: 'a-b-c' },
    { id: 'constant', label: 'CONSTANT_CASE', icon: 'A_B_C' },
    { id: 'dot', label: 'dot.case', icon: 'a.b.c' },
  ];

  const presets = [
    { label: 'Sample Text', apply: () => { setText('hello world from toolzum'); setResult(''); setActiveCase(null); } },
    { label: 'API Response', apply: () => { setText('user id first name last name email address'); setResult(''); setActiveCase(null); } },
    { label: 'CSS Classes', apply: () => { setText('main container header navigation menu item active'); setResult(''); setActiveCase(null); } },
    { label: 'Clear', apply: () => { setText(''); setResult(''); setActiveCase(null); } },
  ];

  const resultText = result ? `Converted to ${cases.find(c => c.id === activeCase)?.label || activeCase}` : 'Enter text and choose a case style';

  return (
    <CalculatorShell category="SEO" title="Case Converter" result={resultText} presets={presets} accent="emerald" downloadData={result} downloadFilename="converted.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
        <textarea value={text} onChange={e => { setText(e.target.value); setResult(''); setActiveCase(null); }} rows={4} placeholder="Enter text to convert..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50 resize-y" />

        <div className="flex flex-wrap gap-2">
          {cases.map(c => (
            <button key={c.id} onClick={() => convert(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${activeCase === c.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[var(--bg-surface)] border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400'} focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2`}>
              <span className="text-[10px] font-mono opacity-50">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {result && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Result</span>
              <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy result"><Copy size={14} /></button>
            </div>
            <textarea readOnly value={result} rows={3} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
