"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '../AiSettings';
import { Clipboard, Download, Sparkles } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';

const CONTEXT_TYPES = [
  'Website Copy', 'Blog Post', 'Product Description', 'Email Campaign',
  'Mobile App UI', 'Landing Page', 'Social Media Post', 'Documentation'
];

const TONES = ['Professional', 'Casual', 'Witty', 'Formal', 'Persuasive', 'Minimal'];

export default function AiPlaceholderContentGenerator() {
  const { isConfigured, generateCompletion } = useAiProvider();
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputText, setOutputText] = useState('');

  const [context, setContext] = useState('');
  const [contextType, setContextType] = useState('Website Copy');
  const [tone, setTone] = useState('Professional');
  const [wordCount, setWordCount] = useState('100');

  const handleGenerate = async () => {
    if (!context.trim()) return toast.error('Please describe what content you need');
    if (!isConfigured) return toast.error('Please configure your AI Provider API key first');

    setIsProcessing(true);
    try {
      const prompt = `You are a professional copywriter. Generate realistic placeholder content for: ${context}. Context type: ${contextType}. Tone: ${tone}. Target length: ~${wordCount} words. Output should be realistic, natural-sounding text that looks like real content — NOT generic lorem ipsum. Do not wrap in markdown code blocks.`;
      const response = await generateCompletion([{ role: 'user', content: prompt }], 0.7);
      setOutputText(response);
      toast.success('Content generated!');
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, "placeholder_content_" + new Date().toISOString().slice(0,10) + ".txt");
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <AiSettings />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">AI Placeholder Content Generator</h3>
            </div>

            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">Generate realistic placeholder text — ditch lorem ipsum.</p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Describe the Content Context</label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                placeholder="e.g., A SaaS landing page for a project management tool targeting startups..."
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white h-32 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Content Type</label>
                <select
                  value={contextType}
                  onChange={e => setContextType(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none text-sm"
                >
                  {CONTEXT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tone</label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none text-sm"
                >
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Target Length</label>
              <select
                value={wordCount}
                onChange={e => setWordCount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none text-sm"
              >
                <option value="50">~50 words (short)</option>
                <option value="100">~100 words (medium)</option>
                <option value="250">~250 words (long)</option>
                <option value="500">~500 words (detailed)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isProcessing}
            className="mt-6 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
            <h4 className="font-semibold text-zinc-900 dark:text-white">Generated Output</h4>
            {outputText && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Copy to Clipboard">
                  <Clipboard className="w-4 h-4" />
                </button>
                <button onClick={handleDownload} className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Download as File">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {outputText ? (
              <pre className="flex-1 p-4 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-y-auto max-h-[500px]">
                {outputText}
              </pre>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
                <Sparkles className="w-8 h-8 mb-3 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                <p className="text-sm font-medium">Realistic placeholder content will appear here.</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Describe your context and generate AI-powered placeholder text.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
