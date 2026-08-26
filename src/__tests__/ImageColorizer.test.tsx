import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

import ImageColorizer from '@/components/tools/modules/image/ImageColorizer';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ImageColorizer', () => {
  it('renders title', () => {
    render(<ImageColorizer />);
    expect(screen.getByText(/Colorize & Tint Image Filter/)).toBeInTheDocument();
  });

  it('renders upload button', () => {
    render(<ImageColorizer />);
    expect(screen.getByText('Choose Photo')).toBeInTheDocument();
  });

  it('renders file input', () => {
    render(<ImageColorizer />);
    expect(screen.getByLabelText('Choose Photo')).toBeInTheDocument();
  });

  it('shows upload instructions', () => {
    render(<ImageColorizer />);
    expect(screen.getByText(/Upload standard grayscale or color image/)).toBeInTheDocument();
  });

  it('shows placeholder for output', () => {
    render(<ImageColorizer />);
    expect(screen.getByText(/Tinted image preview will appear here/)).toBeInTheDocument();
  });
});
