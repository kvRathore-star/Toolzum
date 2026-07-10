"use client";

import React, { useState, useCallback } from 'react';
import { Volume2, Play, Pause, Type, Globe } from 'lucide-react';

const VOICES = [
  { label: 'US English (Female)', lang: 'en-US' },
  { label: 'UK English (Female)', lang: 'en-GB' },
  { label: 'Indian English', lang: 'en-IN' },
  { label: 'Australian English', lang: 'en-AU' },
];

export default function PronunciationTool() {
  const [text, setText] = useState('');
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(0.8);

  const speak = useCallback(() => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICES[voiceIndex].lang;
    utterance.rate = rate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [text, voiceIndex, rate]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-sky-500" />
          Pronunciation Tool — Text to Speech
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Type any word or phrase and hear it pronounced clearly. Supports multiple English accents with adjustable speed.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            Enter text to pronounce
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a word, phrase, or sentence..."
            rows={3}
            className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Accent
            </label>
            <select
              value={voiceIndex}
              onChange={(e) => setVoiceIndex(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              {VOICES.map((v, i) => (
                <option key={i} value={i}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={speak}
            disabled={!text.trim()}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-600/50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Pronounce
          </button>
          <button
            onClick={stop}
            disabled={!isSpeaking}
            className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-40 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Pause className="w-4 h-4" />
            Stop
          </button>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Pronunciation uses your browser&apos;s built-in speech synthesis (Web Speech API).
            Voice quality depends on your operating system and installed voices.
            Works fully offline in Chrome and Edge.
          </p>
        </div>
      </div>
    </div>
  );
}
