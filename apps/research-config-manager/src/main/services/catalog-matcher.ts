import type { BibTexEntry } from './bibtex-parser';
import {
  normalizeSurname,
  extractFirstAuthorSurname,
  createAuthorYearLookup
} from './bibtex-parser';
import type { PageIndexState, PageIndexEntry } from '../../shared/types';
import { validatePageIndexEntry } from '../../shared/types';

export type MatchMethod = 'direct' | 'author-year' | 'manual' | 'unmatched';

export interface MatchResult {
  bibtexKey: string;
  pageindexName: string | null;
  matchMethod: MatchMethod;
  matchConfidence: number;
  alternativeMatches?: string[];
}

export interface MatchingStats {
  totalBibtex: number;
  totalPageIndex: number;
  directMatches: number;
  authorYearMatches: number;
  unmatched: number;
  unmatchedBibtexKeys: string[];
  unmatchedPageIndexNames: string[];
}

interface ParsedFilename {
  author: string;
  year: number;
  title: string;
  normalizedAuthor: string;
}

/**
 * Represents a parsed PageIndex document with its entry
 */
interface ParsedPageIndexDoc {
  parsed: ParsedFilename;
  entry: PageIndexEntry;
  pageindexName: string;
}

/**
 * Build a lookup map of author+year to PageIndex documents
 * Enables O(1) lookups instead of O(n) iterations
 */
function buildPageIndexAuthorYearLookup(
  pageIndexState: PageIndexState
): Map<string, ParsedPageIndexDoc[]> {
  const lookup = new Map<string, ParsedPageIndexDoc[]>();

  for (const [_key, entry] of Object.entries(pageIndexState.indexed_papers)) {
    // Validate entry to prevent silent corruption
    if (!validatePageIndexEntry(entry) || !entry.pageindex_name) {
      continue;
    }

    const parsed = parsePageIndexFilename(entry.pageindex_name);
    if (!parsed) continue;

    const lookupKey = `${parsed.normalizedAuthor}_${parsed.year}`;
    const existing = lookup.get(lookupKey) || [];
    existing.push({
      parsed,
      entry,
      pageindexName: entry.pageindex_name
    });
    lookup.set(lookupKey, existing);
  }

  return lookup;
}

/**
 * Parse a PageIndex filename to extract author and year
 * Format: "Author(s) - Year - Title.pdf" or "Author1 and Author2 - Year - Title.pdf"
 */
export function parsePageIndexFilename(filename: string): ParsedFilename | null {
  // Pattern: "Author(s) - Year - Title.pdf"
  const match = filename.match(/^(.+?)\s*-\s*(\d{4})\s*-\s*(.+?)\.pdf$/i);
  if (!match) return null;

  const authorPart = match[1].trim();
  const year = parseInt(match[2], 10);
  const title = match[3].trim();

  // Extract first author (before "and", "et al.", or comma)
  const firstAuthor = authorPart
    .split(/\s+and\s+|,\s*|\s+et\s+al\.?/i)[0]
    .trim();

  return {
    author: firstAuthor,
    year,
    title,
    normalizedAuthor: normalizeSurname(firstAuthor)
  };
}

/**
 * Match BibTeX entries to PageIndex documents
 * Uses Author + Year as primary matching strategy
 *
 * Algorithm:
 * 1. Direct key matching from pageindex-state (O(n) with hash lookup)
 * 2. Author+year matching for unmatched BibTeX (O(n) with hash lookup)
 * 3. Find unmatched PageIndex documents (O(n) with hash lookup)
 *
 * Overall complexity: O(n) instead of O(n²)
 */
