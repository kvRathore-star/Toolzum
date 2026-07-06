"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Download, Sparkles, User, Link2, Upload } from 'lucide-react';
import { downloadOrShare } from '@/utils/nativeShare';

export default function AiAvatarGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('3D Pixar/Disney');
  const [gender, setGender] = useState('Neutral');
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const styles = [
    { name: '3D Pixar/Disney', suffix: 'cute 3d character avatar, pixar style, disney style, smooth render, highly detailed, bubbly expression' },
    { name: 'Cyberpunk Cyborg', suffix: 'cyberpunk character portrait, glowing neon highlights, robotic details, dark synthwave background, highly detailed' },
    { name: 'Vector Minimalist', suffix: 'flat vector portrait illustration, minimal design, clean shapes, pastel background, premium avatar design' },
    { name: 'Comic Book', suffix: 'vintage comic book cover art style, pop art, hand-drawn ink lines, colorful, halftone dot shading' },
    { name: 'Water Color', suffix: 'artistic watercolor portrait painting, elegant paint splashes, soft lighting, textured paper background' },
    { name: 'Pencil Sketch', suffix: 'detailed hand-drawn graphite pencil sketch portrait, realistic shading, crosshatch lines, black and white sketch' },
    { name: 'Retro Pixel Art', suffix: '16-bit retro arcade video game avatar portrait, pixelated details, highly stylized, vibrant color palette' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setAvatarUrl('');

    // Select style suffix
    const selectedStyleObj = styles.find(s => s.name === style);
    const suffix = selectedStyleObj ? selectedStyleObj.suffix : '';
    
    // Combine features
    const descriptors = prompt.trim() ? `${prompt.trim()}, ` : '';
    const genderTerm = gender !== 'Neutral' ? `${gender.toLowerCase()}, ` : '';
    
    const fullPrompt = `profile picture avatar of a ${genderTerm}${descriptors}stylized as a ${suffix}`;

    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=512&height=512&nologo=true&seed=${seed}`;

    // Force preloading of the image before displaying
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setAvatarUrl(url);
      setIsGenerating(false);
      toast.success('Avatar generated successfully!');
    };
    img.onerror = () => {
      setIsGenerating(false);
      toast.error('Failed to generate avatar. Please try again.');
    };
  };

  const handleDownload = async () => {
    if (!avatarUrl) return;
    try {
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      downloadOrShare(blobUrl, `ai-avatar-${Date.now()}.png`);
    } catch (e) {
      toast.error('Failed to download avatar. Try copying the link instead.');
    }
  };

  const handleCopyLink = () => {
    if (!avatarUrl) return;
    navigator.clipboard.writeText(avatarUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <User className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">AI Avatar Generator</h3>
            </div>
            
            {/* Image Upload for Reference */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Reference Photo (Optional)</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <img loading="lazy" src={imagePreview} alt="Reference Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setImagePreview(null)} 
                      className="absolute inset-0 bg-black/60 text-white text-xs font-bold flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-zinc-400" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  {imagePreview ? "Reference photo uploaded!" : "Upload a selfie to help guide facial structure."}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Features Description</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. smiling, wearing glasses, curly brown hair, hoodie..."
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white h-24 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Gender Vibe</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm"
                >
                  <option value="Neutral">Neutral</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avatar Style</label>
                <select
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors text-sm"
                >
                  {styles.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-6 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Stylizing Avatar...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Avatar</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
            <h4 className="font-semibold text-zinc-900 dark:text-white">Generated Avatar</h4>
            {avatarUrl && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  title="Copy Direct Link" aria-label="Copy link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  title="Download Avatar" aria-label="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-zinc-800/50">
            {isGenerating ? (
              <div className="flex flex-col items-center text-center p-8">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Applying neural style transfer...</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">This typically takes 3 to 6 seconds.</p>
              </div>
            ) : avatarUrl ? (
              <img loading="lazy"
                src={avatarUrl}
                alt="AI Avatar Output"
                className="w-80 h-80 object-cover rounded-full shadow-lg border-4 border-white dark:border-zinc-800 animate-in zoom-in-95 duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                <User className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                <p className="text-sm font-medium">Your customized avatar will appear here.</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Upload a photo or fill the description, then tap generate.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}