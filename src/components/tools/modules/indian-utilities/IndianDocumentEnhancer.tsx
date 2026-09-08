"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Sliders, RotateCcw, Sun, Contrast, Crop, FileImage, ImagePlus, ZoomIn, ZoomOut, RefreshCw, Check, Sparkles, Palette, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { buttonKeyDown, buttonKeyUp } from '@/components/buttonKeys';
import { motion, AnimatePresence } from 'framer-motion';

const DOCUMENT_TYPES = [
  { id: 'aadhaar', label: 'Aadhaar', icon: '🆔' },
  { id: 'pan', label: 'PAN', icon: '💳' },
  { id: 'voter', label: 'Voter ID', icon: '🗳️' },
  { id: 'driving', label: 'Driving License', icon: '🚗' },
  { id: 'other', label: 'Other', icon: '📄' },
];

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
  const [docType, setDocType] = useState('aadhaar');
  const [originalSize, setOriginalSize] = useState(0);

  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file');
    setFileName(file.name);
    setOriginalSize(file.size);
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

      outCtx.clearRect(0, 0, w, h);
      outCtx.save();
      outCtx.translate(w / 2, h / 2);
      outCtx.rotate((rotation * Math.PI) / 180);
      outCtx.drawImage(srcCanvas, -w / 2, -h / 2);
      outCtx.restore();

      const imageData = outCtx.getImageData(0, 0, w, h);
      const data = imageData.data;

      const brightnessFactor = brightness / 100;
      const contrastFactor = contrast / 100;
      const shadowThreshold = shadowRemoval ? 40 : 0;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        if (brightnessFactor !== 0) {
          r += brightnessFactor * 255;
          g += brightnessFactor * 255;
          b += brightnessFactor * 255;
        }

        if (contrastFactor !== 0) {
          const factor = (259 * (contrastFactor * 255 + 255)) / (255 * (259 - contrastFactor * 255));
          r = factor * (r - 128) + 128;
          g = factor * (g - 128) + 128;
          b = factor * (b - 128) + 128;
        }

        if (shadowRemoval) {
          const avg = (r + g + b) / 3;
          if (avg < shadowThreshold * 2.55) {
            const boost = (shadowThreshold * 2.55 - avg) * 0.5;
            r += boost;
            g += boost;
            b += boost;
          }
        }

        if (autoSharpen) {
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

  const autoEnhance = () => {
    setBrightness(10);
    setContrast(15);
    setShadowRemoval(true);
    setAutoSharpen(true);
    toast.success('Auto-enhance applied!');
  };

  const sizeReduction = originalSize > 0 && outputCanvasRef.current ? (() => {
    const ratio = selectedPreset ? Math.min(selectedPreset.size / 2000, 0.9) : 0.85;
    return Math.round((1 - ratio * 0.9) * 100);
  })() : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
        <FileImage className="w-5 h-5" style={{ color: '#475569' }} />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Indian Document Enhancer & Scanner</h3>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        {!image ? (
          <div className="p-8 text-center">
            <div className="grid grid-cols-5 gap-2 mb-6 max-w-lg mx-auto">
              {DOCUMENT_TYPES.map(dt => (
                <button key={dt.id} onClick={() => setDocType(dt.id)}
                  className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${docType === dt.id ? 'border-transparent' : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)]'}`}
                  style={docType === dt.id ? { borderColor: '#475569', backgroundColor: '#47556910' } : {}}>
                  <span className="text-xl block">{dt.icon}</span>
                  <span className="text-[9px] font-semibold text-[var(--text-secondary)] block mt-0.5">{dt.label}</span>
                </button>
              ))}
            </div>
            <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-12 transition-colors cursor-pointer bg-[var(--bg-overlay)]/50 dark:bg-black/20"
              style={{ borderColor: '#47556940' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#475569'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#47556940'}
              role="button" tabIndex={0} aria-label="Upload a document photo"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => buttonKeyDown(e, () => fileInputRef.current?.click())}
              onKeyUp={(e) => buttonKeyUp(e, () => fileInputRef.current?.click())}>
              <ImagePlus className="w-16 h-16 mx-auto mb-4" style={{ color: '#47556980' }} />
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
                <FileImage className="w-4 h-4" style={{ color: '#475569' }} />
                <span className="text-xs text-zinc-600 dark:text-[var(--text-muted)]">{fileName}</span>
                {originalSize > 0 && (
                  <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-overlay)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                    {(originalSize / 1024).toFixed(0)} KB
                  </span>
                )}
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
                  <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5"><Sliders className="w-3 h-3" style={{ color: '#475569' }} /> Adjustments</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] flex justify-between"><span>Brightness</span><span className="font-mono">{(brightness * 100).toFixed(0)}%</span></label>
                    <input type="range" min="-50" max="50" value={brightness} aria-label="Brightness" onChange={e => setBrightness(Number(e.target.value))}
                      className="w-full" style={{ accentColor: '#475569' }} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] flex justify-between"><span>Contrast</span><span className="font-mono">{(contrast * 100).toFixed(0)}%</span></label>
                    <input type="range" min="-50" max="50" value={contrast} aria-label="Contrast" onChange={e => setContrast(Number(e.target.value))}
                      className="w-full" style={{ accentColor: '#475569' }} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] flex justify-between"><span>Rotation</span><span className="font-mono">{rotation}°</span></label>
                    <input type="range" min="-45" max="45" value={rotation} aria-label="Rotation" onChange={e => setRotation(Number(e.target.value))}
                      className="w-full" style={{ accentColor: '#475569' }} />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5"><Sun className="w-3 h-3" /> Shadow Removal</span>
                      <input type="checkbox" checked={shadowRemoval} onChange={e => setShadowRemoval(e.target.checked)}
                        className="rounded border-zinc-300" style={{ accentColor: '#475569' }} />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Auto Sharpen</span>
                      <input type="checkbox" checked={autoSharpen} onChange={e => setAutoSharpen(e.target.checked)}
                        className="rounded border-zinc-300" style={{ accentColor: '#475569' }} />
                    </label>
                  </div>
                </div>

                <div className="space-y-2 bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
                  <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5"><Palette className="w-3 h-3" style={{ color: '#475569' }} /> Export Preset</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DOCUMENT_PRESETS.map(p => (
                      <button key={p.label} onClick={() => setSelectedPreset(selectedPreset?.label === p.label ? null : p)}
                        className={`text-left px-2.5 py-2 rounded-lg border text-[10px] transition-colors ${
                          selectedPreset?.label === p.label
                            ? 'text-slate-600 dark:text-slate-400'
                            : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-zinc-400 dark:hover:border-zinc-500'
                        }`}
                        style={selectedPreset?.label === p.label ? { borderColor: '#475569', backgroundColor: '#47556910', color: '#475569' } : {}}>
                        <p className="font-semibold">{p.label}</p>
                        <p className="opacity-60">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={autoEnhance}
                  className="w-full py-3 bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-slate-500/25">
                  <Sparkles className="w-4 h-4" /> Auto-Enhance
                </button>

                <button onClick={handleDownload}
                  className="w-full py-3.5 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-slate-600/25">
                  <Download className="w-4 h-4" /> Download Enhanced Document
                </button>

                {selectedPreset && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl" style={{ backgroundColor: '#47556908', borderColor: '#47556920', borderWidth: 1 }}>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      Target: <strong style={{ color: '#475569' }}>{selectedPreset.label}</strong> — {selectedPreset.desc}
                    </p>
                  </motion.div>
                )}

                <div className="p-3 rounded-xl" style={{ backgroundColor: '#47556908', borderColor: '#47556920', borderWidth: 1 }}>
                  <p className="text-[10px]" style={{ color: '#475569' }}>
                    <strong>Pro:</strong> AI auto-straighten (one tap), batch enhance 20 docs at once, auto-detect document type, OCR text extraction, export ZIP. 
                    <span className="block mt-1">₹199/mo — every CA firm, HR department, and admission office needs this.</span>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="relative bg-[var(--bg-overlay)] rounded-xl p-2 border border-[var(--border-subtle)]"
                  ref={containerRef}
                  role="img"
                  aria-label="Enhanced document preview. Focus to compare with the original."
                  tabIndex={0}
                  onMouseEnter={() => setShowComparison(true)}
                  onMouseLeave={() => setShowComparison(false)}
                  onFocus={() => setShowComparison(true)}
                  onBlur={() => setShowComparison(false)}>
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/10 dark:bg-white/5 rounded-xl flex items-center justify-center z-10">
                      <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#475569' }} />
                    </div>
                  )}
                  <div className="relative overflow-auto max-h-[600px] flex items-center justify-center">
                    <div className="relative" style={{ position: 'relative' }}>
                      <canvas
                        ref={outputCanvasRef}
                        className="max-w-full max-h-[600px] rounded-lg"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      {showComparison && (
                        <div className="absolute inset-0 overflow-hidden rounded-lg" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                          <canvas
                            ref={sourceCanvasRef}
                            className="max-w-full max-h-[600px]"
                            style={{ imageRendering: 'pixelated', width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      )}
                      {showComparison && (
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 z-20" style={{ backgroundColor: '#475569' }}>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#475569' }}>
                            <ArrowLeft className="w-3 h-3 text-white" /><ArrowRight className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <canvas ref={sourceCanvasRef} className="hidden" />
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 text-[9px]" style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}>
                    <Crop className="w-3 h-3" />
                    {showComparison ? 'Draggable split — move mouse to compare' : 'Hover to compare with original'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
