"use client";

import React, { useState } from 'react';
import { TRANSFORM_CONFIG } from './textTransformConfig';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function TextTransformConverter({ slug }: { slug: string; description?: string }) {
  const config = TRANSFORM_CONFIG[slug];
  const [input, setInput] = useState(config?.inputPlaceholder || '');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!config) return <div className="text-red-500">Unknown transform: {slug}</div>;

  const handleConvert = () => {
    try {
      const result = config.convert(input);
      setOutput(result);
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  };

  const handleCopy = () => {
    clipboardWrite(output);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          {config.name}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{config.description}</p>
        <textarea
          rows={6}
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y min-h-[80px]"
        />
        <button
          onClick={handleConvert}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.98]"
        >
          Convert
        </button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">{config.outputLabel}</span>
              <button
                onClick={handleCopy}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
