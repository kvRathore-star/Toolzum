"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { getErrorMessage } from '@/utils/error';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type Mode = 'mobi-to-pdf' | 'mobi-to-epub' | 'pdf-to-mobi';
type PageSize = 'a4' | 'letter' | 'kindle';
type FontSizeVal = 'small' | 'medium' | 'large';
type MarginVal = 'narrow' | 'normal' | 'wide';

interface MobiMetadata {
  title: string;
  author: string;
  size: number;
  encoding: string;
  pageCount: number;
}

const PAGE_SIZES: Record<PageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  kindle: [600, 800],
};

const FONT_SIZES: Record<FontSizeVal, number> = {
  small: 10,
  medium: 12,
  large: 14,
};

const MARGINS: Record<MarginVal, number> = {
  narrow: 40,
  normal: 60,
  wide: 80,
};

function readU16(data: Uint8Array, off: number): number {
  return (data[off] << 8) | data[off + 1];
}

function readU32(data: Uint8Array, off: number): number {
  return ((data[off] * 256 + data[off + 1]) * 256 + data[off + 2]) * 256 + data[off + 3];
}

function readStr(data: Uint8Array, off: number, len: number, encoding: string): string {
  const slice = data.slice(off, off + len);
  const nullIdx = slice.indexOf(0);
  const clean = nullIdx >= 0 ? slice.slice(0, nullIdx) : slice;
  try {
    return new TextDecoder(encoding).decode(clean);
  } catch {
    return new TextDecoder('utf-8').decode(clean);
  }
}

function decompressPalmDoc(compressed: Uint8Array): Uint8Array {
  const out: number[] = [];
  let ip = 0;
  while (ip < compressed.length) {
    const c = compressed[ip++];
    if (c === 0x00) {
      out.push(0x00);
    } else if (c <= 0x08) {
      let length = c;
      let offset: number;
      if (c === 0x01 || c === 0x08) {
        if (ip + 1 >= compressed.length) break;
        offset = (compressed[ip] << 8) | compressed[ip + 1];
        ip += 2;
      } else {
        offset = compressed[ip++];
      }
      if (offset === 0) offset = 1;
      for (let i = 0; i < length; i++) {
        const src = out.length - offset;
        out.push(src >= 0 ? out[src] : 0x20);
      }
    } else if (c < 0x80) {
      const length = c - 8;
      for (let i = 0; i < length; i++) {
        if (ip >= compressed.length) break;
        out.push(compressed[ip++]);
      }
    } else if (c < 0xC0) {
      if (ip >= compressed.length) break;
      const length = ((c & 0x3F) << 8) | compressed[ip++];
      for (let i = 0; i < length; i++) {
        if (ip >= compressed.length) break;
        out.push(compressed[ip++]);
      }
    } else {
      if (ip >= compressed.length) break;
      const length = ((c & 0x3F) << 8) | compressed[ip++];
      if (ip + 1 >= compressed.length) break;
      let offset = (compressed[ip] << 8) | compressed[ip + 1];
      ip += 2;
      if (offset === 0) offset = 1;
      for (let i = 0; i < length; i++) {
        const src = out.length - offset;
        out.push(src >= 0 ? out[src] : 0x20);
      }
    }
  }
  return new Uint8Array(out);
}

