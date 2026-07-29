"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '../AiSettings';
import { Clipboard, Download, Sparkles, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';

interface AtsResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  keywordGaps: string[];
  formatIssues: string[];
  suggestions: string[];
}

export default function ResumeAtsScoreChecker() {
  const { generateCompletion } = useAiProvider();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [rawOutput, setRawOutput] = useState('');

  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('Technology');

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return toast.error('Paste your resume text first');
    if (!jobTitle.trim()) return toast.error('Enter the target job title');

    setIsProcessing(true);
    setResult(null);
    setRawOutput('');
    try {
      const prompt = `You are an expert ATS (Applicant Tracking System) resume analyst. Analyze the following resume for a "${jobTitle}" position in the "${industry}" industry.

Resume:
${resumeText}

Return EXACTLY this JSON structure with NO markdown formatting, NO code fences, just raw JSON:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence executive summary>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "keywordGaps": ["<missing keyword 1>", ...],
  "formatIssues": ["<issue 1>", ...],
  "suggestions": ["<actionable suggestion 1>", ...]
}

Be honest and critical. Score should reflect real ATS compatibility. Include specific missing keywords from the job description context.`;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.3);
      setRawOutput(response);

      let cleaned = response.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```/g, '');
      }

      const parsed: AtsResult = JSON.parse(cleaned);
      setResult(parsed);
      toast.success(`Score: ${parsed.score}/100`);
    } catch (e: unknown) {
      toast.error('AI returned invalid data. Showing raw response.');
      setRawOutput(response => response || '');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    const text = result
      ? `ATS Score: ${result.score}/100\n\n${result.summary}\n\nStrengths:\n${result.strengths.map(s => `• ${s}`).join('\n')}\n\nImprovements Needed:\n${result.weaknesses.map(w => `• ${w}`).join('\n')}\n\nMissing Keywords:\n${result.keywordGaps.map(k => `• ${k}`).join('\n')}\n\nSuggestions:\n${result.suggestions.map(s => `• ${s}`).join('\n')}`
      : rawOutput;
    clipboardWrite(text);
    toast.success('Copied!');
  };

  const handleDownload = () => {
    const text = result
      ? JSON.stringify(result, null, 2)
      : rawOutput;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `ats_report_${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const scoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const scoreBg = (s: number) => {
    if (s >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (s >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <AiPrivacyBanner />
      <AiSettings />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 mb-4">
            <Target className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Resume ATS Score Checker</h3>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Job Title *</label>
              <input
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Industry</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none"
              >
                {['Technology', 'Finance & Banking', 'Healthcare', 'Education', 'Manufacturing', 'Marketing & Media', 'Consulting', 'Government', 'Retail', 'Other'].map(i =>
                  <option key={i} value={i}>{i}</option>
                )}
              </select>
            </div>

            <div className="space-y-2 flex-1">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Paste Your Resume *</label>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your full resume text here including work experience, skills, education, certifications..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none flex-1 min-h-[200px]"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
            >
              {isProcessing ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Analyzing against ATS...</span></>
              ) : (
                <><Sparkles className="w-5 h-5" /><span>Check ATS Score</span></>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
            <h4 className="font-semibold text-[var(--text-primary)]">ATS Analysis Report</h4>
            {(result || rawOutput) && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors" aria-label="Copy">
                  <Clipboard className="w-4 h-4" />
                </button>
                <button onClick={handleDownload} className="p-2 text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors" aria-label="Download">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {result ? (
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[550px] pr-1">
              <div className={`flex items-center justify-between p-4 rounded-xl border ${scoreBg(result.score)}`}>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase">ATS Compatibility Score</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{result.score >= 80 ? 'Strong candidate' : result.score >= 60 ? 'Room for improvement' : 'Needs significant work'}</p>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-black ${scoreColor(result.score)}`}>{result.score}</span>
                  <span className="text-sm text-[var(--text-muted)]">/100</span>
                </div>
              </div>

              <div className="p-4 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]/50">
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">{result.summary}</p>
              </div>

              {result.strengths.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Strengths</h5>
                  <ul className="space-y-1">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-[var(--text-muted)]">
                        <span className="text-emerald-500 mt-0.5">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.weaknesses.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Areas to Improve</h5>
                  <ul className="space-y-1">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-[var(--text-muted)]">
                        <span className="text-amber-500 mt-0.5">•</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.keywordGaps.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Missing Keywords</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordGaps.map((k, i) => (
                      <span key={i} className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-[11px] text-red-600 dark:text-red-400 font-medium">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.formatIssues.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Format Issues</h5>
                  <ul className="space-y-1">
                    {result.formatIssues.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-[var(--text-muted)]">
                        <span className="text-orange-500 mt-0.5">•</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestions.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Actionable Suggestions</h5>
                  <ul className="space-y-1">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-[var(--text-muted)]">
                        <span className="text-[var(--accent)] mt-0.5">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : rawOutput ? (
            <pre className="flex-1 p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)]/50 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-y-auto max-h-[500px]">
              {rawOutput}
            </pre>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 text-center text-[var(--text-muted)]">
              <Target className="w-8 h-8 mb-3 text-zinc-300 dark:text-zinc-700 animate-pulse" />
              <p className="text-sm font-medium">Your ATS analysis will appear here</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Paste your resume, set the target role, and analyze</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
