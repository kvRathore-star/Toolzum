import { describe, it, expect } from 'vitest';
import { jsPDF } from 'jspdf';

describe('jspdf', () => {
  it('creates PDF document', () => {
    const doc = new jsPDF();
    expect(doc).toBeDefined();
    expect(doc.internal).toBeDefined();
  });

  it('adds text to PDF', () => {
    const doc = new jsPDF();
    doc.text('Hello World', 10, 10);
    expect(doc.internal.pageSize.width).toBeGreaterThan(200);
  });

  it('saves PDF', () => {
    const doc = new jsPDF();
    doc.text('Test', 10, 10);
    const output = doc.output('datauristring');
    expect(output).toContain('data:application/pdf');
  });

  it('creates PDF with custom orientation', () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    expect(doc.internal.pageSize.width).toBeGreaterThan(280);
  });

  it('creates PDF with custom format', () => {
    const doc = new jsPDF({ format: 'letter' });
    expect(doc.internal.pageSize.width).toBeGreaterThan(210);
  });
});
