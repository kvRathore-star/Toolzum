"use client";

import React, { useState, useRef, useEffect } from 'react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { 
  Download, Image as ImageIcon, Type, Sparkles, Sliders, Trash2, 
  Layers, Plus, Layout, Move, Palette, CheckCircle, RefreshCw
} from 'lucide-react';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  bgColor: string;
  bgPadding: number;
}

interface ImageElement {
  id: string;
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

export default function AiThumbnailMaker() {
  // Canvas Configuration
  const [aspectRatio, setAspectRatio] = useState<'16x9' | '1x1' | '9x16'>('16x9');
  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'image'>('gradient');
  const [solidColor, setSolidColor] = useState('#1e1b4b'); // deep indigo
  const [gradColorStart, setGradColorStart] = useState('#4f46e5'); // indigo-600
  const [gradColorEnd, setGradColorEnd] = useState('#06b6d4'); // cyan-500
  const [gradAngle, setGradAngle] = useState(135);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  
  // Image Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  // Overlay Elements
  const [texts, setTexts] = useState<TextElement[]>([
    {
      id: 't1',
      text: 'MAKE AWESOME',
      x: 100,
      y: 200,
      fontSize: 60,
      color: '#ffffff',
      fontFamily: 'Impact',
      fontWeight: 'bold',
      strokeColor: '#000000',
      strokeWidth: 4,
      shadowColor: 'rgba(0,0,0,0.8)',
      shadowBlur: 10,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      bgColor: '#ea580c',
      bgPadding: 15
    },
    {
      id: 't2',
      text: 'THUMBNAILS!',
      x: 100,
      y: 300,
      fontSize: 80,
      color: '#fbbf24',
      fontFamily: 'Impact',
      fontWeight: 'bold',
      strokeColor: '#000000',
      strokeWidth: 5,
      shadowColor: 'rgba(0,0,0,0.9)',
      shadowBlur: 12,
      shadowOffsetX: 6,
      shadowOffsetY: 6,
      bgColor: 'transparent',
      bgPadding: 0
    }
  ]);

  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'text' | 'image' | null>(null);

  // Draggable Interaction
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '1x1': return { width: 1080, height: 1080 };
      case '9x16': return { width: 1080, height: 1920 };
      case '16x9':
      default:
        return { width: 1280, height: 720 };
    }
  };

  const { width, height } = getCanvasDimensions();

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Draw Background
    if (bgType === 'solid') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === 'gradient') {
      const angleRad = (gradAngle * Math.PI) / 180;
      // Calculate coordinates along angle
      const x1 = width / 2 - Math.cos(angleRad) * (width / 2);
      const y1 = height / 2 - Math.sin(angleRad) * (height / 2);
      const x2 = width / 2 + Math.cos(angleRad) * (width / 2);
      const y2 = height / 2 + Math.sin(angleRad) * (height / 2);
      
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, gradColorStart);
      grad.addColorStop(1, gradColorEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === 'image' && backgroundImage) {
      ctx.save();
      // Apply filters for image background
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
      // Draw background keeping ratio or stretching to fit
      ctx.drawImage(backgroundImage, 0, 0, width, height);
      ctx.restore();
    } else {
      // Fallback gray background
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw Stickers / Custom Images
    images.forEach(el => {
      ctx.save();
      ctx.translate(el.x + el.w / 2, el.y + el.h / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.drawImage(el.img, -el.w / 2, -el.h / 2, el.w, el.h);
      ctx.restore();
    });

    // Draw Text Overlays
    texts.forEach(el => {
      ctx.save();
      ctx.font = `${el.fontWeight} ${el.fontSize}px ${el.fontFamily}`;
      ctx.textBaseline = 'top';

      const metrics = ctx.measureText(el.text);
      const textWidth = metrics.width;
      const textHeight = el.fontSize; // Approx

      // Background Box
      if (el.bgColor && el.bgColor !== 'transparent') {
        ctx.fillStyle = el.bgColor;
        ctx.fillRect(
          el.x - el.bgPadding, 
          el.y - el.bgPadding, 
          textWidth + el.bgPadding * 2, 
          textHeight + el.bgPadding * 2
        );
      }

      // Shadow
      if (el.shadowColor && el.shadowBlur > 0) {
        ctx.shadowColor = el.shadowColor;
        ctx.shadowBlur = el.shadowBlur;
        ctx.shadowOffsetX = el.shadowOffsetX;
        ctx.shadowOffsetY = el.shadowOffsetY;
      }

      // Stroke Outline
      if (el.strokeWidth > 0) {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.lineJoin = 'miter';
        ctx.strokeText(el.text, el.x, el.y);
      }

      // Text Fill
      ctx.fillStyle = el.color;
      ctx.fillText(el.text, el.x, el.y);
      ctx.restore();

      // If Selected, draw a bounding border
      if (selectedId === el.id) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          el.x - el.bgPadding - 4,
          el.y - el.bgPadding - 4,
          textWidth + el.bgPadding * 2 + 8,
          textHeight + el.bgPadding * 2 + 8
        );
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(el.x - el.bgPadding - 8, el.y - el.bgPadding - 8, 8, 8);
        ctx.restore();
      }
    });

  }, [
    aspectRatio, bgType, solidColor, gradColorStart, gradColorEnd, gradAngle, 
    backgroundImage, brightness, contrast, saturation, blur, texts, images, selectedId
  ]);

  // Handle image upload as background
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setBackgroundImage(img);
      setBgType('image');
      toast.success("Background image loaded!");
    };
  };

  // Handle custom overlay image upload
  const handleStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const newSticker: ImageElement = {
        id: `img-${Date.now()}`,
        img,
        x: width / 2 - 100,
        y: height / 2 - 100,
        w: 200,
        h: (200 * img.height) / img.width,
        rotation: 0
      };
      setImages([...images, newSticker]);
      setSelectedId(newSticker.id);
      setSelectedType('image');
      toast.success("Image overlay added!");
    };
  };

  // Add standard element templates
  const addTextElement = () => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: 'DOUBLE CLICK TO EDIT',
      x: width / 2 - 200,
      y: height / 2 - 25,
      fontSize: 50,
      color: '#ffffff',
      fontFamily: 'Impact',
      fontWeight: 'bold',
      strokeColor: '#000000',
      strokeWidth: 3,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 5,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      bgColor: 'transparent',
      bgPadding: 0
    };
    setTexts([...texts, newText]);
    setSelectedId(newText.id);
    setSelectedType('text');
  };

  // Drag-and-drop interactive math on canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Scaling ratio from bounding client rect to canvas width/height
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    // Check if clicked text overlay first (top of hierarchy)
    const clickedText = [...texts].reverse().find(t => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      ctx.font = `${t.fontWeight} ${t.fontSize}px ${t.fontFamily}`;
      const metrics = ctx.measureText(t.text);
      const textWidth = metrics.width;
      const textHeight = t.fontSize;

      return (
        pos.x >= t.x - t.bgPadding &&
        pos.x <= t.x + textWidth + t.bgPadding &&
        pos.y >= t.y - t.bgPadding &&
        pos.y <= t.y + textHeight + t.bgPadding
      );
    });

    if (clickedText) {
      setSelectedId(clickedText.id);
      setSelectedType('text');
      isDragging.current = true;
      dragStart.current = pos;
      elementStartPos.current = { x: clickedText.x, y: clickedText.y };
      return;
    }

    // Check if clicked sticker/image
    const clickedImg = [...images].reverse().find(img => {
      return (
        pos.x >= img.x &&
        pos.x <= img.x + img.w &&
        pos.y >= img.y &&
        pos.y <= img.y + img.h
      );
    });

    if (clickedImg) {
      setSelectedId(clickedImg.id);
      setSelectedType('image');
      isDragging.current = true;
      dragStart.current = pos;
      elementStartPos.current = { x: clickedImg.x, y: clickedImg.y };
      return;
    }

    // Clicked background
    setSelectedId(null);
    setSelectedType(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || !selectedId) return;

    const pos = getMousePos(e);
    const dx = pos.x - dragStart.current.x;
    const dy = pos.y - dragStart.current.y;

    if (selectedType === 'text') {
      setTexts(prev => prev.map(t => {
        if (t.id === selectedId) {
          return {
            ...t,
            x: Math.round(elementStartPos.current.x + dx),
            y: Math.round(elementStartPos.current.y + dy)
          };
        }
        return t;
      }));
    } else if (selectedType === 'image') {
      setImages(prev => prev.map(img => {
        if (img.id === selectedId) {
          return {
            ...img,
            x: Math.round(elementStartPos.current.x + dx),
            y: Math.round(elementStartPos.current.y + dy)
          };
        }
        return img;
      }));
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTextPropertyChange = (key: keyof TextElement, value: any) => {
    setTexts(prev => prev.map(t => {
      if (t.id === selectedId) {
        return { ...t, [key]: value };
      }
      return t;
    }));
  };

  const handleImagePropertyChange = (key: keyof ImageElement, value: any) => {
    setImages(prev => prev.map(img => {
      if (img.id === selectedId) {
        return { ...img, [key]: value };
      }
      return img;
    }));
  };

  const deleteSelectedElement = () => {
    if (!selectedId) return;
    if (selectedType === 'text') {
      setTexts(prev => prev.filter(t => t.id !== selectedId));
    } else {
      setImages(prev => prev.filter(img => img.id !== selectedId));
    }
    setSelectedId(null);
    setSelectedType(null);
    toast.success("Element removed");
  };

  const activeText = texts.find(t => t.id === selectedId);
  const activeImage = images.find(img => img.id === selectedId);

  // Apply visual preset templates
  const applyPreset = (preset: 'clickbait' | 'neon' | 'cyberpunk' | 'minimal') => {
    if (preset === 'clickbait') {
      setBgType('gradient');
      setGradColorStart('#ea580c');
      setGradColorEnd('#e11d48');
      setTexts([
        {
          id: 'p1',
          text: 'THIS IS CRAZY!',
          x: 80,
          y: 180,
          fontSize: 85,
          color: '#facc15',
          fontFamily: 'Impact',
          fontWeight: 'bold',
          strokeColor: '#000000',
          strokeWidth: 6,
          shadowColor: '#000000',
          shadowBlur: 15,
          shadowOffsetX: 6,
          shadowOffsetY: 6,
          bgColor: 'transparent',
          bgPadding: 0
        },
        {
          id: 'p2',
          text: '100% Offline Tool',
          x: 80,
          y: 310,
          fontSize: 45,
          color: '#ffffff',
          fontFamily: 'Arial',
          fontWeight: 'black',
          strokeColor: '#000000',
          strokeWidth: 3,
          shadowColor: '#000000',
          shadowBlur: 10,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          bgColor: '#000000',
          bgPadding: 12
        }
      ]);
      setImages([]);
    } else if (preset === 'neon') {
      setBgType('solid');
      setSolidColor('#0b0b1a');
      setTexts([
        {
          id: 'p1',
          text: 'GLOWING NEON',
          x: 150,
          y: 200,
          fontSize: 70,
          color: '#38bdf8',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          strokeColor: 'transparent',
          strokeWidth: 0,
          shadowColor: '#0ea5e9',
          shadowBlur: 30,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          bgColor: 'transparent',
          bgPadding: 0
        },
        {
          id: 'p2',
          text: 'Vibrant Design',
          x: 150,
          y: 300,
          fontSize: 60,
          color: '#ec4899',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          strokeColor: 'transparent',
          strokeWidth: 0,
          shadowColor: '#db2777',
          shadowBlur: 25,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          bgColor: 'transparent',
          bgPadding: 0
        }
      ]);
      setImages([]);
    } else if (preset === 'minimal') {
      setBgType('gradient');
      setGradColorStart('#1f2937');
      setGradColorEnd('#111827');
      setTexts([
        {
          id: 'p1',
          text: 'Minimal Tech Spec',
          x: 100,
          y: 250,
          fontSize: 55,
          color: '#f3f4f6',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          strokeColor: 'transparent',
          strokeWidth: 0,
          shadowColor: 'transparent',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          bgColor: 'transparent',
          bgPadding: 0
        }
      ]);
      setImages([]);
    }
    setSelectedId(null);
    toast.success("Applied template!");
  };

  const exportThumbnail = () => {
    try {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Deselect elements for clean screenshot
    setSelectedId(null);
    setSelectedType(null);

    // Short timeout to let rendering refresh without selection bounding box
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      downloadOrShare(dataUrl, `thumbnail_${aspectRatio}.png`);
      toast.success("Thumbnail exported successfully!");
    }, 100);
  } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            AI Thumbnail & Graphic Maker
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Design clickbait backgrounds, YouTube templates, and post visual assets right in your browser.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportThumbnail}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Thumbnail (PNG)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Design Toolbar - Left Column */}
        <div className="lg:col-span-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-md space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Presets & Aspect Ratios */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-[var(--text-secondary)]" />
              Dimensions Preset
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setAspectRatio('16x9')} 
                className={`py-2 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${aspectRatio === '16x9' ? 'bg-indigo-500/10 border-indigo-500 text-[var(--accent)]' : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-zinc-300'}`}
              >
                16:9 YouTube
              </button>
              <button 
                onClick={() => setAspectRatio('1x1')} 
                className={`py-2 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${aspectRatio === '1x1' ? 'bg-indigo-500/10 border-indigo-500 text-[var(--accent)]' : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-zinc-300'}`}
              >
                1:1 Instagram
              </button>
              <button 
                onClick={() => setAspectRatio('9x16')} 
                className={`py-2 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${aspectRatio === '9x16' ? 'bg-indigo-500/10 border-indigo-500 text-[var(--accent)]' : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-zinc-300'}`}
              >
                9:16 Shorts/Reel
              </button>
            </div>
          </div>

          {/* Quick Presets templates */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[var(--text-secondary)]" />
              Style Templates
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => applyPreset('clickbait')} 
                className="py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-lg font-semibold text-[10px] cursor-pointer hover:bg-rose-500/20"
              >
                Clickbait
              </button>
              <button 
                onClick={() => applyPreset('neon')} 
                className="py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-400 rounded-lg font-semibold text-[10px] cursor-pointer hover:bg-sky-500/20"
              >
                Neon Glow
              </button>
              <button 
                onClick={() => applyPreset('minimal')} 
                className="py-1.5 bg-[var(--bg-overlay)]0/10 border border-zinc-500/20 text-zinc-300 rounded-lg font-semibold text-[10px] cursor-pointer hover:bg-[var(--bg-overlay)]0/20"
              >
                Minimalist
              </button>
            </div>
          </div>

          {/* Background Settings */}
          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-4">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Canvas Background</h3>
            <div className="flex bg-[var(--bg-overlay)]/45 p-1 rounded-xl gap-1">
              <button 
                onClick={() => setBgType('solid')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${bgType === 'solid' ? 'bg-white dark:bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
              >
                Solid
              </button>
              <button 
                onClick={() => setBgType('gradient')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${bgType === 'gradient' ? 'bg-white dark:bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
              >
                Gradient
              </button>
              <button 
                onClick={() => setBgType('image')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${bgType === 'image' ? 'bg-white dark:bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
              >
                Image
              </button>
            </div>

            {bgType === 'solid' && (
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={solidColor}
                  onChange={e => setSolidColor(e.target.value)}
                  className="w-10 h-10 rounded border-0 cursor-pointer"
                />
                <span className="text-xs font-mono text-[var(--text-muted)]">{solidColor}</span>
              </div>
            )}

            {bgType === 'gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Start Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input aria-label="Start Color" 
                        type="color" 
                        value={gradColorStart}
                        onChange={e => setGradColorStart(e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-[var(--text-secondary)]">{gradColorStart}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">End Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="color" 
                        value={gradColorEnd}
                        onChange={e => setGradColorEnd(e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-[var(--text-secondary)]">{gradColorEnd}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>Gradient Angle</span>
                    <span>{gradAngle}°</span>
                  </div>
                  <input 
                    type="range" min="0" max="360" value={gradAngle}
                    onChange={e => setGradAngle(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 mt-1"
                  />
                </div>
              </div>
            )}

            {bgType === 'image' && (
              <div className="space-y-3">
                <div className="border border-dashed border-[var(--border-subtle)] rounded-xl p-3 flex flex-col items-center justify-center bg-[var(--bg-overlay)]/50 dark:bg-black/20">
                  <ImageIcon className="w-8 h-8 text-[var(--text-muted)] mb-1" />
                  <label className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-[10px] text-white font-bold cursor-pointer transition-colors shadow">
                    Choose Background
                    <input 
                      type="file" accept="image/*" className="hidden" 
                      onChange={handleBgImageUpload}
                    />
                  </label>
                </div>
                
                {backgroundImage && (
                  <div className="space-y-3 border-t border-zinc-800 pt-3">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block flex items-center gap-1"><Sliders className="w-3.5 h-3.5" /> Adjust Image</span>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </div>
                      <input 
                        type="range" min="30" max="200" value={brightness}
                        onChange={e => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                        <span>Contrast</span>
                        <span>{contrast}%</span>
                      </div>
                      <input 
                        type="range" min="30" max="200" value={contrast}
                        onChange={e => setContrast(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                        <span>Blur</span>
                        <span>{blur}px</span>
                      </div>
                      <input 
                        type="range" min="0" max="20" value={blur}
                        onChange={e => setBlur(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Elements Panel */}
          <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Layers className="w-4 h-4 text-[var(--text-secondary)]" /> Overlays</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={addTextElement}
                className="flex items-center justify-center gap-1.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
              >
                <Type className="w-3.5 h-3.5" />
                Add Text
              </button>
              <label 
                className="flex items-center justify-center gap-1.5 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-zinc-900 dark:text-zinc-200 font-bold py-2 rounded-xl text-xs cursor-pointer text-center"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Overlay
                <input 
                  type="file" accept="image/*" className="hidden" 
                  onChange={handleStickerUpload}
                />
              </label>
            </div>
          </div>

        </div>

        {/* Live Canvas Area - Middle Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-4 rounded-2xl min-h-[350px]">
          <span className="text-[10px] text-[var(--text-muted)] mb-2 flex items-center gap-1"><Move className="w-3 h-3" /> Click elements to select, drag to reposition on canvas</span>
          
          <div className="relative border border-zinc-300 dark:border-zinc-800 shadow-2xl rounded overflow-hidden max-w-full">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="bg-zinc-900 cursor-crosshair max-w-full object-contain"
              style={{
                width: aspectRatio === '16x9' ? '540px' : aspectRatio === '1x1' ? '400px' : '280px',
                aspectRatio: aspectRatio === '16x9' ? '16/9' : aspectRatio === '1x1' ? '1/1' : '9/16'
              }}
            />
          </div>
        </div>

        {/* Selected Element Customizer - Right Column */}
        <div className="lg:col-span-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-md space-y-6 max-h-[80vh] overflow-y-auto">
          
          {selectedId ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
              
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                  Edit Selected {selectedType === 'text' ? 'Text' : 'Sticker'}
                </span>
                <button 
                  onClick={deleteSelectedElement}
                  className="p-1.5 text-[var(--accent)] hover:bg-rose-500/10 rounded-lg cursor-pointer"
                  title="Remove Element" aria-label="Remove Element"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {selectedType === 'text' && activeText && (
                <div className="space-y-4">
                  {/* Text Edit Box */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Text Value</label>
                    <textarea aria-label="Text Value" 
                      value={activeText.text}
                      onChange={e => handleTextPropertyChange('text', e.target.value)}
                      className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-zinc-400"
                      rows={2}
                    />
                  </div>

                  {/* Font Color */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Text Color</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input aria-label="Text Color" 
                          type="color" 
                          value={activeText.color}
                          onChange={e => handleTextPropertyChange('color', e.target.value)}
                          className="w-8 h-8 rounded border-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-[var(--text-secondary)]">{activeText.color}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Background</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input aria-label="Background" 
                          type="color" 
                          value={activeText.bgColor === 'transparent' ? '#000000' : activeText.bgColor}
                          onChange={e => handleTextPropertyChange('bgColor', e.target.value)}
                          disabled={activeText.bgColor === 'transparent'}
                          className="w-8 h-8 rounded border-0 cursor-pointer disabled:opacity-30"
                        />
                        <label className="text-[9px] text-[var(--text-muted)] flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={activeText.bgColor !== 'transparent'}
                            onChange={e => handleTextPropertyChange('bgColor', e.target.checked ? '#000000' : 'transparent')}
                          />
                          Fill Box
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Font Size & Family */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Font Size</label>
                      <input aria-label="Font Size" 
                        type="number" min="10" max="200"
                        value={activeText.fontSize}
                        onChange={e => handleTextPropertyChange('fontSize', parseInt(e.target.value) || 20)}
                        className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Font Family</label>
                      <select aria-label="Font Family" 
                        value={activeText.fontFamily}
                        onChange={e => handleTextPropertyChange('fontFamily', e.target.value)}
                        className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs mt-1"
                      >
                        <option value="Impact">Impact</option>
                        <option value="Arial">Arial</option>
                        <option value="sans-serif">Sans Serif</option>
                        <option value="Courier New">Courier</option>
                        <option value="Georgia">Georgia</option>
                      </select>
                    </div>
                  </div>

                  {/* Stroke/Outline properties */}
                  <div className="space-y-3 border-t border-zinc-800 pt-3">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Stroke Outline</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-[var(--text-muted)]">Outline Width</label>
                        <input aria-label="Outline Width" 
                          type="number" min="0" max="15"
                          value={activeText.strokeWidth}
                          onChange={e => handleTextPropertyChange('strokeWidth', parseInt(e.target.value) || 0)}
                          className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--text-muted)]">Outline Color</label>
                        <input aria-label="Outline Color" 
                          type="color" 
                          value={activeText.strokeColor}
                          onChange={e => handleTextPropertyChange('strokeColor', e.target.value)}
                          className="w-full h-8 rounded border-0 cursor-pointer mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shadow properties */}
                  <div className="space-y-3 border-t border-zinc-800 pt-3">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Text Drop Shadow</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-[var(--text-muted)]">Shadow Blur</label>
                        <input aria-label="Shadow Blur" 
                          type="number" min="0" max="30"
                          value={activeText.shadowBlur}
                          onChange={e => handleTextPropertyChange('shadowBlur', parseInt(e.target.value) || 0)}
                          className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--text-muted)]">Shadow Color</label>
                        <input 
                          type="color" 
                          value={activeText.shadowColor.startsWith('rgba') ? '#000000' : activeText.shadowColor}
                          onChange={e => handleTextPropertyChange('shadowColor', e.target.value)}
                          className="w-full h-8 rounded border-0 cursor-pointer mt-1"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {selectedType === 'image' && activeImage && (
                <div className="space-y-4">
                  {/* Scale Width/Height */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                      <span>Sticker Width</span>
                      <span>{activeImage.w}px</span>
                    </div>
                    <input 
                      type="range" min="50" max="600" value={activeImage.w}
                      onChange={e => {
                        const newW = parseInt(e.target.value);
                        const ratio = activeImage.h / activeImage.w;
                        setImages(prev => prev.map(img => {
                          if (img.id === selectedId) {
                            return { ...img, w: newW, h: Math.round(newW * ratio) };
                          }
                          return img;
                        }));
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Rotation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                      <span>Rotation</span>
                      <span>{activeImage.rotation}°</span>
                    </div>
                    <input 
                      type="range" min="-180" max="180" value={activeImage.rotation}
                      onChange={e => handleImagePropertyChange('rotation', parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <Sparkles className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="text-xs">Select any element or text overlay on the canvas to configure styling parameters</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
