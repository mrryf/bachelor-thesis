import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
    it('should merge class names correctly', () => {
        const result = cn('base-class', 'additional-class');
        expect(result).toContain('base-class');
        expect(result).toContain('additional-class');
    });

    it('should handle conditional classes', () => {
        const result = cn('base', false && 'hidden', 'visible');
        expect(result).toContain('base');
        expect(result).toContain('visible');
        expect(result).not.toContain('hidden');
    });

    it('should handle undefined and null', () => {
        const result = cn('base', undefined, null, 'valid');
        expect(result).toContain('base');
        expect(result).toContain('valid');
    });

    it('should merge Tailwind conflicting classes', () => {
        // tailwind-merge should resolve conflicts
        const result = cn('px-2', 'px-4');
        // Should only keep px-4 (last one wins)
        expect(result).toContain('px-4');
        expect(result).not.toContain('px-2 px-4'); // Should not have both
    });

    it('should handle empty input', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should handle array of classes', () => {
        const result = cn(['class1', 'class2'], 'class3');
        expect(result).toContain('class1');
        expect(result).toContain('class2');
        expect(result).toContain('class3');
    });

    it('should handle object notation', () => {
        const result = cn({
            'active': true,
            'disabled': false,
            'base': true
        });
        expect(result).toContain('active');
        expect(result).toContain('base');
        expect(result).not.toContain('disabled');
    });
});