export function matchBibTexToPageIndex(
  bibtexEntries: BibTexEntry[],
  pageIndexState: PageIndexState
): MatchResult[] {
  const results: MatchResult[] = [];
  const matchedPageIndexNames = new Set<string>();

  // Build optimized lookups (O(n))
  const bibtexLookup = new Map(bibtexEntries.map((e) => [e.key, e]));
  const authorYearLookup = createAuthorYearLookup(bibtexEntries);
  const pageIndexAuthorYearLookup = buildPageIndexAuthorYearLookup(pageIndexState);

  // First pass: Direct key matching from pageindex-state (O(n))
  for (const [bibtexKey, entry] of Object.entries(pageIndexState.indexed_papers)) {
    if (!validatePageIndexEntry(entry) || !entry.pageindex_name) continue;

    const bibtexEntry = bibtexLookup.get(bibtexKey);

    if (bibtexEntry) {
      results.push({
        bibtexKey,
        pageindexName: entry.pageindex_name,
        matchMethod: 'direct',
        matchConfidence: 1.0
      });
      matchedPageIndexNames.add(entry.pageindex_name);
    }
  }

  // Second pass: Author+year matching for unmatched BibTeX entries (O(n) with lookups)
  const matchedBibtexKeys = new Set(results.map((r) => r.bibtexKey));

  for (const bibtexEntry of bibtexEntries) {
    if (matchedBibtexKeys.has(bibtexEntry.key)) continue;

    // Try to find a PageIndex document with matching author+year
    const surname = extractFirstAuthorSurname(bibtexEntry);
    if (!surname) {
      results.push({
        bibtexKey: bibtexEntry.key,
        pageindexName: null,
        matchMethod: 'unmatched',
        matchConfidence: 0
      });
      continue;
    }

    const normalizedSurname = normalizeSurname(surname);
    const lookupKey = `${normalizedSurname}_${bibtexEntry.year}`;
    const candidates = pageIndexAuthorYearLookup.get(lookupKey);

    let bestMatch: { name: string; confidence: number } | null = null;
    const alternatives: string[] = [];

    if (candidates && candidates.length > 0) {
      for (const candidate of candidates) {
        if (matchedPageIndexNames.has(candidate.pageindexName)) {
          continue;
        }

        const confidence = calculateMatchConfidence(bibtexEntry, candidate.parsed);

        if (!bestMatch || confidence > bestMatch.confidence) {
          if (bestMatch) {
            alternatives.push(bestMatch.name);
          }
          bestMatch = { name: candidate.pageindexName, confidence };
        } else {
          alternatives.push(candidate.pageindexName);
        }
      }
    }

    if (bestMatch) {
      results.push({
        bibtexKey: bibtexEntry.key,
        pageindexName: bestMatch.name,
        matchMethod: 'author-year',
        matchConfidence: bestMatch.confidence,
        alternativeMatches: alternatives.length > 0 ? alternatives : undefined
      });
      matchedPageIndexNames.add(bestMatch.name);
      matchedBibtexKeys.add(bibtexEntry.key);
    } else {
      results.push({
        bibtexKey: bibtexEntry.key,
        pageindexName: null,
        matchMethod: 'unmatched',
        matchConfidence: 0
      });
    }
  }

  // Third pass: Find unmatched PageIndex documents (O(n) with lookups)
  for (const [_key, entry] of Object.entries(pageIndexState.indexed_papers)) {
    if (!validatePageIndexEntry(entry) || !entry.pageindex_name) continue;
    if (matchedPageIndexNames.has(entry.pageindex_name)) continue;

    // Try to find a matching BibTeX entry for this orphan PageIndex doc
    const parsed = parsePageIndexFilename(entry.pageindex_name);
    if (!parsed) continue;

    const lookupKey = `${parsed.normalizedAuthor}_${parsed.year}`;
    const candidates = authorYearLookup.get(lookupKey);

    if (candidates && candidates.length > 0) {
      // Find unmatched candidate
      const unmatchedCandidate = candidates.find((c) => !matchedBibtexKeys.has(c.key));
      if (unmatchedCandidate) {
        const confidence = calculateMatchConfidence(unmatchedCandidate, parsed);
        results.push({
          bibtexKey: unmatchedCandidate.key,
          pageindexName: entry.pageindex_name,
          matchMethod: 'author-year',
          matchConfidence: confidence
        });
        matchedBibtexKeys.add(unmatchedCandidate.key);
        matchedPageIndexNames.add(entry.pageindex_name);
      }
    }
  }

  return results;
}

/**
 * Calculate match confidence based on author+year match and title similarity
 *
 * Uses Sørensen–Dice coefficient for title similarity:
 * 2 * |intersection| / (|set1| + |set2|)
 *
 * This is more sensitive to overlap than Jaccard and works better for
 * comparing document titles where matching keywords are significant.
 */
function calculateMatchConfidence(bibtexEntry: BibTexEntry, parsed: ParsedFilename): number {
  // Base confidence for author+year match
  let confidence = 0.8;

  // Extract significant words (> 3 chars) from titles
  const bibtexTitleWords = bibtexEntry.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const pageIndexTitleWords = parsed.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (bibtexTitleWords.length === 0 || pageIndexTitleWords.length === 0) {
    return confidence;
  }

  // Convert to sets for efficient intersection
  const bibtexSet = new Set(bibtexTitleWords);
  const pageIndexSet = new Set(pageIndexTitleWords);

  // Count overlapping words
  let overlap = 0;
  for (const word of bibtexSet) {
    if (pageIndexSet.has(word)) {
      overlap++;
    }
  }

  // Sørensen–Dice coefficient: 2 * |intersection| / (|set1| + |set2|)
  const totalWords = bibtexSet.size + pageIndexSet.size;
  if (totalWords > 0) {
    const titleSimilarity = (2 * overlap) / totalWords;
    confidence += titleSimilarity * 0.2; // Up to 0.2 boost
  }

  return Math.min(confidence, 1.0);
}

/**
 * Calculate matching statistics
 */
export function calculateMatchingStats(
  results: MatchResult[],
  pageIndexState: PageIndexState
): MatchingStats {
  const directMatches = results.filter((r) => r.matchMethod === 'direct').length;
  const authorYearMatches = results.filter((r) => r.matchMethod === 'author-year').length;
  const unmatched = results.filter((r) => r.matchMethod === 'unmatched').length;

  const matchedPageIndexNames = new Set(results.filter((r) => r.pageindexName).map((r) => r.pageindexName));

  const allPageIndexNames: string[] = [];
  for (const entry of Object.values(pageIndexState.indexed_papers)) {
    if (entry.pageindex_name) {
      allPageIndexNames.push(entry.pageindex_name);
    }
  }

  const unmatchedPageIndexNames = allPageIndexNames.filter((name) => !matchedPageIndexNames.has(name));

  return {
    totalBibtex: results.length,
    totalPageIndex: allPageIndexNames.length,
    directMatches,
    authorYearMatches,
    unmatched,
    unmatchedBibtexKeys: results.filter((r) => !r.pageindexName).map((r) => r.bibtexKey),
    unmatchedPageIndexNames
  };
}

/**
 * Get match results as a lookup map by BibTeX key
 */
export function createMatchResultLookup(results: MatchResult[]): Map<string, MatchResult> {
  return new Map(results.map((r) => [r.bibtexKey, r]));
}

/**
 * Get match results as a lookup map by PageIndex name
 */
export function createPageIndexMatchLookup(results: MatchResult[]): Map<string, MatchResult> {
  const lookup = new Map<string, MatchResult>();
  for (const result of results) {
    if (result.pageindexName) {
      lookup.set(result.pageindexName, result);
    }
  }
  return lookup;
}
