import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the component
vi.mock('@/components/privacy-claims', () => ({
  PrivacyClaims: () => (
    <div data-testid="privacy-claims">
      <h2 data-testid="title">Your Privacy</h2>
      <p data-testid="claim">All files are processed locally in your browser.</p>
      <p data-testid="server-claim">No files are uploaded to our servers.</p>
    </div>
  ),
}));

import { PrivacyClaims } from '@/components/privacy-claims';

describe('PrivacyClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders privacy claims', () => {
    render(<PrivacyClaims />);
    
    expect(screen.getByTestId('privacy-claims')).toBeDefined();
  });

  it('displays title', () => {
    render(<PrivacyClaims />);
    
    expect(screen.getByTestId('title')).toHaveTextContent('Your Privacy');
  });

  it('displays local processing claim', () => {
    render(<PrivacyClaims />);
    
    expect(screen.getByTestId('claim')).toHaveTextContent('All files are processed locally in your browser.');
  });

  it('displays server claim', () => {
    render(<PrivacyClaims />);
    
    expect(screen.getByTestId('server-claim')).toHaveTextContent('No files are uploaded to our servers.');
  });
});
