"use client";

import React, { useState, useEffect } from 'react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useEnterToSubmit } from '@/lib/keyboard';
import { useAiProvider } from '@/hooks/useAiProvider';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';
import { clipboardWrite } from "@/lib/clipboard";


type Tone = 'casual' | 'professional' | 'friendly' | 'natural' | 'storytelling';
type Creativity = 'low' | 'medium' | 'high';

const MAX_CHARS = 5000;

const TONES: { value: Tone; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'natural', label: 'Natural' },
  { value: 'storytelling', label: 'Storytelling' },
];

const CREATIVITY_LEVELS: { value: Creativity; label: string; desc: string }[] = [
  { value: 'low', label: 'Low', desc: 'Light touch, mostly fixes' },
  { value: 'medium', label: 'Medium', desc: 'Balanced rewrite' },
  { value: 'high', label: 'High', desc: 'Aggressive humanization' },
];

const REPLACEMENTS: [RegExp, string][] = [
  [/\b(?:utilize|utilising|utilized)\b/gi, 'use'],
  [/\b(?:demonstrate|demonstrates|demonstrated|demonstrating)\b/gi, 'show'],
  [/\b(?:implement|implements|implemented|implementing|implementation)\b/gi, 'build'],
  [/\b(?:facilitate|facilitates|facilitated|facilitating)\b/gi, 'help'],
  [/\b(?:leverage|leverages|leveraged|leveraging)\b/gi, 'use'],
  [/\b(?:optimize|optimizes|optimized|optimizing|optimisation)\b/gi, 'improve'],
  [/\b(?:subsequently)\b/gi, 'then'],
  [/\b(?:nevertheless)\b/gi, 'still'],
  [/\b(?:furthermore|moreover)\b/gi, 'also'],
  [/\b(?:commence|commences|commenced|commencing)\b/gi, 'start'],
  [/\b(?:endeavor|endeavours|endeavoured)\b/gi, 'try'],
  [/\b(?:pursuant)\b/gi, 'under'],
  [/\b(?:aforementioned|aforesaid)\b/gi, 'above'],
  [/\b(?:henceforth)\b/gi, 'from now'],
  [/\b(?:expedite|expedited|expediting)\b/gi, 'speed up'],
  [/\b(?:substantiate|substantiates|substantiating)\b/gi, 'prove'],
  [/\b(?:elucidate|elucidates|elucidated)\b/gi, 'explain'],
  [/\b(?:disseminate|disseminates|disseminating)\b/gi, 'share'],
  [/\b(?:ascertain|ascertains|ascertained)\b/gi, 'find out'],
  [/\b(?:thereafter)\b/gi, 'after that'],
  [/\b(?:peruse|perused|perusing)\b/gi, 'read'],
  [/\b(?:thus|hence)\b/gi, 'so'],
];

const HEDGING: [RegExp, string][] = [
  [/\bit should be noted that\b/gi, ''],
  [/\bit is important to note that\b/gi, ''],
  [/\bit is worth noting that\b/gi, ''],
  [/\bin the event that\b/gi, 'if'],
  [/\bin the absence of\b/gi, 'without'],
  [/\bin spite of the fact that\b/gi, 'although'],
  [/\bthe majority of\b/gi, 'most'],
  [/\ba number of\b/gi, 'many'],
  [/\bat this point in time\b/gi, 'now'],
  [/\bdue to the fact that\b/gi, 'because'],
  [/\bhas the ability to\b/gi, 'can'],
  [/\bin order to\b/gi, 'to'],
  [/\bin reference to\b/gi, 'about'],
  [/\ba large number of\b/gi, 'many'],
  [/\bthe vast majority\b/gi, 'most'],
  [/\bon a daily basis\b/gi, 'daily'],
  [/\bin close proximity\b/gi, 'near'],
];

