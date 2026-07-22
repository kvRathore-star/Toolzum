"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, RefreshCw, Type, Layout, Sliders, Layers, Image as ImageIcon } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

interface AspectRatio {
  id: string;
  name: string;
  w: number;
  h: number;
  displayW: number;
  displayH: number;
}

const RATIOS: AspectRatio[] = [
  { id: 'insta_square', name: 'Instagram Square (1:1)', w: 1080, h: 1080, displayW: 300, displayH: 300 },
  { id: 'insta_story', name: 'Instagram Story (9:16)', w: 1080, h: 1920, displayW: 225, displayH: 400 },
  { id: 'twitter_post', name: 'Twitter/FB Post (16:9)', w: 1200, h: 675, displayW: 350, displayH: 197 },
  { id: 'linkedin_banner', name: 'LinkedIn Banner (4:1)', w: 1584, h: 396, displayW: 400, displayH: 100 }
];

export default function SocialMediaPostMaker() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(RATIOS[0]);
  const [text, setText] = useState('Build Something Beautiful');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  
  const [bgColor1, setBgColor1] = useState('#6366f1');
  const [bgColor2, setBgColor2] = useState('#4f46e5');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [textY, setTextY] = useState(50); // percentage

  useEffect(() => {
    drawPost();
  }, [selectedRatio, text, fontFamily, fontSize, textColor, bgColor1, bgColor2, bgImage, textY]);

  const drawPost = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Background (Image or Gradient)
    if (bgImage) {
      const img = new Image();
      img.onload = () => {
        // Draw image cover-fit scale
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // Add dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw Text after image loads
        drawTextOnCanvas(ctx, canvas.width, canvas.height);
      };
      img.src = bgImage;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, bgColor1);
      gradient.addColorStop(1, bgColor2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw decorative design elements
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(0, 0, canvas.width * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      drawTextOnCanvas(ctx, canvas.width, canvas.height);
    }
  };

  const drawTextOnCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    
    // Text Alignment & Styling
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const x = width / 2;
    const y = height * (textY / 100);

    // Multiline Text wrap calculation
    const maxWidth = width * 0.85;
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Draw lines
    const lineHeight = fontSize * 1.25;
    let currentY = y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach(lineText => {
      ctx.fillText(lineText, x, currentY);
      currentY += lineHeight;
    });

    ctx.restore();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setBgImage(reader.result as string);
      toast.success("Background image loaded!");
    };
    reader.readAsDataURL(file);
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    downloadOrShare(dataUrl, `social_post_${selectedRatio.id}.png`);
    toast.success("Graphic downloaded!");
  };

  const clearImage = () => {
    setBgImage(null);
    toast.success("Background image cleared.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Layout className="w-5 h-5 text-[var(--accent)]" />
          Social Media Graphic Designer
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Compose posts for Instagram, Twitter, and LinkedIn with templates, image backdrops, and overlays.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor controls */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 max-h-[680px] overflow-y-auto pr-2">
          
          {/* Ratio choices */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Layout className="w-3.5 h-3.5" /> Dimensions / Platform</h4>
            <div className="grid grid-cols-2 gap-2">
              {RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-colors cursor-pointer ${selectedRatio.id === ratio.id ? 'border-indigo-500 bg-indigo-500/10 text-[var(--accent)]' : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}
                >
                  {ratio.name}
                </button>
              ))}
            </div>
          </div>

          {/* Text controls */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)] dark:border-zinc-800">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Text Content</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Text Overlay</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none text-xs h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Font Size</label>
                <input type="number" value={fontSize} onChange={e => setFontSize(Math.max(12, parseInt(e.target.value) || 24))} className="w-full bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] font-bold outline-none text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Font Family</label>
                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl px-2 py-2 text-[var(--text-primary)] outline-none text-xs">
                  <option value="sans-serif">Sans-Serif</option>
                  <option value="serif">Serif</option>
                  <option value="Impact">Impact (Meme Style)</option>
                  <option value="cursive">Elegant Cursive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Text Color</label>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Position Y (%)</label>
                <input type="range" min="10" max="90" value={textY} onChange={e => setTextY(parseInt(e.target.value))} className="w-full accent-indigo-650 mt-2" />
              </div>
            </div>
          </div>

          {/* Background colors/image */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)] dark:border-zinc-800">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Backdrop Settings</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Grad Start</label>
                <input type="color" value={bgColor1} onChange={e => setBgColor1(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Grad End</label>
                <input type="color" value={bgColor2} onChange={e => setBgColor2(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Upload Background Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="w-full text-xs text-[var(--text-muted)] bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl px-4 py-2 cursor-pointer focus:border-[var(--border-subtle)]" 
              />
              {bgImage && (
                <button onClick={clearImage} className="text-[10px] font-bold text-[var(--accent)] hover:underline">Clear Image Backdrop</button>
              )}
            </div>
          </div>

        </div>

        {/* Preview Area */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[var(--bg-overlay)]/45 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-6 rounded-2xl min-h-[450px]">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3 mb-6">
             <span className="text-xs font-bold text-[var(--text-muted)]">DESIGN CANVAS</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {/* Draw according to aspect ratio */}
            <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-[var(--bg-elevated)] p-1">
              <canvas 
                ref={canvasRef} 
                width={selectedRatio.w} 
                height={selectedRatio.h} 
                style={{ width: selectedRatio.displayW, height: selectedRatio.displayH }}
                className="max-w-full"
              />
            </div>
          </div>

          {/* Export triggers */}
          <button 
            onClick={downloadPNG}
            className="w-full mt-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" />
            Download Custom Design
          </button>
        </div>

      </div>

    </div>
  );
}
