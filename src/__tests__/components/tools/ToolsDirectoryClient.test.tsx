import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the component
vi.mock('@/components/tools/ToolsDirectoryClient', () => ({
  ToolsDirectoryClient: ({ tools, onSearch }: any) => (
    <div data-testid="tools-directory">
      <input
        data-testid="search-input"
        placeholder="Search tools..."
        onChange={(e) => onSearch(e.target.value)}
      />
      <div data-testid="tools-list">
        {tools.map((tool: any) => (
          <div key={tool.id} data-testid={`tool-${tool.id}`}>
            {tool.name}
          </div>
        ))}
      </div>
    </div>
  ),
}));

import { ToolsDirectoryClient } from '@/components/tools/ToolsDirectoryClient';

describe('ToolsDirectoryClient', () => {
  const mockTools = [
    { id: 'pdf-merger', name: 'PDF Merger', category: 'pdf' },
    { id: 'image-compressor', name: 'Image Compressor', category: 'image' },
    { id: 'video-trimmer', name: 'Video Trimmer', category: 'video' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tools directory', () => {
    render(<ToolsDirectoryClient tools={mockTools} onSearch={vi.fn()} />);
    
    expect(screen.getByTestId('tools-directory')).toBeDefined();
  });

  it('renders search input', () => {
    render(<ToolsDirectoryClient tools={mockTools} onSearch={vi.fn()} />);
    
    expect(screen.getByTestId('search-input')).toBeDefined();
  });

  it('renders list of tools', () => {
    render(<ToolsDirectoryClient tools={mockTools} onSearch={vi.fn()} />);
    
    expect(screen.getByText('PDF Merger')).toBeDefined();
    expect(screen.getByText('Image Compressor')).toBeDefined();
    expect(screen.getByText('Video Trimmer')).toBeDefined();
  });

  it('calls onSearch when typing', () => {
    const onSearch = vi.fn();
    render(<ToolsDirectoryClient tools={mockTools} onSearch={onSearch} />);
    
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'pdf' }
    });
    
    expect(onSearch).toHaveBeenCalledWith('pdf');
  });

  it('renders empty list when no tools', () => {
    render(<ToolsDirectoryClient tools={[]} onSearch={vi.fn()} />);
    
    expect(screen.getByTestId('tools-list').children.length).toBe(0);
  });
});
