"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/utils/error';
import { createDownloadBlob } from '@/utils/blob';
import { Download, FileText, RefreshCw, Sparkles, FileEdit, Grid, Presentation, FileImage, Code, BookOpen } from 'lucide-react';

type DocFormatPair = {
  slug: string;
  title: string;
  description: string;
  accept: string;
  uploadTitle: string;
  uploadSubtitle: string;
  actionLabel: string;
  successMessage: string;
  outputFileName: (name: string) => string;
  iconLabel: string;
};

const FORMAT_PAIRS: DocFormatPair[] = [
  { slug: 'word-to-pdf', title: 'Convert Word to PDF', description: 'Parse Word XML and render PDF outputs entirely locally.', accept: '.docx', uploadTitle: 'Upload Word Document (.docx)', uploadSubtitle: 'Supports standard .docx formatting and paragraphs', actionLabel: 'Convert to PDF', successMessage: 'Word file converted to PDF successfully!', outputFileName: (n) => `${n.replace('.docx', '')}.pdf`, iconLabel: 'DOCX' },
  { slug: 'pdf-to-word', title: 'Convert PDF to Word', description: 'Extract paragraphs, layouts, and lines directly into editable Word documents.', accept: 'application/pdf', uploadTitle: 'Upload PDF to convert to Word', uploadSubtitle: 'Supports text extraction into editable DOC formats', actionLabel: 'Convert to Word Document', successMessage: 'PDF converted to Word successfully!', outputFileName: (n) => `${n.replace('.pdf', '')}.doc`, iconLabel: 'PDF' },
  { slug: 'excel-to-pdf', title: 'Convert Sheet to PDF Table', description: 'Convert sheets (XLSX, XLS, CSV) into clean PDF tables locally.', accept: '.xlsx,.xls,.csv', uploadTitle: 'Upload Spreadsheet (.xlsx, .xls, .csv)', uploadSubtitle: 'Converts grid sheets to landscape PDF layouts', actionLabel: 'Convert to PDF Document', successMessage: 'Spreadsheet converted to PDF successfully!', outputFileName: (n) => `${n.replace(/\.[^/.]+$/, "")}.pdf`, iconLabel: 'XLSX' },
  { slug: 'pdf-to-excel', title: 'Convert PDF to Excel', description: 'Parse layout rows and columns from PDF text into editable Excel sheets.', accept: 'application/pdf', uploadTitle: 'Upload PDF to convert to Excel', uploadSubtitle: 'Extract structured table data into XLSX sheets', actionLabel: 'Convert to Excel Sheet', successMessage: 'PDF tables exported to Excel successfully!', outputFileName: (n) => `${n.replace('.pdf', '')}.xlsx`, iconLabel: 'PDF' },
  { slug: 'ppt-to-pdf', title: 'Convert PPTX to PDF Slides', description: 'Compile PowerPoint presentation slide structures into standard PDF sheets.', accept: '.pptx', uploadTitle: 'Upload PowerPoint File (.pptx)', uploadSubtitle: 'Converts slide texts to landscape PDF layouts', actionLabel: 'Convert to PDF', successMessage: 'PowerPoint slides converted to PDF successfully!', outputFileName: (n) => `${n.replace('.pptx', '')}.pdf`, iconLabel: 'PPTX' },
  { slug: 'pdf-to-ppt', title: 'Convert PDF to PowerPoint', description: 'Render PDF pages into PowerPoint slide sheets offline.', accept: 'application/pdf', uploadTitle: 'Upload PDF to convert to PPT', uploadSubtitle: 'Converts pages to 16:9 widescreen slides', actionLabel: 'Convert to PowerPoint', successMessage: 'PDF converted to PowerPoint successfully!', outputFileName: (n) => `${n.replace('.pdf', '')}.pptx`, iconLabel: 'PDF' },
  { slug: 'jpg-to-pdf', title: 'Images to PDF', description: 'Convert one or more JPG/PNG images into a single PDF document.', accept: 'image/jpeg,image/png,image/webp', uploadTitle: 'Add Image', uploadSubtitle: 'Click or drop a file', actionLabel: 'Generate PDF', successMessage: 'PDF generated successfully!', outputFileName: () => `converted_document_${Date.now()}.pdf`, iconLabel: 'JPG' },
  { slug: 'pdf-to-jpg', title: 'Convert PDF to JPG', description: 'Render PDF pages directly into high-resolution JPEGs.', accept: 'application/pdf', uploadTitle: 'Upload PDF to convert to JPG', uploadSubtitle: 'Converts pages to high-resolution JPEGs', actionLabel: 'Convert to JPG ZIP', successMessage: 'PDF pages converted to JPG successfully!', outputFileName: (n) => `pages_jpg_${n.replace('.pdf', '')}.zip`, iconLabel: 'PDF' },
  { slug: 'html-to-pdf', title: 'Convert HTML to PDF', description: 'Convert HTML markup to clean PDF documents entirely in your browser.', accept: '.html,.htm', uploadTitle: 'Upload HTML file', uploadSubtitle: 'Convert HTML to PDF', actionLabel: 'Convert to PDF', successMessage: 'HTML converted to PDF successfully!', outputFileName: (n) => `${n}.pdf`, iconLabel: 'HTML' },
  { slug: 'pdf-to-html', title: 'Convert PDF to HTML', description: 'Extract text from PDF pages and generate a clean, responsive HTML document.', accept: 'application/pdf', uploadTitle: 'Upload PDF to convert to HTML', uploadSubtitle: 'Extracts text content as semantic HTML5', actionLabel: 'Convert to HTML', successMessage: 'PDF converted to HTML successfully!', outputFileName: (n) => `${n.replace('.pdf', '')}.html`, iconLabel: 'PDF' },
  { slug: 'epub-to-pdf', title: 'Convert EPUB to PDF', description: 'Parse EPUB book chapters and flow text into formatted PDF sheets.', accept: '.epub', uploadTitle: 'Upload Ebook (.epub)', uploadSubtitle: 'Reads metadata, manifest spine, and text elements', actionLabel: 'Convert to PDF', successMessage: 'Ebook converted to PDF successfully!', outputFileName: (n) => `${n.replace('.epub', '')}.pdf`, iconLabel: 'EPUB' },
  { slug: 'pdf-to-epub', title: 'Convert PDF to EPUB', description: 'Extract PDF text pages and compile them into structured EPUB Ebooks.', accept: 'application/pdf', uploadTitle: 'Upload PDF to convert to EPUB', uploadSubtitle: 'Compiles pages as individual XHTML e-chapters', actionLabel: 'Convert to EPUB', successMessage: 'PDF converted to EPUB successfully!', outputFileName: (n) => `${n.replace('.pdf', '')}.epub`, iconLabel: 'PDF' },
  { slug: 'heic-to-pdf', title: 'HEIC to PDF', description: 'Convert iPhone HEIC/HEIF photos to PDF for document submission.', accept: '.heic,.heif', uploadTitle: 'Upload HEIC/HEIF', uploadSubtitle: 'Convert to PDF', actionLabel: 'Convert to PDF', successMessage: 'HEIC to PDF done!', outputFileName: (n) => `${n.replace(/\.(heic|heif)$/i, '.pdf')}`, iconLabel: 'HEIC' },
];

