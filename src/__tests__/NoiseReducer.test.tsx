import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/hooks/useFFmpeg', () => ({
  useFFmpeg: () => ({
    isLoaded: true,
    isLoading: false,
    progress: 0,
    loadFFmpeg: vi.fn(),
  }),
}));

import NoiseReducer from '@/components/tools/modules/audio/NoiseReducer';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NoiseReducer', () => {
  it('renders title', () => {
    render(<NoiseReducer />);
    expect(screen.getByText('Audio Noise Reducer')).toBeInTheDocument();
  });

  it('shows description', () => {
    render(<NoiseReducer />);
    expect(screen.getByText(/Remove background noise/)).toBeInTheDocument();
  });
});
