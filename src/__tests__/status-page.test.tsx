import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatusPage from '@/app/status/page';

// Mock Next.js Link (none used directly, but keep the render env consistent)
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock lucide-react icons used by the status page
vi.mock('lucide-react', () => {
  const stub = ({ className }: { className?: string }) => <span className={className} />;
  return {
    Activity: stub,
    CheckCircle: stub,
    RefreshCw: stub,
    Server: stub,
    ShieldCheck: stub,
    Cpu: stub,
    Network: stub,
  };
});

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('StatusPage live probes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts unchecked (no fabricated green) and measures on demand', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })),
    );
    render(<StatusPage />);

    // Pre-check: honest idle state, not fake-operational.
    expect(screen.getAllByText('Not checked').length).toBeGreaterThan(0);
    expect(screen.getByText('Status — Run a Check')).toBeDefined();

    fireEvent.click(screen.getByText('Run Infrastructure Ping Check'));

    // Probes resolve: header flips to operational, latencies are measured.
    await waitFor(() => {
      expect(screen.getByText('All Systems Operational')).toBeDefined();
    });
    expect(screen.getAllByText('Operational').length).toBeGreaterThan(0);
  });

  it('marks unreachable systems instead of faking green', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('Network error');
      }),
    );
    render(<StatusPage />);
    fireEvent.click(screen.getByText('Run Infrastructure Ping Check'));

    await waitFor(() => {
      expect(screen.getByText('Partial Outage Detected')).toBeDefined();
    });
    expect(screen.getAllByText('Unreachable').length).toBeGreaterThan(0);
  });
});