const CONTRACTIONS: [RegExp, string][] = [
  [/\bcannot\b/gi, "can't"], [/\bwill not\b/gi, "won't"],
  [/\bdid not\b/gi, "didn't"], [/\bdo not\b/gi, "don't"],
  [/\bdoes not\b/gi, "doesn't"], [/\bis not\b/gi, "isn't"],
  [/\bare not\b/gi, "aren't"], [/\bwas not\b/gi, "wasn't"],
  [/\bwere not\b/gi, "weren't"], [/\bhave not\b/gi, "haven't"],
  [/\bhas not\b/gi, "hasn't"], [/\bhad not\b/gi, "hadn't"],
  [/\bwould not\b/gi, "wouldn't"], [/\bcould not\b/gi, "couldn't"],
  [/\bshould not\b/gi, "shouldn't"], [/\bmust not\b/gi, "mustn't"],
  [/\bmight not\b/gi, "mightn't"], [/\bI\s+am\b/gi, "I'm"],
  [/\byou\s+are\b/gi, "you're"], [/\bwe\s+are\b/gi, "we're"],
  [/\bthey\s+are\b/gi, "they're"], [/\bI\s+have\b/gi, "I've"],
  [/\byou\s+have\b/gi, "you've"], [/\bwe\s+have\b/gi, "we've"],
  [/\bthey\s+have\b/gi, "they've"], [/\bI\s+will\b/gi, "I'll"],
  [/\byou\s+will\b/gi, "you'll"], [/\bwe\s+will\b/gi, "we'll"],
  [/\bthey\s+will\b/gi, "they'll"], [/\bI\s+would\b/gi, "I'd"],
  [/\byou\s+would\b/gi, "you'd"], [/\bwe\s+would\b/gi, "we'd"],
  [/\bthey\s+would\b/gi, "they'd"], [/\bthat\s+is\b/gi, "that's"],
  [/\bthere\s+is\b/gi, "there's"], [/\bwhat\s+is\b/gi, "what's"],
  [/\bwho\s+is\b/gi, "who's"], [/\bwhere\s+is\b/gi, "where's"],
  [/\bwhy\s+is\b/gi, "why's"],
];

const TRANSITIONS: Record<Tone, string[]> = {
  casual: ['So', 'Honestly', 'Basically', 'Anyway', 'You know', 'Truth is'],
  professional: ['Additionally', 'Therefore', 'However', 'Notably', 'Consequently'],
  friendly: ['Actually', 'Honestly', 'By the way', 'Sure enough', 'Here is the thing'],
  natural: ['Still', 'Also', 'Though', 'So', 'Anyway', 'After all'],
  storytelling: ['Then', 'Suddenly', 'Meanwhile', 'Later on', 'Eventually', 'Before long'],
};

const CASUAL: [RegExp, string][] = [
  [/\b(?:difficult)\b/gi, 'tough'], [/\b(?:important)\b/gi, 'key'],
  [/\b(?:understanding)\b/gi, 'getting'], [/\b(?:children)\b/gi, 'kids'],
  [/\b(?:elderly)\b/gi, 'older folks'], [/\b(?:automobile)\b/gi, 'car'],
  [/\b(?:residence)\b/gi, 'place'], [/\b(?:occupation)\b/gi, 'job'],
  [/\b(?:require)\b/gi, 'need'], [/\b(?:provide)\b/gi, 'give'],
  [/\b(?:perform)\b/gi, 'do'], [/\b(?:construct)\b/gi, 'build'],
  [/\b(?:conclude)\b/gi, 'wrap up'], [/\b(?:obtain)\b/gi, 'get'],
  [/\b(?:attempt)\b/gi, 'try'], [/\b(?:possess)\b/gi, 'have'],
  [/\b(?:terminate)\b/gi, 'end'],
];

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function countSents(text: string): number {
  const m = text.match(/[.!?]+/g);
  return m ? m.length : Math.min(1, text.trim() ? 1 : 0);
}

function countSyls(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 1;
  let c = 0, pv = false;
  for (const ch of w) {
    const v = 'aeiouy'.includes(ch);
    if (v && !pv) c++;
    pv = v;
  }
  if (w.endsWith('e')) c--;
  if (w.endsWith('le') && w.length > 2) c++;
  return Math.max(1, c);
}

function readability(text: string): number {
  const words = countWords(text);
  const sents = countSents(text);
  if (words === 0) return 0;
  const syls = text.split(/\s+/).reduce((s, w) => s + countSyls(w), 0);
  return Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * (words / sents) - 84.6 * (syls / words))));
}

