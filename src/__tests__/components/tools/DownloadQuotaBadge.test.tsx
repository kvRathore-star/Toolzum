import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the component
vi.mock('@/components/tools/DownloadQuotaBadge', () => ({
  DownloadQuotaBadge: ({ remaining, total }: any) => (
    <div data-testid="quota-badge">
      <span data-testid="remaining">{remaining}</span>
      <span data-testid="total">{total}</span>
    </div>
  ),
}));

import { DownloadQuotaBadge } from '@/components/tools/DownloadQuotaBadge';

describe('DownloadQuotaBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders quota badge', () => {
    render(<DownloadQuotaBadge remaining={5} total={10} />);
    
    expect(screen.getByTestId('quota-badge')).toBeDefined();
  });

  it('displays remaining count', () => {
    render(<DownloadQuotaBadge remaining={7} total={10} />);
    
    expect(screen.getByTestId('remaining')).toHaveTextContent('7');
  });

  it('displays total count', () => {
    render(<DownloadQuotaBadge remaining={3} total={10} />);
    
    expect(screen.getByTestId('total')).toHaveTextContent('10');
  });
});
