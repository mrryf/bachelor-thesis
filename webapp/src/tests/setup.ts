import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import '@testing-library/svelte/vitest';

// Mock SvelteKit modules that are not available in test environment
vi.mock('$app/environment', () => ({
    browser: false,
    dev: true,
    building: false,
    version: 'test'
}));

vi.mock('$app/stores', () => {
    const { writable } = require('svelte/store');
    const page = writable({
        url: new URL('http://localhost:5173/'),
        params: {},
        route: { id: null },
        status: 200,
        error: null,
        data: {},
        form: undefined
    });

    return {
        page: {
            subscribe: page.subscribe,
            set: page.set,
            update: page.update
        },
        navigating: writable(null),
        updated: writable(false)
    };
});

// Cleanup after each test
afterEach(() => {
    cleanup();
});