function readableLabel(score: number): string {
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Difficult';
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function applyRules(text: string, rules: [RegExp, string][], intensity: number): string {
  let r = text;
  for (const [pat, rep] of rules) {
    if (Math.random() < intensity) r = r.replace(pat, rep);
  }
  return r;
}

function breakLong(text: string): string {
  return text.replace(/([^.!?]{30,}?)\b(and|but|or|so|because|yet|while|whereas|although)\b([^.!?]{10,}[.!?])/gi,
    (_, a, conj, b) => a.trim() + '. ' + conj + b.trim());
}

function addTransitions(text: string, tone: Tone, intensity: number): string {
  const sents = text.match(/[^.!?]+[.!?]*/g) || [text];
  let r = sents[0] || '';
  for (let i = 1; i < sents.length; i++) {
    const s = sents[i]!.trim();
    if (s && Math.random() < intensity * 0.4) {
      const word = pick(TRANSITIONS[tone]);
      r += ' ' + word + ', ' + s.charAt(0).toLowerCase() + s.slice(1);
    } else {
      r += ' ' + s;
    }
  }
  return r;
}

function humanize(text: string, tone: Tone, creativity: Creativity): string {
  const intensity = creativity === 'low' ? 0.35 : creativity === 'medium' ? 0.65 : 0.9;
  let r = applyRules(text, REPLACEMENTS, intensity);
  r = applyRules(r, HEDGING, intensity * 0.8);
  const ci = tone === 'casual' ? 0.9 : tone === 'friendly' ? 0.7 : tone === 'professional' ? 0.25 : 0.5;
  r = applyRules(r, CONTRACTIONS, ci * intensity);
  if (Math.random() < intensity) r = breakLong(r);
  r = addTransitions(r, tone, intensity);
  if (tone === 'casual' && intensity > 0.3) r = applyRules(r, CASUAL, intensity * 0.5);
  if (tone === 'storytelling') r = r.replace(/\b(?:therefore|thus|consequently)\b/gi, () => pick(['so', 'which meant', 'and that is why']));
  if (tone === 'friendly') {
    r = r.replace(/([.!?])\s*/g, (m) => Math.random() < 0.15 ? '! ' : m);
    r = r.replace(/\b(?:you should|you ought to)\b/gi, () => pick(['you might want to', 'have you thought about', 'maybe you can']));
  }
  return r;
}

function computeDiff(original: string, humanized: string): { text: string; changed: boolean }[] {
  const oWords = original.split(/(\s+)/);
  const hWords = humanized.split(/(\s+)/);
  const oSet = new Set(oWords.map(w => w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()).filter(Boolean));
  return hWords.map(w => {
    const clean = w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return { text: w, changed: clean.length > 0 && !oSet.has(clean) };
  });
}

export default function AiHumanizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tone, setTone] = useState<Tone>('natural');
  const [creativity, setCreativity] = useState<Creativity>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [showChanges, setShowChanges] = useState(true);

  const inputWords = countWords(input);
  const outputWords = countWords(output);
  const inScore = readability(input);
  const outScore = readability(output);
  const outLabel = readableLabel(outScore);
  const diff = showChanges && output ? computeDiff(input, output) : [];

  useEffect(() => {
    return () => {
      setInput('');
      setOutput('');
      setIsLoading(false);
    };
  }, []);

  const handleHumanize = async () => {
    if (!input.trim()) { toast.error('Enter some text to humanize'); return; }
    if (input.length > MAX_CHARS) { toast.error(`Text exceeds ${MAX_CHARS} character limit`); return; }
    setIsLoading(true);
    try {
      const result = await new Promise<string>(resolve =>
        setTimeout(() => resolve(humanize(input, tone, creativity)), 300));
      setOutput(result);
      toast.success('Text humanized successfully!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to humanize text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = useEnterToSubmit(handleHumanize);

  const { generateCompletion } = useAiProvider();
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;

  // Server-AI rewrite (1 credit): template engine stays free and instant,
  // this is the quality option — same dual pattern as Regex Generator.
  const handleAiRewrite = async () => {
    if (!input.trim()) { toast.error('Enter some text to rewrite'); return; }
    setIsLoading(true);
    try {
      const result = await generateCompletion(
        [{ role: 'user', content: `Rewrite the following text in a ${tone} tone with ${creativity} creativity. Make it sound naturally human. Return ONLY the rewritten text, no commentary:\n\n${input.slice(0, 4000)}` }],
        0.8,
      );
      setOutput(result.trim());
      toast.success('AI rewrite complete — 1 credit used.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'AI rewrite failed';
      if (!isSignedIn && /sign in/i.test(msg)) {
        toast.error('Sign in free for AI rewrite — 10 credits/month, no card.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    clipboardWrite(output).then(ok => ok && toast.success('Copied to clipboard!'));
  };

  const handleTryAgain = () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      setOutput(humanize(input, tone, creativity));
      toast.success('Rewritten!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to rewrite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 space-y-5">
      <AiPrivacyBanner />
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8l-6.4 4.8L8.4 14l-6-4.8h7.6z" />
            </svg>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Humanizer</h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Rewrite AI-generated text to sound more natural and human-like.</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Tone</label>
              <div className="flex flex-wrap gap-1">
                {TONES.map(t => (
                  <button key={t.value} onClick={() => setTone(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                      tone === t.value
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                        : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Creativity</label>
              <div className="flex gap-1">
                {CREATIVITY_LEVELS.map(c => (
                  <button key={c.value} onClick={() => setCreativity(c.value)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                      creativity === c.value
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                        : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                    }`}>
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">{CREATIVITY_LEVELS.find(c => c.value === creativity)?.desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Original Text</label>
                <span className="text-[10px] text-[var(--text-muted)]">{input.length}/{MAX_CHARS}</span>
              </div>
              <textarea aria-label="Original Text" value={input} onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Paste AI-generated text here..."
                className="w-full h-64 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Humanized Text</label>
                {output && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={showChanges} onChange={e => setShowChanges(e.target.checked)}
                      className="w-3 h-3 rounded border-[var(--border-subtle)] text-emerald-500 focus:ring-emerald-500" />
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">Highlight changes</span>
                  </label>
                )}
              </div>
              <div className="w-full h-64 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-sm text-[var(--text-primary)] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {!output ? (
                  <span className="text-[var(--text-muted)]">Humanized text will appear here...</span>
                ) : showChanges && diff.length > 0 ? (
                  diff.map((t, i) => (
                    <span key={i} className={t.changed ? 'bg-emerald-200 dark:bg-emerald-800/40 rounded px-0.5 font-medium' : ''}>
                      {t.text}
                    </span>
                  ))
                ) : output}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleHumanize} onKeyDown={handleKeyDown} disabled={isLoading || !input.trim()}
              className="px-6 py-2.5 bg-[var(--accent-ink)] hover:opacity-90 disabled:bg-[var(--bg-overlay)] dark:disabled:bg-[var(--bg-elevated)] text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={isLoading ? 'Humanizing text...' : 'Humanize text'}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Humanizing...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8l-6.4 4.8L8.4 14l-6-4.8h7.6z" />
                </svg> Humanize</>
              )}
            </button>
            {output && (
              <>
                <button onClick={handleTryAgain} disabled={isLoading}
                  className="px-4 py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold rounded-xl text-sm transition-colors">
                  Try Again
                </button>
                <button onClick={handleAiRewrite} disabled={isLoading || !input.trim()}
                  title={isSignedIn ? 'Server AI rewrite, 1 credit per use' : 'Sign in free to unlock'}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all">
                  ✨ AI Rewrite · 1 credit
                </button>
                <button onClick={handleCopy}
                  className="px-4 py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold rounded-xl text-sm transition-colors">
                  Copy to Clipboard
                </button>
              </>
            )}
            {!isSignedIn && (
              <p className="text-xs text-[var(--text-secondary)]">
                <Link href="/sign-in" className="text-[var(--accent)] hover:underline font-semibold">Sign in free</Link> for AI rewrite (10 credits/month) — template engine stays free.
              </p>
            )}
          </div>

          {output && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{inputWords}</div>
                <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Words (before)</div>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{outputWords}</div>
                <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Words (after)</div>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{inScore}</div>
                <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Readability (before)</div>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{outScore}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    outScore >= 70 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : outScore >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>{outLabel}</span>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Readability (after)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
