import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/FavoriteStarButton', () => ({
  FavoriteStarButton: () => null,
}));

import { CategoryPageClient } from '@/components/tools/CategoryPageClient';

const freeTools = [
  {
    id: '1',
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Work out percentages.',
    category: 'Calculator',
    isPro: false,
  },
  {
    id: '2',
    slug: 'age-calculator',
    name: 'Age Calculator',
    description: 'Exact age in years.',
    category: 'Calculator',
    isPro: false,
  },
];

describe('CategoryPageClient filter dead-ends (#issue)', () => {
  it('explains an empty Pro filter with a reset path (no silent blank grid)', () => {
    render(<CategoryPageClient category="Calculator" tools={freeTools} />);
    expect(screen.getByText('Percentage Calculator')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Pro' }));
    expect(screen.getByText(/No Pro tools in/)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByText('Percentage Calculator')).toBeDefined();
    expect(screen.getByText('Age Calculator')).toBeDefined();
  });
});
