"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'encode' | 'decode';

export default function Base64EncodeDecode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [urlSafe, setUrlSafe] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processData = (val: string = input, currentMode: Mode = mode) => {
    if (!val.trim()) {
      setOutput('');
      return;
    }

    try {
      if (currentMode === 'encode') {
        // UTF-8 friendly base64 encoding (btoa only supports Latin1)
        const bytes = new TextEncoder().encode(val);
        const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
        let encoded = btoa(binString);
        
        if (urlSafe) {
          encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        setOutput(encoded);
      } else {
        // Decode logic
        let toDecode = val.trim();
        if (urlSafe) {
          toDecode = toDecode.replace(/-/g, '+').replace(/_/g, '/');
          while (toDecode.length % 4) {
            toDecode += '=';
          }
        }
        
        const binString = atob(toDecode);
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
        const decoded = new TextDecoder().decode(bytes);
        setOutput(decoded);
      }
    } catch (err) {
      setOutput('');
      if (currentMode === 'decode') {
        toast.error("Invalid Base64 format!");
      } else {
        toast.error("Failed to encode text.");
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    processData(val, mode);
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    // Process current output as input to make switching easy
    if (output) {
      setInput(output);
      processData(output, newMode);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    if (mode === 'encode') {
      // Encode file to Base64 data URL
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data prefix if desired, or keep it. Let's keep it but show options.
        setInput(`File: ${file.name} (${file.size} bytes)`);
        setOutput(result);
        setIsProcessing(false);
        toast.success("File encoded to Base64!");
      };
      reader.onerror = () => {
        setIsProcessing(false);
        toast.error("Failed to read file.");
      };
      reader.readAsDataURL(file);
    } else {
      // Decode base64 file to text
      reader.onload = () => {
        const text = reader.result as string;
        setInput(text);
        processData(text, 'decode');
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setIsProcessing(false);
        toast.error("Failed to read file.");
      };
      reader.readAsText(file);
    }
  };

  const handleSwap = () => {
    if (!output) return;
    const tempInput = input;
    const tempOutput = output;
    setInput(tempOutput);
    setOutput(tempInput);
    setMode(mode === 'encode' ? 'decode' : 'encode');
    toast.success("Swapped input & output");
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await clipboardWrite(output);
      toast.success('Copied output to clipboard!');
    } catch (err) {
      toast.error('Failed to copy.');
    }
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `base64-${mode === 'encode' ? 'encoded' : 'decoded'}.txt`);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 text-sm space-y-1">
        <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
          🔒 Secure Base64 Encoder / Decoder
        </h4>
        <p className="text-zinc-600 dark:text-zinc-400">
          Encode standard text to Base64 (supporting Unicode characters) or decode Base64 back to plain text. Files are processed entirely in your browser memory for maximum security.
        </p>
      </div>

      {/* Settings Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-white/5">
        <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => handleModeSwitch('encode')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'encode'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => handleModeSwitch('decode')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'decode'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Decode
          </button>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-600 dark:text-zinc-400 font-semibold select-none">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => {
                setUrlSafe(e.target.checked);
                // Trigger reprocess with new setting
                setTimeout(() => processData(input, mode), 0);
              }}
              className="rounded border-zinc-300 dark:border-zinc-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            URL-Safe Base64
          </label>

          <label className="flex items-center gap-2 cursor-pointer bg-zinc-200 dark:bg-[var(--bg-surface)] hover:bg-zinc-300 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            📁 File Import
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl flex flex-col h-[400px]">
          <div className="px-4 py-3 bg-black/20 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center shrink-0">
            <span className="text-zinc-700 dark:text-zinc-300 text-sm font-bold uppercase tracking-wider">
              {mode === 'encode' ? 'Input Text' : 'Base64 Hash'}
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-red-500 hover:text-red-400 font-semibold"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={handleTextChange}
            placeholder={
              mode === 'encode'
                ? "Enter plain text here..."
                : "Enter Base64 encoded string here..."
            }
            className="flex-1 p-4 bg-transparent outline-none resize-none font-mono text-sm text-zinc-900 dark:text-white"
          />
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl flex flex-col h-[400px]">
          <div className="px-4 py-3 bg-black/20 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center shrink-0">
            <span className="text-zinc-700 dark:text-zinc-300 text-sm font-bold uppercase tracking-wider">
              {mode === 'encode' ? 'Base64 Hash' : 'Decoded Text'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSwap}
                disabled={!output}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-semibold disabled:opacity-50"
                aria-label="Swap inputs"
              >
                🔄 Swap
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className="text-xs text-blue-500 hover:text-blue-400 font-semibold disabled:opacity-50"
              >
                📋 Copy
              </button>
              <button
                onClick={downloadOutput}
                disabled={!output}
                className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold disabled:opacity-50"
              >
                💾 Save
              </button>
            </div>
          </div>
          <textarea
            value={isProcessing ? "Processing file..." : output}
            readOnly
            placeholder="Result will appear here..."
            className="flex-1 p-4 bg-transparent outline-none resize-none font-mono text-sm text-emerald-500 dark:text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
}

