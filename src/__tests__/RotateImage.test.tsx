import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/keyboard', () => ({
  useEnterToSubmit: vi.fn().mockReturnValue(vi.fn()),
}));

import RotateImage from '@/components/tools/modules/image/RotateImage';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RotateImage', () => {
  it('renders without crashing', () => {
    render(<RotateImage />);
    expect(screen.getByText('Rotate & Flip Image')).toBeInTheDocument();
  });

  it('shows upload area', () => {
    render(<RotateImage />);
    expect(screen.getByText(/Click or Drag Image Here/)).toBeInTheDocument();
  });

  it('shows description text', () => {
    render(<RotateImage />);
    expect(screen.getByText(/Rotate to any angle/)).toBeInTheDocument();
  });
});
