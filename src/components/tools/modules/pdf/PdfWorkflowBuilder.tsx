"use client";
import React, { useState, useCallback, useRef } from 'react';
import { useRovingTabs } from "@/components/useRovingTabs";
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup } from 'pdf-lib';
import {
  FileText, Shuffle, Scissors,
  PenSquare, Info, Trash2,
  RotateCw, ChevronUp, ChevronDown, FileUp,
  Zap
} from 'lucide-react';
import { getErrorMessage } from '@/utils/error';
import { gateBatchDownload } from '@/utils/freeUsageGuard';

type PdfTab = 'merge' | 'split' | 'fill' | 'pages' | 'optimize' | 'metadata';

const TABS: { id: PdfTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'merge', label: 'Merge', icon: <Shuffle size={15} />, desc: 'Combine PDFs into one file' },
  { id: 'split', label: 'Split', icon: <Scissors size={15} />, desc: 'Extract pages into a new PDF' },
  { id: 'fill', label: 'Fill Forms', icon: <PenSquare size={15} />, desc: 'Fill form fields and flatten' },
  { id: 'pages', label: 'Page Tools', icon: <FileText size={15} />, desc: 'Rotate, extract, or delete pages' },
  { id: 'optimize', label: 'Optimize', icon: <Zap size={15} />, desc: 'Reduce file size, strip unused data' },
  { id: 'metadata', label: 'Metadata', icon: <Info size={15} />, desc: 'Edit title, author, and more' },
];

const inputCls = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)] text-[var(--text-primary)]";
const btnCls = "px-4 py-2 bg-[var(--accent-ink)] hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const btnSec = "px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg text-sm transition-colors disabled:opacity-50";
const fileRowCls = "flex items-center gap-2 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm";

interface MergeFile { name: string; buffer: ArrayBuffer; id: string; }
interface FormField { name: string; value: string; }

function uid(): string { return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; }

function parseRanges(input: string): [number, number][] {
  return input.split(',').map(s => s.trim()).filter(Boolean).map(p => {
    if (p.includes('-')) { const [a, b] = p.split('-').map(Number); return [a, b] as [number, number]; }
    const n = Number(p); return [n, n] as [number, number];
  }).filter(([a, b]) => !isNaN(a) && !isNaN(b) && a >= 1 && b >= a);
}

function rangeToPageIndices(ranges: [number, number][], max: number): number[] {
  const s = new Set<number>();
  ranges.forEach(([start, end]) => { for (let i = start; i <= Math.min(end, max); i++) s.add(i); });
  return [...s].sort((a, b) => a - b).map(n => n - 1);
}

