"use client";
import React, { useState, useEffect } from 'react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useEnterToSubmit } from '@/lib/keyboard';

interface GrammarError {
  start: number;
  end: number;
  message: string;
  suggestion: string;
  type: 'Spelling' | 'Grammar' | 'Punctuation' | 'Style';
}

const COMMON_MISSPELLINGS: Record<string, string> = {
  accomodate: 'accommodate', achive: 'achieve', adress: 'address', alot: 'a lot',
  becuase: 'because', begining: 'beginning', beleive: 'believe', calender: 'calendar',
  definately: 'definitely', enviroment: 'environment', existance: 'existence',
  finaly: 'finally', foriegn: 'foreign', fourty: 'forty', freind: 'friend',
  goverment: 'government', harrass: 'harass', hieght: 'height',
  independant: 'independent', knowlege: 'knowledge', maintainance: 'maintenance',
  millenium: 'millennium', neccessary: 'necessary', noticable: 'noticeable',
  occassion: 'occasion', occured: 'occurred', oppertunity: 'opportunity',
  parliment: 'parliament', peice: 'piece', priviledge: 'privilege',
  pronounciation: 'pronunciation', recieve: 'receive', recomend: 'recommend',
  refered: 'referred', relevent: 'relevant', religous: 'religious',
  restaraunt: 'restaurant', sentance: 'sentence', seperate: 'separate',
  sincerly: 'sincerely', speach: 'speech', surprize: 'surprise', tatoo: 'tattoo',
  thier: 'their', tommorow: 'tomorrow', truely: 'truly', twelth: 'twelfth',
  unfortunatly: 'unfortunately', vaccuum: 'vacuum', vegeterian: 'vegetarian',
  villian: 'villain', wether: 'whether', wich: 'which', wierd: 'weird',
  writting: 'writing', yatch: 'yacht',
};

const CAT_COLORS: Record<string, string> = {
  Spelling: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
  Grammar: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  Punctuation: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  Style: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
};

