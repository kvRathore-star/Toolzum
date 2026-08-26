import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToDoList from '@/components/tools/modules/productivity/ToDoList';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('ToDoList', () => {
  it('renders empty state', () => {
    render(<ToDoList />);
    expect(screen.getByText(/No tasks registered yet/)).toBeDefined();
  });

  it('adds todo via input and button', () => {
    render(<ToDoList />);
    const input = screen.getByPlaceholderText(/What needs to be accomplished/);
    fireEvent.change(input, { target: { value: 'Buy groceries' } });
    fireEvent.click(screen.getByLabelText('Add'));
    expect(screen.getByText('Buy groceries')).toBeDefined();
  });

  it('toggles todo completion', () => {
    render(<ToDoList />);
    const input = screen.getByPlaceholderText(/What needs to be accomplished/);
    fireEvent.change(input, { target: { value: 'Task 1' } });
    fireEvent.click(screen.getByLabelText('Add'));
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('deletes todo', () => {
    render(<ToDoList />);
    const input = screen.getByPlaceholderText(/What needs to be accomplished/);
    fireEvent.change(input, { target: { value: 'Task to delete' } });
    fireEvent.click(screen.getByLabelText('Add'));
    expect(screen.getByText('Task to delete')).toBeDefined();
    fireEvent.click(screen.getByLabelText('Delete'));
    expect(screen.queryByText('Task to delete')).toBeNull();
  });

  it('has proper aria attributes on buttons', () => {
    render(<ToDoList />);
    expect(screen.getByLabelText('Add')).toBeDefined();
  });
});
