"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function WordCounter() {
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
  const readingTime = words > 0 ? Math.ceil(words / 200) : 0;
  const speakingTime = words > 0 ? Math.ceil(words / 150) : 0;

  const presets = [
    { label: 'Lorem Ipsum', apply: () => setText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.') },
    { label: 'Short (~50 words)', apply: () => setText('This is a short sample text with about fifty words to demonstrate the word counter functionality. It includes several sentences and a few paragraphs.') },
    { label: 'Medium (~200 words)', apply: () => setText('The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet. It is commonly used for font testing and keyboard practice. The sentence has thirty-five letters and nine words. Many variations exist, but this is the most famous one. In typography, pangrams help designers see how fonts render all characters. They also serve as test data for text processing algorithms.') },
    { label: 'Clear', apply: () => setText('') },
  ];

  const resultText = words > 0
    ? `${words} words, ${chars} chars, ${sentences} sentences, ${paragraphs} paragraphs, ${readingTime}m read`
    : 'No text entered';

  const stats = [
    { label: 'Words', value: words, color: 'text-emerald-500' },
    { label: 'Characters', value: chars, color: 'text-blue-700 dark:text-blue-400' },
    { label: 'No Spaces', value: charsNoSpace, color: 'text-violet-500' },
    { label: 'Sentences', value: sentences, color: 'text-amber-500' },
    { label: 'Paragraphs', value: paragraphs, color: 'text-rose-500' },
    { label: 'Read Time', value: `${readingTime}m`, color: 'text-cyan-500', suffix: ` / ${speakingTime}m speak` },
  ];

  return (
    <CalculatorShell category="SEO" title="Word Counter" result={resultText} auto={true} calculateLabel="Count" presets={presets} accent="emerald" downloadData={JSON.stringify({ words, chars, charsNoSpace, sentences, paragraphs, readingTime, speakingTime }, null, 2)} downloadFilename="word-count.json">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
          <textarea aria-label="Text" value={text} onChange={e => setText(e.target.value)} rows={10} placeholder="Paste or type your text here..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50 resize-y" />
        </div>

        {text && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="p-3 bg-[var(--bg-surface)] rounded-xl text-center border border-zinc-200 dark:border-zinc-700">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}{s.suffix || ''}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {text && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Character Composition</div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
              {chars > 0 && <>
                <div style={{ width: `${(charsNoSpace / chars) * 100}%` }} className="bg-emerald-500 h-full" title="Non-space" />
                <div style={{ width: `${((chars - charsNoSpace) / chars) * 100}%` }} className="bg-zinc-400 h-full" title="Spaces" />
              </>}
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>Non-space: {charsNoSpace}</span>
              <span>Spaces: {chars - charsNoSpace}</span>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
