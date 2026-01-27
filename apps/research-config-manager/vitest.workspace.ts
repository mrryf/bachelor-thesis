import { defineWorkspace } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineWorkspace([
  {
    test: {
      name: 'main',
      include: ['src/main/**/*.test.ts'],
      environment: 'node',
      globals: true
    },
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main'),
        '@shared': resolve(__dirname, 'src/shared')
      }
    }
  },
  {
    plugins: [svelte({ hot: false })],
    test: {
      name: 'renderer',
      include: ['src/renderer/**/*.test.ts'],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['src/renderer/src/tests/setup.ts']
    },
    resolve: {
      conditions: ['browser'],
      alias: {
        '@main': resolve(__dirname, 'src/main'),
        '@shared': resolve(__dirname, 'src/shared'),
        '$lib': resolve(__dirname, 'src/renderer/src/lib'),
        '@lucide/svelte': resolve(__dirname, 'node_modules/@lucide/svelte')
      }
    }
  }
]);
