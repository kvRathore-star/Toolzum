"use client";

import React, { useState, useRef } from 'react';
import { Shield, Download, RefreshCw, Upload, Crop, Ruler, ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

const ACCENT = '#0d9488';

export default function AadhaarWalletCropper() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [side, setSide] = useState<'front' | 'back'>('front');

  const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 300, h: 189 });
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

    canvas.width = 1018;
    canvas.height = 642;

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

  const outputSizeDisplay = croppedUrl ? Math.round((croppedUrl.length * 3) / 4 / 1024) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 bg-[#0d9488]/10 border border-[#0d9488]/20 p-4 rounded-xl">
        <Shield className="w-5 h-5 text-[#0d9488] shrink-0" />
        <p className="text-sm text-[#0d9488] dark:text-[#0d9488] font-medium">
          Crop scanned Aadhaar cards into standard printable wallet dimensions (86mm x 54mm). All processing is done entirely on your device.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Crop className="w-3.5 h-3.5 text-[#0d9488]" />
              Crop Workspace
            </span>
            <div className="flex bg-[var(--bg-overlay)] rounded-lg p-0.5">
              <button
                onClick={() => setSide('front')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  side === 'front'
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Front Side
              </button>
              <button
                onClick={() => setSide('back')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  side === 'back'
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Back Side
              </button>
            </div>
          </div>

          {!imageSrc ? (
            <div className="border-2 border-dashed border-[#0d9488]/30 rounded-2xl p-12 flex flex-col items-center justify-center bg-[#0d9488]/5 text-center transition-all hover:border-[#0d9488]/50">
              <Upload className="w-10 h-10 text-[#0d9488] mb-2" />
              <p className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-1">Upload scan of your ID card</p>
              <p className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-4">JPG, PNG, WEBP supported</p>
              <label className="cursor-pointer px-5 py-2.5 rounded-xl text-xs text-white font-bold transition-all shadow-lg inline-flex items-center gap-1.5"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, #0f766e)`,
                  boxShadow: `0 4px 16px ${ACCENT}44`
                }}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Choose ID Image
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-zinc-950 flex justify-center items-center">
                <img loading="lazy"
                  ref={imageRef}
                  src={imageSrc}
                  alt="Uploaded image preview"
                  width={800} height={600}
                  className="max-w-full max-h-[350px] object-contain"
                />
                <div
                  className="absolute border-2 border-[#0d9488] bg-[#0d9488]/10"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.w}px`,
                    height: `${cropBox.h}px`
                  }}
                >
                  {/* Crosshair guide lines */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#0d9488]/40 pointer-events-none" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-[#0d9488]/40 pointer-events-none" />
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-[#0d9488] px-1.5 py-0.5 rounded text-white font-mono whitespace-nowrap">
                    86mm x 54mm
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label htmlFor="lbl-aadhaarwalletcropper-horizontal-position-cropbox-x-px" className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-[#0d9488]" />
                    Horizontal Position ({cropBox.x}px)
                  </label>
                  <input id="lbl-aadhaarwalletcropper-horizontal-position-cropbox-x-px"
                    type="range" min="0" max="300" value={cropBox.x}
                    onChange={e => setCropBox(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                    className="w-full accent-[#0d9488]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="lbl-aadhaarwalletcropper-vertical-position-cropbox-y-px" className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-[#0d9488]" />
                    Vertical Position ({cropBox.y}px)
                  </label>
                  <input id="lbl-aadhaarwalletcropper-vertical-position-cropbox-y-px"
                    type="range" min="0" max="200" value={cropBox.y}
                    onChange={e => setCropBox(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                    className="w-full accent-[#0d9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setImageSrc(null)}
                  className="border border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear File
                </button>
                <button
                  onClick={executeCrop}
                  disabled={isProcessing}
                  className="text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, #0f766e)`,
                    boxShadow: `0 4px 16px ${ACCENT}44`
                  }}
                >
                  <Crop className="w-4 h-4" />
                  {isProcessing ? 'Cropping...' : 'Crop Card'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between items-center min-h-[300px]">
          {croppedUrl ? (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full space-y-4">
              <div className="flex-1 flex items-center justify-center w-full p-4 bg-[var(--bg-overlay)] dark:bg-zinc-950 border border-[var(--border-subtle)] rounded-xl">
                <img loading="lazy"
                  src={croppedUrl}
                  alt="Processed result"
                  width={800} height={600}
                  className="border border-[var(--border-subtle)] shadow-lg max-w-full rounded"
                />
              </div>
              <div className="w-full space-y-3">
                <div className="flex items-center justify-center gap-3 text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1 bg-[#0d9488]/10 text-[#0d9488] px-2.5 py-1 rounded-full font-semibold">
                    <ImageIcon className="w-3 h-3" />
                    {outputSizeDisplay} KB
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[var(--bg-overlay)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] px-2.5 py-1 rounded-full font-semibold">
                    <Ruler className="w-3 h-3" />
                    86mm x 54mm
                  </span>
                </div>
                <button
                  onClick={downloadCard}
                  className="w-full text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, #0f766e)`,
                    boxShadow: `0 4px 16px ${ACCENT}44`
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download Printable Card ({side})
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
              <Shield className="w-12 h-12 mb-3 opacity-30 text-[#0d9488]" />
              <p className="text-xs text-center max-w-[220px]">Adjust cropping area and hit crop card. Wallet printable preview will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
