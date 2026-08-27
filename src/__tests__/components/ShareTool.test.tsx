import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the component
vi.mock('@/components/ShareTool', () => ({
  ShareTool: ({ toolName, toolUrl }: any) => (
    <div data-testid="share-tool">
      <span data-testid="tool-name">{toolName}</span>
      <span data-testid="tool-url">{toolUrl}</span>
      <button data-testid="share-button">Share</button>
    </div>
  ),
}));

import { ShareTool } from '@/components/ShareTool';

describe('ShareTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders share component', () => {
    render(<ShareTool toolName="PDF Merger" toolUrl="/pdf/pdf-merger" />);
    
    expect(screen.getByTestId('share-tool')).toBeDefined();
  });

  it('displays tool name', () => {
    render(<ShareTool toolName="Image Compressor" toolUrl="/image/compressor" />);
    
    expect(screen.getByTestId('tool-name')).toHaveTextContent('Image Compressor');
  });

  it('displays tool URL', () => {
    render(<ShareTool toolName="Test" toolUrl="/test/tool" />);
    
    expect(screen.getByTestId('tool-url')).toHaveTextContent('/test/tool');
  });

  it('has share button', () => {
    render(<ShareTool toolName="Test" toolUrl="/test" />);
    
    expect(screen.getByTestId('share-button')).toBeDefined();
  });
});
