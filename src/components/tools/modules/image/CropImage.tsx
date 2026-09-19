"use client";

import React, { useState, useRef } from 'react';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { FileUploader } from '../../FileUploader';
import { Crop, RotateCw, RefreshCcw, Download, FlipHorizontal, FlipVertical, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { useEnterToSubmit } from '@/lib/keyboard';

export default function CropImage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleFileSelect = (file: File, url: string) => {
    setImageFile(file);
    setImageSrc(url);
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const croppedCanvas = cropper.getCroppedCanvas();
    if (!croppedCanvas) {
      toast.error("Failed to crop image.");
      return;
    }

    croppedCanvas.toBlob((blob: Blob | null) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `cropped-${imageFile?.name || 'photo.png'}`);
      toast.success("Cropped image downloaded!");
    }, 'image/png');
  };

  const handleRotate = (deg: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) cropper.rotate(deg);
  };

  const handleFlip = (direction: 'h' | 'v') => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    const data = cropper.getData();
    if (direction === 'h') {
      cropper.scaleX(data.scaleX === -1 ? 1 : -1);
    } else {
      cropper.scaleY(data.scaleY === -1 ? 1 : -1);
    }
  };

  const changeAspectRatio = (ratio: number | undefined) => {
    setAspectRatio(ratio);
    const cropper = cropperRef.current?.cropper;
    if (cropper) cropper.setAspectRatio(ratio === undefined ? NaN : ratio);
  };

  const handleReset = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) cropper.reset();
  };

  const handleStartOver = () => {
    setImageFile(null);
    setImageSrc(null);
  };

  const handleKeyDown = useEnterToSubmit(handleCrop);

  if (!imageSrc) {
    return (
      <div className="space-y-6">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm flex items-center gap-2">
          <Crop className="w-5 h-5 text-[var(--accent)] shrink-0" />
          <span><strong>Client-Side Crop:</strong> Modify and crop your images locally. We do not store or send files to a server.</span>
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Photo to Crop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{imageFile?.name}</h3>
          <p className="text-xs text-[var(--text-secondary)]">Upload scan or custom photo to crop</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleStartOver}
            className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Start Over
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor workspace */}
        <div className="lg:col-span-3 bg-zinc-950 border border-[var(--border-subtle)] rounded-2xl overflow-hidden relative min-h-[400px] flex items-center justify-center p-4">
          <Cropper
            src={imageSrc}
            style={{ height: 400, width: "100%" }}
            initialAspectRatio={undefined}
            guides={true}
            ref={cropperRef}
            viewMode={1}
            background={false}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false}
          />
        </div>

        {/* Control toolbar */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider">Aspect Presets</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Free Size', value: undefined },
                { label: 'Square (1:1)', value: 1 },
                { label: 'Video (16:9)', value: 16 / 9 },
                { label: 'Photo (4:3)', value: 4 / 3 },
                { label: 'Classic (3:2)', value: 3 / 2 },
                { label: 'Portrait (2:3)', value: 2 / 3 },
              ].map((ratio, idx) => (
                <button
                  key={idx}
                  onClick={() => changeAspectRatio(ratio.value)}
                  className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    aspectRatio === ratio.value
                      ? 'bg-[var(--accent-ink)] border-[var(--accent-ink)] text-white'
                      : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider">Transformations</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRotate(-90)}
                className="py-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-[var(--accent)] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Rotate left 90 degrees"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Rotate -90°
              </button>
              <button
                onClick={() => handleRotate(90)}
                className="py-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-[var(--accent)] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Rotate right 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Rotate +90°
              </button>
              <button
                onClick={() => handleFlip('h')}
                className="py-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-[var(--accent)] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Flip image horizontally"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                Flip Horiz
              </button>
              <button
                onClick={() => handleFlip('v')}
                className="py-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-[var(--accent)] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Flip image vertically"
              >
                <FlipVertical className="w-3.5 h-3.5" />
                Flip Vert
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Reset Crop Guides
            </button>
            <button
              onClick={handleCrop}
              onKeyDown={handleKeyDown}
              className="w-full py-3.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Crop and download image"
            >
              <Download className="w-4 h-4" />
              Crop & Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}