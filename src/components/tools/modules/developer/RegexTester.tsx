"use client";
import React, { useState, useMemo } from 'react';
import { Search, Info, Settings2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import { useSession } from '@/lib/auth-client';
import AiSettings from '../../AiSettings';
import Link from 'next/link';
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';
import { getErrorMessage } from '@/utils/error';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('Enter text here to test your regular expression.\n\nSample: user@example.com is a valid email address.\nPhone: 123-456-7890.');

  const [aiTab, setAiTab] = useState<'manual' | 'ai'>('manual');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateCompletion } = useAiProvider();
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;

  const { matches, error } = useMemo(() => {
    if (aiTab !== 'manual' || !pattern) return { matches: [] as { match: string; index: number }[], error: null as string | null };
    try {
      const regex = new RegExp(pattern, flags);
      const newMatches: { match: string; index: number }[] = [];
      let match;
      if (flags.includes('g')) {
        let iterations = 0;
        while ((match = regex.exec(testString)) !== null && iterations < 1000) {
          if (match[0].length === 0) regex.lastIndex++;
          newMatches.push({ match: match[0], index: match.index });
          iterations++;
        }
      } else {
        match = regex.exec(testString);
        if (match) newMatches.push({ match: match[0], index: match.index });
      }
      return { matches: newMatches, error: null };
    } catch (e) {
      return { matches: [] as { match: string; index: number }[], error: (e as Error).message };
    }
  }, [pattern, flags, testString, aiTab]);

  const handleGenerate = async () => {
    if (!description.trim()) { toast.error('Please describe what you want to match'); return; }
    setIsGenerating(true);
    try {
      const prompt = `You are an expert regex developer. Given this description: "${description}", generate ONLY the raw regex pattern (no flags, no explanation, no backticks, just the pattern). The pattern should be valid for JavaScript's RegExp constructor.`;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.1);
      const cleaned = response.trim().replace(/^\/|\/[gimsu]*$/g, '').replace(/```/g, '');
      setPattern(cleaned);
      setAiTab('manual');
      toast.success('Regex generated! Test it below.');
    } catch (e: unknown) {
      const msg = getErrorMessage(e, 'Failed to generate regex');
      // Anonymous users have no credit balance (401) — turn the dead-end
      // error into the signup funnel instead of a shrug.
      if (!isSignedIn && /sign in/i.test(msg)) {
        toast.error('Sign in free to use AI generation — 10 credits/month, no card.');
      } else {
        toast.error(msg);
      }
    } finally { setIsGenerating(false); }
  };

  const renderHighlightedText = () => {
    if (!pattern || error || matches.length === 0) return <span>{testString}</span>;
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
    sortedMatches.forEach((m, i) => {
      if (m.index > lastIndex) elements.push(<span key={`t${i}`}>{testString.substring(lastIndex, m.index)}</span>);
      elements.push(<span key={`m${i}`} className="bg-emerald-700/30 text-emerald-900 dark:text-emerald-100 rounded-sm font-semibold">{m.match}</span>);
      lastIndex = m.index + m.match.length;
    });
    if (lastIndex < testString.length) elements.push(<span key="end">{testString.substring(lastIndex)}</span>);
    return elements;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <AiPrivacyBanner />
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Regex Generator + Tester</h2>
                <p className="text-sm text-[var(--text-secondary)]">AI-powered generation and real-time testing</p>
              </div>
            </div>
            <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Sparkles className="w-3.5 h-3.5" /> AI · 1 credit/use</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-2 p-1 bg-[var(--bg-surface)] rounded-xl max-w-xs">
            <button onClick={() => setAiTab('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${aiTab === 'manual' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Search className="w-3.5 h-3.5 inline mr-1" />Manual
            </button>
            <button onClick={() => setAiTab('ai')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${aiTab === 'ai' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />AI Generate
            </button>
          </div>

          {aiTab === 'ai' && (
            <div className="space-y-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-5 animate-in fade-in duration-300">
              <AiSettings />
              {!isSignedIn && (
                <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3">
                  AI generation needs a free account — <Link href="/sign-in" className="text-[var(--accent)] hover:underline font-semibold">sign in</Link> for 10 credits/month. Manual testing below stays free forever.
                </p>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />Describe what you want to match
                </label>
                <textarea aria-label="Describe what you want to match" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder='e.g. "Match email addresses that end with @gmail.com"'
                  className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-amber-400 h-24 resize-none" />
              </div>
              <button onClick={handleGenerate} disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5">
                {isGenerating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Regex Pattern</>}
              </button>
              <p className="text-[10px] text-[var(--text-muted)]">The generated regex will be inserted below for testing. Costs 1 AI credit per use — no API key needed.</p>
            </div>
          )}

          {aiTab === 'manual' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[var(--text-secondary)]" />Regular Expression
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-4 text-[var(--text-muted)] text-lg">/</span>
                  <input type="text" value={pattern} onChange={e => setPattern(e.target.value)} aria-label="Regular expression"
                    placeholder="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                    className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl pl-8 pr-4 py-3 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-purple-500/50 transition-all font-mono" />
                  <span className="absolute right-4 text-[var(--text-muted)] text-lg">/</span>
                </div>
                <input aria-label="gmi" type="text" value={flags} onChange={e => setFlags(e.target.value)} placeholder="gmi"
                  className="w-24 bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-purple-500/50 transition-all font-mono" />
              </div>
              {error && <p className="text-sm text-red-500 flex items-center gap-2"><Info className="w-4 h-4" />{error}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--text-primary)]">Test String</label>
                <button onClick={() => setTestString('')} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Clear</button>
              </div>
              <textarea aria-label="Test String" value={testString} onChange={e => setTestString(e.target.value)}
                className="w-full h-64 bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-purple-500/50 transition-all font-mono resize-none"
                placeholder="Enter text to test your regular expression against..." spellCheck={false} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--text-primary)]">Match Results</label>
                <span className="text-xs px-2 py-1 bg-[var(--bg-surface)] rounded-md text-[var(--text-secondary)] font-mono">{matches.length} match{matches.length !== 1 && 'es'}</span>
              </div>
              <div className="w-full h-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm font-mono overflow-auto whitespace-pre-wrap break-words">
                {renderHighlightedText()}
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
            <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Save regex patterns to your library, batch test against multiple strings, export test results as CSV, share regex patterns with a link.</p>
            <Link href="/pricing" className="text-[10px] font-bold text-[var(--accent)] dark:text-[var(--accent)] underline shrink-0 ml-4">Upgrade →</Link>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-xl p-4 flex gap-3 text-sm text-purple-800 dark:text-purple-300">
            <Info className="w-5 h-5 shrink-0" />
            <p>Common flags: <strong>g</strong> (global match), <strong>i</strong> (ignore case), <strong>m</strong> (multiline), <strong>s</strong> (dotall).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
