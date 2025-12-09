import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/tests/setup.ts'],
        alias: {
            $lib: '/src/lib',
            $app: '/node_modules/@sveltejs/kit/src/runtime/app'
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/tests/',
                '**/*.config.{js,ts}',
                '**/*.d.ts',
                '**/index.ts'
            ]
        }
    }
});