export function PdfWorkflowBuilder() {
  const [activeTab, setActiveTab] = useState<PdfTab>('merge');
  const flowTabs = useRovingTabs(
    TABS.map((t) => t.id),
    activeTab,
    (id) => { setActiveTab(id); setError(''); setSuccess(''); },
    "data-flow-tab",
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const mergeRef = useRef<HTMLInputElement>(null);
  const splitRef = useRef<HTMLInputElement>(null);
  const fillRef = useRef<HTMLInputElement>(null);
  const pagesRef = useRef<HTMLInputElement>(null);
  const metaRef = useRef<HTMLInputElement>(null);

  const [mergeFiles, setMergeFiles] = useState<MergeFile[]>([]);
  const [splitFile, setSplitFile] = useState<MergeFile | null>(null);
  const [splitRanges, setSplitRanges] = useState('');
  const [fillFile, setFillFile] = useState<ArrayBuffer | null>(null);
  const [fillFileName, setFillFileName] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [pagesFile, setPagesFile] = useState<ArrayBuffer | null>(null);
  const [pagesFileName, setPagesFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rotateAngle, setRotateAngle] = useState<'90' | '180' | '270'>('90');
  const [pageMode, setPageMode] = useState<'rotate' | 'extract' | 'delete'>('rotate');
  const [metaFile, setMetaFile] = useState<ArrayBuffer | null>(null);
  const [metaFileName, setMetaFileName] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaSubject, setMetaSubject] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  const readFile = useCallback((file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as ArrayBuffer);
      r.onerror = () => reject(new Error('Failed to read file'));
      r.readAsArrayBuffer(file);
    });
  }, []);

  const download = useCallback(async (data: Uint8Array | ArrayBuffer, name: string) => {
    const raw = data instanceof ArrayBuffer ? data : new Uint8Array(data).buffer;
    // Quota gate (Pro tool: anon blocked, signed 2/day) — checked before saving.
    if (!(await gateBatchDownload(1, raw.byteLength / (1024 * 1024)))) return;
    const blob = new Blob([raw], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, []);

  const showError = useCallback((msg: string) => { setError(msg); setSuccess(''); }, []);
  const showSuccess = useCallback((msg: string) => { setSuccess(msg); setError(''); }, []);

  const handleMergeUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const entries: MergeFile[] = [];
    for (let i = 0; i < files.length; i++) {
      entries.push({ name: files[i]!.name, buffer: await readFile(files[i]!), id: uid() });
    }
    setMergeFiles(p => [...p, ...entries]);
    e.target.value = '';
  }, [readFile]);

  const removeMergeFile = useCallback((id: string) => {
    setMergeFiles(p => p.filter(f => f.id !== id));
  }, []);

  const moveMergeFile = useCallback((index: number, dir: -1 | 1) => {
    setMergeFiles(prev => {
      const a = [...prev];
      const t = index + dir;
      if (t < 0 || t >= a.length) return a;
      [a[index], a[t]] = [a[t]!, a[index]!];
      return a;
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (mergeFiles.length < 2) { showError('Select at least 2 PDFs'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const merged = await PDFDocument.create();
      for (const f of mergeFiles) {
        const doc = await PDFDocument.load(f.buffer);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      download(await merged.save(), 'merged.pdf');
      showSuccess(`Merged ${mergeFiles.length} PDFs (${merged.getPageCount()} pages)`);
    } catch (err: unknown) { showError(getErrorMessage(err, 'Merge failed')); }
    finally { setLoading(false); }
  }, [mergeFiles, download, showError, showSuccess]);

  const handleSplitUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await readFile(file);
      const doc = await PDFDocument.load(buf);
      setSplitFile({ name: file.name, buffer: buf, id: uid() });
      setSplitRanges(`1-${doc.getPageCount()}`);
    } catch { showError('Invalid PDF'); }
    e.target.value = '';
  }, [readFile, showError]);

  const handleSplit = useCallback(async () => {
    if (!splitFile) { showError('Upload a PDF first'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const doc = await PDFDocument.load(splitFile.buffer);
      const ranges = parseRanges(splitRanges);
      const indices = rangeToPageIndices(ranges, doc.getPageCount());
      if (!indices.length) { showError('No valid page ranges'); setLoading(false); return; }
      const newDoc = await PDFDocument.create();
      (await newDoc.copyPages(doc, indices)).forEach(p => newDoc.addPage(p));
      download(await newDoc.save(), splitFile.name.replace(/\.pdf$/i, '_extracted.pdf'));
      showSuccess(`Extracted ${indices.length} of ${doc.getPageCount()} pages`);
    } catch (err: unknown) { showError(getErrorMessage(err, 'Split failed')); }
    finally { setLoading(false); }
  }, [splitFile, splitRanges, download, showError, showSuccess]);

  const handleFillUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await readFile(file);
      const doc = await PDFDocument.load(buf);
      const fields = doc.getForm().getFields();
      setFillFile(buf);
      setFillFileName(file.name);
      setFormFields(fields.map(f => ({ name: f.getName(), value: '' })));
    } catch { showError('No form fields found or invalid PDF'); }
    e.target.value = '';
  }, [readFile, showError]);

  const updateFormField = useCallback((i: number, v: string) => {
    setFormFields(p => p.map((f, idx) => idx === i ? { ...f, value: v } : f));
  }, []);

  const handleFill = useCallback(async () => {
    if (!fillFile) { showError('Upload a PDF form first'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const doc = await PDFDocument.load(fillFile);
      const fields = doc.getForm().getFields();
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i]; const v = formFields[i]?.value || '';
        if (f instanceof PDFTextField) f.setText(v);
        else if (f instanceof PDFCheckBox) v.toLowerCase() === 'yes' || v === 'true' || v === '1' ? f.check() : f.uncheck();
        else if (f instanceof PDFDropdown || f instanceof PDFOptionList) { if (v) f.select(v); }
        else if (f instanceof PDFRadioGroup) { if (v) f.select(v); }
      }
      doc.getForm().flatten();
      download(await doc.save(), `filled_${fillFileName}`);
      showSuccess(`Filled ${fields.length} form field(s)`);
    } catch (err: unknown) { showError(getErrorMessage(err, 'Fill failed')); }
    finally { setLoading(false); }
  }, [fillFile, formFields, fillFileName, download, showError, showSuccess]);

  const handlePagesUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await readFile(file);
      const doc = await PDFDocument.load(buf);
      const count = doc.getPageCount();
      setPagesFile(buf);
      setPagesFileName(file.name);
      setPageCount(count);
      setSelectedPages([]);
    } catch { showError('Invalid PDF'); }
    e.target.value = '';
  }, [readFile, showError]);

  const togglePage = useCallback((n: number) => {
    setSelectedPages(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n]);
  }, []);

  const toggleAllPages = useCallback(() => {
    setSelectedPages(p => p.length === pageCount ? [] : Array.from({ length: pageCount }, (_, i) => i + 1));
  }, [pageCount]);

  const handlePageAction = useCallback(async () => {
    if (!pagesFile) { showError('Upload a PDF first'); return; }
    if (!selectedPages.length) { showError('Select at least one page'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const doc = await PDFDocument.load(pagesFile);
      const indices = selectedPages.map(n => n - 1);
      if (pageMode === 'delete') {
        const keep = Array.from({ length: pageCount }, (_, i) => i).filter(i => !indices.includes(i));
        const newDoc = await PDFDocument.create();
        (await newDoc.copyPages(doc, keep)).forEach(p => newDoc.addPage(p));
        download(await newDoc.save(), `deleted_${pagesFileName}`);
        showSuccess(`Deleted ${indices.length} page(s)`);
      } else if (pageMode === 'extract') {
        const newDoc = await PDFDocument.create();
        (await newDoc.copyPages(doc, indices)).forEach(p => newDoc.addPage(p));
        download(await newDoc.save(), pagesFileName.replace(/\.pdf$/i, '_extracted.pdf'));
        showSuccess(`Extracted ${indices.length} page(s)`);
      } else {
        const angle = parseInt(rotateAngle);
        indices.forEach(i => {
          const p = doc.getPage(i);
          p.setRotation({ ...p.getRotation(), angle: (p.getRotation().angle + angle) % 360 });
        });
        download(await doc.save(), `rotated_${pagesFileName}`);
        showSuccess(`Rotated ${indices.length} page(s) by ${angle}°`);
      }
    } catch (err: unknown) { showError(getErrorMessage(err, 'Page operation failed')); }
    finally { setLoading(false); }
  }, [pagesFile, selectedPages, pageCount, pageMode, rotateAngle, pagesFileName, download, showError, showSuccess]);

  const handleMetaUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await readFile(file);
      const doc = await PDFDocument.load(buf);
      setMetaFile(buf);
      setMetaFileName(file.name);
      setMetaTitle(doc.getTitle() || '');
      setMetaAuthor(doc.getAuthor() || '');
      setMetaSubject(doc.getSubject() || '');
      setMetaKeywords(doc.getKeywords() || '');
    } catch { showError('Invalid PDF'); }
    e.target.value = '';
  }, [readFile, showError]);

  const handleMetaSave = useCallback(async () => {
    if (!metaFile) { showError('Upload a PDF first'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const doc = await PDFDocument.load(metaFile);
      doc.setTitle(metaTitle); doc.setAuthor(metaAuthor);
      doc.setSubject(metaSubject); doc.setKeywords(metaKeywords.split(',').map(s => s.trim()).filter(Boolean));
      download(await doc.save(), `updated_${metaFileName}`);
      showSuccess('Metadata updated');
    } catch (err: unknown) { showError(getErrorMessage(err, 'Metadata update failed')); }
    finally { setLoading(false); }
  }, [metaFile, metaTitle, metaAuthor, metaSubject, metaKeywords, metaFileName, download, showError, showSuccess]);

  const [optimizeResult, setOptimizeResult] = useState('');
  const optimizeRef = useRef<HTMLInputElement>(null);
  const handleOptimize = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(''); setSuccess(''); setOptimizeResult('');
    try {
      const buf = await readFile(file);
      const doc = await PDFDocument.load(buf);
      const before = file.size;
      const bytes = await doc.save();
      const after = bytes.length;
      download(bytes, `optimized_${file.name}`);
      const saved = before - after;
      setOptimizeResult(`${(before / 1024).toFixed(1)} KB → ${(after / 1024).toFixed(1)} KB (${((saved / before) * 100).toFixed(1)}% smaller)`);
      showSuccess(`Optimized ${file.name}`);
    } catch (err: unknown) { showError(getErrorMessage(err, 'Optimization failed')); }
    finally { setLoading(false); }
    e.target.value = '';
  }, [readFile, download, showError, showSuccess]);

  function dropZone(label: string, onClick: () => void) {
    return (
      <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }} className="border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-8 text-center cursor-pointer hover:border-[var(--accent)]/50 transition-colors">
        <FileUp size={32} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
        <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">PDF files only</p>
      </div>
    );
  }

  function fileBar(name: string, onChange: () => void) {
    return (
      <div className={fileRowCls}>
        <FileText size={15} className="text-[var(--accent)] shrink-0" />
        <span className="flex-1 truncate">{name}</span>
        <button onClick={onChange} className="text-xs text-[var(--accent)] hover:underline shrink-0">Change</button>
      </div>
    );
  }

  function tabBtn<T extends string>(mode: T, current: string, setter: (v: T) => void, children: React.ReactNode) {
    return (
      <button onClick={() => setter(mode)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === current ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
        {children}
      </button>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      <div className="flex min-h-[500px]">
        <div className="w-48 shrink-0 border-r border-[var(--border-subtle)] p-2 space-y-1" role="tablist" aria-orientation="vertical" aria-label="PDF workflow steps" onKeyDown={flowTabs.onKeyDown}>
          {TABS.map(t => (
            <button key={t.id} role="tab" {...flowTabs.tabProps(t.id)} aria-selected={activeTab === t.id} onClick={() => { setActiveTab(t.id); setError(''); setSuccess(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${activeTab === t.id ? 'bg-[var(--accent-ink)]/20 text-[var(--accent)] border border-[var(--accent)]/30' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] border border-transparent'}`}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4" role="tabpanel" aria-label="PDF workflow step">
          {error && <div role="alert" className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-700 dark:text-red-400">{error}</div>}
          {success && <div role="status" className="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg text-sm text-[var(--accent)]">{success}</div>}

          {activeTab === 'merge' && (
            <>
              <h3 className="text-lg font-semibold">Merge PDFs</h3>
              <p className="text-sm text-[var(--text-tertiary)]">Upload multiple PDFs and combine them into one file.</p>
              <input aria-label="Upload multiple PDFs and combine them into one file." ref={mergeRef} type="file" accept=".pdf" multiple onChange={handleMergeUpload} className="hidden" />
              {dropZone('Click to select PDF files', () => mergeRef.current?.click())}
              {mergeFiles.length > 0 && (
                <div className="space-y-1.5">
                  {mergeFiles.map((f, i) => (
                    <div key={f.id} className={fileRowCls}>
                      <FileText size={15} className="text-[var(--accent)] shrink-0" />
                      <span className="flex-1 truncate">{f.name}</span>
                      <button onClick={() => moveMergeFile(i, -1)} disabled={i === 0} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30" aria-label="Move file up"><ChevronUp size={15} /></button>
                      <button onClick={() => moveMergeFile(i, 1)} disabled={i === mergeFiles.length - 1} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30" aria-label="Move file down"><ChevronDown size={15} /></button>
                      <button onClick={() => removeMergeFile(f.id)} className="p-1 text-[var(--text-tertiary)] hover:text-red-700 dark:hover:text-red-400" aria-label="Remove file"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              {mergeFiles.length >= 2 && (
                <button onClick={handleMerge} disabled={loading} className={btnCls}>{loading ? 'Merging...' : `Merge ${mergeFiles.length} Files`}</button>
              )}
            </>
          )}

          {activeTab === 'split' && (
            <>
              <h3 className="text-lg font-semibold">Split PDF</h3>
              <p className="text-sm text-[var(--text-tertiary)]">Extract specific pages or ranges into a new PDF.</p>
              <input aria-label="Extract specific pages or ranges into a new PDF." ref={splitRef} type="file" accept=".pdf" onChange={handleSplitUpload} className="hidden" />
              {!splitFile ? dropZone('Click to select a PDF', () => splitRef.current?.click()) : fileBar(splitFile.name, () => { setSplitFile(null); setSplitRanges(''); })}
              {splitFile && (
                <>
                  <div>
                    <label htmlFor="lbl-pdfworkflowbuilder-page-ranges-e-g-1-3-5-7-9" className="block text-xs font-medium mb-1 text-[var(--text-tertiary)]">Page ranges (e.g. 1-3, 5, 7-9)</label>
                    <input id="lbl-pdfworkflowbuilder-page-ranges-e-g-1-3-5-7-9" aria-label="Page ranges (e.g. 1-3, 5, 7-9)" className={inputCls} value={splitRanges} onChange={e => setSplitRanges(e.target.value)} placeholder="1-3, 5, 7-9" />
                  </div>
                  <button onClick={handleSplit} disabled={loading} className={btnCls}>{loading ? 'Extracting...' : 'Extract Pages'}</button>
                </>
              )}
            </>
          )}

          {activeTab === 'fill' && (
            <>
              <h3 className="text-lg font-semibold">Fill PDF Form</h3>
              <p className="text-sm text-[var(--text-tertiary)]">Upload a PDF form, fill the fields, and download a flattened copy.</p>
              <input aria-label="Upload a PDF form, fill the fields, and download a flattened copy." ref={fillRef} type="file" accept=".pdf" onChange={handleFillUpload} className="hidden" />
              {!fillFile ? dropZone('Click to select a PDF form', () => fillRef.current?.click()) : fileBar(fillFileName, () => { setFillFile(null); setFillFileName(''); setFormFields([]); })}
              {formFields.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-[var(--text-tertiary)]">{formFields.length} field(s) detected</div>
                  {formFields.map((f, i) => (
                    <div key={f.name} className="flex gap-2 items-center">
                      <span className="text-xs text-[var(--text-secondary)] w-1/3 truncate font-mono" title={f.name}>{f.name}</span>
                      <input aria-label="Field value" className={`${inputCls} flex-1`} value={f.value} onChange={e => updateFormField(i, e.target.value)} placeholder="Value" />
                    </div>
                  ))}
                  <button onClick={handleFill} disabled={loading} className={btnCls}>{loading ? 'Filling...' : 'Fill & Download'}</button>
                </div>
              )}
              {fillFile && formFields.length === 0 && <p className="text-sm text-[var(--accent)]">No interactive form fields detected in this PDF.</p>}
            </>
          )}

          {activeTab === 'pages' && (
            <>
              <h3 className="text-lg font-semibold">Page Tools</h3>
              <p className="text-sm text-[var(--text-tertiary)]">Rotate, extract, or delete pages from your PDF.</p>
              <div className="flex gap-2">
                {(['rotate', 'extract', 'delete'] as const).map(m => tabBtn(m, pageMode, setPageMode, m === 'rotate' ? <><RotateCw size={13} className="inline mr-1" />Rotate</> : m === 'extract' ? 'Extract' : 'Delete'))}
              </div>
              <input aria-label="Rotate" ref={pagesRef} type="file" accept=".pdf" onChange={handlePagesUpload} className="hidden" />
              {!pagesFile ? dropZone('Click to select a PDF', () => pagesRef.current?.click()) : fileBar(pagesFileName, () => { setPagesFile(null); setPagesFileName(''); setPageCount(0); setSelectedPages([]); })}
              {pageCount > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--text-tertiary)]">{pageCount} page(s) · {selectedPages.length} selected</span>
                    <button onClick={toggleAllPages} className="text-xs text-[var(--accent)] hover:underline">{selectedPages.length === pageCount ? 'Deselect all' : 'Select all'}</button>
                  </div>
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => togglePage(n)}
                        className={`h-9 rounded-lg text-xs font-medium transition-colors ${selectedPages.includes(n) ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}>{n}</button>
                    ))}
                  </div>
                  {pageMode === 'rotate' && (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-[var(--text-tertiary)]">Angle:</span>
                      {(['90', '180', '270'] as const).map(a => tabBtn(a, rotateAngle, setRotateAngle, `${a}°`))}
                    </div>
                  )}
                  <button onClick={handlePageAction} disabled={loading || !selectedPages.length} className={btnCls}>
                    {loading ? 'Processing...' : pageMode === 'rotate' ? `Rotate ${selectedPages.length} Page(s)` : pageMode === 'extract' ? 'Extract Selected' : 'Delete Selected'}
                  </button>
                </>
              )}
            </>
          )}

          {activeTab === 'optimize' && (
            <>
              <h3 className="text-lg font-semibold">Optimize PDF</h3>
              <p className="text-sm text-[var(--text-tertiary)]">Reduce file size by stripping unused data and re-saving efficiently.</p>
              <input aria-label="Reduce file size by stripping unused data and re-saving efficiently." ref={optimizeRef} type="file" accept=".pdf" onChange={handleOptimize} className="hidden" />
              {dropZone('Click to select a PDF to optimize', () => optimizeRef.current?.click())}
              {optimizeResult && <div className="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg text-sm text-[var(--accent)]">{optimizeResult}</div>}
            </>
          )}

          {activeTab === 'metadata' && (
            <>
              <h3 className="text-lg font-semibold">Edit Metadata</h3>
              <p className="text-sm text-[var(--text-tertiary)]">View and edit PDF document properties like title, author, and subject.</p>
              <input aria-label="View and edit PDF document properties like title, author, and subject." ref={metaRef} type="file" accept=".pdf" onChange={handleMetaUpload} className="hidden" />
              {!metaFile ? dropZone('Click to select a PDF', () => metaRef.current?.click()) : fileBar(metaFileName, () => { setMetaFile(null); setMetaFileName(''); })}
              {metaFile && (
                <div className="space-y-3">
                  {[{ l: 'Title', v: metaTitle, s: setMetaTitle }, { l: 'Author', v: metaAuthor, s: setMetaAuthor }, { l: 'Subject', v: metaSubject, s: setMetaSubject }, { l: 'Keywords', v: metaKeywords, s: setMetaKeywords }].map(({ l, v, s }) => (
                    <div key={l}>
                      <label className="block text-xs font-medium mb-1 text-[var(--text-tertiary)]">{l}</label>
                      <input className={inputCls} value={v} onChange={e => s(e.target.value)} placeholder={l} aria-label={l} />
                    </div>
                  ))}
                  <button onClick={handleMetaSave} disabled={loading} className={btnCls}>{loading ? 'Saving...' : 'Save & Download'}</button>
                </div>
              )}
            </>
          )}

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">
              <span className="text-[var(--accent)] font-bold">🔒 Privacy First</span> — All PDF processing happens in your browser. Files are never uploaded to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