type FormatDef = {
  key: string;
  label: string;
  ext: string;
  accept: string;
};

const FORMATS: Record<string, FormatDef> = {
  pdf: { key: 'pdf', label: 'PDF', ext: '.pdf', accept: 'application/pdf' },
  word: { key: 'word', label: 'Word', ext: '.docx', accept: '.docx' },
  excel: { key: 'excel', label: 'Excel', ext: '.xlsx', accept: '.xlsx,.xls,.csv' },
  ppt: { key: 'ppt', label: 'PowerPoint', ext: '.pptx', accept: '.pptx' },
  jpg: { key: 'jpg', label: 'Image', ext: '.jpg/.png/.webp', accept: 'image/jpeg,image/png,image/webp' },
  html: { key: 'html', label: 'HTML', ext: '.html', accept: '.html,.htm' },
  epub: { key: 'epub', label: 'EPUB', ext: '.epub', accept: '.epub' },
  heic: { key: 'heic', label: 'HEIC', ext: '.heic', accept: '.heic,.heif' },
};

const FORMAT_KEYS = Object.keys(FORMATS);

const VALID_OUTPUTS: Record<string, string[]> = {
  word: ['pdf'],
  pdf: ['word', 'excel', 'ppt', 'jpg', 'html', 'epub'],
  excel: ['pdf'],
  ppt: ['pdf'],
  jpg: ['pdf'],
  html: ['pdf'],
  epub: ['pdf'],
  heic: ['pdf'],
};

