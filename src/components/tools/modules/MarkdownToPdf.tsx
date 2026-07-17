"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { marked } from 'marked';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Token, TokensList } from 'marked';
import DOMPurify from 'dompurify';

const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
};

const MARGINS: Record<string, number> = {
  narrow: 36,
  normal: 72,
  wide: 108,
};

const FONT_SIZES = [10, 11, 12, 14];

interface InlineRun {
  text: string;
  bold: boolean;
  mono: boolean;
}

interface RenderCtx {
  page: any;
  y: number;
  pageNum: number;
}

function extractInlineRuns(tokens: Token[]): InlineRun[] {
  const runs: InlineRun[] = [];
  for (const t of tokens) {
    switch (t.type) {
      case 'text':
      case 'raw':
        runs.push({ text: t.text, bold: false, mono: false });
        break;
      case 'strong':
        for (const r of extractInlineRuns(t.tokens!))
          runs.push({ ...r, bold: true });
        break;
      case 'em':
        for (const r of extractInlineRuns(t.tokens!))
          runs.push(r);
        break;
      case 'codespan':
        runs.push({ text: t.text, bold: false, mono: true });
        break;
      case 'br':
        runs.push({ text: '\n', bold: false, mono: false });
        break;
      default:
        if ('text' in t && typeof (t as any).text === 'string')
          runs.push({ text: (t as any).text, bold: false, mono: false });
    }
  }
  return runs;
}

function drawRuns(
  runs: InlineRun[],
  ctx: RenderCtx,
  doc: any,
  x: number,
  maxW: number,
  size: number,
  lh: number,
  font: any,
  boldFont: any,
  monoFont: any,
  pageW: number,
  pageH: number,
  margin: number,
) {
  interface Word {
    text: string;
    bold: boolean;
    mono: boolean;
    width: number;
  }
  const words: Word[] = [];
  for (const run of runs) {
    const parts = run.text.split(/(\n)/);
    for (const part of parts) {
      if (part === '\n') {
        words.push({ text: '\n', bold: false, mono: false, width: 0 });
      } else if (part) {
        const sub = part.split(/(\s+)/);
        for (const s of sub) {
          if (!s) continue;
          const f = run.mono ? monoFont : run.bold ? boldFont : font;
          words.push({ text: s, bold: run.bold, mono: run.mono, width: f.widthOfTextAtSize(s, size) });
        }
      }
    }
  }
  let lineWords: Word[] = [];
  let lineW = 0;
  const flush = () => {
    if (!lineWords.length) return;
    if (ctx.y - lh < margin) {
      ctx.page = doc.addPage([pageW, pageH]);
      ctx.y = pageH - margin;
      ctx.pageNum++;
    }
    let cx = x;
    for (const w of lineWords) {
      if (w.text === '\n') continue;
      const f = w.mono ? monoFont : w.bold ? boldFont : font;
      ctx.page.drawText(w.text, { x: cx, y: ctx.y, size, font: f });
      cx += w.width;
    }
    ctx.y -= lh;
    lineWords = [];
    lineW = 0;
  };
  for (const word of words) {
    if (word.text === '\n') { flush(); continue; }
    if (lineW + word.width <= maxW || !lineWords.length) {
      lineWords.push(word);
      lineW += word.width;
    } else {
      flush();
      lineWords.push(word);
      lineW = word.width;
    }
  }
  flush();
}

function pageBreak(ctx: RenderCtx, doc: any, pageW: number, pageH: number, margin: number) {
  ctx.page = doc.addPage([pageW, pageH]);
  ctx.y = pageH - margin;
  ctx.pageNum++;
}

