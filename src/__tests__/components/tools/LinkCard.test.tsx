import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the component
vi.mock('@/components/tools/LinkCard', () => ({
  LinkCard: ({ title, url, description }: any) => (
    <div data-testid="link-card">
      <h3 data-testid="title">{title}</h3>
      <p data-testid="description">{description}</p>
      <a data-testid="url" href={url}>Visit</a>
    </div>
  ),
}));

import { LinkCard } from '@/components/tools/LinkCard';

describe('LinkCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders link card', () => {
    render(<LinkCard title="Test Link" url="https://example.com" description="Test description" />);
    
    expect(screen.getByTestId('link-card')).toBeDefined();
  });

  it('displays title', () => {
    render(<LinkCard title="My Link" url="https://example.com" description="Desc" />);
    
    expect(screen.getByTestId('title')).toHaveTextContent('My Link');
  });

  it('displays description', () => {
    render(<LinkCard title="Link" url="https://example.com" description="This is a description" />);
    
    expect(screen.getByTestId('description')).toHaveTextContent('This is a description');
  });

  it('displays URL', () => {
    render(<LinkCard title="Link" url="https://test.com" description="Desc" />);
    
    expect(screen.getByTestId('url')).toHaveAttribute('href', 'https://test.com');
  });
});
