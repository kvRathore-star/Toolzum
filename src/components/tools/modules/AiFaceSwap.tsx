"use client";
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Download, Sparkles, Move, Scale, RotateCw } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import Image from "next/image";

export default function AiFaceSwap() {
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [targetImg, setTargetImg] = useState<string | null>(null);
  
  // Transform settings for the face overlay
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0); // in degrees
  const [opacity, setOpacity] = useState(100);
  const [feather, setFeather] = useState(15); // soft edges

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const targetImageRef = useRef<HTMLImageElement | null>(null);

  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSourceImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTargetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setTargetImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const drawComposite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const targetElement = targetImageRef.current;
    const sourceElement = sourceImageRef.current;

    // Draw target image (background)
    if (targetElement && targetElement.complete) {
      // Set canvas size to match target image
      canvas.width = targetElement.naturalWidth || 600;
      canvas.height = targetElement.naturalHeight || 400;
      ctx.drawImage(targetElement, 0, 0, canvas.width, canvas.height);
    } else {
      // Fallback grid
      canvas.width = 600;
      canvas.height = 400;
      ctx.fillStyle = '#18181b'; // dark zinc-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw source face overlay on top with transforms
    if (sourceElement && sourceElement.complete) {
      ctx.save();

      // Configure opacity/blend
      ctx.globalAlpha = opacity / 100;

      // Translate context to center of overlay position
      // Default center is the middle of the canvas
      const cx = (canvas.width / 2) + posX;
      const cy = (canvas.height / 2) + posY;
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);

      // We want to clip a circle for the face overlay with soft feather edges
      const size = Math.min(canvas.width, canvas.height) * 0.25 * scale;
      
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.closePath();

      // Simple soft edge feathering on HTML5 Canvas:
      // We can use a radial gradient or shadowBlur to make edges soft
      if (feather > 0) {
        ctx.shadowColor = '#000';
        ctx.shadowBlur = feather;
      }
      ctx.clip();

      // Draw source face centered in the clip
      ctx.drawImage(
        sourceElement,
        -size,
        -size,
        size * 2,
        size * 2
      );

      ctx.restore();
    }
  };

  useEffect(() => {
    drawComposite();
  }, [sourceImg, targetImg, posX, posY, scale, rotation, opacity, feather]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !targetImg) return;
    
    downloadOrShare(canvas.toDataURL('image/png'), `faceswap_${Date.now()}.png`);
    toast.success("Swapped artwork downloaded!");
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      
      {/* Hidden helper images for canvas rendering */}
      {sourceImg && (
<Image unoptimized={true} loading="lazy"
  ref={sourceImageRef}
  src={sourceImg}
  alt="Face preview"
  className="hidden"
  onLoad={drawComposite}
/>
      )}
      {targetImg && (
<Image unoptimized={true} loading="lazy"
  ref={targetImageRef}
  src={targetImg}
  alt="Face preview"
  className="hidden"
  onLoad={drawComposite}
/>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Uploads & Transforms */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">AI Face Swap</h3>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500">Upload your face photo (Source) and the background model photo (Target). Use transforms to fit.</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Source Face</label>
              <div className="relative border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center hover:bg-zinc-50 dark:hover:bg-[var(--bg-surface)] transition-colors flex flex-col items-center">
                {sourceImg ? (
                  <Image loading="lazy" src={sourceImg} alt="Face Source" unoptimized={true} className="w-12 h-12 object-cover rounded-full" />
                ) : (
                  <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                )}
                <span className="text-[10px] text-[var(--text-muted)] mt-1">{sourceImg ? "Ready" : "Upload"}</span>
                <input type="file" accept="image/*" onChange={handleSourceUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Target Background</label>
              <div className="relative border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center hover:bg-zinc-50 dark:hover:bg-[var(--bg-surface)] transition-colors flex flex-col items-center">
                {targetImg ? (
                  <Image loading="lazy" src={targetImg} alt="Target Source" unoptimized={true} className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                  <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                )}
                <span className="text-[10px] text-[var(--text-muted)] mt-1">{targetImg ? "Ready" : "Upload"}</span>
                <input type="file" accept="image/*" onChange={handleTargetUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          {sourceImg && targetImg && (
            <div className="space-y-4 border-t border-[var(--border-subtle)] dark:border-[var(--border-subtle)] pt-4 animate-in slide-in-from-top-2 duration-300">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Fine-Tune Alignment</h4>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Move className="w-3.5 h-3.5" /> Position X</span>
                  <span>{posX}px</span>
                </div>
                <input type="range" min="-300" max="300" value={posX} onChange={e => setPosX(parseInt(e.target.value))} className="w-full accent-indigo-500" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Move className="w-3.5 h-3.5" /> Position Y</span>
                  <span>{posY}px</span>
                </div>
                <input type="range" min="-300" max="300" value={posY} onChange={e => setPosY(parseInt(e.target.value))} className="w-full accent-indigo-500" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> Scale Size</span>
                  <span>{scale.toFixed(2)}x</span>
                </div>
                <input type="range" min="0.2" max="3.0" step="0.05" value={scale} onChange={e => setScale(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><RotateCw className="w-3.5 h-3.5" /> Rotation</span>
                  <span>{rotation}°</span>
                </div>
                <input type="range" min="-180" max="180" value={rotation} onChange={e => setRotation(parseInt(e.target.value))} className="w-full accent-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Feather Edge</span>
                  <input type="range" min="0" max="50" value={feather} onChange={e => setFeather(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Face Blend</span>
                  <input type="range" min="10" max="100" value={opacity} onChange={e => setOpacity(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Preview Canvas */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[450px]">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
            <h4 className="font-semibold text-zinc-900 dark:text-white">Live Compositor</h4>
            {sourceImg && targetImg && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save Artwork</span>
              </button>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-black/35 rounded-xl border border-zinc-200 dark:border-zinc-800/50 p-4 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
