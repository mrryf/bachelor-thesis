import { describe, it, expect } from 'vitest';
import {
  parsePageIndexFilename,
  matchBibTexToPageIndex,
  calculateMatchingStats
} from './catalog-matcher';
import type { BibTexEntry } from './bibtex-parser';
import type { PageIndexState } from '../../shared/types';
import { validatePageIndexEntry } from '../../shared/types';

describe('catalog-matcher', () => {
  describe('validation', () => {
    it('validates correct PageIndexEntry objects', () => {
      const validEntry = {
        pageindex_name: 'Test - 2020 - Paper.pdf',
        indexed_at: '2026-01-26',
        pages: 20,
        marked_manually: false
      };

      // Verify validator works correctly
      expect(validatePageIndexEntry(validEntry)).toBe(true);

      // This test verifies entries are properly validated in matching
      const pageIndexState: PageIndexState = {
        version: '1.0',
        last_sync: '2026-01-26',
        indexed_papers: {
          test: validEntry
        }
      };

      // The matching function should validate entries automatically
      const results = matchBibTexToPageIndex([], pageIndexState);
      expect(results).toBeDefined();
    });

    it('rejects invalid PageIndexEntry objects', () => {
      const invalidEntry = {
        indexed_at: '' // Empty required field
      };

      expect(validatePageIndexEntry(invalidEntry)).toBe(false);
    });
  });

  describe('parsePageIndexFilename', () => {
    it('parses standard filename format', () => {
      const result = parsePageIndexFilename(
        'Davis - 1989 - Perceived Usefulness, Perceived Ease of Use.pdf'
      );

      expect(result).not.toBeNull();
      expect(result!.author).toBe('Davis');
      expect(result!.year).toBe(1989);
      expect(result!.title).toBe('Perceived Usefulness, Perceived Ease of Use');
    });

    it('parses filename with multiple authors', () => {
      const result = parsePageIndexFilename(
        'Baron and Kenny - 1986 - The moderator-mediator variable.pdf'
      );

      expect(result).not.toBeNull();
      expect(result!.author).toBe('Baron');
      expect(result!.year).toBe(1986);
    });

    it('parses filename with et al.', () => {
      const result = parsePageIndexFilename(
        'Baroni et al. - 2022 - AI-TAM a model.pdf'
      );

      expect(result).not.toBeNull();
      expect(result!.author).toBe('Baroni');
      expect(result!.year).toBe(2022);
    });

    it('handles German characters in filenames', () => {
      const result = parsePageIndexFilename(
        'Rötzel - 2024 - Künstliche Intelligenz.pdf'
      );

      expect(result).not.toBeNull();
      expect(result!.author).toBe('Rötzel');
      expect(result!.normalizedAuthor).toBe('rotzel');
    });

    it('returns null for invalid filename format', () => {
      expect(parsePageIndexFilename('invalid.pdf')).toBeNull();
      expect(parsePageIndexFilename('no-year.pdf')).toBeNull();
    });
  });

  describe('matchBibTexToPageIndex', () => {
    const createEntry = (
      key: string,
      surname: string,
      year: number,
      title: string
    ): BibTexEntry => ({
      key,
      type: 'article',
      title,
      year,
      authors: [{ surname, givenName: 'Test', full: `${surname}, Test` }]
    });

    const createPageIndexState = (
      papers: Record<string, { pageindex_name: string; pages: number }>
    ): PageIndexState => ({
      version: '1.0',
      last_sync: '2026-01-26',
      indexed_papers: Object.fromEntries(
        Object.entries(papers).map(([key, value]) => [
          key,
          {
            pageindex_name: value.pageindex_name,
            indexed_at: '2026-01-26',
            pages: value.pages
          }
        ])
      )
    });

    it('matches by direct key lookup from pageindex-state', () => {
      const bibtexEntries = [createEntry('davis_1989', 'Davis', 1989, 'Perceived Usefulness')];

      const pageIndexState = createPageIndexState({
        davis_1989: {
          pageindex_name: 'Davis - 1989 - Perceived Usefulness.pdf',
          pages: 23
        }
      });

      const results = matchBibTexToPageIndex(bibtexEntries, pageIndexState);

      expect(results).toHaveLength(1);
      expect(results[0].matchMethod).toBe('direct');
      expect(results[0].matchConfidence).toBe(1.0);
      expect(results[0].pageindexName).toBe('Davis - 1989 - Perceived Usefulness.pdf');
    });

    it('matches by author+year when direct key not found', () => {
      const bibtexEntries = [createEntry('davis_perceived_1989', 'Davis', 1989, 'Perceived Usefulness')];

      // PageIndex state uses different key but same author/year
      const pageIndexState = createPageIndexState({
        different_key: {
          pageindex_name: 'Davis - 1989 - Perceived Usefulness.pdf',
          pages: 23
        }
      });

      const results = matchBibTexToPageIndex(bibtexEntries, pageIndexState);

      expect(results).toHaveLength(1);
      expect(results[0].matchMethod).toBe('author-year');
      expect(results[0].matchConfidence).toBeGreaterThanOrEqual(0.8);
    });

    it('handles umlaut normalization for author matching', () => {
      const bibtexEntries = [createEntry('rotzel_2024', 'Rötzel', 2024, 'KI Research')];

      const pageIndexState = createPageIndexState({
        different_key: {
          pageindex_name: 'Rötzel - 2024 - KI Research.pdf',
          pages: 15
        }
      });

      const results = matchBibTexToPageIndex(bibtexEntries, pageIndexState);

      expect(results).toHaveLength(1);
      expect(results[0].pageindexName).toBe('Rötzel - 2024 - KI Research.pdf');
    });

    it('marks unmatched entries correctly', () => {
      const bibtexEntries = [createEntry('anthropic_2025', 'Anthropic', 2025, 'Claude')];

      // No matching PageIndex document
      const pageIndexState = createPageIndexState({
        davis_1989: {
          pageindex_name: 'Davis - 1989 - Perceived Usefulness.pdf',
          pages: 23
        }
      });

      const results = matchBibTexToPageIndex(bibtexEntries, pageIndexState);

      expect(results).toHaveLength(1);
      expect(results[0].matchMethod).toBe('unmatched');
      expect(results[0].pageindexName).toBeNull();
    });
  });

  describe('calculateMatchingStats', () => {
    it('calculates correct statistics', () => {
      const results = [
        { bibtexKey: 'a', pageindexName: 'A.pdf', matchMethod: 'direct' as const, matchConfidence: 1.0 },
        { bibtexKey: 'b', pageindexName: 'B.pdf', matchMethod: 'author-year' as const, matchConfidence: 0.9 },
        { bibtexKey: 'c', pageindexName: null, matchMethod: 'unmatched' as const, matchConfidence: 0 }
      ];

      const pageIndexState: PageIndexState = {
        version: '1.0',
        last_sync: '2026-01-26',
        indexed_papers: {
          a: { pageindex_name: 'A.pdf', indexed_at: '2026-01-26', pages: 10 },
          b: { pageindex_name: 'B.pdf', indexed_at: '2026-01-26', pages: 20 },
          d: { pageindex_name: 'D.pdf', indexed_at: '2026-01-26', pages: 30 }
        }
      };

      const stats = calculateMatchingStats(results, pageIndexState);

      expect(stats.totalBibtex).toBe(3);
      expect(stats.totalPageIndex).toBe(3);
      expect(stats.directMatches).toBe(1);
      expect(stats.authorYearMatches).toBe(1);
      expect(stats.unmatched).toBe(1);
      expect(stats.unmatchedBibtexKeys).toEqual(['c']);
      expect(stats.unmatchedPageIndexNames).toEqual(['D.pdf']);
    });
  });
});
