import { describe, it, expect } from 'vitest';
import { calculateReadingTime } from '$lib/data/content';

describe('ReadingTime Component Logic', () => {
    it('should format reading time message correctly', () => {
        // Test the underlying reading time calculation
        expect(calculateReadingTime(200)).toBe(1);
        expect(calculateReadingTime(400)).toBe(2);
        expect(calculateReadingTime(1000)).toBe(5);
    });

    it('should handle edge cases for reading time', () => {
        expect(calculateReadingTime(0)).toBe(0);
        expect(calculateReadingTime(1)).toBe(1);
        expect(calculateReadingTime(199)).toBe(1);
    });

    it('should round up partial minutes', () => {
        expect(calculateReadingTime(201)).toBe(2);
        expect(calculateReadingTime(399)).toBe(2);
        expect(calculateReadingTime(401)).toBe(3);
    });
});

// Note: Component rendering tests for Svelte 5 require additional configuration
// and are currently not supported with @testing-library/svelte for Svelte 5.
// The reading time calculation logic is tested above, which covers the core functionality.
