"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from '@/lib/auth-client';

interface FileUploaderProps {
  accept?: string;
  maxSizeMB?: number;
  freeMaxSizeMB?: number;
  onFileSelect: (file: File, dataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

function smartMax(accept: string): { signed: number; free: number } {
  if (accept.includes('video/')) return { signed: 500, free: 100 };
  if (accept.includes('application/pdf')) return { signed: 50, free: 20 };
  if (accept.includes('audio/')) return { signed: 100, free: 50 };
  return { signed: 20, free: 10 };
}

export function FileUploader({ 
  accept = "image/*,application/pdf", 
  maxSizeMB,
  freeMaxSizeMB,
  onFileSelect,
  title = "Upload your file",
  subtitle = "Drag and drop or click to browse"
}: FileUploaderProps) {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limits = smartMax(accept);
  const signedLimit = maxSizeMB ?? limits.signed;
  const freeLimit = freeMaxSizeMB ?? limits.free;
  const effectiveLimit = isSignedIn ? signedLimit : freeLimit;

  const processFile = useCallback((file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (file.size > effectiveLimit * 1024 * 1024) {
      const msg = isSignedIn
        ? `File exceeds ${effectiveLimit}MB limit`
        : `Free users limited to ${effectiveLimit}MB. Sign in for up to ${signedLimit}MB.`;
      setError(msg);
      toast.error(msg);
      return;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const base = type.replace('/*', '');
          return file.type.startsWith(base);
        }
        return file.type === type;
      });

      if (!isAccepted) {
        const msg = `Unsupported file format. Accepted: ${accept}`;
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        toast.success('File loaded securely!');
        onFileSelect(file, dataUrl);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      toast.error("Failed to read file from disk.");
    };
    reader.readAsDataURL(file);
  }, [effectiveLimit, signedLimit, isSignedIn, accept, onFileSelect]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        processFile(e.clipboardData.files[0]);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  return (
    <div className="w-full">
      <div 
        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
            : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-500'
          }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          accept={accept}
          onChange={onFileInput}
        />
        
        <div className="flex flex-col items-center justify-center p-6 text-center z-0 pointer-events-none">
          <div className={`p-4 rounded-full mb-4 transition-colors duration-200 ${isDragging ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-white dark:bg-zinc-800 text-zinc-500 shadow-sm border border-zinc-100 dark:border-zinc-700'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}
      
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium uppercase tracking-wider">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        Files processed locally
      </div>
    </div>
  );
}
