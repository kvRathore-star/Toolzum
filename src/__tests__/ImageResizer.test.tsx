import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/context/WorkflowPresetContext', () => ({
  usePresetContext: () => ({
    registerConfig: vi.fn(),
  }),
}));

vi.mock('@/lib/keyboard', () => ({
  useEnterToSubmit: vi.fn().mockReturnValue(vi.fn()),
}));

import ImageResizer from '@/components/tools/modules/image/ImageResizer';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ImageResizer', () => {
  it('renders without crashing', () => {
    render(<ImageResizer />);
    expect(screen.getByText('Image Resizer')).toBeInTheDocument();
  });

  it('shows upload area', () => {
    render(<ImageResizer />);
    expect(screen.getByText(/Click or Drag Image Here/)).toBeInTheDocument();
  });
});
