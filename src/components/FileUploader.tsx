"use client";

import { useState, useRef, useCallback, useEffect, type DragEvent, type ClipboardEvent } from "react";
import { toast } from "react-hot-toast";
import { cn, formatBytes } from "@/lib/utils";
import { Upload, X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { consumeHeroFile } from "@/lib/heroFile";

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  preview?: string;
}

export interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  onFilesAccepted: (files: UploadedFile[]) => void;
  className?: string;
}

export function FileUploader({
  accept = "*",
  multiple = false,
  maxSize = 100 * 1024 * 1024, // 100 MB default
  onFilesAccepted,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const filesRef = useRef(files);
  filesRef.current = files;
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (newFiles: File[]) => {
      const accepted: UploadedFile[] = [];

      for (const file of newFiles) {
        if (file.size === 0) {
          toast.error(`${file.name} is empty (0 bytes). Please choose a valid file.`);
          continue;
        }
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds the ${formatBytes(maxSize)} limit.`);
          continue;
        }
        if (accept !== "*" && !file.type) {
          toast.error(`Could not detect file type for ${file.name}.`);
          continue;
        }
        if (accept !== "*") {
          const allowed = accept.split(",").map((a) => a.trim().toLowerCase());
          const ext = file.name.split(".").pop()?.toLowerCase();
          const matchesExt = ext && allowed.some((a) => a === `.${ext}`);
          const matchesMime = allowed.some((a) => file.type.startsWith(a.replace("*", "")));
          if (!matchesExt && !matchesMime) {
            toast.error(`${file.name} has an unsupported format. Accepted: ${accept}`);
            continue;
          }
        }

        const uploadFile: UploadedFile = {
          id: crypto.randomUUID(),
          file,
          progress: 100,
        };

        // Generate previews for images
        if (file.type.startsWith("image/")) {
          uploadFile.preview = URL.createObjectURL(file);
        }

        accepted.push(uploadFile);
      }

      if (accepted.length > 0) {
        const updated = multiple ? [...files, ...accepted] : accepted;
        setFiles(updated);
        onFilesAccepted(updated);
      }
    },
    [files, maxSize, multiple, onFilesAccepted]
  );

  // Hero-box carry: a file dropped on the homepage arrives via IndexedDB (same
  // browser, never uploaded) and enters through processFiles — same size/type
  // guards as a manual pick. Consume-once + 5-min TTL live in heroFile.ts.
  const heroClaimed = useRef(false);
  useEffect(() => {
    if (heroClaimed.current) return;
    heroClaimed.current = true;
    consumeHeroFile().then((f) => {
      if (f) processFiles([f]);
    }).catch(() => {});
  }, [processFiles]);

  // Drag handlers
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 0) {
        processFiles(dropped);
      }
    },
    [processFiles]
  );

  // Clipboard handler
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      const pastedFiles: File[] = [];

      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        processFiles(pastedFiles);
      }
    },
    [processFiles]
  );

  // File input handler
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (selected.length > 0) {
        processFiles(selected);
      }
      // Reset so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFiles]
  );

  // Revoke all blob URLs on unmount
  useEffect(() => {
    return () => {
      filesRef.current.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
    };
  }, []);

  // Remove file
  const removeFile = useCallback(
    (id: string) => {
      const removed = files.find((f) => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      const updated = files.filter((f) => f.id !== id);
      setFiles(updated);
      onFilesAccepted(updated);
    },
    [files, onFilesAccepted]
  );

  return (
    <div className={cn("space-y-4", className)} onPaste={handlePaste}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all cursor-pointer",
          dragOver
            ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
            : "border-zinc-300 hover:border-zinc-500 dark:border-zinc-700"
        )}
      >
        <Upload className="mb-3 h-8 w-8 text-zinc-400" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Drop files here, paste from clipboard, or click to browse
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Max file size: {formatBytes(maxSize)}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              {f.preview ? (
                <img
                  src={f.preview}
                  alt="Preview"
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <FileIcon className="h-10 w-10 text-zinc-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{f.file.name}</p>
                <p className="text-xs text-zinc-500">{formatBytes(f.file.size)}</p>
              </div>
              <Button
                type="button"
                variant="icon"
                onClick={() => removeFile(f.id)}
                aria-label={`Remove ${f.file.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}