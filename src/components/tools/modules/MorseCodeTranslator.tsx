"use client";

import React, { useState } from 'react';
import { FileText, Copy, Play, Volume2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function MorseCodeTranslator() {
  const [text, setText] = useState('');
  const [morse, setMorse] = useState('');

  const morseMap: Record<string, string> = {
    'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.',
    'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
    'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.',
    's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
    'y': '-.--', 'z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/'
  };

  const reverseMorseMap = Object.entries(morseMap).reduce((acc, [key, val]) => {
    acc[val] = key;
    return acc;
  }, {} as Record<string, string>);

  const translateToMorse = () => {
    if (!text.trim()) {
      setMorse('');
      return;
    }
    const clean = text.toLowerCase().trim();
    const result = clean
      .split('')
      .map(char => morseMap[char] || char)
      .join(' ');
    setMorse(result);
  };

  const translateToText = () => {
    if (!morse.trim()) {
      setText('');
      return;
    }
    const result = morse
      .split(' ')
      .map(code => reverseMorseMap[code] || code)
      .join('');
    setText(result.toUpperCase());
  };

  // Web Audio API dot/dash feedback player
  const playMorseSound = () => {
    if (!morse) return;
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dotDuration = 0.08; // dot length in seconds
    let time = audioCtx.currentTime;

    const chars = morse.split('');
    chars.forEach(char => {
      if (char === '.' || char === '-') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.frequency.setValueAtTime(600, time); // 600Hz frequency beep
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.3, time + 0.005);

        const duration = char === '.' ? dotDuration : dotDuration * 3;
        gainNode.gain.setValueAtTime(0.3, time + duration - 0.005);
        gainNode.gain.linearRampToValueAtTime(0, time + duration);

        osc.start(time);
        osc.stop(time + duration);
        time += duration + dotDuration;
      } else if (char === ' ') {
        time += dotDuration * 2;
      } else if (char === '/') {
        time += dotDuration * 4;
      }
    });
    toast.success('Playing audio synthesis...');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-[var(--accent)]" />
          Morse Code Translator & Audio Synthesizer
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Translate English text to Morse Code signals and play clean audio dots and dashes offline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs text-[var(--text-muted)] font-bold uppercase block">English Plaintext</span>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && translateToMorse()}
            placeholder="Type standard text here..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-48 outline-none text-xs resize-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <button onClick={translateToMorse} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              Translate to Morse →
            </button>
            <button onClick={() => { clipboardWrite(text); toast.success('Copied text!'); }} className="border border-zinc-800 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              Copy Text
            </button>
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase">Morse Code Output</span>
            {morse && (
              <button onClick={playMorseSound} className="text-xs text-emerald-400 font-bold flex items-center gap-1 hover:underline cursor-pointer">
                <Play className="w-4 h-4" /> Play Audio Beeps
              </button>
            )}
          </div>
          <textarea
            value={morse}
            onChange={e => setMorse(e.target.value)}
            placeholder="Morse code dots and dashes (e.g. .... . .-.. .-.. ---)..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-emerald-400 font-mono h-48 outline-none text-xs resize-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <button onClick={translateToText} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              ← Translate to Text
            </button>
            <button onClick={() => { clipboardWrite(morse); toast.success('Copied morse!'); }} className="border border-zinc-800 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              Copy Morse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}