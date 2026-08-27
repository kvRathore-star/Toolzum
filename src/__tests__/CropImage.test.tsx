import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('react-cropper', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="cropper">Cropper Component</div>,
}));

vi.mock('cropperjs/dist/cropper.css', () => ({}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/keyboard', () => ({
  useEnterToSubmit: vi.fn().mockReturnValue(vi.fn()),
}));

import CropImage from '@/components/tools/modules/image/CropImage';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CropImage', () => {
  it('renders without crashing', () => {
    render(<CropImage />);
    expect(screen.getByText('Upload Photo to Crop')).toBeInTheDocument();
  });

  it('shows client-side crop message', () => {
    render(<CropImage />);
    expect(screen.getByText(/Client-Side Crop/)).toBeInTheDocument();
  });
});
