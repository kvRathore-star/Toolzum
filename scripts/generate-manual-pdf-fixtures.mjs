#!/usr/bin/env node
/**
 * generate-manual-pdf-fixtures.mjs — builds the known-file fixtures for the
 * manual PDF-editor checklist (docs/pdf-editor-manual-checklist.md).
 *
 *   node scripts/generate-manual-pdf-fixtures.mjs
 *
 * Output: docs/fixtures/pdf-editor-manual/
 *
 * Every PDF contains the literal word SECRET so verification is a text
 * search (`node scripts/pdf-find.mjs <file> SECRET`, or pdftotext|grep).
 * Producers covered here: pdf-lib (base fixtures), real Chrome print-to-PDF,
 * image-only "scan" (screenshot embedded — no text layer BY DESIGN).
 * The Word fixture ships as a .docx source (Word export is a human step);
 * LibreOffice converts it headless AFTER `brew install --cask libreoffice`.
 *
 * Requires: node_modules (pdf-lib, @pdf-lib/fontkit, pdfjs-dist,
 * regenerator-runtime, @playwright/test with channel "chrome") + python3
 * (macOS system) for the .docx.
 */
import 'regenerator-runtime/runtime.js';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import fontkitPkg from '@pdf-lib/fontkit';
import { chromium } from '@playwright/test';

const OUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'docs',
  'fixtures',
  'pdf-editor-manual',
);
fs.mkdirSync(OUT, { recursive: true });

const fontkit = fontkitPkg.default ?? fontkitPkg;
const FIX_FONTS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  '__tests__',
  'fixtures',
  'fonts',
);

const write = async (name, doc) => {
  const p = path.join(OUT, name);
  fs.writeFileSync(p, await doc.save());
  console.log(`  wrote ${name}`);
};

const makeDoc = async () => {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  return doc;
};

const addSecret = async (page, doc, { x = 273, y = 388, size = 20, font } = {}) => {
  const f = font ?? (await doc.embedFont(StandardFonts.Helvetica));
  page.drawText('SECRET', { x, y, size, font: f, color: rgb(0, 0, 0) });
  return f;
};

console.log('Generating manual-checklist fixtures →', OUT);

// 1–4: base, rotation, cropped, multi-page — mirrors e2e/pdf-editor.spec.ts
{
  const doc = await makeDoc();
  const page = doc.addPage([612, 792]);
  page.drawText('Confidential memo', { x: 40, y: 740, size: 14, font: await doc.embedFont(StandardFonts.Helvetica) });
  await addSecret(page, doc);
  await write('secret-letter.pdf', doc);
}
for (const angle of [90, 270]) {
  const doc = await makeDoc();
  const page = doc.addPage([612, 792]);
  await addSecret(page, doc);
  page.setRotation(degrees(angle));
  await write(`secret-rot${angle}.pdf`, doc);
}
{
  const doc = await makeDoc();
  const page = doc.addPage([612, 792]);
  page.setMediaBox(50, 40, 300, 200);
  await addSecret(page, doc, { x: 170, y: 130 });
  await write('secret-cropped.pdf', doc);
}
{
  const doc = await makeDoc();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 5; i++) {
    const page = doc.addPage([612, 792]);
    page.drawText(`Page ${i} of 5`, { x: 40, y: 740, size: 14, font });
    await addSecret(page, doc, { font });
  }
  await write('secret-5pages.pdf', doc);
}

// 5: link annotation + fillable form field (selective keeps them / maximum
// drops them — matches what the UI states; checklist verifies the claim).
{
  const doc = await makeDoc();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  await addSecret(page, doc, { font });
  const form = doc.getForm();
  const tf = form.createTextField('secretfield');
  tf.setText('FORMDATA');
  tf.addToPage(page, { x: 100, y: 600, width: 220, height: 24, font, borderWidth: 1 });
  const link = doc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [100, 500, 320, 530],
    Border: [0, 0, 0],
    A: { Type: 'A', S: 'URI', URI: doc.context.obj('https://example.com/secret-target') },
  });
  page.node.addAnnot(doc.context.register(link));
  page.drawText('click the box below for the reference', { x: 100, y: 536, size: 11, font });
  await write('secret-links-forms.pdf', doc);
}

