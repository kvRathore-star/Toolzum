import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('qrcode', () => ({
  default: { toCanvas: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

import QrCodeGenerator from '@/components/tools/modules/utility/QrCodeGenerator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('QrCodeGenerator', () => {
  it('renders with URL input field by default', () => {
    render(<QrCodeGenerator />);
    const urlInput = screen.getByLabelText('Website URL');
    expect(urlInput).toBeDefined();
  });

  it('has aria-labels on color inputs', () => {
    render(<QrCodeGenerator />);
    const fgColor = screen.getByLabelText('Foreground color');
    const bgColor = screen.getByLabelText('Background color');
    expect(fgColor).toBeDefined();
    expect(bgColor).toBeDefined();
  });

  it('has aria-label on size slider', () => {
    render(<QrCodeGenerator />);
    const slider = screen.getByLabelText(/QR code size/);
    expect(slider).toBeDefined();
  });

  it('switches to text tab and shows textarea', () => {
    render(<QrCodeGenerator />);
    fireEvent.click(screen.getByText('Text'));
    const textarea = screen.getByDisplayValue('Hello from Toolzum!');
    expect(textarea).toBeDefined();
  });

  it('switches to Wi-Fi tab and shows SSID input', () => {
    render(<QrCodeGenerator />);
    fireEvent.click(screen.getByText('Wi-Fi'));
    const ssidInput = screen.getByDisplayValue('MyNetwork');
    expect(ssidInput).toBeDefined();
  });
});
