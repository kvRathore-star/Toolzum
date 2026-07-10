"use client";
import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Download, Upload, Crown, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import Link from 'next/link';
import NextImage from "next/image";

const ICON_SIZES = [
  { size: 1024, label: 'App Store (iOS)', file: 'AppStore-1024x1024.png' },
  { size: 512, label: 'Play Store / PWA', file: 'PlayStore-512x512.png' },
  { size: 192, label: 'PWA Small', file: 'PWA-192x192.png' },
  { size: 180, label: 'iOS @3x', file: 'iOS-180x180.png' },
  { size: 167, label: 'iPad Pro @2x', file: 'iPadPro-167x167.png' },
  { size: 152, label: 'iPad @2x', file: 'iPad-152x152.png' },
  { size: 120, label: 'iPhone @2x', file: 'iPhone-120x120.png' },
  { size: 87, label: 'iOS Settings @2x', file: 'iOSSettings-87x87.png' },
  { size: 76, label: 'iPad', file: 'iPad-76x76.png' },
  { size: 60, label: 'iPhone @1x', file: 'iPhone-60x60.png' },
  { size: 58, label: 'iOS Settings @1x', file: 'iOSSettings-58x58.png' },
  { size: 40, label: 'iOS Spotlight @1x', file: 'iOSSpotlight-40x40.png' },
  { size: 32, label: 'Favicon', file: 'favicon-32x32.png' },
  { size: 16, label: 'Favicon Small', file: 'favicon-16x16.png' },
];

const FREE_LIMIT = 5;
const PRO_MAX = 100;

export default function BulkAppIconGenerator() {
  const [source, setSource] = useState<'svg' | 'image'>('svg');
  const [svgText, setSvgText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [usage, setUsage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    toast.success(`Loaded ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
  };

  const generateIcons = async (imgSource: HTMLImageElement | SVGElement) => {
    const zip = new JSZip();
    for (const { size, file } of ICON_SIZES) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgSource instanceof HTMLImageElement ? imgSource : await svgToImage(imgSource as SVGElement, size), 0, 0, size, size);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) zip.file(file, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    return content;
  };

  const svgToImage = (svg: SVGElement, size: number): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleGenerate = async () => {
    if (usage >= FREE_LIMIT) {
      toast.error(`You've used your free generation. Upgrade to Pro for unlimited.`);
      return;
    }
    setIsProcessing(true);
    try {
      let zipBlob: Blob;
      if (source === 'svg') {
        if (!svgText.trim()) { toast.error('Paste your SVG code first'); setIsProcessing(false); return; }
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) { toast.error('Invalid SVG'); setIsProcessing(false); return; }
        if (!svg.getAttribute('viewBox') && svg.getAttribute('width') && svg.getAttribute('height')) {
          svg.setAttribute('viewBox', `0 0 ${svg.getAttribute('width')} ${svg.getAttribute('height')}`);
        }
        const img = await svgToImage(svg, 1024);
        zipBlob = await generateIcons(img);
      } else {
        if (!imageFile) { toast.error('Upload an image first'); setIsProcessing(false); return; }
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = URL.createObjectURL(imageFile);
        });
        zipBlob = await generateIcons(img);
      }
      const url = URL.createObjectURL(zipBlob);
      await downloadOrShare(url, 'app-icons.zip');
      URL.revokeObjectURL(url);
      setUsage(usage + 1);
      toast.success(`Generated ${ICON_SIZES.length} icon sizes!`);
    } catch {
      toast.error('Failed to generate icons');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8">
        {/* Source toggle */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] w-fit">
          <button onClick={() => setSource('svg')} className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all ${source === 'svg' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            SVG Code
          </button>
          <button onClick={() => setSource('image')} className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all ${source === 'image' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            Upload Image
          </button>
        </div>

        {source === 'svg' ? (
          <textarea
            value={svgText}
            onChange={(e) => setSvgText(e.target.value)}
            placeholder={`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#6366f1" />
</svg>`}
            rows={8}
            className="w-full p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all resize-none"
          />
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-overlay)]"
          >
            {imagePreview ? (
              <div className="text-center">
                <NextImage src={imagePreview} alt="Preview" unoptimized={true} className="w-24 h-24 object-contain mx-auto mb-3 rounded-lg" />
                <p className="text-sm text-[var(--text-primary)]">{imageFile?.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Click to change</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
                <p className="text-sm text-[var(--text-primary)] font-medium">Upload a 1024x1024 PNG or SVG</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Your source icon should be square</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg" onChange={handleImageUpload} className="hidden" />
          </div>
        )}

        {/* Icon size preview */}
        <div className="mt-6 p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)]">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Will generate {ICON_SIZES.length} sizes:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {ICON_SIZES.slice(0, 12).map(({ size, label }) => (
              <div key={size} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <div className="w-4 h-4 rounded bg-[var(--accent)]/20 flex items-center justify-center text-[8px] font-mono text-[var(--accent)] shrink-0">{size < 100 ? size : ''}</div>
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleGenerate}
          disabled={isProcessing}
          className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isProcessing ? 'Generating Icons...' : `Generate All ${ICON_SIZES.length} Icon Sizes (ZIP)`}
        </button>

        {usage >= FREE_LIMIT && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-[var(--radius-lg)]">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Free tier limit reached</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">Upgrade to Pro for unlimited icon generations.</p>
            <Link href="/pricing" className="inline-flex items-center gap-1 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-[var(--radius-lg)] hover:bg-amber-600 transition-colors">
              <Crown className="w-3.5 h-3.5" /> Upgrade to Pro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