// 6–7: Hindi + Tamil — Noto fixtures, subset embed (the fixed pipeline).
{
  const cases = [
    ['secret-hindi.pdf', 'noto-sans-devanagari-400.ttf', 'गुप्त शब्द हिन्दी नमूना'],
    ['secret-tamil.pdf', 'noto-sans-tamil-400.ttf', 'ரகசிய சொல் தமிழ் மாதிரி'],
  ];
  for (const [name, ttf, line] of cases) {
    const doc = await makeDoc();
    const font = await doc.embedFont(new Uint8Array(fs.readFileSync(path.join(FIX_FONTS, ttf))), {
      subset: true,
    });
    const page = doc.addPage([612, 792]);
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('Indic sample — same pipeline the editor export uses', {
      x: 40,
      y: 740,
      size: 12,
      font: helv,
    });
    // Fontsource TTFs are subsetted (no Latin glyphs) — split the runs exactly
    // like the editor's splitFontRuns: native text on the Noto face, the
    // SECRET needle on Helvetica so pdf-find can locate it.
    page.drawText(line, { x: 60, y: 400, size: 24, font, color: rgb(0, 0, 0) });
    page.drawText('SECRET', { x: 60, y: 350, size: 24, font: helv, color: rgb(0, 0, 0) });
    await write(name, doc);
  }
}

// 8–9: real Chrome print-to-PDF + an image-only "scan" (both via Chrome).
const chrome = await chromium.launch({ channel: 'chrome' });
try {
  const ctx = await chrome.newContext();
  const page = await ctx.newPage();
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: 612px 792px; margin: 0; }
    body { margin: 0; font-family: Georgia, serif; }
    .memo { padding: 72px; }
    h1 { font-size: 22px; }
    p { font-size: 14px; line-height: 1.6; }
  </style></head><body><div class="memo">
    <h1>Quarterly memo (print from Chrome)</h1>
    <p>Prepared for the review board. The passphrase for the vault is
    <strong>SECRET</strong> — rotate it after the audit.</p>
    <p>Attachment list: 1) ledger, 2) minutes, 3) signatures.</p>
  </div></body></html>`);
  const pdf = await page.pdf({ width: '612px', height: '792px', printBackground: true });
  fs.writeFileSync(path.join(OUT, 'secret-from-chrome.pdf'), pdf);
  console.log('  wrote secret-from-chrome.pdf');

  const scanCtx = await chrome.newContext({
    viewport: { width: 612, height: 792 },
    deviceScaleFactor: 2,
  });
  const scanPage = await scanCtx.newPage();
  await scanPage.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin: 0; width: 612px; height: 792px; background: #fdfdfa;
      font-family: "Courier New", monospace; padding: 64px 56px;
      font-size: 16px; line-height: 1.7; transform: rotate(-0.4deg); }
    h2 { font-size: 18px; }
    .stamp { color: #7a1f1f; border: 3px solid #7a1f1f; display: inline-block;
      padding: 2px 10px; transform: rotate(-6deg); font-weight: bold; }
  </style></head><body>
    <h2>SCANNED MEMO — PAPER ORIGINAL</h2>
    <p>Ref: 2026-QA-004</p>
    <p>The gate phrase for this shipment is SECRET.</p>
    <p>Recipient must shred after reading.</p>
    <p><span class="stamp">CONFIDENTIAL</span></p>
  </body></html>`);
  const png = await scanPage.screenshot();
  const scanDoc = await PDFDocument.create();
  const img = await scanDoc.embedPng(png);
  const scanPg = scanDoc.addPage([612, 792]);
  scanPg.drawImage(img, { x: 0, y: 0, width: 612, height: 792 });
  fs.writeFileSync(path.join(OUT, 'secret-scan.pdf'), await scanDoc.save());
  console.log('  wrote secret-scan.pdf (image-only — pdf-find finds 0 text, BY DESIGN)');
  await scanCtx.close();
  await ctx.close();
} finally {
  await chrome.close();
}

// 10: Word source (.docx) — human step: open in Word → File → Save As PDF
// → secret-from-word.pdf (see the checklist). Built with system python3.
{
  const docxScript = `
import zipfile, sys
content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>'''
rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''
def para(text, bold=False):
    b = '<w:rPr><w:b/></w:rPr>' if bold else ''
    return f'<w:p><w:r>{b}<w:t xml:space="preserve">{text}</w:t></w:r></w:p>'
document = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
{para("Vendor memo (Word source)", True)}
{para("Purpose: this .docx is the human-step source for the Word-produced PDF fixture.")}
{para("The vault passphrase for this test is SECRET.")}
{para("Steps: open in Microsoft Word, File -> Save As -> PDF, save as secret-from-word.pdf next to this file.")}
</w:body></w:document>'''
with zipfile.ZipFile(sys.argv[1], 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('[Content_Types].xml', content_types)
    z.writestr('_rels/.rels', rels)
    z.writestr('word/document.xml', document)
`;
  execFileSync('python3', ['-c', docxScript, path.join(OUT, 'secret-source.docx')]);
  console.log('  wrote secret-source.docx (Word → Save As PDF is a checklist step)');
}

console.log('Done. LibreOffice conversion (after brew install):');
console.log(
  `  /Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to pdf --outdir ${OUT} ${path.join(OUT, 'secret-source.docx')}`,
);
console.log('  then rename secret-source.pdf → secret-from-libreoffice.pdf');
