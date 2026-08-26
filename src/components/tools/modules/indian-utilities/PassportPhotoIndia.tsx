"use client";

import React, { useState, useRef } from 'react';
import { toast } from "react-hot-toast";
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { FileUploader } from '../../FileUploader';
import imageCompression from 'browser-image-compression';
import { downloadOrShare } from '@/utils/nativeShare';
import Image from "next/image";
import { Download, RefreshCw, Grid, FileImage } from 'lucide-react';

const ACCENT = '#2563eb';

export default function PassportPhotoIndia() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleFileSelect = (file: File, dataUrl: string) => {
    setImage(dataUrl);
    setOutputUrl(null);
  };

  React.useEffect(() => {
    return () => {
      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }
      if (cropperRef.current && cropperRef.current.cropper) {
        cropperRef.current.cropper.destroy();
      }
    };
  }, [outputUrl]);

  const processImage = async () => {
    if (!cropperRef.current || !cropperRef.current.cropper) return;

    setIsProcessing(true);
    try {
      const cropper = cropperRef.current.cropper;
      const canvas = cropper.getCroppedCanvas({
        width: 350,
        height: 450,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Canvas is empty");

        const options = {
          maxSizeMB: 0.048,
          maxWidthOrHeight: 1024,
          useWebWorker: typeof window !== 'undefined' && typeof window.Worker !== 'undefined',
          initialQuality: 0.9,
        };

        const file = new File([blob], "passport-photo.jpg", { type: "image/jpeg" });
        const compressedFile = await imageCompression(file, options);

        const url = URL.createObjectURL(compressedFile);
        setOutputUrl(url);
        setOutputSize(compressedFile.size);
        setIsProcessing(false);
      }, 'image/jpeg');

    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      toast.error("Failed to process image.");
    }
  };

  const sizePercent = outputSize ? Math.min(100, Math.round((outputSize / (50 * 1024)) * 100)) : 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (sizePercent / 100) * circumference;

  if (!image) {
    return (
      <div className="space-y-6">
        <div className="bg-[#2563eb]/10 border border-[#2563eb]/20 p-4 rounded-xl flex items-center gap-3">
          <FileImage className="w-5 h-5 text-[#2563eb] shrink-0" />
          <p className="text-sm text-[#2563eb] dark:text-[#2563eb] font-medium">
            <strong>Requirements:</strong> Upload a photo with good lighting. Crop to 3.5x4.5 cm with white background and compress under 50KB for Indian Government portals.
          </p>
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Photo for Passport/Visa"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Crop Your Photo</h3>
        <button
          onClick={() => setImage(null)}
          className="text-sm text-[#2563eb] hover:text-[#1d4ed8] font-medium flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Upload Different
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden border-2 border-[#2563eb]/20 bg-[var(--bg-overlay)]/50 dark:bg-black/50">
        <Cropper
          src={image}
          style={{ height: 400, width: "100%" }}
          aspectRatio={3.5 / 4.5}
          guides={true}
          viewMode={1}
          background={false}
          ref={cropperRef}
          autoCropArea={0.8}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={processImage}
          disabled={isProcessing}
          className="flex-1 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 inline-flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`,
            boxShadow: `0 4px 24px ${ACCENT}44`
          }}
        >
          {isProcessing ? "Processing & Compressing..." : "Generate 50KB Passport Photo"}
        </button>
      </div>

      {outputUrl && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 bg-[#2563eb]/10 border border-[#2563eb]/20 rounded-2xl flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0 rounded-lg overflow-hidden border-4 border-white shadow-xl w-[140px] h-[180px] bg-white">
              <Image loading="lazy" src={outputUrl} alt="Processed Passport" unoptimized={true} width={140} height={180} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-4">
              <div>
                <h4 className="text-lg font-bold text-[#2563eb]">Ready for Upload</h4>
                <p className="text-[var(--text-primary)] text-sm">3.5x4.5 cm with solid white background.</p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="rgb(229 231 235)" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="36"
                      fill="none"
                      stroke={ACCENT}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                    {sizePercent}%
                  </span>
                </div>
                <div className="text-sm">
                  <span className="inline-flex items-center gap-1.5 bg-[#2563eb]/10 text-[#2563eb] font-bold px-3 py-1.5 rounded-full">
                    {outputSize ? (outputSize / 1024).toFixed(2) : 0} KB / 50 KB
                  </span>
                </div>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, 'passport-photo-50kb.jpg')}
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md active:scale-95 w-full sm:w-auto"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`,
                  boxShadow: `0 4px 16px ${ACCENT}44`
                }}
              >
                <Download className="w-4 h-4" />
                Download Photo
              </button>
            </div>
          </div>

          <div className="p-6 bg-[var(--bg-overlay)] rounded-2xl border border-zinc-200 dark:border-[var(--border-subtle)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#2563eb]" />
              Print Layout Preview (4x6 sheet)
            </h4>
            <div className="grid grid-cols-4 gap-2 max-w-[280px] mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3.5/4.5] bg-white rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
                  <Image
                    loading="lazy"
                    src={outputUrl}
                    alt={`Print slot ${i + 1}`}
                    unoptimized={true}
                    width={60}
                    height={77}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-3 text-center">6 photos per 4x6 inch print sheet</p>
          </div>
        </div>
        )}
      </div>
  );
}
