"use client";

import React, { useState, useRef } from 'react';
import { toast } from "react-hot-toast";
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { FileUploader } from '../FileUploader';
import imageCompression from 'browser-image-compression';

import { downloadOrShare } from '@/utils/nativeShare';

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
      // Get cropped canvas
      const cropper = cropperRef.current.cropper;
      const canvas = cropper.getCroppedCanvas({
        width: 350, // 3.5cm
        height: 450, // 4.5cm
        fillColor: '#fff', // Solid white background
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Canvas is empty");

        // Compress to <50KB
        const options = {
          maxSizeMB: 0.048, // slightly under 50KB for safety
          maxWidthOrHeight: 1024,
          useWebWorker: typeof window !== 'undefined' && typeof window.Worker !== 'undefined',
          initialQuality: 0.9,
        };
        
        // Ensure it's a file for browser-image-compression
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

  if (!image) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Requirements:</strong> Upload a photo with good lighting. We will automatically crop it to 3.5x4.5 cm with a white background and compress it under 50KB for Indian Government portals.
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
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white"
        >
          Upload Different Photo
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50">
        <Cropper
          src={image}
          style={{ height: 400, width: "100%" }}
          aspectRatio={3.5 / 4.5} // 3.5cm x 4.5cm Indian Standard
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
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {isProcessing ? "Processing & Compressing..." : "Generate 50KB Passport Photo"}
        </button>
      </div>

      {outputUrl && (
        <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="shrink-0 rounded-lg overflow-hidden border-4 border-white shadow-xl w-[140px] h-[180px] bg-white">
            <img loading="lazy" src={outputUrl} alt="Processed Passport" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-emerald-400 mb-2">Success! Ready for Upload</h4>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-4">
              Your photo is perfectly sized at 3.5x4.5 cm with a solid white background.
            </p>
            <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 mb-6">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Final Size: <strong className="text-zinc-900 dark:text-white">{outputSize ? (outputSize / 1024).toFixed(2) : 0} KB</strong> (Limit: 50 KB)
            </div>
            <div>
              <button 
                onClick={() => downloadOrShare(outputUrl, 'passport-photo-50kb.jpg')}
                className="inline-block bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-8 py-3 rounded-xl transition-colors w-full sm:w-auto text-center shadow-lg"
              >
                Download Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
