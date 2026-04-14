import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'e2e-tests/**', '.claude/**'],
    environment: 'jsdom',
    passWithNoTests: true,
  },
});
