"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Download, Sparkles, Image as ImageIcon, Link2 } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import NextImage from "next/image";
import { clipboardWrite } from "@/lib/clipboard";

export default function AiImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const styles = [
    { name: 'Photorealistic', suffix: 'highly detailed, photorealistic, 8k resolution, raw photo, realistic lighting' },
    { name: 'Anime', suffix: 'anime style, vibrant colors, detailed illustration, studio ghibli vibe, sharp focus' },
    { name: '3D Render', suffix: '3d render, octane render, pixar style, smooth shading, clay model, cute, raytracing' },
    { name: 'Cyberpunk', suffix: 'cyberpunk style, neon lights, futuristic city background, highly detailed, sci-fi' },
    { name: 'Fantasy', suffix: 'fantasy illustration, mythical, magical, highly detailed digital painting, artstation' },
    { name: 'Pixel Art', suffix: '8-bit pixel art, retro gaming style, detailed, sprite, colorful' },
    { name: 'Cinematic', suffix: 'cinematic still, dramatic lighting, depth of field, 35mm film, masterpiece' }
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) {
      return toast.error('Please enter a description for your image!');
    }

    setIsGenerating(true);
    setImageUrl('');

    // Select style suffix
    const selectedStyleObj = styles.find(s => s.name === style);
    const suffix = selectedStyleObj ? selectedStyleObj.suffix : '';
    const fullPrompt = `${prompt}, ${suffix}`;

    // Map aspect ratio to width/height
    let w = 1024;
    let h = 1024;
    if (aspectRatio === '16:9') {
      w = 1024;
      h = 576;
    } else if (aspectRatio === '9:16') {
      w = 576;
      h = 1024;
    }

    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${w}&height=${h}&nologo=true&seed=${seed}`;

    // Force preloading of the image before displaying
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageUrl(url);
      setIsGenerating(false);
      toast.success('Image generated successfully!');
    };
    img.onerror = () => {
      setIsGenerating(false);
      toast.error('Failed to generate image. Please try again.');
    };
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      downloadOrShare(blobUrl, `ai-image-${Date.now()}.png`);
    } catch (e) {
      toast.error('Failed to download image. Try copying the link instead.');
    }
  };

  const handleCopyLink = () => {
    if (!imageUrl) return;
    clipboardWrite(imageUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Image Generator</h3>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Image Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. A futuristic city with flying cars at sunset, watercolor style..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-32 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Art Style</label>
                <select
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm"
                >
                  {styles.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={e => setAspectRatio(e.target.value)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-6 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Artwork...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Image</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
            <h4 className="font-semibold text-[var(--text-primary)]">Artwork Preview</h4>
            {imageUrl && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="p-2 text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors"
                  title="Copy Direct Link" aria-label="Copy link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-[var(--text-secondary)] hover:text-zinc-950 dark:hover:text-white border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors"
                  title="Download Image" aria-label="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)]/50">
            {isGenerating ? (
              <div className="flex flex-col items-center text-center p-8">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Processing latent diffusion nodes...</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">This typically takes 3 to 6 seconds.</p>
              </div>
            ) : imageUrl ? (
<NextImage
  src={imageUrl}
  alt="Processed result"
  unoptimized={true}
  className="max-w-full max-h-[480px] object-contain rounded-lg shadow-md animate-in zoom-in-95 duration-300"
/>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)]">
                <ImageIcon className="w-10 h-10 mb-3 text-zinc-300 dark:text-zinc-700 animate-bounce" />
                <p className="text-sm font-medium">Your generated artwork will appear here.</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Specify your prompt and options to render the model.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
