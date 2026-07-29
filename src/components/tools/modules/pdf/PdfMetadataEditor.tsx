"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';

export default function PdfMetadataEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: ''
  });
  
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
      
      setMetadata({
        title: pdfDoc.getTitle() || '',
        author: pdfDoc.getAuthor() || '',
        subject: pdfDoc.getSubject() || '',
        keywords: pdfDoc.getKeywords() || '',
        creator: pdfDoc.getCreator() || '',
        producer: pdfDoc.getProducer() || ''
      });
      
      setFileBuffer(arrayBuffer);
      setFile(selectedFile);
      setOutputUrl(null);
    } catch (e) {
      toast.error("Failed to load PDF. It might be encrypted or corrupted.");
    }
  };

  const clearAll = () => {
    setFile(null);
    setFileBuffer(null);
    setOutputUrl(null);
    setMetadata({ title: '', author: '', subject: '', keywords: '', creator: '', producer: '' });
  };

  const handleInputChange = (field: keyof typeof metadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const saveMetadata = async () => {
    if (!fileBuffer || !file) return;

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      if (metadata.title) pdfDoc.setTitle(metadata.title);
      if (metadata.author) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject) pdfDoc.setSubject(metadata.subject);
      if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      if (metadata.creator) pdfDoc.setCreator(metadata.creator);
      if (metadata.producer) pdfDoc.setProducer(metadata.producer);
      
      // Update modification date
      pdfDoc.setModificationDate(new Date());
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Metadata updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while saving metadata.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeAllMetadata = () => {
    setMetadata({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: ''
    });
    toast.success("Metadata cleared from form. Click 'Save' to apply.");
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Privacy Focused:</strong> Inspect and edit the hidden metadata attributes (Title, Author, Creator) in any PDF file directly in your browser.
        </div>
        <FileUploader 
          accept="application/pdf"
          onFileSelect={handleFileSelect} 
          title="Upload PDF"
          subtitle="Select document to view/edit metadata"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button 
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Editor */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
             <h4 className="text-[var(--text-primary)] font-medium">Metadata Editor</h4>
             <button onClick={removeAllMetadata} className="text-xs text-red-500 hover:text-red-400 font-bold">Clear All</button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Title</label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Author</label>
              <input
                type="text"
                value={metadata.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Subject</label>
              <input
                type="text"
                value={metadata.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Keywords</label>
              <input
                type="text"
                value={metadata.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="Comma separated"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Creator</label>
                 <input
                   type="text"
                   value={metadata.creator}
                   onChange={(e) => handleInputChange('creator', e.target.value)}
                   className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] text-sm"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Producer</label>
                 <input
                   type="text"
                   value={metadata.producer}
                   onChange={(e) => handleInputChange('producer', e.target.value)}
                   className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] text-sm"
                 />
               </div>
            </div>
          </div>

          <button 
            onClick={saveMetadata}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {isProcessing ? "Saving..." : "Save PDF Metadata"}
          </button>
        </div>

        {/* Right Col: Output */}
        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300 h-full flex flex-col justify-center">
               <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <h4 className="font-bold text-emerald-500">Document Updated</h4>
               </div>
               
               <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500 flex-1">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="font-bold text-center">metadata_updated_{file.name}</p>
               </div>

               <button 
                  onClick={() => downloadOrShare(outputUrl, `metadata_updated_${file.name}`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Updated Document
                </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center h-full min-h-[300px] text-[var(--text-muted)]">
               <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p>Updated PDF will appear here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
