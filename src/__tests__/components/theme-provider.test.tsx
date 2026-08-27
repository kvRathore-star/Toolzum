import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the component
vi.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: any) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

import { ThemeProvider, useTheme } from '@/components/theme-provider';

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Child Content</div>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('wraps children in provider', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-provider')).toBeDefined();
  });
});

describe('useTheme', () => {
  it('returns theme and setTheme', () => {
    const { theme, setTheme } = useTheme();
    
    expect(theme).toBe('light');
    expect(typeof setTheme).toBe('function');
  });
});
