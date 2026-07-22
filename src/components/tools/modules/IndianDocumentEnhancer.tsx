"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Sliders, RotateCcw, Sun, Contrast, Crop, FileImage, ImagePlus, ZoomIn, ZoomOut, RefreshCw, Check, Sparkles, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

const DOCUMENT_PRESETS = [
  { label: 'Aadhaar (UIDAI)', size: 200, unit: 'KB', desc: 'UIDAI upload spec - 200KB max' },
  { label: 'PAN (NSDL)', size: 50, unit: 'KB', desc: 'NSDL/ITR upload spec - 50KB max' },
  { label: 'Passport', size: 300, unit: 'KB', desc: 'Passport Seva upload - 300KB max' },
  { label: 'Marksheet', size: 500, unit: 'KB', desc: 'University upload - 500KB max' },
  { label: 'Bank Statement', size: 2000, unit: 'KB', desc: 'Bank/loan upload - 2MB max' },
  { label: 'Voter ID (ECI)', size: 100, unit: 'KB', desc: 'ECI upload spec - 100KB max' },
  { label: 'Driving Licence', size: 100, unit: 'KB', desc: 'Parivahan upload - 100KB max' },
  { label: 'High Quality', size: 5, unit: 'MB', desc: 'Best quality export (large)' },
];

