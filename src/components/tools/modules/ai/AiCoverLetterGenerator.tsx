"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '../../AiSettings';
import { Clipboard, Download, Sparkles } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';
import { getErrorMessage } from '@/utils/error';

export default function AiCoverLetterGenerator() {
  const { generateCompletion } = useAiProvider();
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputText, setOutputText] = useState('');
  
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [resumeSummary, setResumeSummary] = useState("");

  const handleGenerate = async () => {
    if (!jobTitle.trim()) return toast.error('Please fill in the Target Job Title field');
    if (!company.trim()) return toast.error('Please fill in the Company Name field');
    if (!resumeSummary.trim()) return toast.error('Please fill in the Your Skills / Experience field');

    setIsProcessing(true);
    try {
      const prompt = `You are a professional career coach and executive recruiter.\n\nWrite a highly personalized, compelling cover letter for a ${jobTitle} role at ${company}. Job description context: ${jobDesc}. Candidate profile: ${resumeSummary}. Follow professional letter formatting.`;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.7);
      setOutputText(response);
      toast.success('Successfully generated!');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to generate"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    clipboardWrite(outputText);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, "cover_letter_" + new Date().toISOString().slice(0,10) + ".txt");
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <AiPrivacyBanner />
      <AiSettings />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Cover Letter Generator</h3>
            </div>
            
            <p className="text-xs text-[var(--text-muted)] mb-4">Create professional, customized cover letters tailored for jobs.</p>
            
<div className="space-y-2">
              <label htmlFor="lbl-aicoverlettergenerator-target-job-title" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Job Title</label>
              <input id="lbl-aicoverlettergenerator-target-job-title" aria-label="Target Job Title"
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Engineer"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--border-subtle)] dark:focus:border-[var(--border-subtle)] transition-colors text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lbl-aicoverlettergenerator-company-name" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Company Name</label>
              <input id="lbl-aicoverlettergenerator-company-name" aria-label="Company Name"
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g., Stripe"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--border-subtle)] dark:focus:border-[var(--border-subtle)] transition-colors text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lbl-aicoverlettergenerator-job-description-requirements-optional" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Job Description / Requirements (Optional)</label>
              <textarea id="lbl-aicoverlettergenerator-job-description-requirements-optional" aria-label="Job Description / Requirements (Optional)"
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                placeholder="Paste key job responsibilities or requirements..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--border-subtle)] dark:focus:border-[var(--border-subtle)] transition-colors text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lbl-aicoverlettergenerator-your-skills-experience" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Your Skills / Experience</label>
              <textarea id="lbl-aicoverlettergenerator-your-skills-experience" aria-label="Your Skills / Experience"
                value={resumeSummary}
                onChange={e => setResumeSummary(e.target.value)}
                placeholder="Paste your resume summary, key achievements, or skills..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--border-subtle)] dark:focus:border-[var(--border-subtle)] transition-colors text-sm resize-none"
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isProcessing}
            className="mt-6 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Tailoring Letter...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Cover Letter</span>
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Output */}
        <div className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
            <h4 className="font-semibold text-[var(--text-primary)]">Generated Output</h4>
            {outputText && (
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy} 
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors"
                  title="Copy to Clipboard" aria-label="Copy cover letter"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleDownload} 
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors"
                  title="Download as File" aria-label="Download cover letter"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {outputText ? (
              <pre className="flex-1 p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)]/50 text-[var(--text-primary)] whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-y-auto max-h-[500px]">
                {outputText}
              </pre>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 text-center text-[var(--text-muted)]">
                <Sparkles className="w-8 h-8 mb-3 text-zinc-300 dark:text-[var(--text-primary)] animate-pulse" />
                <p className="text-sm font-medium">Your generated content will appear here.</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Configure your API key and click generate to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
