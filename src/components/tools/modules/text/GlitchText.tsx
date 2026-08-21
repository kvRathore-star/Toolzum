"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Type, Copy, Zap, SlidersHorizontal, Shuffle, Undo2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import seedrandom from 'seedrandom';

const ZALGO_UP = [
  '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
  '\u0308', '\u0309', '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F',
  '\u0310', '\u0311', '\u0312', '\u0313', '\u0314', '\u0315', '\u0316', '\u0317',
  '\u0318', '\u0319', '\u031A', '\u031B', '\u031C', '\u031D', '\u031E', '\u031F',
  '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327',
  '\u0328', '\u0329', '\u032A', '\u032B', '\u032C', '\u032D', '\u032E', '\u032F',
  '\u0330', '\u0331', '\u0332', '\u0333', '\u0334', '\u0335', '\u0336', '\u0337',
  '\u0338', '\u0339', '\u033A', '\u033B', '\u033C', '\u033D', '\u033E', '\u033F',
  '\u0340', '\u0341', '\u0342', '\u0343', '\u0344', '\u0345', '\u0346', '\u0347',
  '\u0348', '\u0349', '\u034A', '\u034B', '\u034C', '\u034D', '\u034E', '\u034F',
  '\u0350', '\u0351', '\u0352', '\u0353', '\u0354', '\u0355', '\u0356', '\u0357',
  '\u0358', '\u0359', '\u035A', '\u035B', '\u035C', '\u035D', '\u035E', '\u035F',
  '\u0360', '\u0361', '\u0362', '\u0363', '\u036F'
];

const ZALGO_DOWN = [
  '\u0316', '\u0317', '\u0318', '\u0319', '\u031C', '\u031D', '\u031E', '\u031F',
  '\u0320', '\u0321', '\u0322', '\u0322', '\u0323', '\u0323', '\u0324', '\u0324',
  '\u0325', '\u0325', '\u0326', '\u0326', '\u0327', '\u0327', '\u0328', '\u0328',
  '\u0329', '\u0329', '\u032A', '\u032A', '\u032B', '\u032B', '\u032C', '\u032C',
  '\u032D', '\u032D', '\u032E', '\u032E', '\u032F', '\u032F', '\u0330', '\u0330',
  '\u0331', '\u0331', '\u0332', '\u0332', '\u0333', '\u0333', '\u0334', '\u0334',
  '\u0335', '\u0335', '\u0336', '\u0336', '\u0337', '\u0337', '\u0338', '\u0338',
  '\u0339', '\u0339', '\u033A', '\u033A', '\u033B', '\u033B', '\u033C', '\u033C',
  '\u033D', '\u033D', '\u033E', '\u033E', '\u033F', '\u033F', '\u0340', '\u0340',
  '\u0341', '\u0341', '\u0342', '\u0342', '\u0343', '\u0343', '\u0344', '\u0344',
  '\u0345', '\u0345', '\u0346', '\u0346', '\u0347', '\u0347', '\u0348', '\u0348',
  '\u0349', '\u0349', '\u034A', '\u034A'
];

const ZALGO_MIDDLE = [
  '\u0305', '\u0306', '\u0307', '\u0308', '\u0309', '\u030A', '\u030B', '\u030C',
  '\u030D', '\u030E', '\u030F', '\u0310', '\u0311', '\u0312', '\u0313', '\u0314',
  '\u0315', '\u0316', '\u0317', '\u0318', '\u0318', '\u0319', '\u031A', '\u031B',
  '\u031C', '\u031D', '\u031E', '\u031F', '\u0320', '\u0321', '\u0322', '\u0323',
  '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329', '\u032A', '\u032B',
  '\u032C', '\u032D', '\u032E', '\u032F', '\u0330', '\u0331', '\u0332', '\u0333',
  '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u0339', '\u033A', '\u033B',
  '\u033C', '\u033D', '\u033E', '\u033F', '\u0340', '\u0341', '\u0342', '\u0343',
  '\u0344', '\u0345', '\u0346', '\u0347', '\u0348', '\u0349', '\u034A', '\u034B',
  '\u034C', '\u034D', '\u034E', '\u034F', '\u0350', '\u0351', '\u0352', '\u0353',
  '\u0354', '\u0355', '\u0356', '\u0357', '\u0358', '\u0359', '\u035A', '\u035B',
  '\u035C', '\u035D', '\u035E', '\u035F', '\u0360', '\u0361', '\u0362', '\u0363'
];

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

function applyZalgo(text: string, intensity: number, position: 'up' | 'down' | 'middle' | 'all', rng: () => number): string {
  if (!text) return '';
  const upCount = Math.floor(intensity * 0.4);
  const downCount = Math.floor(intensity * 0.4);
  const middleCount = Math.floor(intensity * 0.2);

  return text.split('').map(char => {
    if (char === ' ' || char === '\n' || char === '\t') return char;
    
    let result = char;
    
    if (position === 'up' || position === 'all') {
      for (let i = 0; i < upCount; i++) {
        result += ZALGO_UP[Math.floor(rng() * ZALGO_UP.length)];
      }
    }
    
    if (position === 'middle' || position === 'all') {
      for (let i = 0; i < middleCount; i++) {
        result += ZALGO_MIDDLE[Math.floor(rng() * ZALGO_MIDDLE.length)];
      }
    }
    
    if (position === 'down' || position === 'all') {
      for (let i = 0; i < downCount; i++) {
        result += ZALGO_DOWN[Math.floor(rng() * ZALGO_DOWN.length)];
      }
    }
    
    return result;
  }).join('');
}

