"use client";

import React, { useState, useEffect } from 'react';
import NextImage from "next/image";
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';

export default function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const generateFavicons = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      img.src = URL.createObjectURL(file);
      await loadPromise;

      const zip = new JSZip();
      
      const sizes = [
        { name: 'favicon-16x16.png', size: 16 },
        { name: 'favicon-32x32.png', size: 32 },
        { name: 'apple-touch-icon.png', size: 180 },
        { name: 'android-chrome-192x192.png', size: 192 },
        { name: 'android-chrome-512x512.png', size: 512 },
      ];

      // Function to resize image and get blob
      const resizeImage = (size: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject("Failed to get context");
          
          ctx.drawImage(img, 0, 0, size, size);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject("Blob generation failed");
          }, 'image/png');
        });
      };

      // Generate all sizes
      for (const item of sizes) {
        const blob = await resizeImage(item.size);
        zip.file(item.name, blob);
      }

      // Hack for favicon.ico (most modern browsers accept renamed PNGs or we just supply 32x32 as .ico)
      const icoBlob = await resizeImage(32);
      zip.file('favicon.ico', icoBlob);

      // Add standard site.webmanifest
      const manifest = {
        name: "My Awesome Site",
        short_name: "Site",
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone"
      };
      zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      setOutputUrl(url);
      
      toast.success("Favicon package generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate favicons.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>Complete Package:</strong> Upload a square image (PNG/JPG) to instantly generate all modern favicon formats (16x16, 32x32, Apple Touch, Android Chrome) and a `site.webmanifest` zipped up.
        </div>
        <FileUploader 
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onFileSelect={(f) => setFile(f)} 
          title="Upload App Icon"
          subtitle="A high-res square image works best (e.g. 512x512)"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024).toFixed(2)} KB</p>
        </div>
        <button 
          onClick={() => { setFile(null); setOutputUrl(null); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <h4 className="text-[var(--text-primary)] font-medium">Included Assets</h4>
          
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
            <li className="flex items-center gap-2"><span className="text-blue-700 dark:text-blue-400">✓</span> favicon-16x16.png</li>
            <li className="flex items-center gap-2"><span className="text-blue-700 dark:text-blue-400">✓</span> favicon-32x32.png</li>
            <li className="flex items-center gap-2"><span className="text-blue-700 dark:text-blue-400">✓</span> apple-touch-icon.png (180x180)</li>
            <li className="flex items-center gap-2"><span className="text-blue-700 dark:text-blue-400">✓</span> android-chrome-192x192.png</li>
            <li className="flex items-center gap-2"><span className="text-blue-700 dark:text-blue-400">✓</span> android-chrome-512x512.png</li>
            <li className="flex items-center gap-2"><span className="text-blue-700 dark:text-blue-400">✓</span> favicon.ico (fallback)</li>
            <li className="flex items-center gap-2"><span className="text-blue-700 dark:text-blue-400">✓</span> site.webmanifest</li>
          </ul>

          <button 
            onClick={generateFavicons}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? "Packaging ZIP..." : "Generate ZIP Package"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">Package Ready</h4>
               </div>
               
               <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  <p className="font-bold">favicon_package.zip</p>
               </div>

               <button 
                  onClick={() => downloadOrShare(outputUrl, `favicon_package.zip`)}
                  className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download ZIP
                </button>
            </div>
          ) : (
             <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
                <h4 className="text-[var(--text-primary)] font-medium mb-4">Original Image Preview</h4>
                <div className="bg-[var(--bg-overlay)] rounded-xl overflow-hidden border border-[var(--border-subtle)] flex items-center justify-center min-h-[250px] p-4 chess-bg">
                  <style>{`
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
                  `}</style>
                  <NextImage unoptimized={true} loading="lazy" src={URL.createObjectURL(file)} alt="Original" className="max-h-[250px] object-contain drop-shadow-md rounded" />
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
