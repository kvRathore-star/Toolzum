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

export default function AudioToTextTranscription() {
  const { generateCompletion } = useAiProvider();
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputText, setOutputText] = useState('');
  
  const [audioText, setAudioText] = useState("");
  const [format, setFormat] = useState("Clean Read (remove filler words/umms/ahhs)");

  const handleGenerate = async () => {
    if (!audioText.trim()) return toast.error('Please fill in the Raw Transcript Text field');

    setIsProcessing(true);
    try {
      const prompt = `You are an expert transcriber. Format and clean transcription dumps.\n\nFormat and clean up the following transcription text. Format style: ${format}. Transcription:
${audioText}`;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.4);
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
    downloadOrShare(url, "transcription_clean_" + new Date().toISOString().slice(0,10) + ".txt");
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
              <Sparkles className="w-5 h-5 text-teal-500" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Audio to Text Transcription Helper</h3>
            </div>
            
            <p className="text-xs text-[var(--text-muted)] mb-4">Clean up and format raw audio transcriptions into structured documents.</p>
            
<div className="space-y-2">
              <label htmlFor="lbl-audiototexttranscription-raw-transcript-text" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Raw Transcript Text</label>
              <textarea id="lbl-audiototexttranscription-raw-transcript-text" aria-label="Raw Transcript Text"
                value={audioText}
                onChange={e => setAudioText(e.target.value)}
                placeholder="Paste your audio transcript text here..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lbl-audiototexttranscription-clean-up-style" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Clean Up Style</label>
              <select id="lbl-audiototexttranscription-clean-up-style" aria-label="Clean Up Style"
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm"
              >
                <option value="Clean Read (remove filler words/umms/ahhs)">Clean Read (remove filler words/umms/ahhs)</option>
                <option value="Verbatim / Word-for-word">Verbatim / Word-for-word</option>
                <option value="Executive Summary of Transcript">Executive Summary of Transcript</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isProcessing}
            className="mt-6 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:shadow-teal-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Structuring...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Clean & Format</span>
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
                  className="p-2 text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors"
                  title="Copy to Clipboard" aria-label="Copy"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleDownload} 
                  className="p-2 text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors"
                  title="Download as File" aria-label="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {outputText ? (
              <pre className="flex-1 p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)]/50 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-y-auto max-h-[500px]">
                {outputText}
              </pre>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 text-center text-[var(--text-muted)]">
                <Sparkles className="w-8 h-8 mb-3 text-zinc-300 dark:text-zinc-700 animate-pulse" />
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
