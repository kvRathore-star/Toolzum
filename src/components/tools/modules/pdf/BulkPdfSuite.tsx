"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { RotateCw, Lock, Unlock, Trash2, Scissors, Droplets, Crop, Maximize, FileDown } from 'lucide-react';
import { BulkToolShell } from '../utility/BulkToolShell';

const OPERATIONS = [
  { value: 'rotate', label: 'Rotate Pages', icon: RotateCw },
  { value: 'protect', label: 'Add Password', icon: Lock },
  { value: 'unlock', label: 'Remove Password', icon: Unlock },
  { value: 'remove-pages', label: 'Remove Pages', icon: Trash2 },
  { value: 'split', label: 'Split PDF', icon: Scissors },
  { value: 'watermark', label: 'Add Watermark', icon: Droplets },
  { value: 'crop', label: 'Crop Pages', icon: Crop },
  { value: 'resize', label: 'Resize Pages', icon: Maximize },
  { value: 'flatten', label: 'Flatten Forms', icon: FileDown },
];

const OP_LABELS: Record<string, string> = {
  rotate: 'Rotate Pages',
  protect: 'Add Password',
  unlock: 'Remove Password',
  'remove-pages': 'Remove Pages',
  split: 'Split PDF',
  watermark: 'Add Watermark',
  crop: 'Crop Pages',
  resize: 'Resize Pages',
  flatten: 'Flatten Forms',
};

