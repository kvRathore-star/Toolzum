"use client";

import React, { useState, useRef } from 'react';
import { Shield, Download, RefreshCw, Upload, Crop } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function AadhaarWalletCropper() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [side, setSide] = useState<'front' | 'back'>('front');

  // Manual canvas crop coordinates
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 300, h: 189 }); // 1.587 ratio (86mm x 54mm)
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setCroppedUrl(null);
    }
  };

  const executeCrop = () => {
    if (!imageSrc || !imageRef.current) {
      toast.error('Please load an image first');
      return;
    }

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Standard card dimensions (e.g. 1018 x 642 pixels for printing clarity)
    canvas.width = 1018;
    canvas.height = 642;

    // Standard scaling factors
    const displayWidth = img.clientWidth;
    const displayHeight = img.clientHeight;
    
    const scaleX = img.naturalWidth / displayWidth;
    const scaleY = img.naturalHeight / displayHeight;

    const sourceX = cropBox.x * scaleX;
    const sourceY = cropBox.y * scaleY;
    const sourceWidth = cropBox.w * scaleX;
    const sourceHeight = cropBox.h * scaleY;

    try {
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Overlay security details border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCroppedUrl(croppedDataUrl);
      toast.success(`Successfully cropped card ${side} side!`);
    } catch (err) {
      toast.error('Failed to crop card');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCard = () => {
    if (!croppedUrl) return;
    downloadOrShare(croppedUrl, `aadhaar_card_${side}.jpg`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Crop className="w-5 h-5 text-indigo-500" />
          Aadhaar Card Wallet Cropper
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Crop scanned Aadhaar cards into standard printable wallet dimensions (86mm x 54mm) perfectly sized offline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workspace */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-zinc-400 uppercase">Crop Workspace</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setSide('front')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${side === 'front' ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              >
                Front Side
              </button>
              <button 
                onClick={() => setSide('back')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${side === 'back' ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              >
                Back Side
              </button>
            </div>
          </div>

          {!imageSrc ? (
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black/20 text-center">
              <Upload className="w-10 h-10 text-zinc-400 mb-2" />
              <p className="text-xs text-zinc-400">Upload scan of your ID card</p>
              <label className="bg-[var(--accent)] hover:bg-indigo-600 px-4 py-2 rounded-xl text-xs text-white font-bold cursor-pointer transition-colors shadow mt-4">
                Choose ID Image
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 flex justify-center items-center">
<img  loading="lazy" 
  ref={imageRef}
  src={imageSrc} 
  alt="Uploaded image preview" 
  width={800} height={600}
  className="max-w-full max-h-[350px] object-contain"
/>
                
                {/* Simplified Crop Overlay Guides */}
                <div 
                  className="absolute border-2 border-dashed border-indigo-500 bg-indigo-500/10 cursor-move pointer-events-none"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.w}px`,
                    height: `${cropBox.h}px`
                  }}
                >
                  <span className="absolute bottom-1 right-1 text-[9px] bg-indigo-600 px-1 py-0.5 rounded text-white font-mono">
                    86mm x 54mm Standard Box
                  </span>
                </div>
              </div>

              {/* Adjust Box Controls */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Horizontal Box Position ({cropBox.x}px)</label>
                  <input 
                    type="range" min="0" max="300" value={cropBox.x} 
                    onChange={e => setCropBox(prev => ({ ...prev, x: parseInt(e.target.value) }))} 
                    className="w-full accent-indigo-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Vertical Box Position ({cropBox.y}px)</label>
                  <input 
                    type="range" min="0" max="200" value={cropBox.y} 
                    onChange={e => setCropBox(prev => ({ ...prev, y: parseInt(e.target.value) }))} 
                    className="w-full accent-indigo-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setImageSrc(null)}
                  className="border border-zinc-800 text-zinc-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Clear File
                </button>
                <button 
                  onClick={executeCrop}
                  disabled={isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Crop className="w-4 h-4" />
                  Crop Card
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cropped Output preview */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between items-center min-h-[300px]">
          {croppedUrl ? (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full space-y-4">
              <div className="flex-1 flex items-center justify-center w-full p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl">
<img  loading="lazy" 
  src={croppedUrl} 
  alt="Processed result" 
  width={800} height={600}
  className="border border-zinc-300 dark:border-zinc-700 shadow-lg max-w-full rounded"
/>
              </div>
              <button 
                onClick={downloadCard}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download printable card ({side})
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <Shield className="w-12 h-12 mb-3 opacity-30 animate-pulse text-zinc-400" />
              <p className="text-xs">Adjust cropping area and hit crop card. Wallet printable preview will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}