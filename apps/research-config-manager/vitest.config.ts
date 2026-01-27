import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/main/**/*.ts', 'src/shared/**/*.ts', 'src/renderer/**/*.svelte'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/index.ts']
    }
  },
  resolve: {
    alias: {
      '@main': resolve(__dirname, 'src/main'),
      '@shared': resolve(__dirname, 'src/shared'),
      '$lib': resolve(__dirname, 'src/renderer/src/lib'),
      '@lucide/svelte': resolve(__dirname, 'node_modules/@lucide/svelte')
    }
  }
});
