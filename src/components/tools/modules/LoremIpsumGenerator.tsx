"use client";

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';

const STYLES = {
  standard: {
    words: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'],
  },
  cicero: {
    words: ['sed', 'ut', 'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error', 'sit', 'voluptatem', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis', 'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo', 'nemo', 'enim', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'sit', 'aspernatur', 'aut', 'odit', 'aut', 'fugit', 'sed', 'quia', 'consequuntur', 'magni', 'dolores', 'eos', 'qui', 'ratione', 'voluptatem', 'sequi', 'nesciunt', 'neque', 'porro', 'quisquam', 'est', 'qui', 'dolorem', 'ipsum', 'quia', 'dolor', 'sit', 'amet', 'consectetur', 'adipisci', 'velit'],
  },
  legal: {
    words: ['whereas', 'hereinafter', 'party', 'agreement', 'shall', 'pursuant', 'thereto', 'foregoing', 'notwithstanding', 'hereby', 'witnesseth', 'thereof', 'therein', 'thereunder', 'hereunder', 'herein', 'thereafter', 'thereby', 'wherein', 'whereof', 'aforementioned', 'aforesaid', 'hereinafter', 'indemnify', 'hold', 'harmless', 'obligation', 'breach', 'remedy', 'arbitration', 'governing', 'law', 'jurisdiction', 'venue', 'waiver', 'severability', 'entire', 'agreement', 'binding', 'effect', 'successors', 'assigns', 'force', 'majeure', 'termination', 'default', 'notice', 'period', 'covenant', 'representation', 'warranty', 'liability', 'damages', 'reasonable', 'attorneys', 'fees', 'costs', 'expenses', 'executed', 'delivered', 'accepted', 'obligations', 'rights', 'duties', 'performance'],
  },
  startup: {
    words: ['disrupt', 'scale', 'synergy', 'leverage', 'innovate', 'pivot', 'growth', 'hack', 'mvp', 'venture', 'funding', 'series', 'valuation', 'exit', 'ipo', 'acquisition', 'bootstrapped', 'saas', 'platform', 'ecosystem', 'bandwidth', 'deep', 'dive', 'paradigm', 'shift', 'streamline', 'optimize', 'revenue', 'monetize', 'user', 'engagement', 'retention', 'churn', 'kpi', 'metric', 'dashboard', 'roadmap', 'sprint', 'agile', 'scrum', 'iteration', 'feedback', 'loop', 'product', 'market', 'fit', 'traction', 'burn', 'rate', 'runway', 'unit', 'economics', 'lifetime', 'value', 'customer', 'acquisition', 'cost', 'roi', 'stakeholder', 'alignment', 'deliverable', 'actionable', 'insights', 'holistic', 'ecosystem'],
  },
  coffee: {
    words: ['arabica', 'robusta', 'espresso', 'latte', 'cappuccino', 'americano', 'mocha', 'macchiato', 'flat', 'white', 'cold', 'brew', 'pour', 'over', 'french', 'press', 'aero', 'press', 'chemex', 'siphon', 'moka', 'pot', 'ristretto', 'lungo', 'doppio', 'affogato', 'frappe', 'irish', 'coffee', 'beans', 'roast', 'light', 'medium', 'dark', 'blonde', 'single', 'origin', 'blend', 'barista', 'crema', 'body', 'acidity', 'bitter', 'smooth', 'bold', 'earthy', 'fruity', 'floral', 'chocolate', 'caramel', 'nutty', 'smoky', 'grind', 'coarse', 'fine', 'medium', 'tamping', 'extraction', 'brew', 'time', 'water', 'temperature', 'steam', 'milk', 'foam', 'micro', 'foam', 'latte', 'art'],
  },
  pirate: {
    words: ['ahoy', 'matey', 'ship', 'crew', 'treasure', 'gold', 'doubloon', 'plank', 'walk', 'sail', 'ocean', 'sea', 'voyage', 'anchor', 'cannon', 'sword', 'parrot', 'eye', 'patch', 'peg', 'leg', 'rum', 'bottle', 'map', 'compass', 'island', 'desert', 'bury', 'chest', 'skull', 'bones', 'flag', 'jolly', 'roger', 'captain', 'first', 'mate', 'boatswain', 'scurvy', 'dog', 'landlubber', 'avast', 'arrr', 'shiver', 'timbers', 'blimey', 'booty', 'plunder', 'pillage', 'sink', 'swab', 'deck', 'crow', 'nest', 'horizon', 'storm', 'wave', 'sloop', 'galleon', 'frigate', 'cutlass', 'pistol', 'mutiny', 'keelhaul', 'walking', 'plank'],
  },
};

const STANDARD_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface GeneratorOptions {
  paragraphs: number;
  wordsPerPara: number;
  style: keyof typeof STYLES;
  includeStandard: boolean;
  includeHtml: boolean;
}

function generateText(opts: GeneratorOptions): string {
  const { paragraphs, wordsPerPara, style, includeStandard, includeHtml } = opts;
  const words = STYLES[style].words;
  const paras: string[] = [];

  for (let p = 0; p < paragraphs; p++) {
    const sentenceCount = Math.max(2, Math.floor(wordsPerPara / 6));
    const sentences: string[] = [];

    if (p === 0 && includeStandard) {
      sentences.push(STANDARD_OPENING);
    }

    for (let s = 0; s < sentenceCount; s++) {
      const len = Math.floor(Math.random() * 8) + 4;
      const sWords: string[] = [];
      for (let w = 0; w < len; w++) {
        sWords.push(pick(words));
      }
      let sentence = sWords.join(' ');
      sentence = capitalize(sentence) + '.';
      sentences.push(sentence);
    }

    let para = sentences.join(' ');
    if (includeHtml) {
      para = `<p>${para}</p>`;
    }
    paras.push(para);
  }

  return paras.join(includeHtml ? '\n' : '\n\n');
}

export default function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState<number | 'custom'>(100);
  const [customWords, setCustomWords] = useState(120);
  const [style, setStyle] = useState<keyof typeof STYLES>('standard');
  const [includeStandard, setIncludeStandard] = useState(true);
  const [includeHtml, setIncludeHtml] = useState(false);
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const getWordsPerPara = () => {
    return wordsPerParagraph === 'custom' ? customWords : wordsPerParagraph;
  };

  const handleGenerate = () => {
    const wpp = getWordsPerPara();
    const text = generateText({ paragraphs, wordsPerPara: wpp, style, includeStandard, includeHtml });
    setOutput(text);
  };

  const handleCopy = async () => {
    if (!output) { toast.error('Generate text first'); return; }
    try {
      await clipboardWrite(output);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!output) { toast.error('Generate text first'); return; }
    try {
      const blob = new Blob([output], { type: includeHtml ? 'text/html' : 'text/plain' });
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      await downloadOrShare(url, `lorem-ipsum.${includeHtml ? 'html' : 'txt'}`);
    } catch {
      toast.error('Download failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const charCount = output.length;
  const wordCount = output ? output.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-sm space-y-1">
        <h4 className="font-bold text-[var(--text-primary)]">Lorem Ipsum Generator</h4>
        <p className="text-zinc-600 dark:text-[var(--text-muted)]">Generate placeholder text in various styles and formats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-6 space-y-5">
          <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-zinc-200 dark:border-[var(--border-subtle)] pb-2">Options</h4>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">Paragraphs ({paragraphs})</label>
            <input type="range" min={1} max={20} value={paragraphs} onChange={e => setParagraphs(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>1</span><span>20</span></div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">Words Per Paragraph</label>
            <div className="flex flex-wrap gap-2">
              {[50, 100, 200].map(n => (
                <button key={n} onClick={() => setWordsPerParagraph(n)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${wordsPerParagraph === n ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>{n}</button>
              ))}
              <button onClick={() => setWordsPerParagraph('custom')} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${wordsPerParagraph === 'custom' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>Custom</button>
            </div>
            {wordsPerParagraph === 'custom' && (
              <input type="number" min={10} max={500} value={customWords} onChange={e => setCustomWords(Math.max(10, Math.min(500, Number(e.target.value))))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] outline-none" />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">Style</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STYLES) as Array<keyof typeof STYLES>).map(s => (
                <button key={s} onClick={() => setStyle(s)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize ${style === s ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeStandard} onChange={e => setIncludeStandard(e.target.checked)} className="rounded" />
              <span className="text-sm text-[var(--text-primary)]">Start with "Lorem ipsum dolor sit amet"</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeHtml} onChange={e => setIncludeHtml(e.target.checked)} className="rounded" />
              <span className="text-sm text-[var(--text-primary)]">Wrap paragraphs in &lt;p&gt; tags</span>
            </label>
          </div>

          <button onClick={handleGenerate} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Generate</button>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Output</h4>
            {output && (
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span>{charCount} chars</span>
                <span>{wordCount} words</span>
              </div>
            )}
          </div>

          {output ? (
            <div className="space-y-3">
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 max-h-80 overflow-y-auto">
                {includeHtml ? (
                  <div className="text-sm text-[var(--text-primary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: output.replace(/\n/g, '') }} />
                ) : (
                  <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-sans leading-relaxed">{output}</pre>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={handleCopy} className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors">Copy</button>
                <button onClick={handleDownload} className="flex-1 px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold rounded-xl text-sm transition-colors">Download</button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm">Adjust options and click Generate</div>
          )}
        </div>
      </div>
    </div>
  );
}
