"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function CaseConverter() {
  const [inputText, setInputText] = useState('');

  const copyToClipboard = (text: string) => {
    clipboardWrite(text);
    toast.success("Copied to clipboard!");
  };

  const convertCase = (type: string) => {
    switch (type) {
      case 'upper': return inputText.toUpperCase();
      case 'lower': return inputText.toLowerCase();
      case 'title': return inputText.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      case 'camel': return inputText.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
      case 'snake': return inputText.toLowerCase().replace(/\s+/g, '_');
      case 'kebab': return inputText.toLowerCase().replace(/\s+/g, '-');
      case 'alternating': return inputText.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
      default: return inputText;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type or paste your text here..."
        className="w-full h-[300px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 text-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none shadow-sm focus:border-blue-500 transition-colors"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'upper', name: 'UPPER CASE' },
          { id: 'lower', name: 'lower case' },
          { id: 'title', name: 'Title Case' },
          { id: 'camel', name: 'camelCase' },
          { id: 'snake', name: 'snake_case' },
          { id: 'kebab', name: 'kebab-case' },
          { id: 'alternating', name: 'aLtErNaTiNg cAsE' },
        ].map(type => (
          <button
            key={type.id}
            onClick={() => {
              const res = convertCase(type.id);
              setInputText(res);
              copyToClipboard(res);
            }}
            className="bg-zinc-100 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-blue-900/30 text-zinc-700 dark:text-zinc-300 font-medium py-3 px-4 rounded-xl transition-colors border border-transparent dark:hover:border-blue-500/30 active:scale-95"
          >
            {type.name}
          </button>
        ))}
      </div>
    </div>
  );
}