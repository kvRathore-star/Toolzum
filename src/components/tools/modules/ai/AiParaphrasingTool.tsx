"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '../../AiSettings';
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';
import { getErrorMessage } from '@/utils/error';

export default function AiParaphrasingTool() {
  const { generateCompletion } = useAiProvider();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return toast.error('Enter text to paraphrase');

    setIsProcessing(true);
    try {
      const prompt = "You are an expert copywriter. Paraphrase the following text. Make it more engaging, fix any grammatical errors, and ensure it sounds completely human-written while retaining the original meaning.\n\nOriginal Text:\n" + inputText;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.7);
      setOutputText(response);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <AiPrivacyBanner />
      <AiSettings />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea aria-label="Paste text to paraphrase..." value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()} placeholder="Paste text to paraphrase..." className="w-full h-96 p-4 rounded-xl border border-[var(--border-subtle)] bg-transparent focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
        <textarea value={outputText} readOnly placeholder="Paraphrased text will appear here..." className="w-full h-96 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] dark:bg-zinc-900 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
      </div>
      <button onClick={handleGenerate} disabled={isProcessing} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl">{isProcessing ? <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                Paraphrasing...
              </> : 'Paraphrase Text'}</button>
    </div>
  );
}