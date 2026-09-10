import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalculatorShell } from '@/components/tools/modules/shared/CalculatorShell';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn() },
}));

const defaultProps = {
  title: 'Test Calculator',
  children: <div>child content</div>,
  result: '',
  onCalculate: vi.fn(),
};

function renderShell(overrides = {}) {
  return render(<CalculatorShell {...defaultProps} {...overrides} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CalculatorShell', () => {
  it('renders title', () => {
    renderShell();
    expect(screen.getByText('Test Calculator')).toBeInTheDocument();
  });

  it('renders children', () => {
    renderShell();
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('calls onCalculate on button click', () => {
    const onCalculate = vi.fn();
    renderShell({ onCalculate });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(onCalculate).toHaveBeenCalledTimes(1);
  });

  it('calls onCalculate on Enter key', () => {
    const onCalculate = vi.fn();
    renderShell({ onCalculate });
    const shell = screen.getByText('Test Calculator').closest('div')!;
    fireEvent.keyDown(shell, { key: 'Enter' });
    expect(onCalculate).toHaveBeenCalledTimes(1);
  });

  it('renders custom calculateLabel', () => {
    renderShell({ calculateLabel: 'Compute' });
    expect(screen.getByRole('button', { name: /compute/i })).toBeInTheDocument();
  });

  it('shows result with aria-live', () => {
    const { container } = renderShell({ result: '42' });
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live).toHaveTextContent('42');
  });

  it('shows error styling', () => {
    const { container } = renderShell({ error: 'Invalid input' });
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent('Invalid input');
    expect(live!.className).toContain('bg-red-500/10');
  });

  it('copy button has aria-label when result is set', () => {
    renderShell({ result: '42' });
    expect(screen.getByRole('button', { name: 'Copy result' })).toBeInTheDocument();
  });

  it('history toggle toggles aria-expanded', () => {
    renderShell({ result: '42' });
    const historyBtn = screen.getByRole('button', { name: /show calculation history/i });
    expect(historyBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(historyBtn);
    expect(historyBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders preset buttons', () => {
    const apply = vi.fn();
    const presets = [{ label: 'Preset A', apply }, { label: 'Preset B', apply }];
    renderShell({ presets });
    expect(screen.getByRole('button', { name: /preset a/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preset b/i })).toBeInTheDocument();
  });

  it('download button appears with aria-label when downloadData is set', () => {
    renderShell({ result: '42', downloadData: 'col1,col2\n1,2' });
    expect(screen.getByRole('button', { name: 'Download result' })).toBeInTheDocument();
  });

  it('accent blue applies gradient classes', () => {
    renderShell({ accent: 'blue', result: '42' });
    const calcBtn = screen.getByRole('button', { name: /calculate/i });
    expect(calcBtn.className).toContain('from-blue-600');
    expect(calcBtn.className).toContain('to-cyan-600');
  });
});
