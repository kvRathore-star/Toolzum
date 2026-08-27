import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BatchProgressPanel } from '@/components/tools/BatchProgressPanel';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => <span data-testid="check-icon" className={className}>✓</span>,
  X: ({ className }: { className?: string }) => <span data-testid="x-icon" className={className}>X</span>,
  Loader2: ({ className }: { className?: string }) => <span data-testid="loader-icon" className={className}>...</span>,
  AlertTriangle: ({ className }: { className?: string }) => <span data-testid="alert-icon" className={className}>!</span>,
  FileText: ({ className }: { className?: string }) => <span data-testid="file-icon" className={className}>📄</span>,
}));

const mockFiles = [
  { id: '1', file: { name: 'test1.txt', size: 1024 }, status: 'done' as const, progress: 100 },
  { id: '2', file: { name: 'test2.txt', size: 2048 }, status: 'processing' as const, progress: 50 },
  { id: '3', file: { name: 'test3.txt', size: 512 }, status: 'error' as const, progress: 0, error: 'Failed' },
];

const mockProgress = {
  total: 3,
  completed: 1,
  failed: 1,
  processing: 1,
  percent: 33,
};

describe('BatchProgressPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no files', () => {
    const { container } = render(
      <BatchProgressPanel
        files={[]}
        progress={{ total: 0, completed: 0, failed: 0, processing: 0, percent: 0 }}
        isProcessing={false}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders file list', () => {
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={false}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    
    expect(screen.getByText('test1.txt')).toBeDefined();
    expect(screen.getByText('test2.txt')).toBeDefined();
    expect(screen.getByText('test3.txt')).toBeDefined();
  });

  it('shows file count in header', () => {
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={false}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    
    expect(screen.getByText('Files (3)')).toBeDefined();
  });

  it('shows completed count', () => {
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={false}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    
    expect(screen.getByText('1 done')).toBeDefined();
  });

  it('shows failed count', () => {
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={false}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    
    expect(screen.getByText('1 failed')).toBeDefined();
  });

  it('shows processing count when processing', () => {
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={true}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    
    expect(screen.getByText('1 processing')).toBeDefined();
  });

  it('shows progress bar', () => {
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={false}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    
    const progressBar = document.querySelector('[style*="width: 33%"]');
    expect(progressBar).toBeDefined();
  });

  it('calls onRemove when clicking remove button', () => {
    const onRemove = vi.fn();
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={false}
        onRemove={onRemove}
        onClear={vi.fn()}
      />
    );
    
    // Click remove on first file
    const removeButtons = screen.getAllByTestId('x-icon');
    fireEvent.click(removeButtons[0].closest('button')!);
    
    expect(onRemove).toHaveBeenCalledWith('1');
  });

  it('shows clear button when not processing and has completed files', () => {
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={false}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    
    expect(screen.getByText('Clear')).toBeDefined();
  });

  it('hides clear button when processing', () => {
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={true}
        onRemove={vi.fn()}
        onClear={vi.fn()}
        onAbort={vi.fn()}
      />
    );
    
    expect(screen.queryByText('Clear')).toBeNull();
  });

  it('shows stop button when processing and onAbort provided', () => {
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={true}
        onRemove={vi.fn()}
        onClear={vi.fn()}
        onAbort={vi.fn()}
      />
    );
    
    expect(screen.getByText('Stop')).toBeDefined();
  });

  it('calls onAbort when clicking stop', () => {
    const onAbort = vi.fn();
    render(
      <BatchProgressPanel
        files={mockFiles}
        progress={mockProgress}
        isProcessing={true}
        onRemove={vi.fn()}
        onClear={vi.fn()}
        onAbort={onAbort}
      />
    );
    
    fireEvent.click(screen.getByText('Stop'));
    expect(onAbort).toHaveBeenCalledTimes(1);
  });

  it('formats file sizes correctly', () => {
    render(
      <BatchProgressPanel
        files={[
          { id: '1', file: { name: 'small.txt', size: 500 }, status: 'done', progress: 100 },
          { id: '2', file: { name: 'medium.txt', size: 1536 }, status: 'done', progress: 100 },
          { id: '3', file: { name: 'large.txt', size: 2097152 }, status: 'done', progress: 100 },
        ]}
        progress={{ total: 3, completed: 3, failed: 0, processing: 0, percent: 100 }}
        isProcessing={false}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );
    
    expect(screen.getByText('500 B')).toBeDefined();
    expect(screen.getByText('1.5 KB')).toBeDefined();
    expect(screen.getByText('2.0 MB')).toBeDefined();
  });
});
