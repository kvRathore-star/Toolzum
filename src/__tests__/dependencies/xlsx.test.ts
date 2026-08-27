import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';

describe('xlsx dependency', () => {
  it('imports xlsx successfully', () => {
    expect(XLSX).toBeDefined();
  });

  it('creates a new workbook', () => {
    const wb = XLSX.utils.book_new();
    expect(wb).toBeDefined();
    expect(wb.SheetNames).toEqual([]);
  });

  it('creates a worksheet from array', () => {
    const data = [
      ['Name', 'Age', 'City'],
      ['Alice', 30, 'New York'],
      ['Bob', 25, 'San Francisco'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    expect(ws).toBeDefined();
    expect(ws['A1'].v).toBe('Name');
    expect(ws['B2'].v).toBe(30);
  });

  it('adds worksheet to workbook', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['Header1', 'Header2'], ['Data1', 'Data2']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    expect(wb.SheetNames).toContain('Sheet1');
  });

  it('converts workbook to CSV', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['A', 'B'], [1, 2]]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const csv = XLSX.utils.sheet_to_csv(ws);
    expect(csv).toContain('A,B');
    expect(csv).toContain('1,2');
  });

  it('converts workbook to JSON', () => {
    const ws = XLSX.utils.aoa_to_sheet([['Name', 'Age'], ['Alice', 30]]);
    const json = XLSX.utils.sheet_to_json(ws);
    expect(json).toEqual([{ Name: 'Alice', Age: 30 }]);
  });

  it('reads workbook from data', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['Test']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    const loadedWb = XLSX.read(data, { type: 'array' });
    expect(loadedWb.SheetNames).toContain('Sheet1');
  });

  it('handles different cell types', () => {
    const data = [
      ['String', 123, 45.67, true, new Date()],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    expect(ws['A1'].v).toBe('String');
    expect(ws['B1'].v).toBe(123);
    expect(ws['C1'].v).toBe(45.67);
    expect(ws['D1'].v).toBe(true);
  });

  it('handles empty cells', () => {
    const data = [
      ['A', '', 'C'],
      ['', 'B', ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    expect(ws['A1'].v).toBe('A');
    expect(ws['C1'].v).toBe('C');
    expect(ws['B2'].v).toBe('B');
  });

  it('supports formulas', () => {
    const data = [
      ['A', 'B', 'Sum'],
      [10, 20, { f: 'A1+B1' }],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    expect(ws['C2'].f).toBe('A1+B1');
  });
});

describe('xlsx integration with Toolzum patterns', () => {
  it('simulates Excel export workflow', () => {
    const data = [
      ['Product', 'Price', 'Quantity'],
      ['Widget A', 9.99, 100],
      ['Widget B', 19.99, 50],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    
    const csv = XLSX.utils.sheet_to_csv(ws);
    expect(csv).toContain('Product');
    expect(csv).toContain('9.99');
  });

  it('simulates CSV import workflow', () => {
    const csv = 'Name,Age\nAlice,30\nBob,25';
    const ws = XLSX.read(csv, { type: 'string' }).Sheets[XLSX.read(csv, { type: 'string' }).SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws);
    
    expect(json).toEqual([
      { Name: 'Alice', Age: 30 },
      { Name: 'Bob', Age: 25 },
    ]);
  });
});