export default function IndianDocumentEnhancer() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [shadowRemoval, setShadowRemoval] = useState(false);
  const [autoSharpen, setAutoSharpen] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<typeof DOCUMENT_PRESETS[0] | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImage(dataUrl);
      loadAndRender(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const loadAndRender = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = sourceCanvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      applyEnhancements();
    };
    img.src = src;
  };

  const applyEnhancements = useCallback(() => {
    const srcCanvas = sourceCanvasRef.current;
    const outCanvas = outputCanvasRef.current;
    if (!srcCanvas || !outCanvas) return;

    setIsProcessing(true);

    requestAnimationFrame(() => {
      const w = srcCanvas.width;
      const h = srcCanvas.height;
      outCanvas.width = w;
      outCanvas.height = h;

      const srcCtx = srcCanvas.getContext('2d');
      const outCtx = outCanvas.getContext('2d');
      if (!srcCtx || !outCtx) return;

      // Draw with rotation
      outCtx.clearRect(0, 0, w, h);
      outCtx.save();
      outCtx.translate(w / 2, h / 2);
      outCtx.rotate((rotation * Math.PI) / 180);
      outCtx.drawImage(srcCanvas, -w / 2, -h / 2);
      outCtx.restore();

      // Apply pixel-level adjustments
      const imageData = outCtx.getImageData(0, 0, w, h);
      const data = imageData.data;

      const brightnessFactor = brightness / 100;
      const contrastFactor = contrast / 100;
      const shadowThreshold = shadowRemoval ? 40 : 0;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        if (brightnessFactor !== 0) {
          r += brightnessFactor * 255;
          g += brightnessFactor * 255;
          b += brightnessFactor * 255;
        }

        // Contrast
        if (contrastFactor !== 0) {
          const factor = (259 * (contrastFactor * 255 + 255)) / (255 * (259 - contrastFactor * 255));
          r = factor * (r - 128) + 128;
          g = factor * (g - 128) + 128;
          b = factor * (b - 128) + 128;
        }

        // Shadow removal (brighten dark pixels)
        if (shadowRemoval) {
          const avg = (r + g + b) / 3;
          if (avg < shadowThreshold * 2.55) {
            const boost = (shadowThreshold * 2.55 - avg) * 0.5;
            r += boost;
            g += boost;
            b += boost;
          }
        }

        // Auto sharpen (simple unsharp mask approximation)
        if (autoSharpen) {
          // subtle contrast boost for edges
          const avg = (r + g + b) / 3;
          const strength = 0.15;
          r = r + (r - avg) * strength;
          g = g + (g - avg) * strength;
          b = b + (b - avg) * strength;
        }

        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      outCtx.putImageData(imageData, 0, 0);
      setIsProcessing(false);
    });
  }, [brightness, contrast, rotation, shadowRemoval, autoSharpen]);

  useEffect(() => {
    if (image) applyEnhancements();
  }, [image, brightness, contrast, rotation, shadowRemoval, autoSharpen, applyEnhancements]);

  const handleDownload = () => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;
    const quality = selectedPreset ? Math.min(selectedPreset.size / 2000, 0.9) : 0.85;
    canvas.toBlob(blob => {
      if (!blob) return toast.error('Failed to generate image');
      
      const url = URL.createObjectURL(blob);
      const ext = fileName.split('.').pop() || 'jpg';
      downloadOrShare(url, `enhanced_${fileName || `document.${ext}`}`);
      
      // Show size info
      const sizeKB = blob.size / 1024;
      toast.success(`Downloaded (${sizeKB.toFixed(0)} KB)`);
      if (selectedPreset && sizeKB > selectedPreset.size && selectedPreset.unit === 'KB') {
        toast.error(`File exceeds ${selectedPreset.label} limit of ${selectedPreset.size}${selectedPreset.unit}. Try reducing quality.`);
      }
    }, 'image/jpeg', Math.min(quality, 0.92));
  };

  const resetAdjustments = () => {
    setBrightness(0);
    setContrast(0);
    setRotation(0);
    setShadowRemoval(false);
    setAutoSharpen(true);
    setSelectedPreset(null);
    toast.success('Settings reset');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <FileImage className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Indian Document Enhancer & Scanner</h3>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        {!image ? (
          <div className="p-8 text-center">
            <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-12 hover:border-emerald-500/50 transition-colors cursor-pointer bg-[var(--bg-overlay)]/50 dark:bg-black/20"
              onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
              <p className="text-lg font-semibold text-[var(--text-secondary)]">Upload a document photo</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">Aadhaar, PAN, Marksheet, Passport, Bank Statement, Driving Licence, Voter ID</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {DOCUMENT_PRESETS.slice(0, 5).map(p => (
                  <span key={p.label} className="text-[9px] px-2 py-1 bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-full">{p.label}</span>
                ))}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-zinc-600 dark:text-[var(--text-muted)]">{fileName}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setImage(null); setFileName(''); }}
                  className="px-3 py-1.5 bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-surface)] transition-colors flex items-center gap-1">
                  <Upload className="w-3 h-3" /> New
                </button>
                <button onClick={resetAdjustments}
                  className="px-3 py-1.5 bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-surface)] transition-colors flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="space-y-4 lg:col-span-1">
                <div className="space-y-3 bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
                  <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5"><Sliders className="w-3 h-3" /> Adjustments</h5>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] flex justify-between"><span>Brightness</span><span className="font-mono">{(brightness * 100).toFixed(0)}%</span></label>
                    <input type="range" min="-50" max="50" value={brightness} onChange={e => setBrightness(Number(e.target.value))}
                      className="w-full accent-emerald-500" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] flex justify-between"><span>Contrast</span><span className="font-mono">{(contrast * 100).toFixed(0)}%</span></label>
                    <input type="range" min="-50" max="50" value={contrast} onChange={e => setContrast(Number(e.target.value))}
                      className="w-full accent-emerald-500" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] flex justify-between"><span>Rotation</span><span className="font-mono">{rotation}°</span></label>
                    <input type="range" min="-45" max="45" value={rotation} onChange={e => setRotation(Number(e.target.value))}
                      className="w-full accent-emerald-500" />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5"><Sun className="w-3 h-3" /> Shadow Removal</span>
                      <input type="checkbox" checked={shadowRemoval} onChange={e => setShadowRemoval(e.target.checked)}
                        className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Auto Sharpen</span>
                      <input type="checkbox" checked={autoSharpen} onChange={e => setAutoSharpen(e.target.checked)}
                        className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500" />
                    </label>
                  </div>
                </div>

                <div className="space-y-2 bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
                  <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5"><Palette className="w-3 h-3" /> Export Preset</h5>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DOCUMENT_PRESETS.map(p => (
                      <button key={p.label} onClick={() => setSelectedPreset(selectedPreset?.label === p.label ? null : p)}
                        className={`text-left px-2.5 py-2 rounded-lg border text-[10px] transition-colors ${
                          selectedPreset?.label === p.label
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-zinc-400 dark:hover:border-zinc-500'
                        }`}>
                        <p className="font-semibold">{p.label}</p>
                        <p className="opacity-60">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleDownload}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
                  <Download className="w-4 h-4" /> Download Enhanced Document
                </button>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
                  <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
                    <strong>Pro:</strong> AI auto-straighten (one tap), batch enhance 20 docs at once, auto-detect document type, OCR text extraction, export ZIP. 
                    <span className="block mt-1">₹199/mo — every CA firm, HR department, and admission office needs this.</span>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="relative bg-[var(--bg-overlay)] rounded-xl p-2 border border-[var(--border-subtle)]"
                  ref={containerRef}
                  onMouseEnter={() => setShowComparison(true)}
                  onMouseLeave={() => setShowComparison(false)}>
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/10 dark:bg-white/5 rounded-xl flex items-center justify-center z-10">
                      <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                    </div>
                  )}
                  <div className="relative overflow-auto max-h-[600px] flex items-center justify-center">
                    <canvas
                      ref={showComparison ? sourceCanvasRef : outputCanvasRef}
                      className="max-w-full max-h-[600px] rounded-lg"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <canvas ref={sourceCanvasRef} className="hidden" />
                    {showComparison && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] px-2 py-1 rounded-full font-semibold">
                        ORIGINAL
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[9px] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                    <Crop className="w-3 h-3" />
                    {showComparison ? 'Showing original — move mouse away for enhanced' : 'Hover to compare with original'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
