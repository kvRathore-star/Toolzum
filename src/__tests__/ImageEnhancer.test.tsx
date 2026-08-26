import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

import ImageEnhancer from '@/components/tools/modules/image/ImageEnhancer';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ImageEnhancer', () => {
  it('renders without crashing', () => {
    render(<ImageEnhancer />);
    expect(screen.getByText(/Hardware Accelerated Filters/)).toBeInTheDocument();
  });

  it('shows upload title', () => {
    render(<ImageEnhancer />);
    expect(screen.getByText(/Upload Photo to Enhance/)).toBeInTheDocument();
  });
});
