"use client";

import React, { useState, useEffect } from 'react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import NextImage from "next/image";

export default function Base64ToImage() {
  const [base64Input, setBase64Input] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const processBase64 = () => {
    setError(null);
    if (!base64Input.trim()) {
      setImageUrl(null);
      return;
    }

    try {
      let cleanInput = base64Input.trim();
      
      // Check if it already has data URI prefix
      if (!cleanInput.startsWith('data:image/')) {
        // Guess the MIME type or default to png
        const isJpeg = cleanInput.startsWith('/9j/');
        const isSvg = cleanInput.startsWith('PHN2');
        const isWebp = cleanInput.startsWith('UklGR');
        
        let mime = 'image/png';
        if (isJpeg) mime = 'image/jpeg';
        if (isSvg) mime = 'image/svg+xml';
        if (isWebp) mime = 'image/webp';
        
        cleanInput = `data:${mime};base64,${cleanInput}`;
      }

      // Test if valid by loading it into an image
      const img = new Image();
      img.onload = () => {
        setImageUrl(cleanInput);
        toast.success("Image decoded successfully!");
      };
      img.onerror = () => {
        setError("Invalid Base64 string. The data could not be decoded into an image.");
        setImageUrl(null);
      };
      img.src = cleanInput;
    } catch (e) {
      setError("An error occurred processing the Base64 string.");
      setImageUrl(null);
    }
  };

  const clearAll = () => {
    setBase64Input('');
    setImageUrl(null);
    setError(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setBase64Input(text);
      // Wait for React to update state before processing
      setTimeout(() => {
        // Trigger processing by directly invoking it with new text would be better,
        // but since processBase64 uses state, we can just let user click or we can use useEffect.
        // For simplicity, we just paste. 
      }, 0);
    } catch (err) {
      toast.error("Failed to read clipboard");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
        <strong>Client-Side Only:</strong> Paste a Base64 encoded string to decode it into an image. The decoding process happens locally in your browser.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Input */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <h4 className="text-zinc-900 dark:text-white font-medium">Base64 String</h4>
            <div className="flex gap-2">
              <button onClick={handlePaste} className="text-xs text-blue-500 hover:text-blue-400 font-bold">Paste</button>
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-400 font-bold">Clear</button>
            </div>
          </div>
          
          <textarea 
            className="flex-1 w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-none font-mono text-sm"
            placeholder="Paste your Base64 string here... (e.g. iVBORw0KGgo...)"
            value={base64Input}
            onChange={e => setBase64Input(e.target.value)}
          />
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl">
              {error}
            </div>
          )}

          <button 
            onClick={processBase64}
            disabled={!base64Input.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            Decode to Image
          </button>
        </div>

        {/* Right Col: Output */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col space-y-6 min-h-[400px]">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <h4 className="text-zinc-900 dark:text-white font-medium">Image Preview</h4>
          </div>

          <div className="flex-1 bg-zinc-50 dark:bg-black rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-4 relative chess-bg">
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
            
            {imageUrl ? (
              <NextImage loading="lazy" src={imageUrl} alt="Decoded" unoptimized={true} className="max-w-full max-h-[350px] object-contain drop-shadow-md rounded z-10 relative" />
            ) : (
              <div className="text-zinc-400 flex flex-col items-center gap-2 z-10 bg-zinc-50/80 dark:bg-black/80 px-6 py-4 rounded-xl backdrop-blur-sm">
                <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p>Preview will appear here</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => imageUrl && downloadOrShare(imageUrl, `decoded_image_${Date.now()}.png`)}
            disabled={!imageUrl}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
}
