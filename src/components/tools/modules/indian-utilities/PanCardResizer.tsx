"use client";

import React, { useState, useRef, useEffect } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { FileUploader } from '../../FileUploader';
import imageCompression from 'browser-image-compression';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import Image from "next/image";
import { ImageIcon, Signature, BarChart3, Download, RefreshCw, Info } from 'lucide-react';

const ACCENT = '#7c3aed';

type DocType = 'photo' | 'signature';
type Portal = 'nsdl' | 'utiitsl';

interface Spec {
  width: number;
  height: number;
  maxSizeKB: number;
  aspectRatio: number;
  dpi: number;
  label: string;
}

const PORTAL_SPECS: Record<Portal, Record<DocType, Spec>> = {
  nsdl: {
    photo: {
      width: 197,
      height: 276,
      maxSizeKB: 50,
      aspectRatio: 2.5 / 3.5,
      dpi: 200,
      label: "NSDL Photo (2.5 x 3.5 cm, 200 DPI, < 50KB)",
    },
    signature: {
      width: 354,
      height: 157,
      maxSizeKB: 50,
      aspectRatio: 4.5 / 2.0,
      dpi: 200,
      label: "NSDL Signature (4.5 x 2.0 cm, 200 DPI, < 50KB)",
    },
  },
  utiitsl: {
    photo: {
      width: 213,
      height: 213,
      maxSizeKB: 30,
      aspectRatio: 1.0,
      dpi: 300,
      label: "UTIITSL Photo (213 x 213 px, 300 DPI, < 30KB)",
    },
    signature: {
      width: 400,
      height: 200,
      maxSizeKB: 60,
      aspectRatio: 2.0,
      dpi: 600,
      label: "UTIITSL Signature (400 x 200 px, 600 DPI, < 60KB)",
    },
  },
};

