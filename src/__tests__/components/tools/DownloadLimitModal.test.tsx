import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DownloadLimitModal } from '@/components/tools/DownloadLimitModal';

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
  });

  it('renders nothing when no event', () => {
    const { container } = render(<DownloadLimitModal />);
    expect(container.innerHTML).toBe('');
  });

  it('shows modal on download-blocked event', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    
    expect(screen.getByText('Daily download limit reached')).toBeDefined();
  });

  it('shows modal on plan-limit event for file_size', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:plan-limit', {
      detail: { reason: 'file_size', limit: 30, actual: 50 }
    }));
    
    expect(screen.getByText('File too large for your plan')).toBeDefined();
  });

  it('shows modal on plan-limit event for batch_size', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:plan-limit', {
      detail: { reason: 'batch_size', limit: 5, actual: 10 }
    }));
    
    expect(screen.getByText('Batch too large for your plan')).toBeDefined();
  });

  it('closes modal when clicking close button', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    expect(screen.getByText('Daily download limit reached')).toBeDefined();
    
    fireEvent.click(screen.getByTestId('x-icon'));
    expect(screen.queryByText('Daily download limit reached')).toBeNull();
  });

  it('closes modal when clicking backdrop', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    
    const backdrop = document.querySelector('.fixed.inset-0');
    fireEvent.click(backdrop!);
    
    expect(screen.queryByText('Daily download limit reached')).toBeNull();
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
    
    const signInLink = screen.getByText('Sign in free for 3 more');
    expect(signInLink).toBeDefined();
  });

  it('shows maybe later button', () => {
    render(<DownloadLimitModal />);
    
    fireEvent(window, new CustomEvent('toolzum:download-blocked'));
    
    expect(screen.getByText('Maybe later')).toBeDefined();
  });
});