function resolveSlug(input: string, output: string): string {
  return `${input}-to-${output}`;
}

const RELATED: Record<string, string[]> = {
  'word-to-pdf': ['pdf-to-word', 'excel-to-pdf', 'ppt-to-pdf'],
  'pdf-to-word': ['word-to-pdf', 'pdf-to-excel', 'pdf-to-ppt'],
  'excel-to-pdf': ['pdf-to-excel', 'word-to-pdf', 'jpg-to-pdf'],
  'pdf-to-excel': ['excel-to-pdf', 'pdf-to-word', 'pdf-to-html'],
  'ppt-to-pdf': ['pdf-to-ppt', 'word-to-pdf', 'pdf-to-jpg'],
  'pdf-to-ppt': ['ppt-to-pdf', 'pdf-to-word', 'pdf-to-jpg'],
  'jpg-to-pdf': ['pdf-to-jpg', 'heic-to-pdf', 'word-to-pdf'],
  'pdf-to-jpg': ['jpg-to-pdf', 'pdf-to-ppt', 'pdf-to-html'],
  'html-to-pdf': ['pdf-to-html', 'word-to-pdf', 'epub-to-pdf'],
  'pdf-to-html': ['html-to-pdf', 'pdf-to-word', 'pdf-to-epub'],
  'epub-to-pdf': ['pdf-to-epub', 'html-to-pdf', 'word-to-pdf'],
  'pdf-to-epub': ['epub-to-pdf', 'pdf-to-html', 'pdf-to-word'],
  'heic-to-pdf': ['jpg-to-pdf', 'pdf-to-jpg'],
};

type DocumentFormatConverterProps = { slug: string };

