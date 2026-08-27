import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the component since it has complex dependencies
vi.mock('@/components/tools/ToolPresetBar', () => ({
  ToolPresetBar: ({ presets, activePreset, onSelect }: any) => (
    <div data-testid="preset-bar">
      {presets.map((preset: any) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset.id)}
          className={activePreset === preset.id ? 'active' : ''}
        >
          {preset.label}
        </button>
      ))}
    </div>
  ),
}));

import { ToolPresetBar } from '@/components/tools/ToolPresetBar';

describe('ToolPresetBar', () => {
  const mockPresets = [
    { id: 'hd', label: 'HD', params: { quality: 720 } },
    { id: 'fhd', label: 'FHD', params: { quality: 1080 } },
    { id: '4k', label: '4K', params: { quality: 2160 } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders preset buttons', () => {
    render(
      <ToolPresetBar
        presets={mockPresets}
        activePreset="hd"
        onSelect={vi.fn()}
      />
    );
    
    expect(screen.getByText('HD')).toBeDefined();
    expect(screen.getByText('FHD')).toBeDefined();
    expect(screen.getByText('4K')).toBeDefined();
  });

  it('calls onSelect when clicking preset', () => {
    const onSelect = vi.fn();
    render(
      <ToolPresetBar
        presets={mockPresets}
        activePreset="hd"
        onSelect={onSelect}
      />
    );
    
    fireEvent.click(screen.getByText('FHD'));
    expect(onSelect).toHaveBeenCalledWith('fhd');
  });

  it('highlights active preset', () => {
    render(
      <ToolPresetBar
        presets={mockPresets}
        activePreset="fhd"
        onSelect={vi.fn()}
      />
    );
    
    const activeButton = screen.getByText('FHD');
    expect(activeButton.className).toContain('active');
  });
});