function compressPalmDocSimple(input: Uint8Array): Uint8Array {
  const out: number[] = [];
  let pos = 0;
  while (pos < input.length) {
    if (input[pos] === 0) {
      out.push(0x00);
      pos++;
      continue;
    }
    const windowStart = Math.max(0, pos - 4096);
    let bestLen = 0;
    let bestDist = 0;
    for (let j = windowStart; j < pos; j++) {
      let ml = 0;
      while (pos + ml < input.length && j + ml < pos && input[j + ml] === input[pos + ml] && ml < 65535) ml++;
      if (ml >= 3 && ml > bestLen) {
        bestLen = ml;
        bestDist = pos - j;
      }
    }
    if (bestLen >= 3) {
      if (bestLen <= 8 && bestDist <= 255) {
        if (bestLen === 8) {
          out.push(0x08);
          out.push(bestDist);
        } else {
          out.push(bestLen);
          out.push(bestDist);
        }
      } else if (bestLen === 1 && bestDist > 255) {
        out.push(0x01);
        out.push(bestDist >> 8);
        out.push(bestDist & 0xFF);
      } else {
        const extraLen = bestLen - 8;
        if (extraLen <= 0x3FFF) {
          out.push(0xC0 | (extraLen >> 8));
          out.push(extraLen & 0xFF);
          out.push(bestDist >> 8);
          out.push(bestDist & 0xFF);
        } else {
          out.push(0x00);
          pos++;
          continue;
        }
      }
      pos += bestLen;
    } else {
      const litStart = pos;
      while (pos < input.length && input[pos] !== 0) {
        const ws = Math.max(0, pos - 4096);
        let hasMatch = false;
        for (let j = ws; j < pos; j++) {
          if (input[j] === input[pos] && pos + 1 < input.length && input[j + 1] === input[pos + 1]) {
            if (pos - j <= 255 || (input[j + 2] && input[pos + 2] === input[j + 2])) {
              hasMatch = true;
              break;
            }
          }
        }
        if (hasMatch) break;
        pos++;
      }
      const litRun = input.slice(litStart, pos);
      let rp = 0;
      while (rp < litRun.length) {
        if (litRun[rp] === 0) {
          out.push(0x00);
          rp++;
          continue;
        }
        const chunk = litRun.slice(rp);
        if (chunk.length <= 119) {
          out.push(0x08 + chunk.length);
          chunk.forEach(b => out.push(b));
          rp += chunk.length;
        } else {
          const take = Math.min(chunk.length, 0x3FFF);
          out.push(0x80 | (take >> 8));
          out.push(take & 0xFF);
          for (let k = 0; k < take; k++) out.push(chunk[k]);
          rp += take;
        }
      }
    }
  }
  return new Uint8Array(out);
}

