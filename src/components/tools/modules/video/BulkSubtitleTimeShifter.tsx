"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const timePresets = [
  { label: 'Delay 1s', offset: 1000 },
  { label: 'Advance 0.5s', offset: -500 },
  { label: 'Delay 5s', offset: 5000 },
  { label: 'Advance 2s', offset: -2000 },
  { label: 'Sync to video', offset: 0 },
];

const sampleSrt = `1
00:00:01,000 --> 00:00:04,000
Hello, welcome to this video.

2
00:00:05,000 --> 00:00:08,000
Today we are going to learn something new.

3
00:00:09,000 --> 00:00:12,000
Let's get started!`;

export default function BulkSubtitleTimeShifter() {
  const [offset, setOffset] = useState(0);
  const [inputText, setInputText] = useState(sampleSrt);
  const [outputText, setOutputText] = useState('');
  const [format, setFormat] = useState<'srt' | 'vtt'>('srt');

  const shiftTime = (timestamp: string, msOffset: number): string => {
    const match = timestamp.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
    if (!match) return timestamp;
    const [, h = 0, m = 0, s = 0, ms = 0] = match.map(Number);
    let totalMs = h * 3600000 + m * 60000 + s * 1000 + ms + msOffset;
    if (totalMs < 0) totalMs = 0;
    const nh = Math.floor(totalMs / 3600000);
    const nm = Math.floor((totalMs % 3600000) / 60000);
    const ns = Math.floor((totalMs % 60000) / 1000);
    const nms = totalMs % 1000;
    const sep = format === 'vtt' ? '.' : ',';
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')}${sep}${String(nms).padStart(3, '0')}`;
  };

  const process = () => {
    const shifted = inputText.replace(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/g, (match) => shiftTime(match, offset));
    setOutputText(shifted);
    toast.success('Subtitles shifted!');
  };

  const copyOutput = () => {
    clipboardWrite(outputText);
    toast.success('Copied!');
  };

  const downloadOutput = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shifted.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap gap-2">
          {timePresets.map((p) => (
            <button key={p.label} onClick={() => setOffset(p.offset)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${offset === p.offset ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Format</label>
            <div className="flex gap-2 mt-1">
              {(['srt', 'vtt'] as const).map((f) => (
                <button key={f} onClick={() => setFormat(f)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${format === f ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]'}`}>
                  .{f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Time Offset (ms)</label>
            <input aria-label="Time Offset (ms)" type="number" value={offset} onChange={(e) => setOffset(Number(e.target.value))} step={100} className="w-full mt-1 p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)]" />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Negative = earlier, Positive = later</p>
          </div>
          <div className="flex items-end">
            <button onClick={process} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all">
              Shift Timestamps
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Input</h4>
            <textarea aria-label="Input" value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full h-[300px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none focus:border-[var(--accent)] transition-colors" placeholder="Paste your subtitles here..." />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Output</h4>
              {outputText && (
                <div className="flex gap-3">
                  <button onClick={copyOutput} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
                  <button onClick={downloadOutput} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download .{format}</button>
                </div>
              )}
            </div>
            <textarea aria-label="Copy" value={outputText} readOnly className="w-full h-[300px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" placeholder="Shifted subtitles will appear here..." />
          </div>
        </div>

        {outputText && (
          <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <h5 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Before / After Comparison</h5>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[var(--text-muted)] text-[10px] uppercase">Original</span>
                <pre className="mt-1 text-[var(--text-secondary)] whitespace-pre-wrap max-h-24 overflow-auto">{inputText.split('\n').filter(l => l.includes('-->')).slice(0, 3).join('\n')}</pre>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-[10px] uppercase">Shifted (+{offset}ms)</span>
                <pre className="mt-1 text-[var(--text-secondary)] whitespace-pre-wrap max-h-24 overflow-auto">{outputText.split('\n').filter(l => l.includes('-->')).slice(0, 3).join('\n')}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
