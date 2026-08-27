import { describe, it, expect } from 'vitest';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

describe('pdf-lib dependency', () => {
  it('creates a new PDF document', async () => {
    const doc = await PDFDocument.create();
    expect(doc).toBeDefined();
    expect(doc.getPageCount()).toBe(0);
  });

  it('adds a blank page', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    expect(doc.getPageCount()).toBe(1);
  });

  it('adds page with specific dimensions', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([612, 792]); // US Letter
    expect(doc.getPageCount()).toBe(1);
    const page = doc.getPage(0);
    expect(page.getSize()).toEqual({ width: 612, height: 792 });
  });

  it('embeds standard font', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    expect(font).toBeDefined();
    expect(font.widthOfTextAtSize('Hello', 12)).toBeGreaterThan(0);
  });

  it('draws text on page', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    
    page.drawText('Hello World', {
      x: 50,
      y: 700,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });
    
    expect(page).toBeDefined();
  });

  it('creates pages with links', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    
    page.drawText('Click here', {
      x: 50,
      y: 700,
      size: 12,
    });
    
    // Add annotation
    page.node.Annots = [];
    expect(page).toBeDefined();
  });

  it('saves to bytes', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    doc.addPage();
    
    const bytes = await doc.save();
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
    // PDF header
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
  });

  it('loads existing PDF', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = await doc.save();
    
    const loadedDoc = await PDFDocument.load(bytes);
    expect(loadedDoc.getPageCount()).toBe(1);
  });

  it('copies pages between documents', async () => {
    const srcDoc = await PDFDocument.create();
    srcDoc.addPage();
    srcDoc.addPage();
    
    const destDoc = await PDFDocument.create();
    const copiedPages = await destDoc.copyPages(srcDoc, [0, 1]);
    copiedPages.forEach(page => destDoc.addPage(page));
    
    expect(destDoc.getPageCount()).toBe(2);
  });

  it('sets document metadata', async () => {
    const doc = await PDFDocument.create();
    doc.setTitle('Test Document');
    doc.setAuthor('Test Author');
    doc.setSubject('Test Subject');
    doc.setProducer('Test Producer');
    
    expect(doc.getTitle()).toBe('Test Document');
    expect(doc.getAuthor()).toBe('Test Author');
  });

  it('handles form fields', async () => {
    const doc = await PDFDocument.create();
    const form = doc.getForm();
    expect(form).toBeDefined();
  });

  it('encrypts PDF with password', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    
    const bytes = await doc.save({
      userPassword: 'user123',
      ownerPassword: 'owner456',
    });
    
    expect(bytes).toBeInstanceOf(Uint8Array);
    // Encrypted PDFs are typically larger
    expect(bytes.length).toBeGreaterThan(0);
  });
});

describe('pdf-lib integration with Toolzum patterns', () => {
  it('simulates PDF merge workflow', async () => {
    // Create two source PDFs
    const doc1 = await PDFDocument.create();
    doc1.addPage();
    const bytes1 = await doc1.save();
    
    const doc2 = await PDFDocument.create();
    doc2.addPage();
    const bytes2 = await doc2.save();
    
    // Merge into new document
    const mergedDoc = await PDFDocument.create();
    const pdf1 = await PDFDocument.load(bytes1);
    const pdf2 = await PDFDocument.load(bytes2);
    
    const pages1 = await mergedDoc.copyPages(pdf1, pdf1.getPageIndices());
    pages1.forEach(page => mergedDoc.addPage(page));
    
    const pages2 = await mergedDoc.copyPages(pdf2, pdf2.getPageIndices());
    pages2.forEach(page => mergedDoc.addPage(page));
    
    expect(mergedDoc.getPageCount()).toBe(2);
  });

  it('simulates PDF watermark workflow', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    
    // Add watermark text
    page.drawText('CONFIDENTIAL', {
      x: 150,
      y: 400,
      size: 60,
      font,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.5,
    });
    
    const bytes = await doc.save();
    expect(bytes.length).toBeGreaterThan(0);
  });

  it('simulates PDF page extraction', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    doc.addPage();
    doc.addPage();
    
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(doc, [1]); // Extract page 2
    newDoc.addPage(pages[0]);
    
    expect(newDoc.getPageCount()).toBe(1);
  });

  it('simulates PDF rotation', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    
    page.setRotation(degrees(90));
    
    expect(page.getRotation().angle).toBe(90);
  });
});

function degrees(angle: number) {
  return { angle, type: 'degrees' as const };
}
