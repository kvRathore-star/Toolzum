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

export default function VideoToTextTranscription() {
  const { generateCompletion } = useAiProvider();
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputText, setOutputText] = useState('');
  
  const [videoText, setVideoText] = useState("");
  const [format, setFormat] = useState("Clean Article / Blog Post");

  const handleGenerate = async () => {
    if (!videoText.trim()) return toast.error('Please fill in the Video Audio Logs / Transcript field');

    setIsProcessing(true);
    try {
      const prompt = `You are a professional media editor. Structure raw transcription text into readable articles or clean scripts.\n\nStructure the following raw transcription text into a readable script/article. Format: ${format}. Text:
${videoText}`;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.5);
      setOutputText(response);
      toast.success('Successfully generated!');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to generate"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    clipboardWrite(outputText).then(ok => { if (ok) toast.success('Copied to clipboard!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, "video_script_" + new Date().toISOString().slice(0,10) + ".txt");
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <AiPrivacyBanner />
      <AiSettings />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Video to Text Transcription Helper</h3>
            </div>
            
            <p className="text-xs text-[var(--text-muted)] mb-4">Structure and edit video audio logs into high-quality scripts or articles.</p>
            
<div className="space-y-2">
              <label htmlFor="lbl-videototexttranscription-video-audio-logs-transcript" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Video Audio Logs / Transcript</label>
              <textarea id="lbl-videototexttranscription-video-audio-logs-transcript" aria-label="Video Audio Logs / Transcript"
                value={videoText}
                onChange={e => setVideoText(e.target.value)}
                placeholder="Paste video transcription logs..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] transition-colors text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lbl-videototexttranscription-target-format" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Format</label>
              <select id="lbl-videototexttranscription-target-format" aria-label="Target Format"
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] transition-colors text-sm"
              >
                <option value="Clean Article / Blog Post">Clean Article / Blog Post</option>
                <option value="Script with Speaker Names">Script with Speaker Names</option>
                <option value="Concise Summary Outline">Concise Summary Outline</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isProcessing}
            className="mt-6 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-rose-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Process Transcription</span>
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Output */}
        <div className="lg:col-span-7 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
            <h4 className="font-semibold text-[var(--text-primary)]">Generated Output</h4>
            {outputText && (
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy} 
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors"
                  title="Copy to Clipboard" aria-label="Copy transcript"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleDownload} 
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors"
                  title="Download as File" aria-label="Download transcript"
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
                <Sparkles className="w-8 h-8 mb-3 text-[var(--text-muted)] animate-pulse" />
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
