"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface Breakdown {
  burstiness: { score: number; variance: number; stdDev: number; avgLength: number };
  repetition: { score: number; ngramReps: number; totalNgrams: number };
  triggerPhrases: { score: number; found: string[]; total: number };
}

interface ParagraphScore {
  index: number;
  text: string;
  score: number;
}

const TRIGGER_PHRASES = [
  "In today's digital age", "In conclusion", "It is important to note that",
  "The landscape of", "A tapestry of", "Let's delve into", "Navigating the complexities",
  "It's worth noting that", "As an AI language model", "I cannot", "I'm sorry, but",
  "In the realm of", "When it comes to", "Not only... but also", "In order to",
];

function detectSentences(text: string): string[] {
  const cleaned = text.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
  const parts = cleaned.split(/(?<=[.!?])\s+/);
  return parts.filter(s => s.trim().length > 0);
}

function analyzeBurstiness(text: string): { score: number; variance: number; stdDev: number; avgLength: number } {
  const sentences = detectSentences(text);
  if (sentences.length < 2) return { score: 50, variance: 0, stdDev: 0, avgLength: 0 };
  const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + (l - avg) ** 2, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const maxPossibleVariance = avg * avg;
  const normalizedVariance = Math.min(variance / Math.max(maxPossibleVariance, 1), 1);
  const score = Math.round((1 - normalizedVariance) * 100);
  return { score: Math.max(0, Math.min(100, score)), variance, stdDev, avgLength: avg };
}

function analyzeRepetition(text: string): { score: number; ngramReps: number; totalNgrams: number } {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length < 4) return { score: 50, ngramReps: 0, totalNgrams: 0 };
  let repeats = 0;
  let total = 0;
  for (let n = 2; n <= 4; n++) {
    const seen = new Map<string, number>();
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      seen.set(ngram, (seen.get(ngram) || 0) + 1);
      total++;
    }
    for (const count of seen.values()) {
      if (count > 1) repeats += count - 1;
    }
  }
  const repetitionRate = total > 0 ? repeats / total : 0;
  const score = Math.round(Math.min(repetitionRate * 200, 100));
  return { score: Math.max(0, Math.min(100, score)), ngramReps: repeats, totalNgrams: total };
}

function analyzeTriggerPhrases(text: string): { score: number; found: string[]; total: number } {
  const lower = text.toLowerCase();
  const found = TRIGGER_PHRASES.filter(p => lower.includes(p.toLowerCase()));
  const ratio = found.length / TRIGGER_PHRASES.length;
  const score = Math.round(Math.min(ratio * 200, 100));
  return { score, found, total: TRIGGER_PHRASES.length };
}

function analyzeText(text: string) {
  const burstiness = analyzeBurstiness(text);
  const repetition = analyzeRepetition(text);
  const triggerPhrases = analyzeTriggerPhrases(text);
  const combinedScore = Math.round(
    burstiness.score * 0.4 + repetition.score * 0.3 + triggerPhrases.score * 0.3
  );
  return { score: combinedScore, breakdown: { burstiness, repetition, triggerPhrases } };
}

function getScoreColor(score: number): string {
  if (score < 35) return 'text-emerald-500';
  if (score < 65) return 'text-amber-500';
  return 'text-red-500';
}

