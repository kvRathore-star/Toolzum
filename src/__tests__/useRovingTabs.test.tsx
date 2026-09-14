import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRovingTabs } from '@/components/useRovingTabs';

const IDS = ['alpha', 'beta', 'gamma'] as const;

function Harness({
  initial = 'alpha',
  onChange,
}: {
  initial?: (typeof IDS)[number];
  onChange?: (id: (typeof IDS)[number]) => void;
}) {
  const tabs = useRovingTabs(IDS, initial, onChange ?? (() => {}), 'data-test-tab');
  return (
    <div role="tablist" aria-label="Test tabs" onKeyDown={tabs.onKeyDown}>
      {IDS.map((id) => (
        <button key={id} role="tab" {...tabs.tabProps(id)}>
          {id}
        </button>
      ))}
    </div>
  );
}

describe('useRovingTabs', () => {
  it('single tab stop: only the active tab is tabbable', () => {
    render(<Harness initial="beta" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('tabindex', '-1');
    expect(tabs[1]).toHaveAttribute('tabindex', '0');
    expect(tabs[2]).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowRight moves selection forward and wraps', () => {
    const onChange = vi.fn();
    render(<Harness initial="gamma" onChange={onChange} />);
    const tabs = screen.getAllByRole('tab');
    tabs[2].focus();
    fireEvent.keyDown(tabs[2], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('alpha');
    expect(document.activeElement).toHaveAttribute('data-test-tab', 'alpha');
  });

  it('ArrowLeft moves selection backward', () => {
    const onChange = vi.fn();
    render(<Harness initial="beta" onChange={onChange} />);
    const tabs = screen.getAllByRole('tab');
    tabs[1].focus();
    fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('alpha');
  });

  it('Home/End jump to first/last tab', () => {
    const onChange = vi.fn();
    render(<Harness initial="beta" onChange={onChange} />);
    const tabs = screen.getAllByRole('tab');
    fireEvent.keyDown(tabs[1], { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith('alpha');
    fireEvent.keyDown(tabs[1], { key: 'End' });
    expect(onChange).toHaveBeenCalledWith('gamma');
  });

  it('unrelated keys are ignored', () => {
    const onChange = vi.fn();
    render(<Harness initial="alpha" onChange={onChange} />);
    fireEvent.keyDown(screen.getAllByRole('tab')[0], { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
