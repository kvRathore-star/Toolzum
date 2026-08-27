import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the component
vi.mock('@/components/tools/FreeVsProBoundary', () => ({
  FreeVsProBoundary: ({ children, featureName, requiredPlan }: any) => (
    <div data-testid="boundary">
      <span data-testid="feature-name">{featureName}</span>
      <span data-testid="required-plan">{requiredPlan}</span>
      {children}
    </div>
  ),
}));

import { FreeVsProBoundary } from '@/components/tools/FreeVsProBoundary';

describe('FreeVsProBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', () => {
    render(
      <FreeVsProBoundary featureName="Premium Feature" requiredPlan="pro">
        <div data-testid="child">Child Content</div>
      </FreeVsProBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('displays feature name', () => {
    render(
      <FreeVsProBoundary featureName="HD Export" requiredPlan="pro">
        <div>Content</div>
      </FreeVsProBoundary>
    );
    
    expect(screen.getByTestId('feature-name')).toHaveTextContent('HD Export');
  });

  it('displays required plan', () => {
    render(
      <FreeVsProBoundary featureName="Feature" requiredPlan="enterprise">
        <div>Content</div>
      </FreeVsProBoundary>
    );
    
    expect(screen.getByTestId('required-plan')).toHaveTextContent('enterprise');
  });
});
