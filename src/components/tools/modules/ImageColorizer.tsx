"use client";

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Download, Upload, Sliders } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function ImageColorizer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);
  const [hue, setHue] = useState(200); // Default blue tint colorizer
  const [saturation, setSaturation] = useState(60);
  const [brightness, setBrightness] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setColorizedUrl(null);
    }
  };

  const applyColorizer = () => {
    if (!imageSrc || !imageRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Apply color overlay blending mode (Hue-Rotate/HSL tint)
      ctx.globalCompositeOperation = 'hue';
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${50 + brightness}%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reset blending for clean export
      ctx.globalCompositeOperation = 'source-over';

      const output = canvas.toDataURL('image/jpeg', 0.9);
      setColorizedUrl(output);
      toast.success('Image color tint filter applied!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Colorization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!colorizedUrl) return;
    downloadOrShare(colorizedUrl, 'colorized_photo.jpg');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-500" />
          Colorize & Tint Image Filter
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Overlay visual color masks and HSL hue-rotate filters on photos and templates offline in your browser.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
        {/* Workspace */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase border-b border-zinc-800 pb-2">Filter Parameters</h3>
          
          {!imageSrc ? (
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black/20 text-center">
              <Upload className="w-10 h-10 text-zinc-400 mb-2" />
              <p className="text-xs text-zinc-400">Upload standard grayscale or color image</p>
              <label className="bg-[var(--accent)] hover:bg-indigo-600 px-4 py-2 rounded-xl text-xs text-white font-bold cursor-pointer transition-colors shadow mt-4">
                Choose Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 flex justify-center items-center p-2">
<img  loading="lazy" 
  ref={imageRef}
  src={imageSrc} 
  alt="Uploaded image preview" 
  className="max-w-full max-h-[250px] object-contain"
/>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block flex items-center gap-1"><Sliders className="w-3.5 h-3.5" /> Adjust Color Hue</span>
                
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Hue Tone</span>
                    <span>{hue}°</span>
                  </div>
                  <input type="range" min="0" max="360" value={hue} onChange={e => setHue(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Color Saturation</span>
                    <span>{saturation}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={saturation} onChange={e => setSaturation(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button onClick={() => setImageSrc(null)} className="border border-zinc-800 text-zinc-400 font-bold py-3 rounded-xl text-xs cursor-pointer">Clear File</button>
                <button onClick={applyColorizer} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Apply Tint</button>
              </div>
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 py-2">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between items-center min-h-[300px]">
          {colorizedUrl ? (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full space-y-4">
              <div className="flex-1 flex items-center justify-center w-full p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl">
<img  loading="lazy" 
  src={colorizedUrl} 
  alt="Processed result" 
  className="shadow-lg max-w-full max-h-[280px] object-contain rounded"
/>
              </div>
              <button 
                onClick={downloadImage}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Download Tinted Image
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <ImageIcon className="w-12 h-12 mb-3 opacity-30 text-[var(--text-muted)]" />
              <p className="text-xs">Tinted image preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
