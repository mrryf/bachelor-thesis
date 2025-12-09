import { describe, it, expect } from 'vitest';
import {
    calculateReadingTime,
    sections,
    navItems,
    glossaryTerms,
    figures,
    totalWordCount,
    type Section,
    type NavItem
} from './content';

describe('calculateReadingTime', () => {
    it('should calculate reading time correctly for standard word counts', () => {
        expect(calculateReadingTime(200)).toBe(1);
        expect(calculateReadingTime(400)).toBe(2);
        expect(calculateReadingTime(600)).toBe(3);
    });

    it('should round up partial minutes', () => {
        expect(calculateReadingTime(250)).toBe(2); // 1.25 min -> 2 min
        expect(calculateReadingTime(350)).toBe(2); // 1.75 min -> 2 min
        expect(calculateReadingTime(100)).toBe(1); // 0.5 min -> 1 min
    });

    it('should handle zero word count', () => {
        expect(calculateReadingTime(0)).toBe(0);
    });

    it('should handle very large word counts', () => {
        expect(calculateReadingTime(10000)).toBe(50);
        expect(calculateReadingTime(20000)).toBe(100);
    });

    it('should handle single word', () => {
        expect(calculateReadingTime(1)).toBe(1);
    });
});

describe('sections data integrity', () => {
    it('should have all required fields for each section', () => {
        sections.forEach((section: Section) => {
            expect(section).toHaveProperty('id');
            expect(section).toHaveProperty('number');
            expect(section).toHaveProperty('title');
            expect(section).toHaveProperty('content');
            expect(section).toHaveProperty('wordCount');

            expect(typeof section.id).toBe('string');
            expect(typeof section.number).toBe('string');
            expect(typeof section.title).toBe('string');
            expect(typeof section.content).toBe('string');
            expect(typeof section.wordCount).toBe('number');
        });
    });

    it('should have unique section IDs', () => {
        const ids = sections.map(s => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have positive word counts', () => {
        sections.forEach((section: Section) => {
            expect(section.wordCount).toBeGreaterThan(0);
        });
    });

    it('should have valid subsection structure', () => {
        sections.forEach((section: Section) => {
            if (section.subsections) {
                expect(Array.isArray(section.subsections)).toBe(true);
                section.subsections.forEach(sub => {
                    expect(sub).toHaveProperty('id');
                    expect(sub).toHaveProperty('title');
                    expect(sub).toHaveProperty('content');
                });
            }
        });
    });
});

describe('navItems data integrity', () => {
    it('should have all required navigation items', () => {
        expect(navItems.length).toBeGreaterThan(0);

        const expectedRoutes = ['/vorstudie', '/forschung', '/materialien', '/glossar', '/downloads'];
        const actualRoutes = navItems.map((item: NavItem) => item.href);

        expectedRoutes.forEach(route => {
            expect(actualRoutes).toContain(route);
        });
    });

    it('should have valid href structure', () => {
        navItems.forEach((item: NavItem) => {
            expect(item.href).toMatch(/^\/[a-z-]*$/);
        });
    });

    it('should have non-empty titles', () => {
        navItems.forEach((item: NavItem) => {
            expect(item.title).toBeTruthy();
            expect(item.title.length).toBeGreaterThan(0);
        });
    });
});

describe('glossaryTerms data integrity', () => {
    it('should have terms and definitions', () => {
        expect(glossaryTerms.length).toBeGreaterThan(0);

        glossaryTerms.forEach(entry => {
            expect(entry).toHaveProperty('term');
            expect(entry).toHaveProperty('definition');
            expect(typeof entry.term).toBe('string');
            expect(typeof entry.definition).toBe('string');
            expect(entry.term.length).toBeGreaterThan(0);
            expect(entry.definition.length).toBeGreaterThan(0);
        });
    });

    it('should have unique terms', () => {
        const terms = glossaryTerms.map(g => g.term);
        const uniqueTerms = new Set(terms);
        expect(uniqueTerms.size).toBe(terms.length);
    });

    it('should include expected key terms', () => {
        const terms = glossaryTerms.map(g => g.term);
        expect(terms).toContain('TAM');
        expect(terms).toContain('AI-TAM');
        expect(terms).toContain('LLM');
    });
});

describe('figures data integrity', () => {
    it('should have all required figure fields', () => {
        expect(figures.length).toBeGreaterThan(0);

        figures.forEach(figure => {
            expect(figure).toHaveProperty('id');
            expect(figure).toHaveProperty('src');
            expect(figure).toHaveProperty('caption');
            expect(figure).toHaveProperty('alt');
        });
    });

    it('should have valid image paths', () => {
        figures.forEach(figure => {
            expect(figure.src).toMatch(/^\/images\/.+\.(jpg|png|svg)$/);
        });
    });

    it('should have unique figure IDs', () => {
        const ids = figures.map(f => f.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have accessibility alt text', () => {
        figures.forEach(figure => {
            expect(figure.alt).toBeTruthy();
            expect(figure.alt.length).toBeGreaterThan(0);
        });
    });
});

describe('totalWordCount calculation', () => {
    it('should correctly sum all section word counts', () => {
        const expectedTotal = sections.reduce((sum, s) => sum + s.wordCount, 0);
        expect(totalWordCount).toBe(expectedTotal);
    });

    it('should be a positive number', () => {
        expect(totalWordCount).toBeGreaterThan(0);
    });

    it('should calculate reading time for total', () => {
        const totalReadingTime = calculateReadingTime(totalWordCount);
        expect(totalReadingTime).toBeGreaterThan(0);
        expect(Number.isInteger(totalReadingTime)).toBe(true);
    });
});
