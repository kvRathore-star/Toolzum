"use client";

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Download, RefreshCw, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { downloadOrShare } from '@/utils/nativeShare';

export default function PngToSvg() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [svgContent, setSvgContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'embedded' | 'silhouette'>('embedded');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setSvgContent('');
    }
  };

  const convertToSvg = () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      if (mode === 'embedded') {
        // Mode 1: Premium high fidelity Embedded Base64 Image inside SVG Wrapper
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          const w = img.width;
          const h = img.height;
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <image href="${dataUrl}" width="100%" height="100%"/>
</svg>`;
          setSvgContent(svg);
          setIsProcessing(false);
          toast.success('Embedded SVG vector wrapped!');
        };
      } else {
        // Mode 2: Client-side Silhouette/Threshold Vector tracing
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsProcessing(false);
            return;
          }

          // Render small thumbnail size for faster tracing
          const scale = Math.min(250 / img.width, 250 / img.height, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Simple threshold grouping to build silhouette paths
          let pathD = '';
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const idx = (y * canvas.width + x) * 4;
              const r = data[idx] ?? 0;
              const g = data[idx + 1] ?? 0;
              const b = data[idx + 2] ?? 0;
              const a = data[idx + 3] ?? 0;
              const brightness = (r + g + b) / 3;

              // Threshold trace black paths
              if (brightness < 128 && a > 100) {
                pathD += `M${x},${y}h1v1h-1z `;
              }
            }
          }

          const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}" width="100%" height="100%">
  <path d="${pathD}" fill="#000000"/>
</svg>`;
          setSvgContent(svg);
          setIsProcessing(false);
          toast.success('Silhouette Vector traced!');
        };
      }
    };

    reader.readAsDataURL(imageFile);
  };

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'traced_vector.svg');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[var(--accent)]" />
          PNG to SVG Vector Converter
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Convert raster images (PNG/JPG) to scalable vector SVG layouts. Support clean embedded vector scaling.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2">Image Upload</h3>
          
          <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col items-center justify-center bg-[var(--bg-overlay)] text-center">
            <Upload className="w-10 h-10 text-[var(--text-muted)] mb-2" />
            {imageFile ? (
              <div>
                <p className="text-xs text-[var(--text-primary)] dark:text-white font-bold">{imageFile.name}</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{(imageFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[var(--text-muted)]">Select PNG, JPG, or WebP image</p>
                <p className="text-[9px] text-[var(--text-secondary)] mt-1">Conversion works offline in your browser</p>
              </div>
            )}
            <label className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] px-4 py-2 rounded-xl text-xs text-white font-bold cursor-pointer transition-colors shadow mt-4">
              Select Image File
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Conversion Method</label>
            <div className="flex bg-[var(--bg-overlay)] p-1 rounded-xl gap-1">
              <button 
                onClick={() => setMode('embedded')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${mode === 'embedded' ? 'bg-white dark:bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}
              >
                Embedded Vector Wrapper
              </button>
              <button 
                onClick={() => setMode('silhouette')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${mode === 'silhouette' ? 'bg-white dark:bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}
              >
                Silhouette Path Trace
              </button>
            </div>
          </div>

          <button onClick={convertToSvg} disabled={isProcessing || !imageFile} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Trace SVG Vector
          </button>
        </div>

        {/* Vector Display Panel */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col justify-between items-center min-h-[300px]">
          {svgContent ? (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full">
              <div className="flex-1 flex items-center justify-center w-full p-4 bg-[var(--bg-overlay)] dark:bg-zinc-950 border border-[var(--border-subtle)] rounded-xl min-h-[220px]">
                <div className="max-w-full max-h-full object-contain" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svgContent, { USE_PROFILES: { svg: true, svgFilters: true } }) }} />
              </div>
              <button onClick={downloadSvg} className="w-full mt-4 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <Download className="w-4 h-4" /> Download SVG File
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
              <ImageIcon className="w-12 h-12 mb-3 opacity-30 animate-pulse" />
              <p className="text-xs">Traced SVG preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}