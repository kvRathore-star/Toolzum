import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/clipboard', () => ({
  clipboardWrite: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/nativeShare', () => ({
  downloadOrShare: vi.fn(),
}));

import UuidGenerator from '@/components/tools/modules/developer/UuidGenerator';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UuidGenerator', () => {
  it('renders without crashing', () => {
    render(<UuidGenerator />);
    expect(screen.getByText(/UUID Generator/)).toBeInTheDocument();
  });

  it('has UUID version buttons', () => {
    render(<UuidGenerator />);
    expect(screen.getByText('v4 (Random)')).toBeInTheDocument();
    expect(screen.getByText('v1 (Time)')).toBeInTheDocument();
  });

  it('has copy all button', () => {
    render(<UuidGenerator />);
    expect(screen.getByText(/Copy All/)).toBeInTheDocument();
  });

  it('has save list button', () => {
    render(<UuidGenerator />);
    expect(screen.getByText(/Save List/)).toBeInTheDocument();
  });

  it('displays generated UUIDs', () => {
    render(<UuidGenerator />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('has quantity slider', () => {
    render(<UuidGenerator />);
    expect(screen.getByText(/Quantity/)).toBeInTheDocument();
  });

  it('has version selector', () => {
    render(<UuidGenerator />);
    expect(screen.getByText('UUID Version')).toBeInTheDocument();
  });

  it('has capitalize toggle', () => {
    render(<UuidGenerator />);
    expect(screen.getByText(/Capitalize/)).toBeInTheDocument();
  });

  it('has hyphens toggle', () => {
    render(<UuidGenerator />);
    expect(screen.getByText(/Hyphens/)).toBeInTheDocument();
  });
});
