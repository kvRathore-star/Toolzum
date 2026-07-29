"use client";
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import DOMPurify from 'dompurify';
import { downloadOrShare } from '@/utils/nativeShare';

export default function HtmlToImage() {
  const [htmlContent, setHtmlContent] = useState('<div style="padding: 20px; background: linear-gradient(45deg, #FF6B6B, #4ECDC4); border-radius: 10px; color: white; font-family: sans-serif; text-align: center;"><h1>Hello World</h1><p>Edit this HTML to generate an image!</p></div>');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'svg'>('png');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const sanitized = DOMPurify.sanitize(htmlContent);
    iframe.contentDocument.open();
    iframe.contentDocument.write(sanitized);
    iframe.contentDocument.close();
  }, [htmlContent]);

  const convert = async () => {
    const container = previewContainerRef.current;
    if (!container) return;
    toast.loading("Rendering Image...", { id: 'html' });
    try {
      let dataUrl = '';
      if (format === 'png') {
        dataUrl = await toPng(container, { cacheBust: true });
      } else if (format === 'jpeg') {
        dataUrl = await toJpeg(container, { quality: 0.95 });
      } else if (format === 'svg') {
        dataUrl = await toSvg(container);
      }
      
      downloadOrShare(dataUrl, `rendered.${format}`);
      toast.success(`Downloaded as ${format.toUpperCase()}!`, { id: 'html' });
    } catch (err) {
      toast.error('Failed to render HTML.', { id: 'html' });
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6">
         <div className="text-center">
           <h2 className="text-2xl font-bold">HTML to Image Converter</h2>
           <p className="text-[var(--text-secondary)]">Render custom HTML/CSS directly into a downloadable image (PNG, JPG, SVG).</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Editor */}
           <div className="space-y-4">
             <h3 className="font-semibold">HTML Source Code</h3>
             <textarea 
               value={htmlContent}
               onChange={(e) => setHtmlContent(e.target.value)}
               className="w-full h-64 p-4 font-mono text-sm bg-zinc-900 text-green-400 rounded-xl border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Enter HTML here..."
             />
             <div className="flex gap-4">
               <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="bg-[var(--bg-surface)] border-none rounded-lg px-4 py-2 flex-1 outline-none">
                 <option value="png">PNG</option>
                 <option value="jpeg">JPEG</option>
                 <option value="svg">SVG</option>
               </select>
               <button onClick={convert} className="flex-[2] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-2 rounded-lg shadow transition-all active:scale-95">
                 Render & Download
               </button>
             </div>
           </div>

           {/* Preview */}
           <div className="space-y-4">
             <h3 className="font-semibold">Live Preview</h3>
             <div ref={previewContainerRef} className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 overflow-auto bg-[var(--bg-overlay)] flex items-center justify-center min-h-[16rem]">
               <iframe
                 ref={iframeRef}
                 className="w-full h-full min-h-[14rem]"
                 sandbox="allow-same-origin"
                 title="Preview"
               />
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}
