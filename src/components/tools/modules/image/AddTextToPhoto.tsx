"use client";
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Type, Upload, Download, Settings2, Camera, Crown } from 'lucide-react';
import Link from 'next/link';
import { useUsageCounter } from '@/hooks/useUsageCounter';
import { useProStatus } from '@/hooks/useProStatus';
import { downloadOrShare } from '@/utils/nativeShare';

const PRESETS = [
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'Instagram Reel', w: 1080, h: 1920 },
  { label: 'YouTube Banner', w: 2560, h: 1440 },
  { label: 'Twitter Header', w: 1500, h: 500 },
  { label: 'Custom', w: 0, h: 0 },
];

const DAILY_LIMIT = 3;

export default function SocialMediaImageCreator() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [text, setText] = useState('Your Text Here');
  const [color, setColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(48);
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(50);
  const [preset, setPreset] = useState(0);
  const [customW, setCustomW] = useState('1080');
  const [customH, setCustomH] = useState('1080');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { usage, trackUsage } = useUsageCounter('socialImageCreatorUsage');
  const isProUser = useProStatus();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => { setImage(img); setXPos(img.width / 2); setYPos(img.height / 2); };
    }
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const p = PRESETS[preset]!;
      const cw = p.label === 'Custom' ? parseInt(customW) || image.width : p.w;
      const ch = p.label === 'Custom' ? parseInt(customH) || image.height : p.h;

      canvas.width = cw;
      canvas.height = ch;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);

      const scale = Math.min(cw / image.width, ch / image.height);
      const dw = image.width * scale;
      const dh = image.height * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(image, dx, dy, dw, dh);

      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(text, xPos, yPos);

      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'transparent';
      ctx.fillText(`${cw} × ${ch}`, cw - 12, 12);
    }
  }, [image, text, color, fontSize, xPos, yPos, preset, customW, customH]);

  const downloadImage = async () => {
    if (!isProUser && usage >= DAILY_LIMIT) {
      toast.error(`You've used all ${DAILY_LIMIT} free downloads today. Upgrade to Pro for unlimited exports.`);
      return;
    }
    if (canvasRef.current) {
      try {
        // Server quota gate (1 unit) — block shows the limit modal, so only
        // count local usage when the save actually happened.
        if (await downloadOrShare(
          canvasRef.current.toDataURL('image/png'),
          `social-${PRESETS[preset]!.label.toLowerCase().replace(/\s+/g, '-')}.png`
        )) {
          trackUsage(usage + 1);
          if (!isProUser && usage + 1 >= DAILY_LIMIT) {
            toast(`Upgrade to Pro for unlimited image exports.`, { icon: '👑' });
          }
        }
      } catch (e) {
        console.error('AddTextToPhoto canvas error:', e);
        toast.error('Failed to export image. The canvas may be too large or corrupted.');
      }
    }
  };

  const remaining = DAILY_LIMIT - usage;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
         <div className="flex items-center justify-between gap-3 mb-2">
           <div className="flex items-center gap-3">
             <Camera className="w-8 h-8 text-violet-500" />
             <h2 className="text-2xl font-bold">Social Media Image Creator</h2>
           </div>
           <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-[var(--accent)] text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
         </div>
         <p className="text-[var(--text-secondary)]">Design images for Instagram, YouTube, Twitter with preset sizes and custom text overlays.</p>

          {!isProUser && (
          <div className="flex items-center justify-between bg-[var(--bg-overlay)]/50 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-secondary)]">Daily free downloads:</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: DAILY_LIMIT }, (_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < usage ? 'bg-[var(--bg-overlay)] dark:bg-[var(--bg-elevated)]' : 'bg-violet-500'}`} />
                ))}
              </div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)]">{remaining} / {DAILY_LIMIT} remaining</span>
            </div>
          </div>
          )}

         {!image ? (
           <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer relative">
             <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Select image" />
             <div className="text-[var(--text-secondary)] flex flex-col items-center"><Upload className="w-12 h-12 text-[var(--text-muted)] dark:text-[var(--text-secondary)] mb-2" />Select Image</div>
           </div>
         ) : (
           <div className="grid md:grid-cols-[300px_1fr] gap-8">
             <div className="space-y-5 bg-[var(--bg-overlay)]/50 p-6 rounded-xl border border-[var(--border-subtle)] h-fit">
               <div className="flex items-center gap-2 font-semibold border-b border-[var(--border-subtle)] pb-3"><Settings2 className="w-5 h-5" /> Canvas Presets</div>
               <div className="grid grid-cols-2 gap-1.5">
                 {PRESETS.map((p, i) => (
                   <button key={i} onClick={() => setPreset(i)}
                     className={`py-2 px-2 rounded-lg text-[10px] font-bold border transition-all ${preset === i ? 'bg-violet-600 text-white border-violet-500' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>
                     {p.label}{p.w ? `\n${p.w}×${p.h}` : ''}
                   </button>
                 ))}
               </div>
                {PRESETS[preset]!.label === 'Custom' && (
                 <div className="grid grid-cols-2 gap-2">
                   <div><label htmlFor="lbl-addtexttophoto-width" className="text-[10px] font-semibold text-[var(--text-muted)]">Width</label><input id="lbl-addtexttophoto-width" aria-label="Width" type="number" value={customW} onChange={e => setCustomW(e.target.value)} className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" /></div>
                   <div><label htmlFor="lbl-addtexttophoto-height" className="text-[10px] font-semibold text-[var(--text-muted)]">Height</label><input id="lbl-addtexttophoto-height" aria-label="Height" type="number" value={customH} onChange={e => setCustomH(e.target.value)} className="w-full p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" /></div>
                 </div>
               )}

               <div className="border-t border-[var(--border-subtle)] pt-4 space-y-3">
                 <label htmlFor="lbl-addtexttophoto-text" className="block text-sm font-semibold">Text</label>
                 <input id="lbl-addtexttophoto-text" aria-label="Text" type="text" value={text} onChange={e => setText(e.target.value)} className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-sm" />
                 <div className="flex gap-2">
                   <input aria-label="Text color" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer border-0 p-0 shrink-0" />
                    <input type="text" value={color} onChange={e => setColor(e.target.value)} aria-label="Text color hex" className="flex-1 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 uppercase font-mono text-xs" />
                 </div>
                 <div><label className="text-xs font-semibold flex justify-between"><span>Size</span><span className="text-[var(--text-secondary)]">{fontSize}px</span></label><input aria-label="Size" type="range" min="10" max="300" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-violet-500" /></div>
                 <div><label className="text-xs font-semibold flex justify-between"><span>X Pos</span><span className="text-[var(--text-secondary)]">{Math.round(xPos)}</span></label><input aria-label="X Pos" type="range" min="0" max={image.width} value={xPos} onChange={e => setXPos(Number(e.target.value))} className="w-full accent-violet-500" /></div>
                 <div><label className="text-xs font-semibold flex justify-between"><span>Y Pos</span><span className="text-[var(--text-secondary)]">{Math.round(yPos)}</span></label><input aria-label="Y Pos" type="range" min="0" max={image.height} value={yPos} onChange={e => setYPos(Number(e.target.value))} className="w-full accent-violet-500" /></div>
                 <button onClick={downloadImage} disabled={!isProUser && remaining === 0}
                   className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5">
                   <Download className="w-4 h-4" />{!isProUser && remaining === 0 ? 'Limit reached — Upgrade to Pro' : 'Download PNG'}
                 </button>
                 <button onClick={() => setImage(null)} className="w-full text-[var(--text-secondary)] hover:text-red-500 text-xs font-medium py-2 transition-colors">Start Over</button>
               </div>
             </div>
             <div ref={containerRef} className="bg-[var(--bg-overlay)] dark:bg-black rounded-xl border border-[var(--border-subtle)] overflow-hidden flex items-center justify-center p-4 min-h-[400px]">
               <canvas ref={canvasRef} className="max-w-full max-h-[600px] object-contain shadow-2xl"
                 style={{ backgroundImage: 'conic-gradient(#ccc 25%, white 25%, white 50%, #ccc 50%, #ccc 75%, white 75%, white)', backgroundSize: '20px 20px' }} />
             </div>
           </div>
         )}

         <div className="bg-[var(--accent)]/10/20 border border-[var(--accent)]/20 rounded-xl p-3 flex items-center justify-between">
           <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> No download limits, custom fonts, save brand presets, batch create multiple sizes at once, transparent background export.</p>
           <Link href="/pricing" className="text-[10px] font-bold text-[var(--accent)] dark:text-[var(--accent)] underline shrink-0 ml-4">Upgrade →</Link>
         </div>
      </div>
    </div>
  );
}
