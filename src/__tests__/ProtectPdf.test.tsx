import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('pdfjs-dist', () => ({
  version: '4.0.379',
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn().mockReturnValue({ promise: Promise.resolve({ numPages: 1 }) }),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(),
    deletePage: vi.fn(),
    addImage: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob()),
  })),
}));

import ProtectPdf from '@/components/tools/modules/pdf/ProtectPdf';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProtectPdf', () => {
  it('renders without crashing', () => {
    render(<ProtectPdf />);
    expect(screen.getByText('Protect PDF')).toBeInTheDocument();
  });

  it('shows unlock mode button', () => {
    render(<ProtectPdf />);
    expect(screen.getByText('Unlock PDF')).toBeInTheDocument();
  });

  it('shows client-side security message', () => {
    render(<ProtectPdf />);
    expect(screen.getByText(/Client-Side Encryption/)).toBeInTheDocument();
  });
});
