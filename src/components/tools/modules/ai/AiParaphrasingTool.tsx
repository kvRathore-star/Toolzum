"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '../../AiSettings';
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';
import { getErrorMessage } from '@/utils/error';
import { clipboardWrite } from "@/lib/clipboard";


export default function AiParaphrasingTool() {
  const { generateCompletion } = useAiProvider();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [tone, setTone] = useState<'standard' | 'fluent' | 'formal' | 'creative'>('standard');
  const [mode, setMode] = useState<'paraphrase' | 'summarize' | 'expand'>('paraphrase');
  const [length, setLength] = useState<'shorter' | 'same' | 'longer'>('same');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return toast.error('Enter text to paraphrase');

    setIsProcessing(true);
    try {
      const lengthNote = length === 'shorter' ? 'Make the result more concise than the original.' : length === 'longer' ? 'Expand slightly with helpful detail while keeping the original meaning.' : 'Keep roughly the same length as the original.';
      const prompt = `You are an expert copywriter. Paraphrase the following text in a ${tone} tone (${mode} mode). ${lengthNote} Fix any grammatical errors, and ensure it sounds completely human-written while retaining the original meaning.\n\nOriginal Text:\n` + inputText;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.7);
      setOutputText(response);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    clipboardWrite(outputText).then(ok => ok && toast.success('Copied to clipboard!'));
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'paraphrased_text.txt');
    URL.revokeObjectURL(url);
    toast.success('Paraphrased text downloaded');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <AiPrivacyBanner />
      <AiSettings />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Tone</label>
          <select aria-label="Tone" value={tone} onChange={e => setTone(e.target.value as typeof tone)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
            <option value="standard">Standard</option>
            <option value="fluent">Fluent</option>
            <option value="formal">Formal</option>
            <option value="creative">Creative</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Mode</label>
          <select aria-label="Mode" value={mode} onChange={e => setMode(e.target.value as typeof mode)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
            <option value="paraphrase">Paraphrase</option>
            <option value="summarize">Summarize</option>
            <option value="expand">Expand</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Length</label>
          <select aria-label="Length" value={length} onChange={e => setLength(e.target.value as typeof length)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
            <option value="shorter">Shorter</option>
            <option value="same">Same length</option>
            <option value="longer">Longer</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea aria-label="Paste text to paraphrase..." value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()} placeholder="Paste text to paraphrase..." className="w-full h-96 p-4 rounded-xl border border-[var(--border-subtle)] bg-transparent focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
        <textarea value={outputText} readOnly placeholder="Paraphrased text will appear here..." className="w-full h-96 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] dark:bg-zinc-900 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
      </div>
      <button onClick={handleGenerate} disabled={isProcessing} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl">{isProcessing ? <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                Paraphrasing...
              </> : 'Paraphrase Text'}</button>
      {outputText && (
        <div className="flex gap-3">
          <button onClick={handleCopy} className="flex-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold py-3 rounded-xl">Copy to Clipboard</button>
          <button onClick={handleDownload} className="flex-1 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold py-3 rounded-xl">Download .txt</button>
        </div>
      )}
    </div>
  );
}