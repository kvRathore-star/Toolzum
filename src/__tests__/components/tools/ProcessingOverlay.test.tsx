import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessingOverlay } from '@/components/tools/ProcessingOverlay';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className}>Loader</div>
  ),
}));

describe('ProcessingOverlay', () => {
  it('renders children when not processing', () => {
    render(
      <ProcessingOverlay isProcessing={false}>
        <div data-testid="content">Content</div>
      </ProcessingOverlay>
    );
    expect(screen.getByTestId('content')).toBeDefined();
    expect(screen.queryByTestId('loader')).toBeNull();
  });

  it('shows overlay when processing', () => {
    render(
      <ProcessingOverlay isProcessing={true}>
        <div data-testid="content">Content</div>
      </ProcessingOverlay>
    );
    expect(screen.getByTestId('loader')).toBeDefined();
  });

  it('displays default label', () => {
    render(
      <ProcessingOverlay isProcessing={true}>
        <div>Content</div>
      </ProcessingOverlay>
    );
    expect(screen.getByText('Processing...')).toBeDefined();
  });

  it('displays custom label', () => {
    render(
      <ProcessingOverlay isProcessing={true} label="Custom Loading">
        <div>Content</div>
      </ProcessingOverlay>
    );
    expect(screen.getByText('Custom Loading')).toBeDefined();
  });

  it('shows progress bar when progress provided', () => {
    render(
      <ProcessingOverlay isProcessing={true} progress={50}>
        <div>Content</div>
      </ProcessingOverlay>
    );
    // Check for progress bar element
    const progressBar = document.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeDefined();
  });

  it('caps progress at 100%', () => {
    render(
      <ProcessingOverlay isProcessing={true} progress={150}>
        <div>Content</div>
      </ProcessingOverlay>
    );
    const progressBar = document.querySelector('[style*="width: 100%"]');
    expect(progressBar).toBeDefined();
  });

  it('hides progress bar when progress is 0', () => {
    render(
      <ProcessingOverlay isProcessing={true} progress={0}>
        <div>Content</div>
      </ProcessingOverlay>
    );
    const progressBar = document.querySelector('[style*="width"]');
    expect(progressBar).toBeNull();
  });
});
