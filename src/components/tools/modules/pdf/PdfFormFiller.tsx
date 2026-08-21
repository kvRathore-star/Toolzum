"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { PDFDocument } from 'pdf-lib';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { createDownloadBlob } from '@/utils/blob';

interface FormFieldData {
  name: string;
  type: string;
  value: string;
}

export default function PdfFormFiller() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  
  const [fields, setFields] = useState<FormFieldData[]>([]);
  const [pdfBytesData, setPdfBytesData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = async (file: File) => {
    setPdfFile(file);
    setOutputUrl(null);
    setFields([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      setPdfBytesData(uint8Array);
      
      const pdfDoc = await PDFDocument.load(uint8Array);
      const form = pdfDoc.getForm();
      const rawFields = form.getFields();
      
      if (rawFields.length === 0) {
        toast.error("No interactive form fields found in this PDF.");
      }
      
      const parsedFields: FormFieldData[] = rawFields.map(field => {
        return {
          name: field.getName(),
          type: field.constructor.name,
          value: ''
        };
      });
      
      setFields(parsedFields);
    } catch (e) {
      console.error("Failed to parse PDF form", e);
      toast.error("Failed to parse PDF. It might be corrupted or encrypted.");
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFields(fields.map(f => f.name === name ? { ...f, value } : f));
  };

  const generateFilledPdf = async () => {
    if (!pdfBytesData) return;
    setIsProcessing(true);
    
    try {
      const pdfDoc = await PDFDocument.load(pdfBytesData);
      const form = pdfDoc.getForm();
      
      fields.forEach(f => {
        try {
          if (f.type.includes('TextField')) {
            const field = form.getTextField(f.name);
            field.setText(f.value);
          } else if (f.type.includes('CheckBox')) {
            const field = form.getCheckBox(f.name);
            if (f.value === 'true') field.check();
            else field.uncheck();
          } else if (f.type.includes('Dropdown')) {
            const field = form.getDropdown(f.name);
            field.select(f.value);
          }
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') console.warn(`Could not fill field ${f.name}`, e);
        }
      });
      
      const savedBytes = await pdfDoc.save();
      const blob = createDownloadBlob(savedBytes, 'application/pdf');
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      toast.success("PDF filled successfully!");
    } catch (e) {
      console.error("Failed to generate filled PDF", e);
      toast.error("Failed to fill PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pdfFile) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>100% Client-Side Filling:</strong> We extract and fill the AcroForm fields right in your browser. Highly secure for sensitive documents like Government Forms, W-9s, or NDAs.
        </div>
        <FileUploader 
          accept="application/pdf" 
          onFileSelect={handleFileSelect} 
          title="Upload Fillable PDF Form"
          subtitle="We will automatically detect interactive fields."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{pdfFile.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{fields.length} form fields detected</p>
        </div>
        <button 
          onClick={() => { setPdfFile(null); setFields([]); }}
          className="text-sm text-red-700 dark:text-red-400 hover:text-red-300 px-3 py-1 bg-red-400/10 rounded-lg"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl max-h-[600px] overflow-y-auto space-y-4">
          <h4 className="text-[var(--text-primary)] font-medium sticky top-0 bg-[var(--bg-elevated)] pb-2 z-10 border-b border-[var(--border-subtle)]">Fill Fields</h4>
          
          {fields.length === 0 ? (
            <div className="text-[var(--text-secondary)] py-8 text-center">
              No fillable fields detected in this PDF.<br/>
              It might be a flat PDF. Try using our eSign tool instead to add text manually.
            </div>
          ) : (
            fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-[var(--text-muted)] truncate block" title={field.name}>{field.name}</label>
                
                {field.type.includes('CheckBox') ? (
                  <select 
                    className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  >
                    <option value="">Unchecked</option>
                    <option value="true">Checked</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    placeholder={`Enter ${field.name}`}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl">
            <button 
              onClick={generateFilledPdf}
              disabled={isProcessing || fields.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Generate Filled PDF"}
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-700/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center">
              <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-4">PDF Generated Successfully!</h4>
              <button 
                onClick={() => downloadOrShare(outputUrl, `filled_${pdfFile.name}`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