export default function DocumentFormatConverter({ slug }: DocumentFormatConverterProps) {
  const initialSlug = useMemo(() => {
    const p = FORMAT_PAIRS.find(p => p.slug === slug);
    return p ? p.slug : 'pdf-to-word';
  }, [slug]);

  const [inputKey, setInputKey] = useState<string>(initialSlug.split('-to-')[0]);
  const [outputKey, setOutputKey] = useState<string>(initialSlug.split('-to-')[1]);
  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const resolvedSlug = useMemo(() => resolveSlug(inputKey, outputKey), [inputKey, outputKey]);
  const pair = useMemo(() => FORMAT_PAIRS.find(p => p.slug === resolvedSlug) || FORMAT_PAIRS[0], [resolvedSlug]);

  const handleFormatChange = (role: "input" | "output", value: string) => {
    if (role === "input") setInputKey(value);
    else setOutputKey(value);
    setFile(null);
    setOutputUrl(null);
    setProgress(0);
  };

  const swapFormats = () => {
    setInputKey(outputKey);
    setOutputKey(inputKey);
    setFile(null);
    setOutputUrl(null);
    setProgress(0);
  };

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOutputUrl(null);
    setProgress(0);
  };

  const clearAll = () => {
    setFile(null);
    setOutputUrl(null);
    setProgress(0);
  };

  const convertDoc = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(10);
    setStatusText('Processing...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      let blob: Blob | null = null;

      switch (resolvedSlug) {
        case 'word-to-pdf': {
          setStatusText('Reading Word file structure...');
          const JSZip = (await import('jszip')).default;
          const { jsPDF } = await import('jspdf');
          const zip = await JSZip.loadAsync(arrayBuffer);
          const docXmlFile = zip.file('word/document.xml');
          if (!docXmlFile) throw new Error('Invalid .docx file.');
          const docXmlText = await docXmlFile.async('text');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(docXmlText, 'text/xml');
          const paragraphs = xmlDoc.getElementsByTagName('w:p');
          const extracted: string[] = [];
          for (let i = 0; i < paragraphs.length; i++) {
            const textRuns = paragraphs[i].getElementsByTagName('w:t');
            let text = '';
            for (let j = 0; j < textRuns.length; j++) text += textRuns[j].textContent || '';
            extracted.push(text.trim());
          }
          setProgress(75);
          setStatusText('Generating PDF...');
          const doc = new jsPDF();
          let y = 20;
          const margin = 20;
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const maxWidth = pageWidth - margin * 2;
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(11);
          extracted.forEach(text => {
            if (!text) { y += 5; return; }
            const splitText = doc.splitTextToSize(text, maxWidth);
            const blockHeight = splitText.length * 6;
            if (y + blockHeight > pageHeight - margin) { doc.addPage(); y = 20; }
            doc.text(splitText, margin, y);
            y += blockHeight + 6;
          });
          blob = doc.output('blob');
          break;
        }
        case 'pdf-to-word': {
          setStatusText('Reading PDF pages...');
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const totalPages = pdf.numPages;
          let htmlContent = '';
          for (let i = 1; i <= totalPages; i++) {
            setStatusText(`Extracting page ${i} of ${totalPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const linesMap: Record<number, string[]> = {};
            textContent.items.forEach((item: any) => {
              const y = Math.round(item.transform[5]);
              if (!linesMap[y]) linesMap[y] = [];
              linesMap[y].push(item.str);
            });
            const sortedY = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
            let pageText = '';
            sortedY.forEach(y => {
              const lineStr = linesMap[y].join(' ').trim();
              if (lineStr) pageText += `<p style="margin:0 0 10px 0;font-family:Calibri,Arial,sans-serif;font-size:11pt;">${lineStr}</p>\n`;
            });
            if (i < totalPages) htmlContent += `<div class="page">${pageText}</div>\n<br clear="all" style="page-break-before:always" />\n`;
            else htmlContent += `<div class="page">${pageText}</div>\n`;
            setProgress(Math.round((i / totalPages) * 100));
          }
          const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Converted Document</title></head><body>${htmlContent}</body></html>`;
          blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
          break;
        }
        case 'excel-to-pdf': {
          setStatusText('Reading spreadsheet...');
          const XLSX = await import('xlsx');
          const { jsPDF } = await import('jspdf');
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (rawRows.length === 0) throw new Error('No data found.');
          setProgress(80);
          setStatusText('Building PDF grid...');
          const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
          const margin = 15, rowHeight = 8;
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const maxCols = Math.max(...rawRows.map(r => r.length));
          const colWidth = maxCols > 0 ? (pageWidth - margin * 2) / Math.min(maxCols, 8) : 30;
          let y = margin + 10;
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(14);
          doc.text(`Sheet: ${sheetName}`, margin, margin);
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          rawRows.forEach(row => {
            if (y + rowHeight > pageHeight - margin) { doc.addPage(); y = margin; }
            let x = margin;
            row.slice(0, 8).forEach((cell: any) => {
              doc.rect(x, y, colWidth, rowHeight);
              doc.text(String(cell ?? '').substring(0, 22), x + 2, y + 5.5);
              x += colWidth;
            });
            y += rowHeight;
          });
          blob = doc.output('blob');
          break;
        }
        case 'pdf-to-excel': {
          setStatusText('Parsing PDF tables...');
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const XLSX = await import('xlsx');
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const totalPages = pdf.numPages;
          const allRows: any[][] = [];
          for (let i = 1; i <= totalPages; i++) {
            setStatusText(`Analyzing page ${i} of ${totalPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const rowsMap: Record<number, { x: number; str: string; width: number }[]> = {};
            textContent.items.forEach((item: any) => {
              const y = Math.round(item.transform[5]);
              const x = Math.round(item.transform[4]);
              if (!rowsMap[y]) rowsMap[y] = [];
              rowsMap[y].push({ x, str: item.str, width: item.width || 0 });
            });
            const sortedY = Object.keys(rowsMap).map(Number).sort((a, b) => b - a);
            sortedY.forEach(y => {
              const items = rowsMap[y].sort((a, b) => a.x - b.x);
              const rowCells: string[] = [];
              let currentCell = '';
              let lastX = -999;
              items.forEach(item => {
                if (lastX !== -999 && item.x - lastX > 40) {
                  rowCells.push(currentCell.trim());
                  currentCell = item.str;
                } else {
                  currentCell += (currentCell ? ' ' : '') + item.str;
                }
                lastX = item.x + item.width;
              });
              if (currentCell) rowCells.push(currentCell.trim());
              if (rowCells.length > 0) allRows.push(rowCells);
            });
            setProgress(Math.round((i / totalPages) * 100));
          }
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet(allRows);
          XLSX.utils.book_append_sheet(wb, ws, 'PDF_Export');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          break;
        }
        case 'ppt-to-pdf': {
          setStatusText('Reading PowerPoint...');
          const JSZip = (await import('jszip')).default;
          const { jsPDF } = await import('jspdf');
          const zip = await JSZip.loadAsync(arrayBuffer);
          const slideFiles: { name: string; file: any }[] = [];
          zip.forEach((relativePath, fileObj) => {
            if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
              slideFiles.push({ name: relativePath, file: fileObj });
            }
          });
          if (slideFiles.length === 0) throw new Error('No slides found.');
          slideFiles.sort((a, b) => {
            const numA = parseInt(a.name.match(/\d+/)?.join('') || '0');
            return numA - parseInt(b.name.match(/\d+/)?.join('') || '0');
          });
          const slidesText: string[][] = [];
          for (let i = 0; i < slideFiles.length; i++) {
            setStatusText(`Extracting slide ${i + 1} of ${slideFiles.length}...`);
            const xmlText = await slideFiles[i].file.async('text');
            const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
            const textElements = xmlDoc.getElementsByTagName('a:t');
            const slideTexts: string[] = [];
            for (let j = 0; j < textElements.length; j++) {
              const t = textElements[j].textContent;
              if (t && t.trim()) slideTexts.push(t.trim());
            }
            slidesText.push(slideTexts);
            setProgress(40 + Math.round((i / slideFiles.length) * 40));
          }
          setStatusText('Compiling PDF...');
          const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 20;
          slidesText.forEach((slideLines, index) => {
            if (index > 0) doc.addPage();
            doc.setDrawColor(220, 220, 220);
            doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(79, 70, 229);
            doc.text(`Slide ${index + 1}`, margin, margin + 5);
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            let y = margin + 18;
            const lineSpacing = 6;
            const maxTextWidth = pageWidth - margin * 2;
            slideLines.forEach(line => {
              const splitLines = doc.splitTextToSize(line, maxTextWidth);
              splitLines.forEach((splitLine: string) => {
                if (y < pageHeight - margin - 10) { doc.text(splitLine, margin, y); y += lineSpacing; }
              });
              y += 2;
            });
          });
          blob = doc.output('blob');
          break;
        }
        case 'pdf-to-ppt': {
          setStatusText('Reading PDF pages...');
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const pptxgen = (await import('pptxgenjs')).default;
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const totalPages = pdf.numPages;
          const pptx = new pptxgen();
          pptx.layout = 'LAYOUT_16x9';
          for (let i = 1; i <= totalPages; i++) {
            setStatusText(`Preparing slide ${i} of ${totalPages}...`);
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            const imgDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const slide = pptx.addSlide();
            slide.addImage({ data: imgDataUrl, x: 0, y: 0, w: '100%', h: '100%' });
            setProgress(Math.round((i / totalPages) * 100));
          }
          const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;
          blob = pptxBlob;
          break;
        }
        case 'jpg-to-pdf': {
          setStatusText('Processing...');
          const { jsPDF } = await import('jspdf');
          const image = new Image();
          const dataUrl = URL.createObjectURL(file);
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = reject;
            image.src = dataUrl;
          });
          const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const imgWidth = image.width;
          const imgHeight = image.height;
          let targetWidth = pageWidth - 20;
          let targetHeight = (imgHeight * targetWidth) / imgWidth;
          if (targetHeight > pageHeight - 20) {
            targetHeight = pageHeight - 20;
            targetWidth = (imgWidth * targetHeight) / imgHeight;
          }
          doc.addImage(dataUrl, 'JPEG', (pageWidth - targetWidth) / 2, (pageHeight - targetHeight) / 2, targetWidth, targetHeight);
          blob = doc.output('blob');
          URL.revokeObjectURL(dataUrl);
          break;
        }
        case 'pdf-to-jpg': {
          setStatusText('Loading PDF...');
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const JSZip = (await import('jszip')).default;
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const totalPages = pdf.numPages;
          const zip = new JSZip();
          for (let i = 1; i <= totalPages; i++) {
            setStatusText(`Rendering page ${i} of ${totalPages}...`);
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            const base64Data = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
            zip.file(`page_${i}.jpg`, base64Data, { base64: true });
            setProgress(Math.round((i / totalPages) * 100));
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          blob = zipBlob;
          break;
        }
        case 'html-to-pdf': {
          setStatusText('Converting HTML to PDF...');
          const { jsPDF } = await import('jspdf');
          const text = await file.text();
          const stripHtml = (html: string) => html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<\/h[1-6]>/gi, '\n\n')
            .replace(/<\/li>/gi, '\n')
            .replace(/<li[^>]*>/gi, '- ')
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
            .replace(/\n{3,}/g, '\n\n').trim();
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const margin = 20;
          const textWidth = pageWidth - margin * 2;
          const lines = stripHtml(text).split('\n');
          let y = margin;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { y += 6; continue; }
            const wrappedLines = pdf.splitTextToSize(trimmed, textWidth);
            for (const wrapped of wrappedLines) {
              if (y + 7 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
              pdf.text(wrapped, margin, y);
              y += 7;
            }
          }
          blob = pdf.output('blob');
          break;
        }
        case 'pdf-to-html': {
          setStatusText('Reading PDF pages...');
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const totalPages = pdf.numPages;
          let bodyContent = '';
          for (let i = 1; i <= totalPages; i++) {
            setStatusText(`Extracting page ${i} of ${totalPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const linesMap: Record<number, string[]> = {};
            textContent.items.forEach((item: any) => {
              const y = Math.round(item.transform[5]);
              if (!linesMap[y]) linesMap[y] = [];
              linesMap[y].push(item.str);
            });
            const sortedY = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
            bodyContent += `<section class="page" id="page-${i}">\n<h2 class="page-number">Page ${i}</h2>\n`;
            sortedY.forEach(y => {
              const lineStr = linesMap[y].join(' ').trim();
              if (lineStr) {
                const e = lineStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
                bodyContent += `  <p>${e}</p>\n`;
              }
            });
            bodyContent += `</section>\n`;
            setProgress(Math.round((i / totalPages) * 100));
          }
          const title = file.name.replace(/\.pdf$/i, '');
          const html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n<title>${title}</title>\n<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,'Times New Roman',serif;line-height:1.6;color:#1a1a2e;background:#f8f9fa;padding:20px}.container{max-width:800px;margin:0 auto}.page{background:#fff;padding:40px;margin-bottom:20px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);page-break-after:always}.page-number{font-size:14px;color:#6b7280;font-weight:600;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px}p{margin-bottom:0.8em;text-indent:1.5em}</style>\n</head>\n<body>\n<div class="container">\n<h1 style="text-align:center;margin:40px 0;font-size:28px;color:#4f46e5;">${title}</h1>\n${bodyContent}\n</div>\n</body>\n</html>`;
          blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          break;
        }
        case 'epub-to-pdf': {
          setStatusText('Reading EPUB...');
          const JSZip = (await import('jszip')).default;
          const { jsPDF } = await import('jspdf');
          const zip = await JSZip.loadAsync(arrayBuffer);
          const containerFile = zip.file('META-INF/container.xml');
          if (!containerFile) throw new Error('Invalid EPUB format.');
          const containerXml = await containerFile.async('text');
          const parser = new DOMParser();
          const containerDoc = parser.parseFromString(containerXml, 'text/xml');
          const rootfileTag = containerDoc.getElementsByTagName('rootfile')[0];
          const opfPath = rootfileTag?.getAttribute('full-path') || 'OEBPS/content.opf';
          const opfFile = zip.file(opfPath);
          if (!opfFile) throw new Error('Could not locate content.opf.');
          const opfXml = await opfFile.async('text');
          const opfDoc = parser.parseFromString(opfXml, 'text/xml');
          const manifestItems = opfDoc.getElementsByTagName('item');
          const manifestMap: Record<string, string> = {};
          for (let i = 0; i < manifestItems.length; i++) {
            const id = manifestItems[i].getAttribute('id');
            const href = manifestItems[i].getAttribute('href');
            if (id && href) {
              const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
              manifestMap[id] = opfDir + href;
            }
          }
          const spineItems = opfDoc.getElementsByTagName('itemref');
          const spinePaths: string[] = [];
          for (let i = 0; i < spineItems.length; i++) {
            const idref = spineItems[i].getAttribute('idref');
            if (idref && manifestMap[idref]) spinePaths.push(manifestMap[idref]);
          }
          if (spinePaths.length === 0) throw new Error('No readable chapters found.');
          const extractedText: string[] = [];
          for (let i = 0; i < spinePaths.length; i++) {
            setStatusText(`Extracting chapter ${i + 1} of ${spinePaths.length}...`);
            const chapterFile = zip.file(spinePaths[i]);
            if (!chapterFile) continue;
            const htmlText = await chapterFile.async('text');
            const chapterDoc = parser.parseFromString(htmlText, 'text/html');
            const paragraphs = chapterDoc.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
            paragraphs.forEach(p => { const t = p.textContent?.trim(); if (t) extractedText.push(t); });
            setProgress(35 + Math.round((i / spinePaths.length) * 45));
          }
          setProgress(85);
          setStatusText('Compiling ebook PDF...');
          const doc = new jsPDF();
          let y = 20;
          const margin = 20;
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const maxWidth = pageWidth - margin * 2;
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(11);
          extractedText.forEach(text => {
            const splitText = doc.splitTextToSize(text, maxWidth);
            const blockHeight = splitText.length * 6;
            if (y + blockHeight > pageHeight - margin) { doc.addPage(); y = 20; }
            doc.text(splitText, margin, y);
            y += blockHeight + 6;
          });
          blob = doc.output('blob');
          break;
        }
        case 'pdf-to-epub': {
          setStatusText('Reading PDF pages...');
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const JSZip = (await import('jszip')).default;
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const totalPages = pdf.numPages;
          const zip = new JSZip();
          zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
          zip.file('META-INF/container.xml', `<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>\n</container>`);
          let manifestItems = '', spineItems = '', tocItems = '';
          for (let i = 1; i <= totalPages; i++) {
            setStatusText(`Extracting page ${i} of ${totalPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const linesMap: Record<number, string[]> = {};
            textContent.items.forEach((item: any) => {
              const y = Math.round(item.transform[5]);
              if (!linesMap[y]) linesMap[y] = [];
              linesMap[y].push(item.str);
            });
            const sortedY = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
            let paragraphsHtml = '';
            sortedY.forEach(y => {
              const lineStr = linesMap[y].join(' ').trim();
              if (lineStr) {
                const e = lineStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
                paragraphsHtml += `<p>${e}</p>\n`;
              }
            });
            const chapterFileName = `page_${i}.xhtml`;
            const chapterHtml = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>Page ${i}</title></head>\n<body>\n<h1>Page ${i}</h1>\n${paragraphsHtml}\n</body>\n</html>`;
            zip.file(`OEBPS/${chapterFileName}`, chapterHtml);
            manifestItems += `<item id="page_${i}" href="${chapterFileName}" media-type="application/xhtml+xml"/>\n`;
            spineItems += `<itemref idref="page_${i}"/>\n`;
            tocItems += `<navPoint id="navpoint-${i}" playOrder="${i}"><navLabel><text>Page ${i}</text></navLabel><content src="${chapterFileName}"/></navPoint>\n`;
            setProgress(Math.round((i / totalPages) * 85));
          }
          const bookTitle = file.name.replace('.pdf', '');
          const opfXml = `<?xml version="1.0" encoding="UTF-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">\n<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">\n<dc:title>${bookTitle}</dc:title>\n<dc:language>en</dc:language>\n<dc:identifier id="BookID">urn:uuid:${Math.random().toString(36).substring(2, 15)}</dc:identifier>\n</metadata>\n<manifest>\n<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n${manifestItems}</manifest>\n<spine toc="ncx">\n${spineItems}</spine>\n</package>`;
          zip.file('OEBPS/content.opf', opfXml);
          const ncxXml = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE ncx PUBLIC "-//NISO//DTD NCX 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx-2005-1/" version="2005-1">\n<head><meta name="dtb:uid" content="urn:uuid:book-id"/></head>\n<docTitle><text>${bookTitle}</text></docTitle>\n<navMap>\n${tocItems}</navMap>\n</ncx>`;
          zip.file('OEBPS/toc.ncx', ncxXml);
          const epubBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
          blob = epubBlob;
          break;
        }
        case 'heic-to-pdf': {
          setStatusText('Converting HEIC to PDF...');
          const heic2any = (await import('heic2any')).default;
          const { PDFDocument } = await import('pdf-lib');
          const blobResult = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
          const finalBlob = Array.isArray(blobResult) ? blobResult[0] : blobResult;
          const jpgBuffer = await finalBlob.arrayBuffer();
          const pdfDoc = await PDFDocument.create();
          const image = await pdfDoc.embedJpg(jpgBuffer);
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
          const pdfBytes = await pdfDoc.save();
          blob = createDownloadBlob(pdfBytes, 'application/pdf');
          break;
        }
      }

      if (blob) {
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputUrl(URL.createObjectURL(blob));
        toast.success(pair.successMessage);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Conversion failed. Check your input file.'));
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const related = RELATED[resolvedSlug] || [];

  const inputFmt = FORMATS[inputKey];
  const outputFmt = FORMATS[outputKey];

  const formatPicker = (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <select
        value={inputKey}
        onChange={(e) => handleFormatChange("input", e.target.value)}
        className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer"
      >
        {FORMAT_KEYS.map(k => (
          <option key={k} value={k}>{FORMATS[k].label} ({FORMATS[k].ext})</option>
        ))}
      </select>

      <button
        onClick={swapFormats}
        className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-all active:scale-95"
        aria-label="Swap formats"
      >
        <svg className="w-5 h-5 text-zinc-600 dark:text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>

      <select
        value={outputKey}
        onChange={(e) => handleFormatChange("output", e.target.value)}
        className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer"
      >
        {(VALID_OUTPUTS[inputKey] || []).map(k => (
          <option key={k} value={k}>{FORMATS[k].label} ({FORMATS[k].ext})</option>
        ))}
      </select>
    </div>
  );

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        {formatPicker}
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm flex items-center gap-2">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <span><strong>100% Client-Side:</strong> {pair.description}</span>
        </div>
        <FileUploader
          accept={pair.accept}
          onFileSelect={handleFileSelect}
          title={pair.uploadTitle}
          subtitle={pair.uploadSubtitle}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {formatPicker}
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[var(--accent)]" />
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-[var(--text-primary)]">{file.name}</h3>
            <p className="text-[var(--text-secondary)] text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button
          onClick={clearAll}
          disabled={isProcessing}
          className="text-xs text-[var(--text-secondary)] dark:text-zinc-300 px-3 py-2 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-[var(--text-primary)] font-bold text-base flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
              <FileEdit className="w-5 h-5 text-[var(--accent)]" />
              {pair.title}
            </h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{pair.description}</p>
          </div>

          <button
            onClick={convertDoc}
            disabled={isProcessing || !!outputUrl}
            className="w-full mt-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{statusText} ({progress}%)</span>
              </>
            ) : (
              <>
                <FileEdit className="w-4 h-4" />
                <span>{pair.actionLabel}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col justify-center">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300 h-full flex flex-col justify-center">
              <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <Download className="w-16 h-16 mb-4" />
                <p className="font-bold text-center">{pair.outputFileName(file.name)}</p>
                <p className="text-xs text-emerald-500/80 mt-1">Converted successfully.</p>
              </div>

              <button
                onClick={() => downloadOrShare(outputUrl, pair.outputFileName(file.name))}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                Download {pair.iconLabel} File
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center h-full min-h-[250px] text-[var(--text-muted)] text-center">
              <FileEdit className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">Converted file will appear here</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="pt-6 border-t border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-secondary)] mb-3 font-medium">Also popular:</p>
          <div className="flex flex-wrap gap-2">
            {related.map(s => {
              const p = FORMAT_PAIRS.find(fp => fp.slug === s);
              if (!p) return null;
              return (
                <a
                  key={s}
                  href={`/pdf/${s}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  {p.iconLabel} {p.actionLabel}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
