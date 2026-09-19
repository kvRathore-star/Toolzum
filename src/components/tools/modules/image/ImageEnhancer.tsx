"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { Download, Sliders, RefreshCw, Layers, Star, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface FiltersState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  hueRotate: number;
  grayscale: number;
}

const DEFAULT_FILTERS: FiltersState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  sepia: 0,
  hueRotate: 0,
  grayscale: 0,
};

const PRESETS = [
  { name: 'Default', filters: DEFAULT_FILTERS },
  { name: 'Vintage', filters: { ...DEFAULT_FILTERS, sepia: 40, contrast: 90, saturation: 85 } },
  { name: 'Noir (Grayscale)', filters: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 120 } },
  { name: 'Vibrant', filters: { ...DEFAULT_FILTERS, saturation: 140, contrast: 110 } },
  { name: 'Cool Tone', filters: { ...DEFAULT_FILTERS, hueRotate: 200, saturation: 90 } },
  { name: 'Warm Glow', filters: { ...DEFAULT_FILTERS, sepia: 20, brightness: 105, saturation: 110 } },
];

export default function ImageEnhancer() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = (file: File, url: string) => {
    setImageFile(file);
    setImageSrc(url);
    setFilters(DEFAULT_FILTERS);
    setProcessedUrl(null);
  };

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        applyFilters();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, filters]);

  useEffect(() => {
    return () => {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [processedUrl]);

  const applyFilters = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Build filter string
    const filterString = `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      blur(${filters.blur}px) 
      sepia(${filters.sepia}%) 
      hue-rotate(${filters.hueRotate}deg)
      grayscale(${filters.grayscale}%)
    `.trim().replace(/\s+/g, ' ');

    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        if (processedUrl) URL.revokeObjectURL(processedUrl);
        setProcessedUrl(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.95);
  };

  const handleSliderChange = (key: keyof FiltersState, val: number) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    downloadOrShare(processedUrl, `enhanced-${imageFile?.name || 'photo.jpg'}`);
  };

  const reset = () => {
    setImageFile(null);
    setImageSrc(null);
    setFilters(DEFAULT_FILTERS);
    setProcessedUrl(null);
  };

  if (!imageSrc) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-700/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span><strong>Hardware Accelerated Filters:</strong> Adjust details, apply filter presets, and download high-resolution outputs instantly.</span>
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Photo to Enhance"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{imageFile?.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">Fine tune color, light, and styling parameters</p>
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Change Photo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 max-h-[600px] overflow-y-auto pr-1">
          {/* Quick presets */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <Star className="w-4 h-4 text-[var(--accent)]" />
              Quick Presets
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setFilters(p.filters)}
                  className="py-2.5 px-3 bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] font-bold border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-lg text-center cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 border-t border-[var(--border-subtle)] pt-4">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            Adjust Adjustments
          </h4>

          {/* Brightness */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Brightness</span>
              <span className="text-[var(--accent)] font-bold">{filters.brightness}%</span>
            </div>
            <input aria-label="Brightness"
              type="range" min="0" max="200" value={filters.brightness}
              onChange={(e) => handleSliderChange('brightness', Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Contrast</span>
              <span className="text-[var(--accent)] font-bold">{filters.contrast}%</span>
            </div>
            <input aria-label="Contrast"
              type="range" min="0" max="200" value={filters.contrast}
              onChange={(e) => handleSliderChange('contrast', Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Saturation</span>
              <span className="text-[var(--accent)] font-bold">{filters.saturation}%</span>
            </div>
            <input aria-label="Saturation"
              type="range" min="0" max="200" value={filters.saturation}
              onChange={(e) => handleSliderChange('saturation', Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Blur */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Soft Blur</span>
              <span className="text-[var(--accent)] font-bold">{filters.blur} px</span>
            </div>
            <input aria-label="Soft Blur"
              type="range" min="0" max="10" value={filters.blur}
              onChange={(e) => handleSliderChange('blur', Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Sepia */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Sepia (Warmth)</span>
              <span className="text-[var(--accent)] font-bold">{filters.sepia}%</span>
            </div>
            <input aria-label="Sepia (Warmth)"
              type="range" min="0" max="100" value={filters.sepia}
              onChange={(e) => handleSliderChange('sepia', Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Grayscale */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Grayscale</span>
              <span className="text-[var(--accent)] font-bold">{filters.grayscale}%</span>
            </div>
            <input aria-label="Grayscale"
              type="range" min="0" max="100" value={filters.grayscale}
              onChange={(e) => handleSliderChange('grayscale', Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </div>

        {/* View Workspace */}
        <div className="lg:col-span-2 bg-zinc-950 border border-[var(--border-subtle)] rounded-2xl overflow-hidden min-h-[350px] flex flex-col justify-between p-6">
          <div className="flex-1 flex justify-center items-center relative">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[350px] object-contain border border-zinc-800 rounded-xl"
            />
          </div>

          <div className="w-full mt-6 h-12 flex justify-center">
            {processedUrl ? (
              <button
                onClick={handleDownload}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download Enhanced Image
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] justify-center">
                <span>Renders automatically as adjustments move.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}