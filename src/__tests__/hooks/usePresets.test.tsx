import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePresets } from '@/hooks/usePresets';

describe('usePresets', () => {
  const mockOnApply = vi.fn();
  const presets = [
    { label: 'Preset A', value: 'value-a' },
    { label: 'Preset B', value: 'value-b' },
    { label: 'Preset C', value: 'value-c', description: 'Custom description' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns presets and initial state', () => {
    const { result } = renderHook(() =>
      usePresets({ presets, onApply: mockOnApply })
    );

    expect(result.current.presets).toEqual(presets);
    expect(result.current.activePreset).toBeNull();
    expect(typeof result.current.apply).toBe('function');
  });

  it('sets active preset and calls onApply when apply is called', () => {
    const { result } = renderHook(() =>
      usePresets({ presets, onApply: mockOnApply })
    );

    act(() => {
      result.current.apply(presets[0]);
    });

    expect(result.current.activePreset).toBe('Preset A');
    expect(mockOnApply).toHaveBeenCalledWith('value-a');
  });

  it('updates active preset on each apply call', () => {
    const { result } = renderHook(() =>
      usePresets({ presets, onApply: mockOnApply })
    );

    act(() => {
      result.current.apply(presets[0]);
    });
    expect(result.current.activePreset).toBe('Preset A');

    act(() => {
      result.current.apply(presets[1]);
    });
    expect(result.current.activePreset).toBe('Preset B');
  });

  it('passes correct value type for object presets', () => {
    const objectPresets = [
      { label: 'JSON', value: { indent: 2, sort: true } },
      { label: 'Compact', value: { indent: 0, sort: false } },
    ];
    const { result } = renderHook(() =>
      usePresets({ presets: objectPresets, onApply: mockOnApply })
    );

    act(() => {
      result.current.apply(objectPresets[0]);
    });

    expect(mockOnApply).toHaveBeenCalledWith({ indent: 2, sort: true });
  });

  it('re-apply same preset updates activePreset', () => {
    const { result } = renderHook(() =>
      usePresets({ presets, onApply: mockOnApply })
    );

    act(() => {
      result.current.apply(presets[0]);
    });
    act(() => {
      result.current.apply(presets[0]);
    });

    expect(result.current.activePreset).toBe('Preset A');
    expect(mockOnApply).toHaveBeenCalledTimes(2);
  });
});
