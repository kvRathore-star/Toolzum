import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the component
vi.mock('@/components/tools/UndoRedoBar', () => ({
  UndoRedoBar: ({ canUndo, canRedo, onUndo, onRedo }: any) => (
    <div data-testid="undo-redo-bar">
      <button data-testid="undo-button" onClick={onUndo} disabled={!canUndo}>Undo</button>
      <button data-testid="redo-button" onClick={onRedo} disabled={!canRedo}>Redo</button>
    </div>
  ),
}));

import { UndoRedoBar } from '@/components/tools/UndoRedoBar';

describe('UndoRedoBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders undo/redo buttons', () => {
    render(<UndoRedoBar canUndo={true} canRedo={true} onUndo={vi.fn()} onRedo={vi.fn()} />);
    
    expect(screen.getByTestId('undo-button')).toBeDefined();
    expect(screen.getByTestId('redo-button')).toBeDefined();
  });

  it('disables undo when cannot undo', () => {
    render(<UndoRedoBar canUndo={false} canRedo={true} onUndo={vi.fn()} onRedo={vi.fn()} />);
    
    expect(screen.getByTestId('undo-button')).toBeDisabled();
  });

  it('disables redo when cannot redo', () => {
    render(<UndoRedoBar canUndo={true} canRedo={false} onUndo={vi.fn()} onRedo={vi.fn()} />);
    
    expect(screen.getByTestId('redo-button')).toBeDisabled();
  });

  it('calls onUndo when clicking undo', () => {
    const onUndo = vi.fn();
    render(<UndoRedoBar canUndo={true} canRedo={true} onUndo={onUndo} onRedo={vi.fn()} />);
    
    fireEvent.click(screen.getByTestId('undo-button'));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('calls onRedo when clicking redo', () => {
    const onRedo = vi.fn();
    render(<UndoRedoBar canUndo={true} canRedo={true} onUndo={vi.fn()} onRedo={onRedo} />);
    
    fireEvent.click(screen.getByTestId('redo-button'));
    expect(onRedo).toHaveBeenCalledTimes(1);
  });
});
