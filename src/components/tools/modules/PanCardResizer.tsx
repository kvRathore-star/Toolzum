"use client";

import React, { useState, useRef, useEffect } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { FileUploader } from '../FileUploader';
import imageCompression from 'browser-image-compression';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

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
      aspectRatio: 2.5 / 3.5, // 2.5cm W x 3.5cm H
      dpi: 200,
      label: "NSDL Photo (2.5 x 3.5 cm, 200 DPI, < 50KB)",
    },
    signature: {
      width: 354,
      height: 157,
      maxSizeKB: 50,
      aspectRatio: 4.5 / 2.0, // 4.5cm W x 2.0cm H
      dpi: 200,
      label: "NSDL Signature (4.5 x 2.0 cm, 200 DPI, < 50KB)",
    },
  },
  utiitsl: {
    photo: {
      width: 213,
      height: 213,
      maxSizeKB: 30,
      aspectRatio: 1.0, // 213 x 213 px
      dpi: 300,
      label: "UTIITSL Photo (213 x 213 px, 300 DPI, < 30KB)",
    },
    signature: {
      width: 400,
      height: 200,
      maxSizeKB: 60,
      aspectRatio: 2.0, // 400 x 200 px
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
  
  const cropperRef = useRef<ReactCropperElement>(null);
  const currentSpec = PORTAL_SPECS[portal][docType];

  useEffect(() => {
    return () => {
      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }
    };
  }, [outputUrl]);

  // Adjust cropper aspect ratio dynamically when options change
  useEffect(() => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.setAspectRatio(currentSpec.aspectRatio);
    }
  }, [docType, portal, currentSpec.aspectRatio]);

  const handleFileSelect = (file: File, dataUrl: string) => {
    setImage(dataUrl);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const processImage = async () => {
    if (!cropperRef.current || !cropperRef.current.cropper) return;

    setIsProcessing(true);
    try {
      const cropper = cropperRef.current.cropper;
      
      // Get cropped canvas at standard specifications
      const canvas = cropper.getCroppedCanvas({
        width: currentSpec.width,
        height: currentSpec.height,
        fillColor: '#fff', // Keep background white
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to capture cropped area.");
        }

        // Target size is slightly below max limit for safety
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Informative Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-6 rounded-2xl text-zinc-700 dark:text-zinc-300 text-sm space-y-2">
        <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          PAN Card Photo & Signature Resizer
        </h4>
        <p>
          Indian PAN card portals (NSDL/Protean and UTIITSL) reject document uploads that do not meet strict dimension (DPI) and file size (KB) requirements. This tool crops and compresses your image entirely in your browser, keeping your personal documents 100% private.
        </p>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">1. Select Document Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setDocType('photo'); setOutputUrl(null); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium border text-sm transition-all ${
                docType === 'photo'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              📷 Photograph
            </button>
            <button
              onClick={() => { setDocType('signature'); setOutputUrl(null); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium border text-sm transition-all ${
                docType === 'signature'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              ✍️ Signature
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">2. Select Portal</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setPortal('nsdl'); setOutputUrl(null); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium border text-sm transition-all ${
                portal === 'nsdl'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              Protean (NSDL)
            </button>
            <button
              onClick={() => { setPortal('utiitsl'); setOutputUrl(null); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium border text-sm transition-all ${
                portal === 'utiitsl'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              UTIITSL
            </button>
          </div>
        </div>
      </div>

      {/* Target Spec Indicator */}
      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 text-center tracking-wider uppercase">
        Target Spec: {currentSpec.label}
      </div>

      {/* File Upload or Interactive Cropping */}
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
              className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
            >
              Upload Different Image
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black p-4">
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
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? "Processing & Compressing..." : `Format & Save as ${portal.toUpperCase()} ${docType.charAt(0).toUpperCase() + docType.slice(1)}`}
          </button>
        </div>
      )}

      {/* Cropped Output Preview and Download */}
      {outputUrl && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="shrink-0 bg-white p-2 rounded-xl border border-zinc-200 dark:border-white/10 shadow-lg">
            <img
              src={outputUrl}
              alt="Processed result"
              className="object-contain max-h-[160px] rounded-lg"
              style={{
                width: docType === 'photo' ? '120px' : '240px',
              }}
            />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h4 className="text-lg font-bold text-emerald-500">Document Ready!</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                The image has been scaled to exactly {currentSpec.width} x {currentSpec.height} pixels ({currentSpec.dpi} DPI equivalent) and compressed.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="bg-black/20 dark:bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                File Size: <strong className="text-zinc-900 dark:text-white">{(outputSize! / 1024).toFixed(2)} KB</strong> (Limit: {currentSpec.maxSizeKB} KB)
              </span>
              <span className="bg-black/20 dark:bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                Dimensions: <strong className="text-zinc-900 dark:text-white">{currentSpec.width} x {currentSpec.height} px</strong>
              </span>
            </div>

            <div>
              <button
                onClick={() => downloadOrShare(outputUrl, `pan-${docType}-${portal}.jpg`)}
                className="w-full md:w-auto bg-white hover:bg-zinc-100 text-zinc-950 font-bold px-8 py-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

