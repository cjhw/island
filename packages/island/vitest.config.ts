import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    // 多线程
    threads: true
  }
});
