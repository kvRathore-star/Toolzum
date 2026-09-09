import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorMessage } from '@/components/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders title, message and detail in an alert landmark', () => {
    render(<ErrorMessage title="T" message="M" detail="D" />);
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('T')).toBeDefined();
    expect(screen.getByText('M')).toBeDefined();
    expect(screen.getByText('D')).toBeDefined();
  });

  it('omits buttons with no actions', () => {
    render(<ErrorMessage title="T" message="M" />);
    expect(screen.queryByText('Retry')).toBeNull();
    expect(screen.queryByText('Refresh Page')).toBeNull();
    expect(screen.queryByText('Copy Error')).toBeNull();
  });

  it('fires retry and shows pending state', () => {
    const onRetry = vi.fn();
    const { rerender } = render(<ErrorMessage title="T" message="M" onRetry={onRetry} />);
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    rerender(<ErrorMessage title="T" message="M" onRetry={onRetry} retryPending />);
    expect(screen.getByText('Retrying…')).toBeDefined();
  });
});
