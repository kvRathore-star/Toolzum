"use client";

import React, { useState, useRef, useEffect } from 'react';
import NextImage from "next/image";
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

export default function SvgToPngConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(2); // 1x, 2x, 4x, 8x

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const processImage = () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target?.result as string;
        
        // Create an image from SVG string
        const img = new Image();
        img.onload = () => {
          // Create canvas with scale
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            toast.error("Failed to get canvas context");
            setIsProcessing(false);
            return;
          }
          
          // Draw image to canvas scaled up
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert to PNG
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setOutputUrl(url);
              toast.success("Conversion complete!");
            } else {
              toast.error("Failed to generate PNG blob.");
            }
            setIsProcessing(false);
          }, 'image/png');
        };
        
        img.onerror = () => {
          toast.error("Invalid SVG file format.");
          setIsProcessing(false);
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));
      };
      
      reader.onerror = () => {
        toast.error("Failed to read file.");
        setIsProcessing(false);
      };
      
      reader.readAsText(file);
    } catch (e) {
      console.error(e);
      toast.error("Conversion failed.");
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Perfect Quality:</strong> Convert vector SVGs to high-resolution PNGs right in your browser.
        </div>
        <FileUploader 
          accept="image/svg+xml" 
          onFileSelect={(f) => setFile(f)} 
          title="Upload SVG File"
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
          Change SVG
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px] chess-bg">
          <style>{`
            .chess-bg {
              background-image: 
                linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee),
                linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee);
              background-size: 20px 20px;
              background-position: 0 0, 10px 10px;
            }
          `}</style>
          <NextImage unoptimized={true} loading="lazy" src={URL.createObjectURL(file)} className="max-h-[300px] object-contain drop-shadow-2xl" alt="SVG Preview" />
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-[var(--text-primary)] font-medium">Export Settings</h4>
            
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 4, 8].map(s => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`py-3 rounded-xl font-bold text-sm transition-colors border ${scale === s ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white dark:bg-black border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-zinc-800'}`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Higher scale multipliers produce larger, higher resolution PNG files. Because SVG is a vector format, it scales infinitely without losing quality.
            </p>

            <button 
              onClick={processImage}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? "Rendering PNG..." : "Convert to PNG"}
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-4">PNG Ready!</h4>
              <button 
                onClick={() => downloadOrShare(outputUrl, `${file.name.replace('.svg', '')}_${scale}x.png`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download PNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
