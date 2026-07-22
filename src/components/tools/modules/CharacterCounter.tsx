"use client";

import React, { useState } from 'react';
import { Type, RefreshCw, BarChart3, HelpCircle, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CharacterCounter() {
  const [text, setText] = useState('');

  // Computes statistics dynamically
  const charCountWithSpaces = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  
  const wordsArray = text.trim() ? text.trim().split(/\s+/) : [];
  const wordCount = wordsArray.length;
  
  const sentencesCount = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  const paragraphsCount = text.trim() ? text.split(/\n+/).filter(p => p.trim()).length : 0;

  // Average reading speed: 200 words per minute
  const readingTimeMinutes = wordCount / 200;
  const readingTimeSeconds = Math.round(readingTimeMinutes * 60);

  // Average speaking speed: 130 words per minute
  const speakingTimeMinutes = wordCount / 130;
  const speakingTimeSeconds = Math.round(speakingTimeMinutes * 60);

  // Word Density Map (top 5 repeated words, minimum 3 letters to filter out common articles)
  const getWordDensity = () => {
    const wordCounts: Record<string, number> = {};
    wordsArray.forEach(w => {
      const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanWord.length >= 3) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });

    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const densities = getWordDensity();

  // Case transforms
  const transformCase = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
    if (!text.trim()) return;

    let result = '';
    if (type === 'upper') {
      result = text.toUpperCase();
    } else if (type === 'lower') {
      result = text.toLowerCase();
    } else if (type === 'title') {
      result = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    } else {
      // Sentence case
      result = text.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (m) => m.toUpperCase());
    }

    setText(result);
    toast.success(`Converted to ${type} case!`);
  };

  const handleClear = () => {
    setText('');
    toast.success('Cleared!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-6 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--accent)]" />
          Advanced Character & Word Analyzer
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
          Detailed text metrics (letters, sentences, paragraphs, read time) and real-time word density tracker.
        </p>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Words', value: wordCount },
          { label: 'Chars (Spaces)', value: charCountWithSpaces },
          { label: 'Chars (No Space)', value: charCountNoSpaces },
          { label: 'Sentences', value: sentencesCount },
          { label: 'Paragraphs', value: paragraphsCount },
        ].map((stat, idx) => (
          <div key={idx} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl text-center shadow-sm">
            <div className="text-3xl font-black text-[var(--accent)]">{stat.value}</div>
            <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor text input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or write your text here to begin analysis..."
              className="w-full h-[400px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none shadow-sm focus:border-indigo-500 transition-colors"
            />
            {text && (
              <button
                onClick={handleClear}
                className="absolute top-4 right-4 bg-zinc-100 hover:bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Clear Text
              </button>
            )}
          </div>

          {/* Quick case modification controls */}
          <div className="flex flex-wrap gap-2 text-xs print:hidden">
            <button onClick={() => transformCase('upper')} className="px-4 py-2.5 bg-[var(--bg-overlay)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl font-bold cursor-pointer">
              UPPERCASE
            </button>
            <button onClick={() => transformCase('lower')} className="px-4 py-2.5 bg-[var(--bg-overlay)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl font-bold cursor-pointer">
              lowercase
            </button>
            <button onClick={() => transformCase('title')} className="px-4 py-2.5 bg-[var(--bg-overlay)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl font-bold cursor-pointer">
              Title Case
            </button>
            <button onClick={() => transformCase('sentence')} className="px-4 py-2.5 bg-[var(--bg-overlay)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl font-bold cursor-pointer">
              Sentence Case
            </button>
          </div>
        </div>

        {/* Read time and Keyword density maps */}
        <div className="space-y-6 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-6 rounded-2xl">
          {/* Times */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <Type className="w-4 h-4 text-[var(--accent)]" />
              Timing Estimates
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-white dark:bg-black/35 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)] block">Read Time</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-[var(--text-secondary)] block mt-1">{readingTimeSeconds} seconds</span>
              </div>
              <div className="p-3 bg-white dark:bg-black/35 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)] block">Speaking Time</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-[var(--text-secondary)] block mt-1">{speakingTimeSeconds} seconds</span>
              </div>
            </div>
          </div>

          {/* Density map */}
          <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
            <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
              Keyword Density Map
            </h4>
            {densities.length > 0 ? (
              <div className="space-y-3">
                {densities.map(([word, count]) => {
                  const pct = ((count / wordCount) * 100).toFixed(1);
                  return (
                    <div key={word} className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-700 dark:text-[var(--text-muted)]">
                        <span className="font-mono font-medium">{word}</span>
                        <span className="font-bold">{count}x ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${Math.min(100, (count / densities[0][1]) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Type more text to build density map.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}