function findErrors(text: string): GrammarError[] {
  const errors: GrammarError[] = [];
  const seen = new Set<number>();

  for (const [wrong, correct] of Object.entries(COMMON_MISSPELLINGS)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      if (seen.has(start)) continue;
      seen.add(start);
      errors.push({ start, end: start + match[0].length, message: `Possible misspelling; use "${correct}"`, suggestion: correct, type: 'Spelling' });
    }
  }

  const patterns: { regex: RegExp; extract: (_m: RegExpExecArray) => { start: number; end: number; msg: string; sug: string }; type: 'Grammar' | 'Punctuation' | 'Style' }[] = [
    {
      regex: /\b(your)\s+(going|doing|making|taking|coming|leaving|being|having|using|trying|running|walking|talking|eating|playing|working|studying|sleeping|saying|telling|asking|giving|getting|buying|bringing|meeting|starting|stopping|reading|writing)\b/gi,
      extract: (m) => ({ start: m.index, end: m.index + m[1].length, msg: "Use 'you're' (you are) instead of 'your' (possessive)", sug: "you're" }),
      type: 'Grammar',
    },
    {
      regex: /\b(its)\s+(is|was|has|been|being|a|an|the|going|making|doing|getting|taking|coming|having|saying|telling|asking|giving|running|working|playing)\b/gi,
      extract: (m) => ({ start: m.index, end: m.index + m[1].length, msg: "Use 'it's' (it is) instead of 'its' (possessive)", sug: "it's" }),
      type: 'Grammar',
    },
    {
      regex: /\b(their)\s+(is|was|are|were|has|have|been|being)\b/gi,
      extract: (m) => ({ start: m.index, end: m.index + m[1].length, msg: "Use 'there' (existential) instead of 'their' (possessive)", sug: 'there' }),
      type: 'Grammar',
    },
    {
      regex: /\b(there)\s+(book|books|car|cars|house|houses|home|homes|dog|dogs|cat|cats|idea|ideas|work|works|life|lives|family|families|child|children|friend|friends|money|name|names|company|companies|world|people|team|teams|office|offices|website|websites|project|projects)\b/gi,
      extract: (m) => ({ start: m.index, end: m.index + m[1].length, msg: "Use 'their' (possessive) instead of 'there' (location)", sug: 'their' }),
      type: 'Grammar',
    },
    {
      regex: /  +/g,
      extract: (m) => ({ start: m.index, end: m.index + m[0].length, msg: 'Remove extra whitespace', sug: ' ' }),
      type: 'Style',
    },
    {
      regex: /\.\s+([a-z])/g,
      extract: (m) => ({ start: m.index + m[0].length - 1, end: m.index + m[0].length, msg: 'Capitalize after a period', sug: m[1].toUpperCase() }),
      type: 'Punctuation',
    },
    {
      regex: /,\s+(?=(he|she|it|they|we|you|I|this|that|these|those|there|here)\s+\w+)/gi,
      extract: (m) => ({ start: m.index, end: m.index + m[0].length, msg: 'Comma splice: use a semicolon or split sentences', sug: '; ' }),
      type: 'Punctuation',
    },
  ];

  for (const rule of patterns) {
    let match;
    while ((match = rule.regex.exec(text)) !== null) {
      const { start, end, msg, sug } = rule.extract(match);
      if (seen.has(start)) continue;
      seen.add(start);
      errors.push({ start, end, message: msg, suggestion: sug, type: rule.type });
    }
  }

  const sentEnd = /[.!?]+(\s+|$)/g;
  let last = 0;
  let m;
  while ((m = sentEnd.exec(text)) !== null) {
    const sEnd = m.index + m[0].length;
    const sentence = text.slice(last, sEnd).trim();
    if (sentence.split(/\s+/).length > 35 && !/\b(for|and|nor|but|or|yet|so)\b/i.test(sentence) && !seen.has(last)) {
      seen.add(last);
      errors.push({ start: last, end: sEnd, message: 'Run-on sentence: break into shorter sentences', suggestion: '', type: 'Style' });
    }
    last = sEnd;
  }
  if (last < text.length) {
    const sentence = text.slice(last).trim();
    if (sentence.split(/\s+/).length > 35 && !/\b(for|and|nor|but|or|yet|so)\b/i.test(sentence) && !seen.has(last)) {
      seen.add(last);
      errors.push({ start: last, end: text.length, message: 'Run-on sentence: break into shorter sentences', suggestion: '', type: 'Style' });
    }
  }

  return errors.sort((a, b) => a.start - b.start);
}

function applyFixes(text: string, errors: GrammarError[]): string {
  const sorted = [...errors].filter(e => e.suggestion).sort((a, b) => b.start - a.start);
  let result = text;
  for (const err of sorted) result = result.slice(0, err.start) + err.suggestion + result.slice(err.end);
  return result;
}

