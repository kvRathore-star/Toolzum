/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      // Reporting only for now — no thresholds until the baseline is
      // measured and the suite is green under coverage.
      exclude: [
        'src/__tests__/**',
        '**/*.test.{ts,tsx}',
        'src/registry/**',
        'scripts/**',
        '.next/**',
        'out/**',
        'e2e/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