function applyGlitch(text: string, intensity: number, rng: () => number): string {
  if (!text) return '';
  return text.split('').map(char => {
    if (char === ' ' || char === '\n' || char === '\t') return char;
    const rand = rng();
    if (rand < intensity * 0.3) {
      return GLITCH_CHARS[Math.floor(rng() * GLITCH_CHARS.length)];
    }
    if (rand < intensity * 0.4) {
      return char + GLITCH_CHARS[Math.floor(rng() * GLITCH_CHARS.length)];
    }
    return char;
  }).join('');
}

function applyScramble(text: string, intensity: number, rng: () => number): string {
  if (!text) return '';
  return text.split('').map(char => {
    if (char === ' ' || char === '\n' || char === '\t') return char;
    if (rng() < intensity * 0.5) {
      return String.fromCharCode(Math.floor(rng() * 94) + 33);
    }
    return char;
  }).join('');
}

export default function GlitchText() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'zalgo' | 'glitch' | 'scramble'>('zalgo');
  const [intensity, setIntensity] = useState(3);
  const [zalgoPosition, setZalgoPosition] = useState<'up' | 'down' | 'middle' | 'all'>('all');
  const [seed, setSeed] = useState(Date.now());

  const output = useMemo(() => {
    if (!text) return '';
    
    const rng = seedrandom(seed.toString());
    
    switch (mode) {
      case 'zalgo':
        return applyZalgo(text, intensity, zalgoPosition, rng);
      case 'glitch':
        return applyGlitch(text, intensity / 10, rng);
      case 'scramble':
        return applyScramble(text, intensity / 10, rng);
      default:
        return text;
    }
  }, [text, mode, intensity, zalgoPosition, seed]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied to clipboard!');
  }, [output]);

  const handleClear = () => setText('');
  const handleRandomize = () => setSeed(Date.now());

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <Zap className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Glitch Text Generator</h3>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Your Text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste text to glitch..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-28 outline-none resize-none text-sm"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Effect Mode</label>
            <div className="flex flex-wrap gap-2">
{[
              { id: 'zalgo', label: 'Zalgo (Diacritics)', desc: 'Stacks combining marks: h̸e̸l̸l̸o̸', icon: <Zap className="w-4 h-4" /> },
              { id: 'glitch', label: 'Glitch (Corruption)', desc: 'Random char substitution/insertion', icon: <Shuffle className="w-4 h-4" /> },
              { id: 'scramble', label: 'Scramble (Noise)', desc: 'Replaces chars with random symbols', icon: <SlidersHorizontal className="w-4 h-4" /> },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as 'zalgo' | 'glitch' | 'scramble')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  mode === m.id
                    ? 'bg-[var(--accent-ink)] text-white shadow-md'
                    : 'bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]'
                }`}
              >
                  <div className="flex items-center gap-1.5">
                    {m.icon}
                    <span>{m.label}</span>
                  </div>
                  <div className="text-xs opacity-70 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {mode === 'zalgo' && (
            <div>
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Zalgo Position</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All (Max Chaos)', desc: 'Up + Middle + Down' },
                  { id: 'up', label: 'Above Only', desc: 'Stacking marks above' },
                  { id: 'middle', label: 'Through Middle', desc: 'Strikethrough style' },
                  { id: 'down', label: 'Below Only', desc: 'Stacking marks below' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setZalgoPosition(m.id as 'up' | 'down' | 'middle' | 'all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      zalgoPosition === m.id
                        ? 'bg-[var(--accent-ink)] text-white'
                        : 'bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {m.label}
                    <div className="text-[10px] opacity-70 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">
                Intensity: {intensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Random Seed</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={seed}
                  onChange={e => setSeed(Number(e.target.value))}
                  className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none"
                />
                <button
                  onClick={handleRandomize}
                  className="px-3 py-2 rounded-lg bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] text-sm flex items-center gap-1.5"
                >
                  <Undo2 className="w-4 h-4" />
                  Randomize
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Glitched Output</label>
            {output && <span className="text-xs text-[var(--text-muted)]">{output.length} chars</span>}
          </div>
          <div className="relative">
            <textarea
              value={output}
              readOnly
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-28 outline-none resize-none text-sm break-all font-mono"
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
          <button onClick={handleRandomize} className="flex-1 bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5">
            <Shuffle className="w-4 h-4" />
            Re-generate
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-secondary)]">
        <h4 className="font-bold text-[var(--text-primary)] mb-2">Effect Guide</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>Zalgo:</strong> Stacks Unicode combining diacritics (0300-036F) above/below/through text. Works best with Latin characters.</li>
          <li><strong>Glitch:</strong> Randomly substitutes characters and inserts noise symbols. Preserves readability at low intensity.</li>
          <li><strong>Scramble:</strong> Replaces characters with random ASCII symbols. High intensity = unreadable noise.</li>
        </ul>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Seed controls randomness — same seed + same settings = same output. 
          All processing is 100% client-side. No data sent to any server.
        </p>
      </div>
    </div>
  );
}