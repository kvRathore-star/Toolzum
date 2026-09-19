"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, LOREM_WORDS, randInt, randItem } from './GeneratorsShared';

export default function LoremIpsumGenerator() {
  const [type, setType] = useState('paragraphs'); const [count, setCount] = useState(3); const [result, setResult] = useState(''); const [startLorem, setStartLorem] = useState(true);
  const generate = () => {
    const sentences: string[] = []; const total = type === 'words' ? count : type === 'sentences' ? count : count * 4;
    for (let i = 0; i < total; i++) { const len = randInt(5, 15); const words: string[] = []; for (let j = 0; j < len; j++) words.push(randItem(LOREM_WORDS)); words[0]! = words[0]!.charAt(0).toUpperCase() + words[0]!.slice(1); sentences.push(words.join(' ') + '.'); }
    if (type === 'words') { const text = sentences.slice(0, count).join(' ').toLowerCase(); setResult(text); }
    else if (type === 'sentences') setResult(sentences.join(' '));
    else { const paras: string[] = []; for (let i = 0; i < count; i++) { let p = sentences.slice(i * 4, (i + 1) * 4).join(' '); if (i === 0 && startLorem) p = 'Lorem ipsum dolor sit amet, ' + p.charAt(0).toLowerCase() + p.slice(1); paras.push(p); } setResult(paras.join('\n\n')); }
  };

  const presets = [
    { label: '3 Paragraphs', apply: () => { setType('paragraphs'); setCount(3); generate(); } },
    { label: '5 Sentences', apply: () => { setType('sentences'); setCount(5); generate(); } },
    { label: '50 Words', apply: () => { setType('words'); setCount(50); generate(); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? 'Generated ' + type + ' (' + count + ')' : 'Configure and generate';

  return (
    <CalculatorShell category="Utility"
      title="Lorem Ipsum Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="blue"
      downloadData={result}
      downloadFilename="lorem-ipsum.txt"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="mb-3">
            <label htmlFor="lbl-loremipsumgenerator-type" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type</label>
            <select id="lbl-loremipsumgenerator-type" aria-label="Type" value={type} onChange={e => setType(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select>
          </div>
          <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
        </div>
        {type === 'paragraphs' && <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={startLorem} onChange={e => setStartLorem(e.target.checked)} className="accent-blue-500" />Start with "Lorem ipsum..."</label>}
        {result ? (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[200px]">
            <textarea aria-label="Start with &quot;Lorem ipsum...&quot;" readOnly value={result} rows={8} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 font-sans text-xs leading-relaxed resize-none" />
            <div className="flex gap-1 mt-2">
              <button onClick={() => { clipboardWrite(result).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy lorem ipsum"><Copy size={14} /></button>
              <button onClick={() => { const blob = new Blob([result], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'lorem-ipsum.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Download lorem ipsum"><Download size={14} /></button>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-sm text-center">Generate placeholder text</p>
        )}
      </div>
    </CalculatorShell>
  );
}
