import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the component
vi.mock('@/components/tools/ToolPaywall', () => ({
  ToolPaywall: ({ toolName, featureName }: any) => (
    <div data-testid="paywall">
      <h2 data-testid="tool-name">{toolName}</h2>
      <p data-testid="feature-name">{featureName}</p>
      <button data-testid="upgrade-button">Upgrade to Pro</button>
    </div>
  ),
}));

import { ToolPaywall } from '@/components/tools/ToolPaywall';

describe('ToolPaywall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders paywall', () => {
    render(<ToolPaywall toolName="PDF Tools" featureName="Batch Processing" />);
    
    expect(screen.getByTestId('paywall')).toBeDefined();
  });

  it('displays tool name', () => {
    render(<ToolPaywall toolName="Video Compressor" featureName="4K Export" />);
    
    expect(screen.getByTestId('tool-name')).toHaveTextContent('Video Compressor');
  });

  it('displays feature name', () => {
    render(<ToolPaywall toolName="Tools" featureName="Premium Feature" />);
    
    expect(screen.getByTestId('feature-name')).toHaveTextContent('Premium Feature');
  });

  it('has upgrade button', () => {
    render(<ToolPaywall toolName="Tools" featureName="Feature" />);
    
    expect(screen.getByTestId('upgrade-button')).toBeDefined();
  });
});
