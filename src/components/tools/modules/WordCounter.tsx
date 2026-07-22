"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function WordCounter() {
  const [inputText, setInputText] = useState('');

  const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const characters = inputText.length;
  const charactersNoSpaces = inputText.replace(/\s/g, '').length;
  const paragraphs = inputText.trim() ? inputText.split(/\n+/).filter(p => p.trim()).length : 0;
  const sentences = inputText.trim() ? inputText.split(/[.!?]+/).filter(s => s.trim()).length : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Words', value: words },
          { label: 'Characters', value: characters },
          { label: 'No Spaces', value: charactersNoSpaces },
          { label: 'Sentences', value: sentences },
          { label: 'Paragraphs', value: paragraphs },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-[var(--accent)] dark:text-[var(--accent)]">{stat.value}</div>
            <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste your text here to count..."
          className="w-full h-[500px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none shadow-sm focus:border-indigo-500 transition-colors"
        />
        <button 
          onClick={() => { setInputText(''); toast.success('Cleared!'); }}
          className="absolute top-4 right-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-zinc-600 dark:text-zinc-300 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          Clear Text
        </button>
      </div>
    </div>
  );
}