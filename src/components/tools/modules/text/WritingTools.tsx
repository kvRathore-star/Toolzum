"use client";

import React, { useMemo, useState } from 'react';
import { PenTool, Eraser } from 'lucide-react';
import { CalculatorShell } from '../shared/CalculatorShell';

interface AnalysisResult {
  words: number;
  chars: number;
  charsNoSpace: number;
  sentences: number;
  paragraphs: number;
  longWords: number;
  syllables: number;
  uniqueWords: number;
  avgWordLength: number;
  avgSentenceLength: number;
  readingTime: string;
  speakingTime: string;
  fleschKincaid: number;
  readingEase: string;
  vocabularyRichness: number;
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  const vowels = 'aeiouy';
  let count = 0;
  let prevVowel = false;
  for (const c of word) {
    const isVowel = vowels.includes(c);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (word.endsWith('e')) count--;
  if (word.endsWith('le') && word.length > 2) count++;
  if (count === 0) count = 1;
  return Math.max(1, count);
}

function analyze(text: string): AnalysisResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0, chars: 0, charsNoSpace: 0, sentences: 0, paragraphs: 0,
      longWords: 0, syllables: 0, uniqueWords: 0, avgWordLength: 0,
      avgSentenceLength: 0, readingTime: '0 min', speakingTime: '0 min',
      fleschKincaid: 0, readingEase: 'N/A', vocabularyRichness: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chars = trimmed.length;
  const charsNoSpace = trimmed.replace(/\s/g, '').length;
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const longWords = words.filter(w => w.length > 6).length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const avgWordLength = wordCount > 0 ? charsNoSpace / wordCount : 0;
  const avgSentenceLength = wordCount / sentenceCount;

  const totalMinutesReading = wordCount / 238;
  const readingTime = totalMinutesReading < 1 ? '<1 min' : `${Math.ceil(totalMinutesReading)} min`;
  const totalMinutesSpeaking = wordCount / 183;
  const speakingTime = totalMinutesSpeaking < 1 ? '<1 min' : `${Math.ceil(totalMinutesSpeaking)} min`;

  const fleschKincaid = wordCount > 0 && sentenceCount > 0
    ? 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount)
    : 0;

  let readingEase: string;
  if (fleschKincaid >= 90) readingEase = 'Very Easy (5th grade)';
  else if (fleschKincaid >= 80) readingEase = 'Easy (6th grade)';
  else if (fleschKincaid >= 70) readingEase = 'Fairly Easy (7th grade)';
  else if (fleschKincaid >= 60) readingEase = 'Standard (8th-9th grade)';
  else if (fleschKincaid >= 50) readingEase = 'Fairly Difficult (10th-12th grade)';
  else if (fleschKincaid >= 30) readingEase = 'Difficult (College)';
  else readingEase = 'Very Difficult (Graduate)';

  const vocabularyRichness = wordCount > 0 ? (uniqueWords / wordCount) * 100 : 0;

  return {
    words: wordCount,
    chars,
    charsNoSpace,
    sentences: sentenceCount,
    paragraphs: paragraphs.length,
    longWords,
    syllables: totalSyllables,
    uniqueWords,
    avgWordLength,
    avgSentenceLength,
    readingTime,
    speakingTime,
    fleschKincaid: Math.round(fleschKincaid * 10) / 10,
    readingEase,
    vocabularyRichness: Math.round(vocabularyRichness * 10) / 10,
  };
}

const labelCls = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";
const inputCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

export default function WritingTools() {
  const [text, setText] = useState('');

  const result = useMemo(() => analyze(text), [text]);

  const resultStats = [
    { label: 'Words', value: String(result.words) },
    { label: 'Characters', value: result.chars.toLocaleString() },
    { label: 'Sentences', value: String(result.sentences) },
    { label: 'Reading Time', value: result.readingTime },
    { label: 'Flesch-Kincaid', value: String(result.fleschKincaid) },
  ];

  const customResult = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Paragraphs</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{result.paragraphs}</div>
        </div>
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Syllables</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{result.syllables.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Unique Words</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{result.uniqueWords}</div>
        </div>
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Long Words</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{result.longWords}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Speaking Time</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{result.speakingTime}</div>
        </div>
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Avg Word Length</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{result.avgWordLength.toFixed(1)} chars</div>
        </div>
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Vocabulary Richness</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{result.vocabularyRichness}%</div>
        </div>
      </div>

      <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
        <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Readability</div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold ${
            result.fleschKincaid >= 70 ? 'text-green-500' :
            result.fleschKincaid >= 50 ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {result.fleschKincaid}
          </span>
          <span className="text-sm text-[var(--text-primary)]">{result.readingEase}</span>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorShell
      title="Writing Tools"
      icon={<PenTool className="w-5 h-5" />}
      result=""
      onCalculate={() => {}}
      calculateLabel="Analyze"
      resultStats={resultStats}
      resultLabel="Writing Analysis"
      customResult={customResult}
      accent="emerald"
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className={labelCls}>Your Text</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">{result.chars.toLocaleString()} chars</span>
            {text && (
              <button onClick={() => setText('')} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer" title="Clear">
                <Eraser className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste or type your text here for instant analysis..."
          className={`${inputCls} h-40 resize-none font-mono`}
        />
      </div>
    </CalculatorShell>
  );
}
