"use client";

import React, { useState } from 'react';
import { FileText, Copy, Check, Download, Upload, Briefcase, Target, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '@/components/tools/AiSettings';

export default function AiResumeTailor() {
  const { apiKey, provider, isConfigured } = useAiProvider();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const handleResumeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setResumeText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const tailor = async () => {
    if (!resumeText.trim()) return toast.error('Paste or upload your resume');
    if (!jobDescription.trim()) return toast.error('Paste the job description');
    if (!isConfigured || !apiKey) return toast.error('Configure your AI provider first');

    setIsGenerating(true);
    setTailoredResume(null);
    setMatchScore(null);

    const systemPrompt = 'You are an expert resume writer and ATS consultant. Analyze the resume against the job description and produce a tailored version.';

    const userPrompt = `RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please:
1. First give a MATCH SCORE (0-100%) with brief reasoning
2. Then rewrite the resume tailored to this specific job:
   - Rewrite the professional summary to match the role
   - Reorder and rephrase bullet points to highlight relevant experience
   - Add keywords from the job description naturally
   - Remove or minimize irrelevant sections
   - Keep all factual claims accurate — do not fabricate experience

Output format:
=== MATCH SCORE: X% ===
[Brief reasoning for score]

=== TAILORED RESUME ===
[Full rewritten resume]`;

    try {
      const response = await fetch(
        provider === 'openai'
          ? 'https://api.openai.com/v1/chat/completions'
          : provider === 'gemini'
            ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
            : 'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(provider !== 'gemini' ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify(
            provider === 'gemini'
              ? { contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }] }
              : { model: provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] }
          ),
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data: any = await response.json();
      const text = provider === 'gemini'
        ? data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        : data?.choices?.[0]?.message?.content || '';

      if (!text) throw new Error('No response from AI');

      const scoreMatch = text.match(/MATCH SCORE:\s*(\d+)/i);
      if (scoreMatch) setMatchScore(parseInt(scoreMatch[1]));
      setTailoredResume(text);
      toast.success('Resume tailored!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to tailor resume');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!tailoredResume) return;
    navigator.clipboard.writeText(tailoredResume);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!tailoredResume) return;
    const blob = new Blob([tailoredResume], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailored_resume_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">AI Resume Tailor</h3>
      </div>

      <AiSettings />

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Paste a job description and your resume. AI rewrites your resume to match the role — highlights relevant experience, adds keywords, and improves your match score.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5"><FileText className="w-3 h-3" /> Your Resume *</label>
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center hover:border-emerald-500/50 cursor-pointer bg-zinc-50/50 dark:bg-black/20"
              onClick={() => document.getElementById('resume-file')?.click()}>
              <Upload className="w-5 h-5 mx-auto mb-1 text-zinc-400" />
              <p className="text-[10px] text-zinc-500">{fileName || 'Upload .txt resume'}</p>
              <input id="resume-file" type="file" accept=".txt" onChange={handleResumeFile} className="hidden" />
            </div>
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={10}
              placeholder="Paste your full resume here..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5"><Target className="w-3 h-3" /> Job Description *</label>
            <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={10}
              placeholder="Paste the full job description here..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none font-mono" />
          </div>
        </div>

        <button onClick={tailor} disabled={isGenerating}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
          {isGenerating ? (
            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" /></svg> Tailoring...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Tailor Resume for This Job</>
          )}
        </button>

        {matchScore !== null && (
          <div className={`rounded-xl p-4 border text-center ${
            matchScore >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30' :
            matchScore >= 40 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30' :
            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
          }`}>
            <p className="text-[10px] font-bold uppercase text-zinc-500">ATS Match Score</p>
            <p className={`text-4xl font-black mt-1 ${
              matchScore >= 70 ? 'text-emerald-600' : matchScore >= 40 ? 'text-amber-600' : 'text-red-600'
            }`}>{matchScore}%</p>
          </div>
        )}

        {tailoredResume && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Tailored Resume</h5>
              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-600 transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={handleDownload}
                  className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">{tailoredResume}</pre>
            </div>
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
            <strong>Pro:</strong> PDF resume upload, DOCX export, cover letter + resume bundle, 10 tailored versions/month, company-specific tailoring, interview questions based on JD.
          </p>
        </div>
      </div>
    </div>
  );
}
