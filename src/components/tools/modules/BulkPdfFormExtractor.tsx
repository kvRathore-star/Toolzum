"use client";
import React from 'react';
import { BulkToolShell } from './BulkToolShell';

export default function BulkPdfFormExtractor() {
  return (
    <BulkToolShell
      toolSlug="bulk-pdf-form-extractor"
      title="Bulk PDF Form Extractor"
      description="Extract form field data from fillable PDFs into structured CSV. Audit-ready output."
      accept=".pdf"
      processFile={async (file) => {
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuf = await file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuf);
        const form = doc.getForm();
        const fields = form.getFields();
        const data: Record<string, string> = {};
        for (const field of fields) {
          const name = field.getName();
          try {
            if (field.constructor.name === 'PDFTextField') {
              data[name] = (field as unknown as { getText(): string }).getText() || '';
            } else if (field.constructor.name === 'PDFDropdown' || field.constructor.name === 'PDFOptionList') {
              data[name] = (field as unknown as { getSelected(): string[] }).getSelected().join(', ') || '';
            } else if (field.constructor.name === 'PDFCheckBox' || field.constructor.name === 'PDFRadioGroup') {
              data[name] = (field as unknown as { isSelected(): boolean }).isSelected() ? 'Yes' : 'No';
            }
          } catch (e) { data[name] = 'ERROR'; if (process.env.NODE_ENV !== 'production') console.warn('PDF form field extraction error:', e); }
        }
        const csv = Object.entries(data).map(([k, v]) => `"${k}","${v}"`).join('\n');
        return { name: file.name.replace(/\.pdf$/i, '-form-data.csv'), blob: new Blob([csv], { type: 'text/csv' }) };
      }}
    />
  );
}
