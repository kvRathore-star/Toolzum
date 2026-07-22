"use client";

import React, { useState } from 'react';
import { Sparkles, Copy, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WordDensity {
  word: string;
  count: number;
  density: number;
}

export default function KeywordDensityChecker() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<WordDensity[]>([]);
  const [ignoreStopwords, setIgnoreStopwords] = useState(true);

  const stopwords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
    'did', 'do', 'does', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
    'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
    'is', 'it', 'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
    'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
    'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
    'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
    'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  const analyzeDensity = () => {
    if (!text.trim()) {
      setResults([]);
      return;
    }

    // Extract alphanumeric word tokens
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 1);

    const totalWords = words.length;
    const wordCounts: Record<string, number> = {};

    words.forEach(w => {
      if (ignoreStopwords && stopwords.has(w)) return;
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });

    const densities: WordDensity[] = Object.entries(wordCounts)
      .map(([word, count]) => ({
        word,
        count,
        density: parseFloat(((count / totalWords) * 100).toFixed(2))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 keywords

    setResults(densities);
    toast.success('Text analyzed successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-[var(--accent)]" />
          Keyword Density Checker
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Analyze copy texts to map word frequency patterns and check stopword occurrences client-side.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs text-[var(--text-muted)] font-bold uppercase block">Content Copy</span>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste article, blog post, or keywords content to analyze..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-72 outline-none text-xs resize-none"
          />

          <div className="flex justify-between items-center text-xs border-t border-zinc-800 pt-3">
            <label className="text-[var(--text-muted)] flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={ignoreStopwords} onChange={e => setIgnoreStopwords(e.target.checked)} />
              Ignore Common Stopwords (the, as, or)
            </label>
            <button onClick={analyzeDensity} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow">
              Check Density
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl min-h-[300px] flex flex-col justify-center">
          {results.length > 0 ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase block border-b border-zinc-800 pb-2">Top density Keywords</span>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {results.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-[var(--bg-overlay)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                    <span className="font-bold text-zinc-300 font-mono">#{idx+1} {item.word}</span>
                    <span className="text-[var(--text-secondary)]">Count: {item.count} ({item.density}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-[var(--text-secondary)]">
              <Search className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 animate-pulse" />
              <p className="text-xs">No analysis computed yet. Enter text and trigger analysis check.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}