export default function BulkPdfSuite({ defaultConfig: extraConfig }: { defaultConfig?: Record<string, unknown> } = {}) {
  const searchParams = useSearchParams();
  const opParam = searchParams?.get('op');

  const base = { op: 'rotate', quality: '80' };
  const merged = { ...base, ...extraConfig };

  if (opParam && OPERATIONS.find(o => o.value === opParam)) {
    merged.op = opParam;
  }

  const opLabel = opParam ? OP_LABELS[opParam] : null;
  const currentOp = (merged.op as string) || 'rotate';

  return (
    <BulkToolShell
      toolSlug="bulk-pdf-suite"
      title="Bulk PDF Suite"
      description={opLabel
        ? `Batch ${opLabel.toLowerCase()} on multiple PDF files at once. Everything runs locally in your browser — nothing is uploaded.`
        : 'Rotate, protect, unlock, split, watermark, crop, resize, or flatten multiple PDF files in one batch. All processing happens locally — zero uploads.'}
      accept=".pdf"
      processFile={async (file, config) => {
        const op = (config as Record<string, string>).op || 'rotate';
        const { PDFDocument } = await import('pdf-lib');
        const srcBytes = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(srcBytes);

        let pdfBytes: Uint8Array;

        switch (op) {
          case 'rotate': {
            const { degrees } = await import('pdf-lib');
            const angleDeg = Number((config as Record<string, string>).degrees) || 90;
            for (const p of srcDoc.getPages()) p.setRotation(degrees(angleDeg));
            pdfBytes = await srcDoc.save();
            break;
          }
          case 'protect': {
            const userPassword = (config as Record<string, string>).userPassword || '';
            const ownerPassword = (config as Record<string, string>).ownerPassword || '';
            (srcDoc as any).encrypt({ userPassword, ownerPassword });
            pdfBytes = await srcDoc.save();
            break;
          }
          case 'unlock': {
            const password = (config as Record<string, string>).password || '';
            const unlockedDoc = await PDFDocument.load(srcBytes, { password } as any);
            pdfBytes = await unlockedDoc.save();
            break;
          }
          case 'remove-pages': {
            const rangeStr = (config as Record<string, string>).range || '';
            const indices = parseRangeToIndices(rangeStr, srcDoc.getPageCount());
            const pagesToRemove = new Set(indices);
            const pageIndices = srcDoc.getPageIndices().filter(i => !pagesToRemove.has(i));
            const newDoc = await PDFDocument.create();
            const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
            for (const p of copiedPages) newDoc.addPage(p);
            pdfBytes = await newDoc.save();
            break;
          }
          case 'split': {
            const pagesPerFile = Number((config as Record<string, string>).pagesPerFile) || 1;
            const total = srcDoc.getPageCount();
            const newDoc = await PDFDocument.create();
            const indices = [];
            for (let i = 0; i < Math.min(pagesPerFile, total); i++) indices.push(i);
            const copiedPages = await newDoc.copyPages(srcDoc, indices);
            for (const p of copiedPages) newDoc.addPage(p);
            pdfBytes = await newDoc.save();
            break;
          }
          case 'watermark': {
            const text = (config as Record<string, string>).watermarkText || 'WATERMARK';
            const { rgb, StandardFonts, degrees } = await import('pdf-lib');
            const font = await srcDoc.embedFont(StandardFonts.Helvetica);
            for (const p of srcDoc.getPages()) {
              const { width, height } = p.getSize();
              p.drawText(text, {
                x: width / 2 - 60,
                y: height / 2,
                font,
                size: 48,
                color: rgb(0.8, 0.8, 0.8),
                opacity: 0.4,
                rotate: degrees(45),
              });
            }
            pdfBytes = await srcDoc.save();
            break;
          }
          case 'crop': {
            const top = Number((config as Record<string, string>).cropTop) || 0;
            const right = Number((config as Record<string, string>).cropRight) || 0;
            const bottom = Number((config as Record<string, string>).cropBottom) || 0;
            const left = Number((config as Record<string, string>).cropLeft) || 0;
            for (const p of srcDoc.getPages()) {
              const { width, height } = p.getSize();
              p.setMediaBox(left, bottom, width - left - right, height - top - bottom);
            }
            pdfBytes = await srcDoc.save();
            break;
          }
          case 'resize': {
            const targetWidth = Number((config as Record<string, string>).resizeWidth) || 595;
            const targetHeight = Number((config as Record<string, string>).resizeHeight) || 842;
            for (const p of srcDoc.getPages()) {
              const { width, height } = p.getSize();
              const scale = Math.min(targetWidth / width, targetHeight / height);
              p.scale(scale, scale);
              p.setMediaBox(0, 0, targetWidth, targetHeight);
            }
            pdfBytes = await srcDoc.save();
            break;
          }
          case 'flatten': {
            const form = srcDoc.getForm();
            if (form) {
              const fields = form.getFields();
              for (const f of fields) try { f.enableReadOnly(); } catch {}
              form.flatten();
            }
            pdfBytes = await srcDoc.save();
            break;
          }
          default:
            pdfBytes = await srcDoc.save();
        }

        const suffix = op === 'rotate' ? '-rotated' : `-${op}`;
        return { name: file.name.replace(/\.pdf$/i, `${suffix}.pdf`), blob: new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }) };
      }}
      configFields={
        <div className="space-y-3">
          {opLabel && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-ink)]/10 border border-[var(--accent)]/20 rounded-[var(--radius-lg)] w-fit">
              <span className="text-xs font-semibold text-[var(--accent)]">{opLabel}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[var(--text-secondary)] w-24">Operation</label>
            <select aria-label="Operation" name="op" defaultValue={currentOp} className="flex-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              {OPERATIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Rotate config */}
          {currentOp === 'rotate' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] w-24">Degrees</label>
              <select aria-label="Degrees" name="degrees" defaultValue="90" className="flex-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
                <option value="90">90° clockwise</option>
                <option value="-90">90° counter-clockwise</option>
                <option value="180">180°</option>
                <option value="-180">180° (flipped)</option>
                <option value="270">270°</option>
              </select>
            </div>
          )}

          {/* Protect config */}
          {currentOp === 'protect' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] w-24">User Password</label>
                <input aria-label="User Password" name="userPassword" type="password" placeholder="Optional" className="flex-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] w-24">Owner Password</label>
                <input aria-label="Owner Password" name="ownerPassword" type="password" placeholder="Required" className="flex-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
              </div>
            </>
          )}

          {/* Unlock config */}
          {currentOp === 'unlock' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] w-24">Password</label>
              <input aria-label="Password" name="password" type="password" placeholder="Enter document password" className="flex-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
            </div>
          )}

          {/* Remove pages config */}
          {currentOp === 'remove-pages' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] w-24">Page Range</label>
              <input aria-label="Page Range" name="range" placeholder="e.g. 1-3, 5, 7-9" className="flex-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
            </div>
          )}

          {/* Split config */}
          {currentOp === 'split' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] w-24">Pages Per File</label>
              <input aria-label="Pages Per File" name="pagesPerFile" type="number" min="1" defaultValue="1" className="flex-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
            </div>
          )}

          {/* Watermark config */}
          {currentOp === 'watermark' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] w-24">Text</label>
              <input aria-label="Text" name="watermarkText" placeholder="WATERMARK" className="flex-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
            </div>
          )}

          {/* Crop config */}
          {currentOp === 'crop' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">Top (pts)</label>
                <input aria-label="Top (pts)" name="cropTop" type="number" min="0" defaultValue="0" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">Right (pts)</label>
                <input aria-label="Right (pts)" name="cropRight" type="number" min="0" defaultValue="0" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">Bottom (pts)</label>
                <input aria-label="Bottom (pts)" name="cropBottom" type="number" min="0" defaultValue="0" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">Left (pts)</label>
                <input aria-label="Left (pts)" name="cropLeft" type="number" min="0" defaultValue="0" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
              </div>
            </div>
          )}

          {/* Resize config */}
          {currentOp === 'resize' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">Width (pts)</label>
                <input aria-label="Width (pts)" name="resizeWidth" type="number" min="10" defaultValue="595" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">Height (pts)</label>
                <input aria-label="Height (pts)" name="resizeHeight" type="number" min="10" defaultValue="842" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
              </div>
            </div>
          )}

          {/* Flatten — no config needed */}
          {currentOp === 'flatten' && (
            <p className="text-xs text-[var(--text-muted)]">Flattens all form fields and annotations in each PDF. No configuration needed.</p>
          )}
        </div>
      }
      defaultConfig={merged}
    />
  );
}

function parseRangeToIndices(input: string, max: number): number[] {
  const ranges = input.split(',').map(s => s.trim()).filter(Boolean);
  const indices: number[] = [];
  for (const r of ranges) {
    if (r.includes('-')) {
      const [a = 0, b = 0] = r.split('-').map(Number);
      const start = Math.max(1, Math.min(a, b));
      const end = Math.min(max, Math.max(a, b));
      for (let i = start; i <= end; i++) indices.push(i - 1);
    } else {
      const n = Number(r);
      if (!isNaN(n) && n >= 1 && n <= max) indices.push(n - 1);
    }
  }
  return [...new Set(indices)];
}