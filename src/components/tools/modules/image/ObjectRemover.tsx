"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { Download, RefreshCw, Eraser, Trash2, Sliders, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function ObjectRemover() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = (file: File, url: string) => {
    setImageFile(file);
    setImageSrc(url);
    setProcessedUrl(null);
  };

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        initCanvas();
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  useEffect(() => {
    return () => {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [processedUrl]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // Set display matching container
    const containerWidth = canvas.parentElement?.clientWidth || 600;
    const ratio = img.height / img.width;
    canvas.width = containerWidth;
    canvas.height = containerWidth * ratio;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Init mask canvas
    const mCanvas = document.createElement('canvas');
    mCanvas.width = canvas.width;
    mCanvas.height = canvas.height;
    const mCtx = mCanvas.getContext('2d');
    if (mCtx) {
      mCtx.fillStyle = '#000000';
      mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);
    }
    maskCanvasRef.current = mCanvas;
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    drawStroke(coords.x, coords.y, true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    drawStroke(coords.x, coords.y, false);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.beginPath(); // Reset stroke path
    
    const mCanvas = maskCanvasRef.current;
    const mCtx = mCanvas?.getContext('2d');
    if (mCtx) mCtx.beginPath();
  };

  const drawStroke = (x: number, y: number, isStart: boolean) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const mCanvas = maskCanvasRef.current;
    const mCtx = mCanvas?.getContext('2d');

    if (!ctx || !mCtx || !canvas) return;

    // Draw red highlight on screen
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Semitransparent red
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw white mask on mask canvas
    mCtx.strokeStyle = '#ffffff';
    mCtx.lineWidth = brushSize;
    mCtx.lineCap = 'round';
    mCtx.lineJoin = 'round';

    if (isStart) {
      ctx.moveTo(x, y);
      mCtx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      mCtx.lineTo(x, y);
      ctx.stroke();
      mCtx.stroke();
    }
  };

  const handleInpaint = async () => {
    const canvas = canvasRef.current;
    const mCanvas = maskCanvasRef.current;
    if (!canvas || !mCanvas) return;

    const ctx = canvas.getContext('2d');
    const mCtx = mCanvas.getContext('2d');
    if (!ctx || !mCtx) return;

    setIsProcessing(true);
    
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const mData = mCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const data = imgData.data;

      const width = canvas.width;
      const height = canvas.height;

      // Simple pixel patch propagation inpainting
      // Finds white mask pixels and fills them using adjacent non-masked pixels
      for (let attempt = 0; attempt < 8; attempt++) {
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            // Mask is white on mask canvas
            const isMasked = (mData[idx] ?? 0) > 100;
            if (isMasked) {
              // Sample neighboring pixels
              const neighbors = [
                ((y - 1) * width + x) * 4, // Top
                ((y + 1) * width + x) * 4, // Bottom
                (y * width + (x - 1)) * 4, // Left
                (y * width + (x + 1)) * 4, // Right
              ];

              let rSum = 0, gSum = 0, bSum = 0, count = 0;
              for (const nIdx of neighbors) {
                if ((mData[nIdx] ?? 0) < 100) { // Not masked neighbor
                  rSum += data[nIdx] ?? 0;
                  gSum += data[nIdx + 1] ?? 0;
                  bSum += data[nIdx + 2] ?? 0;
                  count++;
                }
              }

              if (count > 0) {
                data[idx] = rSum / count;
                data[idx + 1] = gSum / count;
                data[idx + 2] = bSum / count;
                
                // Clear mask flag locally for subsequent passes
                // We write into mask data array so next iterations propagate inward
                (mData as any)[idx] = 0;
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setProcessedUrl(url);
          toast.success("Object removed successfully!");
        }
      }, 'image/jpeg', 0.95);
    } catch (e) {
      console.error(e);
      toast.error("Inpainting failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    downloadOrShare(processedUrl, `erased-${imageFile?.name || 'photo.jpg'}`);
  };

  const handleClearStrokes = () => {
    initCanvas();
  };

  if (!imageSrc) {
    return (
      <div className="space-y-6">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm flex items-center gap-2">
          <Zap className="w-5 h-5 text-[var(--accent)] shrink-0" />
          <span><strong>100% Client-Side Inpaint:</strong> Draw red highlight strokes over unwanted objects to erase them using surrounding textures.</span>
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Photo to Erase Object"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{imageFile?.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">Highlight unwanted elements with brush to erase them</p>
        </div>
        <button
          onClick={() => {
            setImageFile(null);
            setImageSrc(null);
          }}
          className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Change Photo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Toolbar */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-sm uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            Brush Settings
          </h4>

          {/* Brush Size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <span>Brush Size</span>
              <span className="text-[var(--accent)] font-bold">{brushSize} px</span>
            </div>
            <input aria-label="Brush Size"
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleClearStrokes}
              className="w-full py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Clear Canvas Strokes
            </button>
            <button
              onClick={handleInpaint}
              disabled={isProcessing}
              className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--accent-ink)] text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg text-xs"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eraser className="w-4 h-4" />}
              Erase Highlighted Object
            </button>
          </div>
        </div>

        {/* Canvas editor workspace */}
        <div className="lg:col-span-2 bg-zinc-950 border border-[var(--border-subtle)] rounded-2xl overflow-hidden min-h-[350px] flex flex-col justify-between p-6">
          <div className="flex-1 flex justify-center items-center relative">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full cursor-crosshair border border-zinc-800 rounded-xl"
            />
          </div>

          <div className="w-full mt-6 h-12 flex justify-center">
            {processedUrl ? (
              <button
                onClick={handleDownload}
                className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                Download Restructured Image
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] justify-center">
                <span>Hold mouse click and drag over objects to highlight them.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}