function parseMobi(data: Uint8Array): { metadata: MobiMetadata; text: string } {
  const numRecords = readU16(data, 0x4C);
  const recOffsets: number[] = [];
  for (let i = 0; i < numRecords; i++) {
    recOffsets.push(readU32(data, 0x4E + i * 8));
  }
  const r0 = recOffsets[0];
  const magic = String.fromCharCode(data[r0], data[r0 + 1], data[r0 + 2], data[r0 + 3]);
  if (magic !== 'MOBI') throw new Error('Not a valid MOBI file');

  const mobiHeaderLen = readU32(data, r0 + 0x04);
  const encoding = readU32(data, r0 + 0x0C);
  const firstNonBook = readU32(data, r0 + 0x50);
  const titleOff = readU32(data, r0 + 0x54);
  const titleLen = readU32(data, r0 + 0x5C);
  const encStr = encoding === 65001 ? 'utf-8' : 'windows-1252';

  let title = 'Unknown';
  if (titleLen > 0 && r0 + titleOff + titleLen <= data.length) {
    title = readStr(data, r0 + titleOff, titleLen, encStr);
  }

  let author = '';
  const exthStart = r0 + mobiHeaderLen;
  let exthLen = 0;
  if (exthStart + 4 <= data.length) {
    const exMagic = String.fromCharCode(data[exthStart], data[exthStart + 1], data[exthStart + 2], data[exthStart + 3]);
    if (exMagic === 'EXTH') {
      exthLen = readU32(data, exthStart + 0x04);
      const exthCount = readU32(data, exthStart + 0x08);
      let exthPos = exthStart + 0x0C;
      for (let i = 0; i < exthCount; i++) {
        const rType = readU32(data, exthPos);
        const rLen = readU32(data, exthPos + 0x04);
        if (rType === 100) {
          author = readStr(data, exthPos + 0x08, rLen - 8, encStr);
        }
        exthPos += rLen;
      }
    }
  }

  const textEndIdx = firstNonBook === 0xFFFFFFFF ? numRecords : firstNonBook;
  let textStartInR0 = exthStart + exthLen;
  let compressionType = 2;
  if (textStartInR0 + 16 <= data.length) {
    const pc = readU16(data, textStartInR0);
    if (pc === 1 || pc === 2) {
      compressionType = pc;
      textStartInR0 += 16;
    }
  }

  const textParts: string[] = [];
  const decoder = new TextDecoder(encStr);

  function decompressAndDecode(chunk: Uint8Array): string {
    if (compressionType === 2) {
      const dec = decompressPalmDoc(chunk);
      return decoder.decode(dec);
    }
    return decoder.decode(chunk);
  }

  if (textStartInR0 < (recOffsets[1] || data.length)) {
    const chunk = data.slice(textStartInR0, recOffsets[1] || data.length);
    try {
      textParts.push(decompressAndDecode(chunk));
    } catch { /* skip */ }
  }

  for (let i = 1; i < textEndIdx && i < recOffsets.length; i++) {
    const start = recOffsets[i];
    const end = i + 1 < recOffsets.length ? recOffsets[i + 1] : data.length;
    const chunk = data.slice(start, end);
    try {
      textParts.push(decompressAndDecode(chunk));
    } catch { /* skip */ }
  }

  const fullText = textParts.join('');
  const pageCount = Math.max(1, Math.round(fullText.length / 1800));

  return {
    metadata: { title, author, size: data.length, encoding: encStr, pageCount },
    text: fullText,
  };
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function MobiConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>('mobi-to-pdf');
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [fontSize, setFontSize] = useState<FontSizeVal>('medium');
  const [margin, setMargin] = useState<MarginVal>('normal');
  const [metadata, setMetadata] = useState<MobiMetadata | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState('');

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  function detectMode(fileName: string): Mode {
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'mobi' || ext === 'prc') return 'mobi-to-pdf';
    if (ext === 'pdf') return 'pdf-to-mobi';
    return 'mobi-to-pdf';
  }

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const buf = await selectedFile.arrayBuffer();
      const data = new Uint8Array(buf);
      const detected = detectMode(selectedFile.name);
      setMode(detected);
      setOutputUrl(null);
      setOutputName('');
      setExtractedText('');

      if (detected === 'mobi-to-pdf' || detected === 'mobi-to-epub') {
        const result = parseMobi(data);
        setMetadata(result.metadata);
        const clean = stripHtml(result.text);
        setExtractedText(clean);
        setFile(selectedFile);
        toast.success(`Loaded "${result.metadata.title}"`);
      } else {
        const pdf = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          text += tc.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        const title = selectedFile.name.replace(/\.pdf$/i, '');
        setMetadata({ title, author: '', size: buf.byteLength, encoding: 'utf-8', pageCount: pdf.numPages });
        setExtractedText(text);
        setFile(selectedFile);
        toast.success(`Loaded PDF: "${title}"`);
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to read file'));
    }
  };

  const clearAll = () => {
    setFile(null);
    setMetadata(null);
    setExtractedText('');
    setOutputUrl(null);
    setOutputName('');
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    setOutputUrl(null);
    setOutputName('');
  };

  const handleConvert = async () => {
    if (!file || !extractedText) return;
    setIsProcessing(true);
    try {
      if (mode === 'mobi-to-pdf' || mode === 'mobi-to-epub') {
        if (!metadata) throw new Error('No metadata');
      }

      if (mode === 'mobi-to-pdf') {
        const [pw, ph] = PAGE_SIZES[pageSize];
        const fs = FONT_SIZES[fontSize];
        const mg = MARGINS[margin];
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const lines = extractedText.split('\n');
        const maxW = pw - mg * 2;
        const lineH = fs * 1.4;
        let page = pdfDoc.addPage([pw, ph]);
        let y = ph - mg;

        if (metadata) {
          page.drawText(metadata.title, { x: mg, y, size: fs + 4, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
          y -= lineH + 4;
          if (metadata.author) {
            page.drawText(`by ${metadata.author}`, { x: mg, y, size: fs, font, color: rgb(0.3, 0.3, 0.3) });
            y -= lineH + 8;
          }
          y -= 8;
        }

        for (const line of lines) {
          if (y < mg + lineH) {
            page = pdfDoc.addPage([pw, ph]);
            y = ph - mg;
          }
          const words = line.split(' ');
          let x = mg;
          for (const word of words) {
            const ww = font.widthOfTextAtSize(word + ' ', fs);
            if (x + ww > mg + maxW) {
              x = mg;
              y -= lineH;
              if (y < mg + lineH) {
                page = pdfDoc.addPage([pw, ph]);
                y = ph - mg;
              }
            }
            const displayText = word + ' ';
            page.drawText(displayText, { x, y, size: fs, font, color: rgb(0.15, 0.15, 0.15) });
            x += ww;
          }
          y -= lineH;
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        const name = (metadata?.title || file.name.replace(/\.mobi$/i, '')) + '.pdf';
        setOutputName(name);
        setOutputUrl(URL.createObjectURL(blob));
        toast.success('PDF created!');
      } else if (mode === 'mobi-to-epub') {
        const title = metadata?.title || 'Unknown';
        const author = metadata?.author || 'Unknown Author';
        const htmlContent = extractedText.split('\n').filter(l => l.trim()).map(p => `<p>${p.trim()}</p>`).join('\n');
        const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata>
    <dc:identifier id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="content"/>
  </spine>
</package>`;
        const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${crypto.randomUUID()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${title}</text></docTitle>
  <navMap>
    <navPoint id="np-1" playOrder="1"><navLabel><text>Start</text></navLabel><content src="content.xhtml"/></navPoint>
  </navMap>
</ncx>`;
        const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${title}</title></head>
<body>
<h1>${title}</h1>
${author ? `<h2>by ${author}</h2>` : ''}
${htmlContent}
</body>
</html>`;
        const zip = new JSZip();
        zip.file('mimetype', 'application/epub+zip');
        zip.file('META-INF/container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`);
        const oebps = zip.folder('OEBPS')!;
        oebps.file('content.opf', opf);
        oebps.file('toc.ncx', ncx);
        oebps.file('content.xhtml', xhtml);
        const epubBlob = await zip.generateAsync({ type: 'blob' });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        const name = title + '.epub';
        setOutputName(name);
        setOutputUrl(URL.createObjectURL(epubBlob));
        toast.success('EPUB created!');
      } else {
        const title = metadata?.title || file.name.replace(/\.pdf$/i, '');
        const textBytes = new TextEncoder().encode(extractedText);
        const compressed = compressPalmDocSimple(textBytes);
        const maxRecSize = 4096;
        const records: Uint8Array[] = [];
        for (let i = 0; i < compressed.length; i += maxRecSize) {
          records.push(compressed.slice(i, Math.min(i + maxRecSize, compressed.length)));
        }
        const mobiHeaderLen = 228;
        const titleEncoded = new TextEncoder().encode(title + '\0');
        const titlePadOff = 100;
        const mobiHeader = new Uint8Array(mobiHeaderLen);
        mobiHeader[0] = 0x4D; mobiHeader[1] = 0x4F; mobiHeader[2] = 0x42; mobiHeader[3] = 0x49;
        writeU32(mobiHeader, 4, mobiHeaderLen);
        writeU32(mobiHeader, 8, 2);
        writeU32(mobiHeader, 0x0C, 65001);
        writeU32(mobiHeader, 0x10, 1);
        writeU32(mobiHeader, 0x14, 6);
        writeU32(mobiHeader, 0x50, 0xFFFFFFFF);
        writeU32(mobiHeader, 0x54, titlePadOff);
        writeU32(mobiHeader, 0x5C, titleEncoded.length);
        for (let i = 0; i < titleEncoded.length && titlePadOff + i < mobiHeaderLen; i++) {
          mobiHeader[titlePadOff + i] = titleEncoded[i];
        }
        const palmdocHeader = new Uint8Array(16);
        writeU16(palmdocHeader, 0, 2);
        writeU16(palmdocHeader, 2, 0);
        writeU32(palmdocHeader, 4, textBytes.length);
        writeU16(palmdocHeader, 8, records.length);
        writeU16(palmdocHeader, 10, maxRecSize);
        writeU32(palmdocHeader, 12, 0);

        const record0Data = new Uint8Array(mobiHeaderLen + palmdocHeader.length + (records.length > 0 ? records[0].length : 0));
        record0Data.set(mobiHeader, 0);
        record0Data.set(palmdocHeader, mobiHeaderLen);
        if (records.length > 0) record0Data.set(records[0], mobiHeaderLen + 16);

        const totalRecords = 1 + Math.max(0, records.length - 1);
        const pdbHeaderLen = 78;
        const recInfoLen = totalRecords * 8;
        const dataStart = pdbHeaderLen + recInfoLen;

        const dataBlobs: Uint8Array[] = [record0Data];
        for (let ri = 1; ri < records.length; ri++) {
          dataBlobs.push(records[ri]);
        }

        let runningDataOffset = dataStart;
        const recOffsets: number[] = [];
        for (let ri = 0; ri < totalRecords; ri++) {
          recOffsets.push(runningDataOffset);
          runningDataOffset += dataBlobs[ri].length;
        }

        const totalLen = runningDataOffset;
        const result = new Uint8Array(totalLen);

        const nameBytes = new TextEncoder().encode(title.padEnd(32, ' ').slice(0, 32));
        result.set(nameBytes, 0);
        result.set(new TextEncoder().encode('BOOK'), 0x3C);
        result.set(new TextEncoder().encode('MOBI'), 0x40);
        writeU16(result, 0x4C, totalRecords);

        for (let ri = 0; ri < totalRecords; ri++) {
          const off = pdbHeaderLen + ri * 8;
          writeU32(result, off, recOffsets[ri]);
        }

        for (let ri = 0; ri < totalRecords; ri++) {
          result.set(dataBlobs[ri], recOffsets[ri]);
        }

        const blob = new Blob([result], { type: 'application/x-mobipocket-ebook' });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputName(title + '.mobi');
        setOutputUrl(URL.createObjectURL(blob));
        toast.success('MOBI file created!');
      }
    } catch (e: unknown) {
      console.error(e);
      toast.error(getErrorMessage(e, 'Conversion failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-400 text-sm">
          <strong>Convert MOBI ↔ PDF/EPUB</strong> — Upload a Kindle (.mobi) file to convert to PDF or EPUB, or upload a PDF to generate a MOBI file. All processing happens in your browser.
        </div>
        <FileUploader
          accept=".mobi,.prc,.pdf,application/pdf,application/x-mobipocket-ebook"
          onFileSelect={handleFileSelect}
          title="Upload MOBI or PDF file"
          subtitle="Drag & drop your ebook here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-center gap-3 bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div className="min-w-0">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{file.name}</h3>
          {metadata && (
            <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm truncate">
              {metadata.title}{metadata.author ? ` • ${metadata.author}` : ''} • {(file.size / 1024 / 1024).toFixed(2)} MB • ~{metadata.pageCount} pages
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {mode !== 'mobi-to-pdf' && <button onClick={() => changeMode('mobi-to-pdf')} className="text-xs px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">PDF</button>}
          {mode !== 'mobi-to-epub' && <button onClick={() => changeMode('mobi-to-epub')} className="text-xs px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">EPUB</button>}
          {mode !== 'pdf-to-mobi' && <button onClick={() => changeMode('pdf-to-mobi')} className="text-xs px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">MOBI</button>}
          <button onClick={clearAll} className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">
            {mode === 'mobi-to-pdf' ? 'PDF Settings' : mode === 'mobi-to-epub' ? 'EPUB Settings' : 'MOBI Settings'}
          </h4>

          <div>
            <label className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Output Format</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['mobi-to-pdf', 'mobi-to-epub', 'pdf-to-mobi'] as Mode[]).map(m => (
                <button key={m} onClick={() => changeMode(m)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${mode === m ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'}`}>
                  {m === 'mobi-to-pdf' ? 'MOBI→PDF' : m === 'mobi-to-epub' ? 'MOBI→EPUB' : 'PDF→MOBI'}
                </button>
              ))}
            </div>
          </div>

          {(mode === 'mobi-to-pdf') && (
            <>
              <div>
                <label className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Page Size</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['a4', 'letter', 'kindle'] as PageSize[]).map(s => (
                    <button key={s} onClick={() => setPageSize(s)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border ${pageSize === s ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>
                      {s === 'a4' ? 'A4' : s === 'letter' ? 'Letter' : 'Kindle'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Font Size</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['small', 'medium', 'large'] as FontSizeVal[]).map(s => (
                    <button key={s} onClick={() => setFontSize(s)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border ${fontSize === s ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Margins</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['narrow', 'normal', 'wide'] as MarginVal[]).map(s => (
                    <button key={s} onClick={() => setMargin(s)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border ${margin === s ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(mode === 'mobi-to-epub') && (
            <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-overlay)]/50 p-4 rounded-xl">
              EPUB is a reflowable format — page size, font, and margin settings are controlled by the e-reader. The extracted book text will be packaged into a standards-compliant EPUB file.
            </div>
          )}

          {(mode === 'pdf-to-mobi') && (
            <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-overlay)]/50 p-4 rounded-xl">
              The generated MOBI file will contain the extracted text with basic formatting. Complex PDF layouts (tables, images, columns) may not reproduce perfectly.
            </div>
          )}

          <button onClick={handleConvert} disabled={isProcessing || !extractedText}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 mt-2">
            {isProcessing && <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {!isProcessing && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
            {isProcessing ? 'Processing...' : mode === 'mobi-to-pdf' ? 'Convert to PDF' : mode === 'mobi-to-epub' ? 'Convert to EPUB' : 'Convert to MOBI'}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h4 className="font-bold text-emerald-500">Conversion Complete</h4>
              </div>
              <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-bold text-center truncate max-w-full">{outputName}</p>
              </div>
              <button onClick={() => downloadOrShare(outputUrl, outputName)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download {outputName.split('.').pop()?.toUpperCase()}
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p>Generated file will appear here</p>
            </div>
          )}

          {extractedText && (
            <details className="bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl">
              <summary className="px-4 py-3 text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)] cursor-pointer hover:text-zinc-900 dark:hover:text-white">
                Preview extracted text ({extractedText.length.toLocaleString()} chars)
              </summary>
              <div className="px-4 pb-4 max-h-64 overflow-y-auto">
                <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-sans leading-relaxed">
                  {extractedText.slice(0, 3000)}
                  {extractedText.length > 3000 ? '\n...' : ''}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function writeU16(buf: Uint8Array, off: number, val: number) {
  buf[off] = (val >> 8) & 0xFF;
  buf[off + 1] = val & 0xFF;
}

function writeU32(buf: Uint8Array, off: number, val: number) {
  buf[off] = (val >> 24) & 0xFF;
  buf[off + 1] = (val >> 16) & 0xFF;
  buf[off + 2] = (val >> 8) & 0xFF;
  buf[off + 3] = val & 0xFF;
}