export default function AiGrammarChecker() {
  const [input, setInput] = useState('');
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => { return () => { setErrors([]); }; }, []);

  const handleCheck = () => {
    if (!input.trim()) { toast.error('Enter some text to check'); return; }
    setIsLoading(true);
    try {
      const found = findErrors(input);
      setErrors(found);
      setHasChecked(true);
      toast.success(found.length === 0 ? 'No errors found' : `Found ${found.length} potential error${found.length > 1 ? 's' : ''}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to check grammar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = useEnterToSubmit(handleCheck);

  const handleFixAll = () => {
    try {
      const fixed = applyFixes(input, errors);
      setInput(fixed);
      setErrors([]);
      setHasChecked(false);
      toast.success(`All ${errors.filter(e => e.suggestion).length} fixes applied`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to apply fixes');
    }
  };

  const handleClear = () => { setInput(''); setErrors([]); setHasChecked(false); };
  const handleExport = () => {
    try {
      const corrected = applyFixes(input, errors);
      const blob = new Blob([corrected], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, 'corrected_text.txt');
      URL.revokeObjectURL(url);
      toast.success('Corrected text exported');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to export');
    }
  };

  const correctedText = applyFixes(input, errors);
  const categories = ['Spelling', 'Grammar', 'Punctuation', 'Style'] as const;
  const counts: Record<string, number> = { Spelling: 0, Grammar: 0, Punctuation: 0, Style: 0 };
  for (const e of errors) counts[e.type]++;

  function renderHighlighted(text: string, errs: GrammarError[]) {
    if (!errs.length) return <span className="whitespace-pre-wrap">{text}</span>;
    const sorted = [...errs].sort((a, b) => a.start - b.start);
    const segs: { text: string; error?: GrammarError }[] = [];
    let last = 0;
    for (const err of sorted) {
      if (err.start < last) continue;
      if (err.start > last) segs.push({ text: text.slice(last, err.start) });
      segs.push({ text: text.slice(err.start, err.end), error: err });
      last = err.end;
    }
    if (last < text.length) segs.push({ text: text.slice(last) });
    return (
      <span className="whitespace-pre-wrap">
        {segs.map((seg, i) => seg.error ? (
          <span key={i} className="relative group cursor-help">
            <span className="text-rose-600 dark:text-rose-400 underline decoration-rose-400/60 decoration-wavy underline-offset-2">{seg.text}</span>
            <span className="invisible group-hover:visible absolute bottom-full left-0 mb-1 px-2 py-1 bg-zinc-900 dark:bg-zinc-700 text-white text-[10px] rounded-lg whitespace-nowrap z-10 shadow-lg pointer-events-none">
              {seg.error.suggestion || seg.error.message}
            </span>
          </span>
        ) : <span key={i}>{seg.text}</span>)}
      </span>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          AI Grammar Checker
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Check and correct grammar, spelling, and punctuation in your text.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Rules-based checker for common grammar, spelling, and punctuation errors. Not exhaustive — proofread manually.</span>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Your Text</span>
            <span className={`text-[10px] font-mono ${input.length > 4800 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>{input.length} / 5,000</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              if (e.target.value.length <= 5000) setInput(e.target.value);
              if (hasChecked) { setErrors([]); setHasChecked(false); }
            }}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCheck()}
            placeholder="Paste or type text to check..."
            className="w-full h-44 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-primary)] outline-none resize-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleCheck} onKeyDown={handleKeyDown} disabled={isLoading || !input.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={isLoading ? 'Checking grammar...' : 'Check grammar'}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {isLoading ? 'Checking...' : 'Check Grammar'}
          </button>
          <button onClick={handleClear}
            className="px-5 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="Clear text"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>

        {hasChecked && (
          <div className="border-t border-[var(--border-subtle)] pt-6 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
            {errors.length > 0 ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{errors.length} error{errors.length > 1 ? 's' : ''} found</span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => counts[cat] > 0 && (
                      <span key={cat} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${CAT_COLORS[cat]}`}>{cat}: {counts[cat]}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Original with Highlights
                    </span>
                    <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm leading-relaxed max-h-60 overflow-y-auto min-h-[120px]">
                      {input.trim() ? renderHighlighted(input, errors) : <span className="text-[var(--text-muted)] italic">No text</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-700" /> Corrected Text
                    </span>
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4 text-sm leading-relaxed max-h-60 overflow-y-auto min-h-[120px] text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                      {correctedText.trim() || <span className="text-[var(--text-muted)] italic">No text</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleFixAll}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Fix All ({errors.filter(e => e.suggestion).length} fixes)
                  </button>
                  <button onClick={handleExport}
                    className="px-5 py-3 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Error Details</span>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-xs">
                        <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${err.type === 'Spelling' ? 'bg-rose-500' : err.type === 'Grammar' ? 'bg-amber-500' : err.type === 'Punctuation' ? 'bg-blue-500' : 'bg-violet-500'}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-zinc-800 dark:text-zinc-200">
                            &ldquo;<span className="font-mono text-rose-600 dark:text-rose-400">{input.slice(err.start, err.end)}</span>&rdquo;
                          </span>
                          <span className="text-[var(--text-secondary)]"> &mdash; {err.message}</span>
                          {err.suggestion && <span className="block text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Suggestion: &ldquo;{err.suggestion}&rdquo;</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <svg className="w-12 h-12 mx-auto mb-3 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">No errors found!</p>
                <p className="text-xs mt-1">Your text looks clean. Try pasting more text to check.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
