import { describe, it, expect } from 'vitest';
import {
  getCategoryTheme,
  getCategoryGroup,
  getGroupedCategories,
  CATEGORY_GROUPS,
  CATEGORY_DISPLAY_NAMES,
  GROUP_ORDER,
} from '@/lib/categoryTheme';

describe('getCategoryTheme', () => {
  it('returns a theme for a known category', () => {
    const theme = getCategoryTheme('Image');
    expect(theme).toHaveProperty('icon');
    expect(theme).toHaveProperty('iconColor', 'text-purple-500');
    expect(theme).toHaveProperty('bgTint');
    expect(theme).toHaveProperty('gradientHover');
  });

  it('returns a theme for PDF category', () => {
    const theme = getCategoryTheme('PDF');
    expect(theme.iconColor).toBe('text-amber-500');
  });

  it('returns a theme for Developer category', () => {
    const theme = getCategoryTheme('Developer');
    expect(theme.iconColor).toBe('text-cyan-500');
  });

  it('returns default theme for unknown category', () => {
    const theme = getCategoryTheme('UnknownCategory');
    expect(theme).toHaveProperty('icon');
    expect(theme.iconColor).toBe('text-[var(--text-muted)]');
  });
});

describe('getCategoryGroup', () => {
  it('returns group label for known categories', () => {
    expect(getCategoryGroup('Image')).toBe('Media');
    expect(getCategoryGroup('PDF')).toBe('Media');
    expect(getCategoryGroup('Text')).toBe('Text & AI');
    expect(getCategoryGroup('Developer')).toBe('Developer & Tech');
    expect(getCategoryGroup('Finance')).toBe('Business & Finance');
    expect(getCategoryGroup('Utility')).toBe('Tools & Converters');
    expect(getCategoryGroup('Health')).toBe('Lifestyle');
  });

  it('returns Other for unknown category', () => {
    expect(getCategoryGroup('UnknownCategory')).toBe('Other');
  });

  it('returns India 🇮🇳 for indian-utilities', () => {
    expect(getCategoryGroup('indian-utilities')).toBe('India 🇮🇳');
  });
});

describe('getGroupedCategories', () => {
  it('groups categories by their group label', () => {
    const result = getGroupedCategories(['Image', 'PDF', 'Text', 'Developer']);
    expect(result['Media']).toContain('Image');
    expect(result['Media']).toContain('PDF');
    expect(result['Text & AI']).toContain('Text');
    expect(result['Developer & Tech']).toContain('Developer');
  });

  it('sorts categories within each group', () => {
    const result = getGroupedCategories(['PDF', 'Image', 'Video', 'Audio']);
    const media = result['Media'];
    expect(media).toEqual(['Audio', 'Image', 'PDF', 'Video']);
  });

  it('returns empty object for empty input', () => {
    const result = getGroupedCategories([]);
    expect(result).toEqual({});
  });
});

describe('CATEGORY_GROUPS', () => {
  it('has all expected categories', () => {
    expect(CATEGORY_GROUPS).toHaveProperty('Image');
    expect(CATEGORY_GROUPS).toHaveProperty('PDF');
    expect(CATEGORY_GROUPS).toHaveProperty('Text');
    expect(CATEGORY_GROUPS).toHaveProperty('AI');
    expect(CATEGORY_GROUPS).toHaveProperty('Calculator');
  });

  it('each group has label and order', () => {
    Object.values(CATEGORY_GROUPS).forEach(group => {
      expect(group).toHaveProperty('label');
      expect(group).toHaveProperty('order');
      expect(typeof group.label).toBe('string');
      expect(typeof group.order).toBe('number');
    });
  });
});

describe('GROUP_ORDER', () => {
  it('starts with Media', () => {
    expect(GROUP_ORDER[0]).toBe('Media');
  });

  it('is an array of strings', () => {
    expect(Array.isArray(GROUP_ORDER)).toBe(true);
    GROUP_ORDER.forEach(g => expect(typeof g).toBe('string'));
  });
});

describe('CATEGORY_DISPLAY_NAMES', () => {
  it('has display names for key categories', () => {
    expect(CATEGORY_DISPLAY_NAMES['ai']).toBe('AI Tools');
    expect(CATEGORY_DISPLAY_NAMES['calculator']).toBe('Calculator');
    expect(CATEGORY_DISPLAY_NAMES['indian-utilities']).toBe('Indian Utilities');
  });
});