export default function PanCardResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocType>('photo');
  const [portal, setPortal] = useState<Portal>('nsdl');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);

  const cropperRef = useRef<ReactCropperElement>(null);
  const currentSpec = PORTAL_SPECS[portal][docType];

  useEffect(() => {
    return () => {
      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }
    };
  }, [outputUrl]);

  useEffect(() => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.setAspectRatio(currentSpec.aspectRatio);
    }
  }, [docType, portal, currentSpec.aspectRatio]);

  const handleFileSelect = (file: File, dataUrl: string) => {
    setImage(dataUrl);
    setOutputUrl(null);
    setOutputSize(null);
    setOriginalSize(file.size);
  };

  const processImage = async () => {
    if (!cropperRef.current || !cropperRef.current.cropper) return;

    setIsProcessing(true);
    try {
      const cropper = cropperRef.current.cropper;

      const canvas = cropper.getCroppedCanvas({
        width: currentSpec.width,
        height: currentSpec.height,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to capture cropped area.");
        }

        const safetyFactor = 0.95;
        const targetSizeMB = (currentSpec.maxSizeKB * safetyFactor) / 1024;

        const options = {
          maxSizeMB: targetSizeMB,
          maxWidthOrHeight: Math.max(currentSpec.width, currentSpec.height),
          useWebWorker: typeof window !== 'undefined' && typeof window.Worker !== 'undefined',
          initialQuality: 0.9,
        };

        const file = new File([blob], `${docType}-pancard.jpg`, { type: 'image/jpeg' });
        const compressedFile = await imageCompression(file, options);

        const url = URL.createObjectURL(compressedFile);
        setOutputUrl(url);
        setOutputSize(compressedFile.size);
        setIsProcessing(false);
        toast.success("Successfully resized and compressed!");
      }, 'image/jpeg');

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      toast.error("Failed to process image. Try a different format.");
    }
  };

  const compressionRatio = outputSize && originalSize
    ? Math.max(0, Math.min(100, Math.round((1 - outputSize / originalSize) * 100)))
    : 0;

  const sizePercent = outputSize ? Math.min(100, Math.round((outputSize / (currentSpec.maxSizeKB * 1024)) * 100)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-[#7c3aed]/10 to-[#a855f7]/10 border border-[#7c3aed]/20 p-6 rounded-2xl text-[var(--text-primary)] text-sm space-y-2">
        <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Info className="w-5 h-5 text-[#7c3aed]" />
          PAN Card Photo & Signature Resizer
        </h4>
        <p>
          Indian PAN card portals (NSDL/Protean and UTIITSL) reject document uploads that do not meet strict dimension (DPI) and file size (KB) requirements. This tool crops and compresses your image entirely in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[var(--bg-overlay)] p-6 rounded-2xl border border-zinc-200 dark:border-[var(--border-subtle)] shadow-sm">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-[var(--text-primary)]">Document Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setDocType('photo'); setOutputUrl(null); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium border text-sm transition-all flex items-center justify-center gap-2 ${
                docType === 'photo'
                  ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/30'
                  : 'bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)]'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photograph
            </button>
            <button
              onClick={() => { setDocType('signature'); setOutputUrl(null); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium border text-sm transition-all flex items-center justify-center gap-2 ${
                docType === 'signature'
                  ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/30'
                  : 'bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)]'
              }`}
            >
              <Signature className="w-4 h-4" />
              Signature
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-[var(--text-primary)]">Portal</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setPortal('nsdl'); setOutputUrl(null); }}
              className={`p-3 rounded-xl border text-left transition-all ${
                portal === 'nsdl'
                  ? 'bg-[#7c3aed]/10 border-[#7c3aed] shadow-md shadow-[#7c3aed]/20'
                  : 'bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <span className="block text-xs font-bold text-[var(--text-primary)]">Protean (NSDL)</span>
              <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Govt. empanelled</span>
            </button>
            <button
              onClick={() => { setPortal('utiitsl'); setOutputUrl(null); }}
              className={`p-3 rounded-xl border text-left transition-all ${
                portal === 'utiitsl'
                  ? 'bg-[#7c3aed]/10 border-[#7c3aed] shadow-md shadow-[#7c3aed]/20'
                  : 'bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <span className="block text-xs font-bold text-[var(--text-primary)]">UTIITSL</span>
              <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Public sector</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-bold px-3 py-1.5 rounded-full border border-[#7c3aed]/20">
          <ImageIcon className="w-3.5 h-3.5" />
          {currentSpec.width} x {currentSpec.height} px
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-bold px-3 py-1.5 rounded-full border border-[#7c3aed]/20">
          <Info className="w-3.5 h-3.5" />
          {currentSpec.dpi} DPI
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-bold px-3 py-1.5 rounded-full border border-[#7c3aed]/20">
          <BarChart3 className="w-3.5 h-3.5" />
          Max {currentSpec.maxSizeKB} KB
        </span>
      </div>

      {!image ? (
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title={`Upload ${docType === 'photo' ? 'Photograph' : 'Signature Image'}`}
          subtitle="Supports JPG, PNG, WEBP. Transformed completely on-device."
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Crop & Align {docType === 'photo' ? 'Photo' : 'Signature'}
            </h3>
            <button
              onClick={() => setImage(null)}
              className="text-sm font-medium text-[#7c3aed] hover:text-[#9333ea] transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload Different
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-zinc-100 dark:bg-black p-4">
            <Cropper
              src={image}
              style={{ height: 400, width: "100%" }}
              aspectRatio={currentSpec.aspectRatio}
              guides={true}
              viewMode={1}
              background={false}
              ref={cropperRef}
              autoCropArea={0.9}
            />
          </div>

          <button
            onClick={processImage}
            disabled={isProcessing}
            className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #9333ea)`,
              boxShadow: `0 4px 24px ${ACCENT}44`
            }}
          >
            {isProcessing ? "Processing & Compressing..." : `Format as ${portal.toUpperCase()} ${docType}`}
          </button>
        </div>
      )}

      {outputUrl && (
        <div className="p-6 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-2xl flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="shrink-0 bg-white p-2 rounded-xl border border-[var(--border-subtle)] shadow-lg">
            <Image
              src={outputUrl}
              alt="Processed result"
              unoptimized={true}
              width={docType === 'photo' ? 120 : 240}
              height={160}
              className="object-contain max-h-[160px] rounded-lg"
              style={{
                width: docType === 'photo' ? '120px' : '240px',
              }}
            />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div>
              <h4 className="text-lg font-bold text-[#7c3aed]">Document Ready!</h4>
              <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">
                Scaled to exactly {currentSpec.width} x {currentSpec.height} px ({currentSpec.dpi} DPI equivalent).
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-[var(--text-primary)]">
              <span className="bg-black/20 dark:bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                Size: {(outputSize! / 1024).toFixed(2)} KB / {currentSpec.maxSizeKB} KB
              </span>
              {originalSize && (
                <span className="bg-black/20 dark:bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  Reduced by {compressionRatio}%
                </span>
              )}
            </div>

            {sizePercent > 0 && (
              <div className="w-full max-w-xs mx-auto md:mx-0">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>Compression</span>
                  <span>{sizePercent}% of limit</span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${sizePercent}%`, background: `linear-gradient(90deg, ${ACCENT}, #a855f7)` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => downloadOrShare(outputUrl, `pan-${docType}-${portal}.jpg`)}
              className="w-full md:w-auto text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, #9333ea)`,
                boxShadow: `0 4px 16px ${ACCENT}44`
              }}
            >
              <Download className="w-4 h-4" />
              Download Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
