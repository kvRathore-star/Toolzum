"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';

export default function VideoCompressor() {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  
  const [file, setFile] = useState<File | null>(null);
  const [crf, setCrf] = useState(28); // 23 is default, higher is more compressed
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load ffmpeg when component mounts
  useEffect(() => {
    loadFFmpeg();
  }, []);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const clearAll = () => {
    setFile(null);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const compressVideo = async () => {
    if (!file || !ffmpeg || !isLoaded) return;

    setIsProcessing(true);
    try {
      // Write file to ffmpeg virtual file system
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      
      // Run compression command: 
      // -vcodec libx264: H.264 codec
      // -crf: Constant Rate Factor (0-51). 28 is good compression.
      // -preset fast: Balance between speed and compression
      await ffmpeg.exec([
        '-i', 'input.mp4', 
        '-vcodec', 'libx264', 
        '-crf', crf.toString(), 
        '-preset', 'fast', 
        'output.mp4'
      ]);
      
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as any], { type: 'video/mp4' });
      
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      toast.success("Video compressed successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during compression.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <svg className="w-12 h-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">Initializing WebAssembly Core...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>100% Client-Side FFmpeg:</strong> Compress large video files directly in your browser without uploading them to any server. Your videos never leave your device.
        </div>
        <FileUploader 
          accept="video/mp4,video/quicktime,video/x-matroska,video/webm,image/gif"
          onFileSelect={handleFileSelect} 
          title="Upload Video or GIF"
          subtitle="MP4, MOV, MKV, WEBM, or GIF"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">Original Size: <span className="font-bold text-red-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span></p>
        </div>
        <button 
          onClick={clearAll}
          disabled={isProcessing}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg disabled:opacity-50"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Settings Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-zinc-900 dark:text-white font-medium border-b border-zinc-100 dark:border-zinc-800 pb-2">Compression Settings</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Compression Level</label>
              <span className="text-xs font-bold text-blue-500">{crf === 23 ? 'High Quality' : crf >= 32 ? 'Low Quality' : 'Balanced'} (CRF {crf})</span>
            </div>
            
            <input
              type="range"
              min="20"
              max="40"
              step="1"
              value={crf}
              onChange={(e) => setCrf(parseInt(e.target.value))}
              disabled={isProcessing}
              className="w-full accent-blue-600"
            />
            
            <div className="flex justify-between text-xs text-zinc-500 px-1">
              <span>Better Quality</span>
              <span>Smaller File</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
             {isProcessing ? (
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold text-blue-500">
                    <span>Compressing Video...</span>
                    <span>{progress}%</span>
                 </div>
                 <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden">
                   <div 
                     className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                     style={{ width: `${progress}%` }}
                   ></div>
                 </div>
               </div>
             ) : (
               <button 
                 onClick={compressVideo}
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                 Compress Video
               </button>
             )}
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <h4 className="font-bold text-emerald-500">Compression Complete</h4>
                  {outputSize && (
                     <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">
                       - {((file.size - outputSize) / file.size * 100).toFixed(1)}% Smaller
                     </span>
                  )}
               </div>
               
               <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center relative">
                  <video src={outputUrl} controls className="w-full max-h-[250px]" />
               </div>
               
               {outputSize && (
                 <div className="flex justify-between text-sm">
                   <span className="text-zinc-500">New Size:</span>
                   <span className="font-bold text-emerald-500">{(outputSize / 1024 / 1024).toFixed(2)} MB</span>
                 </div>
               )}

               <button 
                  onClick={() => downloadOrShare(outputUrl, `compressed_${file.name.replace(/\.[^/.]+$/, "")}.mp4`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Compressed Video
                </button>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-zinc-400">
               <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <p className="text-center text-sm px-4">Your compressed video will appear here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
