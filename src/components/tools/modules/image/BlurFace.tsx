"use client";
import React, { useState, useRef, useEffect } from 'react';
import NextImage from "next/image";
import { toast } from 'react-hot-toast';
import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs';
import { downloadOrShare } from '@/utils/nativeShare';

export default function BlurFace() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setModelLoading(true);
    const loadToast = toast.loading("Loading AI face detection model...");
    blazeface.load().then(m => {
      setModel(m);
      setModelLoading(false);
      toast.dismiss(loadToast);
      toast.success("Face detection model ready");
    }).catch(err => {
      setModelLoading(false);
      toast.dismiss(loadToast);
      toast.error("Failed to load face detection model");
      console.error("Failed to load blazeface", err);
    });
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const processFaces = async () => {
    if (!image || !canvasRef.current || !model) {
      if (!model) toast.error("AI Model still loading...");
      return;
    }
    setIsProcessing(true);
    toast.loading("Detecting faces...", { id: 'blur' });
    
    const img = new Image();
    img.src = image;
    img.onload = async () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      try {
        const predictions = await model.estimateFaces(canvas, false);
        
        if (predictions.length === 0) {
          toast.error("No faces detected", { id: 'blur' });
          setIsProcessing(false);
          return;
        }

        ctx.filter = 'blur(15px)';
        predictions.forEach((pred: any) => {
          const [x, y] = pred.topLeft as [number, number];
          const [x2, y2] = pred.bottomRight as [number, number];
          const w = x2 - x;
          const h = y2 - y;
          ctx.drawImage(canvas, x, y, w, h, x, y, w, h);
        });
        ctx.filter = 'none';

        const outUrl = canvas.toDataURL('image/png');
        downloadOrShare(outUrl, 'blurred_faces.png');
        toast.success(`Blurred ${predictions.length} faces!`, { id: 'blur' });
      } catch (err) {
        toast.error("Failed to process image", { id: 'blur' });
      }
      setIsProcessing(false);
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6 text-center">
         <h2 className="text-2xl font-bold">Auto Blur Faces</h2>
         <p className="text-[var(--text-secondary)]">Automatically detect and blur faces in photos using completely private, on-device AI.</p>
         
         <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
           <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
           {image ? (
              <NextImage unoptimized={true} loading="lazy" src={image} alt="Preview" width={800} height={600} className="max-h-64 mx-auto rounded-lg shadow-sm" />
           ) : (
             <div className="text-[var(--text-secondary)]">Click or Drag Image Here</div>
           )}
         </div>

         {image && (
           <button onClick={processFaces} disabled={isProcessing} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-zinc-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">
             {isProcessing ? "Processing..." : "Blur Faces & Download"}
           </button>
         )}
         
         <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