function getScoreBg(score: number): string {
  if (score < 35) return 'bg-emerald-700/10 border-emerald-500/20';
  if (score < 65) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

function getScoreLabel(score: number): string {
  if (score < 35) return 'Likely Human-Written';
  if (score < 65) return 'Uncertain / Mixed';
  return 'Likely AI-Generated';
}

function getScoreEmoji(score: number): string {
  if (score < 35) return '\u{1F9F1}';
  if (score < 65) return '\u{1F937}';
  return '\u{1F916}';
}

function highlightAiPatterns(text: string, foundPhrases: string[]): React.ReactNode[] {
  if (!foundPhrases.length) return [text];
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  const sorted = [...foundPhrases].sort((a, b) => remaining.indexOf(a) - remaining.indexOf(b));
  for (const phrase of sorted) {
    const idx = remaining.toLowerCase().indexOf(phrase.toLowerCase());
    if (idx === -1) continue;
    if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    parts.push(
      <span key={key++} className="bg-red-500/20 text-red-700 dark:text-red-300 rounded-sm px-0.5 font-medium">
        {remaining.slice(idx, idx + phrase.length)}
      </span>
    );
    remaining = remaining.slice(idx + phrase.length);
  }
  if (remaining) parts.push(<span key={key++}>{remaining}</span>);
  return parts;
}

function analyzeParagraphs(text: string): ParagraphScore[] {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return paragraphs.map((p, i) => ({
    index: i,
    text: p,
    score: analyzeText(p.trim()).score,
  }));
}

function getBarColor(score: number): string {
  if (score < 35) return 'bg-emerald-700';
  if (score < 65) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function AiDetector() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ score: number; breakdown: Breakdown } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [paragraphScores, setParagraphScores] = useState<ParagraphScore[]>([]);

  useEffect(() => {
    return () => {
      setResult(null);
      setParagraphScores([]);
    };
  }, []);

  const handleAnalyze = () => {
    const trimmed = input.trim();
    if (!trimmed) { toast.error('Please enter some text to analyze'); return; }
    if (trimmed.length < 20) { toast.error('Text is too short for meaningful analysis (min 20 characters)'); return; }
    setIsLoading(true);
    try {
      const analysis = analyzeText(trimmed);
      setResult(analysis);
      setParagraphScores(analyzeParagraphs(trimmed));
      if (analysis.score >= 65) {
        toast('Text shows strong AI-like patterns', { icon: '\u{1F916}' });
      } else if (analysis.score < 35) {
        toast('Text appears to be human-written', { icon: '\u{1F9F1}' });
      } else {
        toast('Results are inconclusive', { icon: '\u{1F937}' });
      }
      setShowDetailed(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.length > 10000) { toast.error('Text exceeds 10,000 character limit'); return; }
      setInput(text);
      toast.success('Text pasted from clipboard');
    } catch {
      toast.error('Unable to read clipboard. Paste manually instead.');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.endsWith('.txt')) { toast.error('Only .txt files are supported'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text.length > 10000) { toast.error('File exceeds 10,000 character limit'); return; }
      setInput(text);
      toast.success('File loaded');
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setParagraphScores([]);
    setShowDetailed(false);
  };

  const handleShare = async () => {
    if (!result) return;
    const lines = [
      `AI Detector Results - ${getScoreLabel(result.score)}`,
      `Overall AI Score: ${result.score}%`,
      '',
      '--- Breakdown ---',
      `Burstiness: ${result.breakdown.burstiness.score}%`,
      `Repetition: ${result.breakdown.repetition.score}%`,
      `Trigger Phrases Found: ${result.breakdown.triggerPhrases.found.length}/${result.breakdown.triggerPhrases.total}`,
      '',
      '--- Analyzed Text ---',
      input.slice(0, 500) + (input.length > 500 ? '...' : ''),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    await downloadOrShare(url, `ai_detector_results_${Date.now()}.txt`);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-600 dark:text-amber-400 text-sm">
        <strong className="block mb-1">Limitations of Automated AI Detection</strong>
        No AI detector is 100% accurate. Results are estimates based on statistical patterns and may produce false positives or false negatives. AI-generated text can mimic human writing, and human text can appear formulaic. Use this tool as a reference, not definitive proof.
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-lg">
              {getScoreEmoji(result?.score ?? -1)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">AI Content Detector</h2>
              <p className="text-sm text-[var(--text-secondary)]">Analyze text for AI-generated patterns</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text-primary)]">Input Text</label>
            <div className="flex gap-2">
              <button onClick={handlePaste} className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-zinc-600 dark:text-zinc-300 px-3 py-1.5 rounded-lg transition-colors">
                Paste
              </button>
              <button onClick={handleClear} className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-zinc-600 dark:text-zinc-300 px-3 py-1.5 rounded-lg transition-colors">
                Clear
              </button>
            </div>
          </div>
          <div
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            className="relative"
          >
            <textarea
              value={input}
              onChange={(e) => { if (e.target.value.length <= 10000) setInput(e.target.value); }}
              placeholder="Paste or type text to analyze (up to 10,000 characters)..."
              className="w-full h-64 bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none focus:ring-2 focus:ring-red-500/50 transition-all"
              spellCheck={false}
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full">
              {input.length}/10000
            </div>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] -mt-2">Drag and drop a .txt file to load text</p>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !input.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
            ) : (
              <>{getScoreEmoji(-1)} Analyze Text</>
            )}
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className={`${getScoreBg(result.score)} border rounded-2xl p-6 space-y-6`}>
            <div className="text-center">
              <div className={`text-6xl font-black mb-2 ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                {getScoreEmoji(result.score)} {getScoreLabel(result.score)}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {result.score < 35
                  ? 'Text shows high variance in sentence structure typical of human writing'
                  : result.score < 65
                  ? 'Text has mixed patterns — could be human or AI-generated'
                  : 'Text shows uniform structure and repetitive patterns typical of AI writing'}
              </p>
            </div>

            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getBarColor(result.score)}`}
                style={{ width: `${result.score}%` }}
              />
            </div>

            <div className="flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-700" /> Human (0-34%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Uncertain (35-64%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> AI (65-100%)</span>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setShowDetailed(!showDetailed)}
                className="text-xs text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white underline underline-offset-2 transition-colors"
              >
                {showDetailed ? 'Hide Detailed Breakdown' : 'Show Detailed Breakdown'}
              </button>
            </div>

            {showDetailed && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Burstiness</h4>
                      <span className={`text-sm font-black ${getScoreColor(result.breakdown.burstiness.score)}`}>
                        {result.breakdown.burstiness.score}%
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] mb-3">Measures sentence length variance. Human writing has greater variation.</p>
                    <div className="space-y-2 text-xs text-zinc-600 dark:text-[var(--text-muted)]">
                      <div className="flex justify-between"><span>Variance</span><span className="font-mono">{result.breakdown.burstiness.variance.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Std Deviation</span><span className="font-mono">{result.breakdown.burstiness.stdDev.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Avg Sentence Length</span><span className="font-mono">{result.breakdown.burstiness.avgLength.toFixed(1)} words</span></div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Repetition</h4>
                      <span className={`text-sm font-black ${getScoreColor(result.breakdown.repetition.score)}`}>
                        {result.breakdown.repetition.score}%
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] mb-3">Analyzes repeated n-gram patterns. AI tends to reuse phrase structures.</p>
                    <div className="space-y-2 text-xs text-zinc-600 dark:text-[var(--text-muted)]">
                      <div className="flex justify-between"><span>Repeated N-grams</span><span className="font-mono">{result.breakdown.repetition.ngramReps}</span></div>
                      <div className="flex justify-between"><span>Total N-grams</span><span className="font-mono">{result.breakdown.repetition.totalNgrams}</span></div>
                      <div className="flex justify-between"><span>Repetition Rate</span><span className="font-mono">{result.breakdown.repetition.totalNgrams > 0 ? ((result.breakdown.repetition.ngramReps / result.breakdown.repetition.totalNgrams) * 100).toFixed(1) : '0'}%</span></div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Trigger Phrases</h4>
                      <span className={`text-sm font-black ${getScoreColor(result.breakdown.triggerPhrases.score)}`}>
                        {result.breakdown.triggerPhrases.score}%
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] mb-3">Common AI overused phrases found in the text.</p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {result.breakdown.triggerPhrases.found.length > 0 ? (
                        result.breakdown.triggerPhrases.found.map((phrase, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-500/10 rounded-md px-2 py-1">
                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>
                            {phrase}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">No common trigger phrases detected</p>
                      )}
                    </div>
                  </div>
                </div>

                {result.breakdown.triggerPhrases.found.length > 0 && (
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">Highlighted AI Patterns</h4>
                    <div className="text-sm leading-relaxed text-[var(--text-primary)] bg-[var(--bg-overlay)] dark:bg-zinc-950 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs whitespace-pre-wrap">
                      {highlightAiPatterns(input, result.breakdown.triggerPhrases.found)}
                    </div>
                  </div>
                )}

                {paragraphScores.length > 1 && (
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Per-Paragraph Analysis</h4>
                    <div className="space-y-2">
                      {paragraphScores.map((p) => (
                        <div key={p.index} className="flex items-center gap-3">
                          <div className="w-12 shrink-0 text-xs font-mono text-[var(--text-secondary)]">#{p.index + 1}</div>
                          <div className="flex-1 bg-[var(--bg-surface)] rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getBarColor(p.score)}`}
                              style={{ width: `${p.score}%` }}
                            />
                          </div>
                          <div className={`w-10 text-right text-xs font-mono font-bold ${getScoreColor(p.score)}`}>
                            {p.score}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleShare}
                className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-zinc-600 dark:text-zinc-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
