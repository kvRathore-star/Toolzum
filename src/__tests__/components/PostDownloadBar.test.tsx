import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PostDownloadBar } from '@/components/PostDownloadBar';
import { setSignedIn } from '@/lib/session-state';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock lazy motion (framer-motion) — plain passthrough for tests
vi.mock('@/components/LazyMotion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  MotionDiv: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Sparkles: ({ className }: any) => <span data-testid="sparkles-icon" className={className} />,
  X: ({ className }: any) => <span data-testid="x-icon" className={className} />,
}));

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('PostDownloadBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setSignedIn(false);
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    setSignedIn(false);
  });

  it('shows the sign-in prompt to anonymous visitors after a download', () => {
    render(<PostDownloadBar />);

    act(() => {
      fireEvent(window, new CustomEvent('toolzum:download-completed'));
    });

    expect(screen.getByText('Loved the tool?')).toBeDefined();
    expect(screen.getByText('Sign In Free')).toBeDefined();
  });

  it('never shows a sign-in prompt to signed-in users (Sep 2026 bug)', () => {
    setSignedIn(true);
    render(<PostDownloadBar />);

    act(() => {
      fireEvent(window, new CustomEvent('toolzum:download-completed'));
    });

    expect(screen.queryByText('Loved the tool?')).toBeNull();
    expect(screen.queryByText('Sign In Free')).toBeNull();
  });

  it('hides the prompt when the user signs in while it is open', () => {
    render(<PostDownloadBar />);

    act(() => {
      fireEvent(window, new CustomEvent('toolzum:download-completed'));
    });
    expect(screen.getByText('Loved the tool?')).toBeDefined();

    act(() => {
      setSignedIn(true);
    });
    expect(screen.queryByText('Loved the tool?')).toBeNull();
  });
});