async function generatePdf(
  markdown: string,
  pageW: number,
  pageH: number,
  margin: number,
  fontSize: number,
  titlePage: boolean,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await doc.embedFont(StandardFonts.Courier);
  const usableW = pageW - 2 * margin;
  const lh = fontSize * 1.5;
  const codeSize = fontSize - 1;

  const ctx: RenderCtx = {
    page: doc.addPage([pageW, pageH]),
    y: pageH - margin,
    pageNum: 1,
  };

  const tokens = marked.lexer(markdown);

  let startIndex = 0;
  if (titlePage && tokens.length > 0 && tokens[0].type === 'heading' && tokens[0].depth === 1) {
    const titleRuns = extractInlineRuns(tokens[0].tokens!);
    const titleText = titleRuns.map(r => r.text).join('');
    const titleSize = 28;
    const tw = boldFont.widthOfTextAtSize(titleText, titleSize);
    if (tw <= usableW) {
      ctx.page.drawText(titleText, {
        x: (pageW - tw) / 2,
        y: pageH / 2 + titleSize / 2,
        size: titleSize,
        font: boldFont,
      });
    } else {
      ctx.page.drawText(titleText, {
        x: margin,
        y: pageH / 2 + titleSize / 2,
        size: titleSize,
        font: boldFont,
        maxWidth: usableW,
      });
    }
    drawRuns(
      [{ text: '— ' + new Date().toLocaleDateString() + ' —', bold: false, mono: false }],
      ctx, doc, margin, usableW, fontSize, lh,
      font, boldFont, monoFont, pageW, pageH, margin,
    );
    pageBreak(ctx, doc, pageW, pageH, margin);
    startIndex = 1;
  }

  const checkSpace = (needed: number) => {
    if (ctx.y - needed < margin) {
      pageBreak(ctx, doc, pageW, pageH, margin);
    }
  };

  for (let i = startIndex; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'heading': {
        const hSize = token.depth === 1 ? fontSize + 8 : token.depth === 2 ? fontSize + 4 : fontSize + 2;
        const hLh = hSize * 1.4;
        checkSpace(hLh + 4);
        const runs = extractInlineRuns(token.tokens!);
        drawRuns(runs, ctx, doc, margin, usableW, fontSize, lh, font, boldFont, monoFont, pageW, pageH, margin);
        ctx.y -= 4;
        break;
      }
      case 'code': {
        const codeLines = token.text.split('\n');
        const codeH = codeLines.length * (codeSize * 1.4) + 16;
        checkSpace(codeH + 8);
        const bgY = ctx.y - codeH;
        ctx.page.drawRectangle({
          x: margin, y: bgY, width: usableW, height: codeH,
          color: rgb(0.93, 0.93, 0.95),
        });
        let cy = ctx.y - 12;
        for (const line of codeLines) {
          ctx.page.drawText(line, {
            x: margin + 8, y: cy, size: codeSize, font: monoFont,
            color: rgb(0.25, 0.25, 0.35),
          });
          cy -= codeSize * 1.4;
        }
        ctx.y = bgY - 8;
        break;
      }
      case 'list': {
        let idx = 1;
        for (const item of token.items) {
          checkSpace(lh + 2);
          const runs = extractInlineRuns(item.tokens);
          const prefix = token.ordered ? `${idx}. ` : '\u2022 ';
          const prefixRuns: InlineRun[] = [{ text: prefix, bold: false, mono: false }];
          drawRuns([...prefixRuns, ...runs], ctx, doc, margin + 14, usableW - 14, fontSize, lh, font, boldFont, monoFont, pageW, pageH, margin);
          idx++;
        }
        ctx.y -= 4;
        break;
      }
      case 'space': {
        ctx.y -= lh * 0.5;
        break;
      }
      case 'hr': {
        checkSpace(20);
        ctx.y -= 8;
        ctx.page.drawLine({
          start: { x: margin, y: ctx.y },
          end: { x: pageW - margin, y: ctx.y },
          thickness: 1,
          color: rgb(0.7, 0.7, 0.7),
        });
        ctx.y -= 12;
        break;
      }
    }
  }

  for (let i = 0; i < doc.getPageCount(); i++) {
    const p = doc.getPage(i);
    const num = `${i + 1}`;
    const pw = p.getWidth();
    const tw = font.widthOfTextAtSize(num, 9);
    p.drawText(num, {
      x: (pw - tw) / 2, y: margin / 3, size: 9, font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return doc.save();
}

function getDefaultMarkdown(): string {
  return [
    '# Markdown to PDF',
    '',
    'Write your **markdown** here and convert it to a *styled* PDF document.',
    '',
    '## Headers',
    '',
    'You can use H1, H2, and H3 headings to structure your document.',
    '',
    '### Lists',
    '',
    'Unordered list:',
    '- Item one',
    '- Item two',
    '- Item three',
    '',
    'Ordered list:',
    '1. First step',
    '2. Second step',
    '3. Third step',
    '',
    '### Code Blocks',
    '',
    '```',
    'function hello() {',
    '  console.log("Hello, world!");',
    '}',
    '```',
    '',
    '### Text Formatting',
    '',
    '**Bold text**, *italic text*, and `inline code` are all supported.',
  ].join('\n');
}

export default function MarkdownToPdf() {
  const [markdown, setMarkdown] = useState(getDefaultMarkdown);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [pageSize, setPageSize] = useState('A4');
  const [margin, setMargin] = useState('normal');
  const [fontSize, setFontSize] = useState(12);
  const [includeTitlePage, setIncludeTitlePage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!markdown.trim()) { setHtmlPreview(''); return; }
    Promise.resolve(marked.parse(markdown)).then(setHtmlPreview).catch(() => {});
  }, [markdown]);

  const handleFileSelect = async (file: File) => {
    try {
      const text = await file.text();
      setMarkdown(text);
      setPdfUrl(null);
      setActiveTab('editor');
      toast.success('Markdown file loaded!');
    } catch {
      toast.error('Failed to read markdown file.');
    }
  };

  const handleConvert = async () => {
    if (!markdown.trim()) {
      toast.error('Please enter some markdown content.');
      return;
    }
    setIsProcessing(true);
    try {
      const [pw, ph] = PAGE_SIZES[pageSize];
      const marginPt = MARGINS[margin];
      const bytes = await generatePdf(markdown, pw, ph, marginPt, fontSize, includeTitlePage);
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setActiveTab('preview');
      toast.success('PDF generated successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (activeTab === 'preview' && pdfUrl) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('editor')}
            className="text-sm px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
            Back to Editor
          </button>
          <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">PDF Preview</h3>
          <button
            onClick={() => downloadOrShare(pdfUrl, 'document.pdf')}
            className="text-sm px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PDF
          </button>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-xl">
          <iframe
            src={pdfUrl}
            className="w-full h-[85vh]"
            title="PDF Preview"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
        <strong>Markdown to PDF:</strong> Write or upload markdown content and convert it into a beautifully formatted PDF document.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Markdown Editor</h3>
              <span className="text-xs text-zinc-400">{markdown.length} chars</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => { setMarkdown(e.target.value); setPdfUrl(null); }}
              placeholder="# Enter your markdown here..."
              className="w-full h-[340px] p-5 bg-transparent text-zinc-800 dark:text-zinc-200 font-mono text-sm resize-none outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">HTML Preview</h3>
            </div>
            <div className="p-5 min-h-[180px] max-h-[260px] overflow-y-auto">
              {htmlPreview ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlPreview) }}
                />
              ) : (
                <p className="text-zinc-400 text-sm italic">Preview will appear here...</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl space-y-5">
            <h4 className="text-zinc-900 dark:text-white font-medium text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2">Options</h4>

            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">Page Size</label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.keys(PAGE_SIZES).map(s => (
                  <button
                    key={s}
                    onClick={() => setPageSize(s)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all border ${pageSize === s ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">Margin</label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.keys(MARGINS).map(m => (
                  <button
                    key={m}
                    onClick={() => setMargin(m)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all border capitalize ${margin === m ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-300'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">Font Size</label>
              <div className="grid grid-cols-4 gap-1.5">
                {FONT_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all border ${fontSize === s ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTitlePage}
                onChange={(e) => setIncludeTitlePage(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Include title page</span>
            </label>

            <button
              onClick={handleConvert}
              disabled={isProcessing || !markdown.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  Convert to PDF
                </>
              )}
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl">
            <h4 className="text-zinc-900 dark:text-white font-medium text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-3">Import .md</h4>
            <FileUploader
              accept=".md,.markdown,text/markdown"
              onFileSelect={handleFileSelect as any}
              title="Upload Markdown File"
              subtitle="Drag & drop .md file here"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
