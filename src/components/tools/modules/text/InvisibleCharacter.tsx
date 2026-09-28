"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Type, Copy, Eye, EyeOff, Search, Minus, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const INVISIBLE_CHARS = [
  { id: 'zwsp', name: 'Zero Width Space', char: '\u200B', code: 'U+200B', desc: 'Invisible separator, allows line breaks without visible space' },
  { id: 'zwnj', name: 'Zero Width Non-Joiner', char: '\u200C', code: 'U+200C', desc: 'Prevents ligature/conjoining between characters' },
  { id: 'zwj', name: 'Zero Width Joiner', char: '\u200D', code: 'U+200D', desc: 'Forces ligature/conjoining (used in emoji sequences)' },
  { id: 'lr', name: 'Left-to-Right Mark', char: '\u200E', code: 'U+200E', desc: 'Forces left-to-right text direction' },
  { id: 'rl', name: 'Right-to-Left Mark', char: '\u200F', code: 'U+200F', desc: 'Forces right-to-left text direction' },
  { id: 'wj', name: 'Word Joiner', char: '\u2060', code: 'U+2060', desc: 'Like ZWSP but prevents line breaks' },
  { id: 'inhib', name: 'Invisible Separator', char: '\u2063', code: 'U+2063', desc: 'Invisible comma-like separator' },
  { id: 'times', name: 'Invisible Times', char: '\u2062', code: 'U+2062', desc: 'Invisible multiplication operator' },
  { id: 'space', name: 'Zero Width Space (alt)', char: '\uFEFF', code: 'U+FEFF', desc: 'Byte Order Mark / Zero Width No-Break Space' },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

export default function InvisibleCharacter() {
  const [text, setText] = useState('');
  const [selectedChars, setSelectedChars] = useState<string[]>(['zwsp']);
  const [count, setCount] = useState(1);
  const [showInvisible, setShowInvisible] = useState(false);
  const [output, setOutput] = useState('');

  const selectedCharObjs = useMemo(() => 
    INVISIBLE_CHARS.filter(c => selectedChars.includes(c.id)), 
    [selectedChars]
  );

  const invisibleSequence = useMemo(() => 
    selectedCharObjs.map(c => c.char).join(''), 
    [selectedCharObjs]
  );

  const generateOutput = useCallback(() => {
    if (!text) {
      setOutput(invisibleSequence.repeat(count));
      return;
    }
    
    const separator = invisibleSequence;
    const parts = text.split('');
    setOutput(parts.join(separator));
  }, [text, invisibleSequence, count]);

  useMemo(() => generateOutput(), [text, invisibleSequence, count]);

  const handleCopy = () => {
    if (!output) return;
    clipboardWrite(output).then(ok => { if (ok) toast.success('Copied to clipboard!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const handleClear = () => {
    setText('');
    setOutput('');
  };

  const handleCopyRaw = () => {
    if (!invisibleSequence) return;
    clipboardWrite(invisibleSequence.repeat(count)).then(ok => { if (ok) toast.success(`Copied ${count}x ${selectedCharObjs.map(c => c.name).join(' + ')}!`); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const toggleInvisible = (id: string) => {
    setSelectedChars(prev => prev.includes(id) 
      ? prev.filter(c => c !== id) 
      : [...prev, id]
    );
  };

  const handleCountChange = (delta: number) => {
    setCount(prev => Math.max(1, Math.min(100, prev + delta)));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <Eye className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Invisible Character Generator</h3>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Select Invisible Characters</label>
          <div className="flex flex-wrap gap-2">
            {INVISIBLE_CHARS.map(c => (
              <button
                key={c.id}
                onClick={() => toggleInvisible(c.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedChars.includes(c.id)
                    ? 'bg-[var(--accent-ink)] text-white shadow-md'
                    : 'bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]'
                }`}
                title={c.desc}
              >
                <span className="font-mono text-xs">{c.code}</span>
                <span className="ml-1">{c.name}</span>
              </button>
            ))}
          </div>
          {selectedChars.length === 0 && (
            <p className="text-xs text-red-500">Select at least one invisible character</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Input Text (optional)</label>
          <textarea aria-label="Input Text (optional)"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Text to inject invisible chars between each character..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none text-sm"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Minus onClick={() => handleCountChange(-1)} className="w-8 h-8 rounded-lg bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)]" />
            <span className="w-12 text-center font-mono text-lg font-bold">{count}</span>
            <Plus onClick={() => handleCountChange(1)} className="w-8 h-8 rounded-lg bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)]" />
            <span className="text-xs text-[var(--text-muted)] ml-2">Repeat count</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowInvisible(!showInvisible)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              {showInvisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} Show Invisible
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Invisible Sequence</label>
            {invisibleSequence && (
              <button onClick={handleCopyRaw} className="px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">
                Copy Raw
              </button>
            )}
          </div>
          <div className="relative">
            <textarea aria-label="Invisible Sequence"
              value={showInvisible 
                ? output.split('').map(c => INVISIBLE_CHARS.find(ic => ic.char === c) ? `[${INVISIBLE_CHARS.find(ic => ic.char === c)!.name.charAt(0).toUpperCase() + INVISIBLE_CHARS.find(ic => ic.char === c)!.name.slice(1)}]` : c).join('') 
                : output
              }
              readOnly
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none text-sm break-all font-mono"
            />
            {output && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button onClick={handleClear} className="flex-1 bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] font-bold py-2.5 rounded-xl transition-colors">
            Clear
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-secondary)]">
        <h4 className="font-bold text-[var(--text-primary)] mb-2">Invisible Character Reference</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          {INVISIBLE_CHARS.map(c => (
            <div key={c.id} className="p-2 bg-[var(--bg-elevated)] rounded border border-[var(--border-subtle)]">
              <div className="font-mono text-[var(--accent)]">{c.code}</div>
              <div className="text-[var(--text-primary)] font-medium">{c.name}</div>
              <div className="text-[var(--text-muted)] truncate">{c.desc}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          <strong>Use cases:</strong> Bypass character limits, create invisible usernames, watermark text, prevent line breaks (Word Joiner), force text direction (LTR/RTL marks), separate emoji sequences (ZWJ), break ligatures (ZWNJ).
          <br />All characters are Unicode zero-width characters. 100% client-side. No data sent to servers.
        </p>
      </div>
    </div>
  );
}