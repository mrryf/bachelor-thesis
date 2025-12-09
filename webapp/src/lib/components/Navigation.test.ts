import { describe, it, expect } from 'vitest';
import { navItems, githubUrl } from '$lib/data/content';

describe('Navigation Component Data', () => {
    it('should have valid navigation items', () => {
        expect(navItems).toBeDefined();
        expect(navItems.length).toBeGreaterThan(0);
    });

    it('should have expected routes in navigation', () => {
        const routes = navItems.map(item => item.href);
        expect(routes).toContain('/vorstudie');
        expect(routes).toContain('/forschung');
        expect(routes).toContain('/materialien');
        expect(routes).toContain('/glossar');
        expect(routes).toContain('/downloads');
    });

    it('should have valid GitHub URL', () => {
        expect(githubUrl).toBeDefined();
        expect(githubUrl).toMatch(/^https?:\/\//);
    });

    it('should have proper navigation item structure', () => {
        navItems.forEach(item => {
            expect(item).toHaveProperty('title');
            expect(item).toHaveProperty('href');
            expect(typeof item.title).toBe('string');
            expect(typeof item.href).toBe('string');
        });
    });
});

// Note: Component rendering tests for Svelte 5 require additional configuration
// and are currently not supported with @testing-library/svelte for Svelte 5.
// These tests focus on the data layer which is already well covered.
