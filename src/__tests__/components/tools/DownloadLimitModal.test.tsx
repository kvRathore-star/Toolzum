import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DownloadLimitModal } from '@/components/tools/DownloadLimitModal';
import { setSignedIn } from '@/lib/session-state';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Crown: ({ className }: { className?: string }) => <span data-testid="crown-icon" className={className}>Crown</span>,
  Lock: ({ className }: { className?: string }) => <span data-testid="lock-icon" className={className}>Lock</span>,
  X: ({ className }: { className?: string }) => <span data-testid="x-icon" className={className}>X</span>,
}));

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('DownloadLimitModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSignedIn(false);
  });

  afterEach(() => {
    setSignedIn(false);
  });

  it('renders nothing when no event', () => {
    const { container } = render(<DownloadLimitModal />);
    expect(container.innerHTML).toBe('');
  });

  it('shows modal on download-blocked event', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    
    expect(screen.getByText("You've used your 3 free downloads")).toBeDefined();
  });

  it('shows modal on plan-limit event for file_size', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:plan-limit', {
      detail: { reason: 'file_size', limit: 30, actual: 50 }
    }));
    
    expect(screen.getByText('File too large for guest use (30MB)')).toBeDefined();
  });

  it('shows modal on plan-limit event for batch_size', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:plan-limit', {
      detail: { reason: 'batch_size', limit: 5, actual: 10 }
    }));
    
    expect(screen.getByText('Guests are limited to 1 file at a time')).toBeDefined();
  });

  it('closes modal when clicking close button', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    expect(screen.getByText("You've used your 3 free downloads")).toBeDefined();
    
    fireEvent.click(screen.getByTestId('x-icon'));
    expect(screen.queryByText("You've used your 3 free downloads")).toBeNull();
  });

  it('closes modal when clicking backdrop', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    
    const backdrop = screen.getByRole('button', { name: 'Close dialog' });
    fireEvent.click(backdrop);
    
    expect(screen.queryByText("You've used your 3 free downloads")).toBeNull();
  });

  it('shows upgrade link', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    
    const upgradeLink = screen.getByText('Upgrade to Pro — Unlimited');
    expect(upgradeLink).toBeDefined();
    expect(upgradeLink.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('shows sign-in link', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    
    const signInLink = screen.getByText('Sign in free — unlock 5/day + 5 trial credits');
    expect(signInLink).toBeDefined();
  });

  it('shows maybe later button', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    
    expect(screen.getByText('Maybe later')).toBeDefined();
  });

  it('signed-in users see no sign-in CTA (Sep 2026 cookie-sniff bug)', () => {
    setSignedIn(true);
    render(<DownloadLimitModal />);

    fireEvent(window, new CustomEvent('toolzum:download-blocked'));

    expect(screen.getByText('Daily download limit reached')).toBeDefined();
    expect(screen.queryByText(/Sign in free/)).toBeNull();
    expect(screen.queryByText('Maybe later')).toBeDefined();
  });

  it('re-evaluates copy when auth changes while open', () => {
    render(<DownloadLimitModal />);

    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    expect(screen.getByText("You've used your 3 free downloads")).toBeDefined();

    setSignedIn(true);
    fireEvent(window, new CustomEvent('toolzum:auth-changed'));

    expect(screen.getByText('Daily download limit reached')).toBeDefined();
    expect(screen.queryByText(/Sign in free/)).toBeNull();
  });
});
