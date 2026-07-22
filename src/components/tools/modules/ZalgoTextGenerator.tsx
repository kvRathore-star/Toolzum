"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const ZALGO_UP = [
  '\u030d', '\u030e', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u0309', '\u030a', '\u030b', '\u030c',
  '\u030f', '\u0311', '\u0312', '\u0313', '\u0314', '\u031a', '\u031b', '\u031c', '\u031d', '\u031e', '\u031f',
  '\u0320', '\u032d', '\u0330', '\u0331', '\u033e', '\u0357', '\u0358', '\u035d', '\u035e', '\u0360', '\u0361',
  '\u0362', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c',
  '\u036d', '\u036e', '\u036f', '\u033d', '\u0300', '\u0301', '\u0302', '\u0303'
];

const ZALGO_DOWN = [
  '\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0321', '\u0322',
  '\u0323', '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329', '\u032a', '\u032b', '\u032c', '\u032e',
  '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347',
  '\u0348', '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035a', '\u035b',
  '\u035c', '\u035f', '\u0362', '\u0300', '\u0301', '\u0302', '\u0303'
];

const ZALGO_MID = [
  '\u0315', '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u0358', '\u0320', '\u0338', '\u035c', '\u035d'
];

export default function ZalgoTextGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [intensity, setIntensity] = useState(8);
  const [goUp, setGoUp] = useState(true);
  const [goMid, setGoMid] = useState(true);
  const [goDown, setGoDown] = useState(true);

  const getRand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const corruptText = (textVal: string) => {
    if (!textVal) {
      setOutput('');
      return;
    }

    let result = '';
    for (let char of textVal) {
      if (char === '\n' || char === ' ') {
        result += char;
        continue;
      }

      result += char;

      // Stacking characters based on intensity
      const counts = Math.floor(Math.random() * intensity) + 1;
      for (let i = 0; i < counts; i++) {
        if (goUp && Math.random() > 0.3) {
          result += getRand(ZALGO_UP);
        }
        if (goMid && Math.random() > 0.4) {
          result += getRand(ZALGO_MID);
        }
        if (goDown && Math.random() > 0.3) {
          result += getRand(ZALGO_DOWN);
        }
      }
    }
    setOutput(result);
  };

  useEffect(() => {
    corruptText(input);
  }, [input, intensity, goUp, goMid, goDown]);

  const loadSample = () => {
    setInput("This text is corrupt and cursed! Join the darkness.");
    toast.success("Loaded sample text!");
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await clipboardWrite(output);
      toast.success("Cursed Zalgo copied to clipboard!");
    } catch {
      toast.error("Failed to copy text.");
    }
  };

  const clearAll = () => {
    setInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 text-sm space-y-1">
        <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
          👻 Interactive Zalgo Text Generator
        </h4>
        <p className="text-zinc-600 dark:text-[var(--text-muted)]">
          Transform standard string text into cursed, creepy Zalgo text by layering diacritical marks. Customise intensity and stacking bounds entirely client-side.
        </p>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-6 space-y-6 h-fit">
          <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-zinc-200 dark:border-[var(--border-subtle)] pb-2">
            Zalgo Parameters
          </h4>

          {/* Corruption Intensity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Cursed Level (1-20)</label>
              <span className="text-sm font-extrabold text-red-500">{intensity}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-lg appearance-none cursor-pointer accent-red-600 mt-2"
            />
          </div>

          {/* Stacking Options */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] font-semibold select-none">
              <input
                type="checkbox"
                checked={goUp}
                onChange={e => setGoUp(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-800 text-red-600 focus:ring-red-500 h-4 w-4"
              />
              Stack Above (Upwards)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] font-semibold select-none">
              <input
                type="checkbox"
                checked={goMid}
                onChange={e => setGoMid(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-800 text-red-600 focus:ring-red-500 h-4 w-4"
              />
              Stack Middle (Cross through)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] font-semibold select-none">
              <input
                type="checkbox"
                checked={goDown}
                onChange={e => setGoDown(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-800 text-red-600 focus:ring-red-500 h-4 w-4"
              />
              Stack Below (Downwards)
            </label>
          </div>

          <button
            onClick={loadSample}
            className="w-full bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-zinc-800 dark:text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
          >
            💡 Load Sample Text
          </button>
        </div>

        {/* Input & Output Area */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-auto">
          {/* Input Block */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl flex flex-col h-[200px]">
            <div className="px-4 py-3 bg-black/20 border-b border-zinc-200 dark:border-[var(--border-subtle)] flex justify-between items-center shrink-0">
              <span className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-wider">
                Normal Input Text
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-400 font-semibold"
              >
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste standard text here..."
              className="flex-1 p-4 bg-transparent outline-none resize-none font-mono text-sm text-[var(--text-primary)]"
            />
          </div>

          {/* Output Block */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl flex flex-col h-[250px] overflow-hidden">
            <div className="px-4 py-3 bg-black/20 border-b border-zinc-200 dark:border-[var(--border-subtle)] flex justify-between items-center shrink-0">
              <span className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-wider">
                Cursed Zalgo Output
              </span>
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className="text-xs text-blue-500 hover:text-blue-400 font-semibold disabled:opacity-50"
              >
                📋 Copy Cursed Text
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Cursed text will creep here..."
              className="flex-1 p-4 bg-transparent outline-none resize-none font-sans text-lg text-red-500 dark:text-red-400 overflow-y-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

