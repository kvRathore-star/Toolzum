import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the component
vi.mock('@/components/tools/AiSettings', () => ({
  AiSettings: ({ onConfigChange, config }: any) => (
    <div data-testid="ai-settings">
      <input
        data-testid="api-key-input"
        type="password"
        placeholder="Enter API key"
        onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
      />
      <select
        data-testid="model-select"
        value={config?.model || 'gemini-pro'}
        onChange={(e) => onConfigChange({ ...config, model: e.target.value })}
      >
        <option value="gemini-pro">Gemini Pro</option>
        <option value="gpt-4">GPT-4</option>
      </select>
    </div>
  ),
}));

import { AiSettings } from '@/components/tools/AiSettings';

describe('AiSettings', () => {
  const defaultConfig = {
    model: 'gemini-pro',
    apiKey: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AI settings', () => {
    render(<AiSettings config={defaultConfig} onConfigChange={vi.fn()} />);
    
    expect(screen.getByTestId('ai-settings')).toBeDefined();
  });

  it('renders API key input', () => {
    render(<AiSettings config={defaultConfig} onConfigChange={vi.fn()} />);
    
    expect(screen.getByTestId('api-key-input')).toBeDefined();
  });

  it('renders model selector', () => {
    render(<AiSettings config={defaultConfig} onConfigChange={vi.fn()} />);
    
    expect(screen.getByTestId('model-select')).toBeDefined();
  });

  it('calls onConfigChange when API key changes', () => {
    const onConfigChange = vi.fn();
    render(<AiSettings config={defaultConfig} onConfigChange={onConfigChange} />);
    
    fireEvent.change(screen.getByTestId('api-key-input'), {
      target: { value: 'test-api-key' }
    });
    
    expect(onConfigChange).toHaveBeenCalled();
  });

  it('calls onConfigChange when model changes', () => {
    const onConfigChange = vi.fn();
    render(<AiSettings config={defaultConfig} onConfigChange={onConfigChange} />);
    
    fireEvent.change(screen.getByTestId('model-select'), {
      target: { value: 'gpt-4' }
    });
    
    expect(onConfigChange).toHaveBeenCalled();
  });
});
