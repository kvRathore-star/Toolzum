"use client";

import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import Image from "next/image";
import { clipboardWrite } from "@/lib/clipboard";

export default function ImageToBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [includePrefix, setIncludePrefix] = useState<boolean>(true);

  const handleFileSelect = (selectedFile: File, url: string) => {
    setFile(selectedFile);
    setDataUrl(url);
  };

  const getOutputString = () => {
    if (!dataUrl) return '';
    return includePrefix ? dataUrl : dataUrl.split(',')[1] || '';
  };

  const copyToClipboard = async () => {
    const text = getOutputString();
    if (!text) return;
    try {
      await clipboardWrite(text);
      toast.success("Base64 string copied to clipboard!");
    } catch (e) {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const downloadAsTextFile = () => {
    const text = getOutputString();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `base64_${file?.name || 'image'}.txt`);
  };

  const clearAll = () => {
    setFile(null);
    setDataUrl('');
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Lightning Fast & Private:</strong> Convert any image into a Base64 string instantly in your browser. Files never touch a server.
        </div>
        <FileUploader 
          accept="image/*"
          onFileSelect={handleFileSelect} 
          title="Upload Image"
          subtitle="Drag & drop or click to select"
        />
      </div>
    );
  }

  const outputString = getOutputString();
  const approxSizeKb = (outputString.length * (3/4)) / 1024;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{(file.size / 1024).toFixed(2)} KB (Original File)</p>
        </div>
        <button 
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
        >
          Change Image
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Preview */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <h4 className="text-zinc-900 dark:text-white font-medium">Image Preview</h4>
          </div>

          <div className="flex-1 bg-zinc-50 dark:bg-black rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-4 min-h-[300px] chess-bg">
            <style dangerouslySetInnerHTML={{__html: `
              .chess-bg {
                background-image: 
                  linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee),
                  linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee);
                background-size: 20px 20px;
                background-position: 0 0, 10px 10px;
              }
              @media (prefers-color-scheme: dark) {
                .chess-bg {
                  background-image: 
                    linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111),
                    linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111);
                }
              }
            `}} />
            <Image loading="lazy" src={dataUrl} alt="Preview" unoptimized={true} className="max-h-[350px] object-contain drop-shadow-md rounded z-10 relative" />
          </div>
        </div>

        {/* Right Col: Output Base64 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4 flex flex-col h-[500px]">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <h4 className="text-zinc-900 dark:text-white font-medium">Base64 Output</h4>
            <div className="text-xs text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
              ~{approxSizeKb.toFixed(2)} KB decoded
            </div>
          </div>
          
          <div className="flex items-center gap-2 pb-2">
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={includePrefix} 
                onChange={(e) => setIncludePrefix(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              Include URI Prefix 
              <span className="text-xs text-zinc-400 font-normal">(data:image/jpeg;base64,...)</span>
            </label>
          </div>

          <textarea 
            className="flex-1 w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-500 dark:text-zinc-400 outline-none focus:border-blue-500 resize-none font-mono text-xs break-all"
            readOnly
            value={outputString}
          />

          <div className="flex gap-4 pt-2">
            <button 
              onClick={copyToClipboard}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              📋 Copy to Clipboard
            </button>
            <button 
              onClick={downloadAsTextFile}
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-3 rounded-xl shadow transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              💾 Download .txt
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
