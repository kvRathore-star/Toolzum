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
      // Baseline measured 2026-09-10 (full suite green under coverage:
      // 195 files / 1134 tests passed): statements 45.10% (52124/115565),
      // branches 50.27% (3498/6958), functions 16.44% (1374/8355),
      // lines 45.10% (52124/115565).
      // Thresholds are ratcheted just below baseline (floor - 1 per metric);
      // raise them as coverage improves, never above a measured value.
      thresholds: {
        statements: 44,
        branches: 49,
        functions: 15,
        lines: 44,
      },
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
