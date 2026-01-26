import { readFile, access } from 'fs/promises';

export interface CatalogEntry {
  shortCitation: string;
  pageIndexName: string;
  categories: string[];
  relevance: 'FOUNDATIONAL' | 'CORE' | 'SUPPORTING';
  keyPages?: string;
  focus?: string;
}

export interface CategorySummary {
  name: string;
  documentCount: number;
}

export interface ParsedCatalog {
  lastUpdated: string;
  totalPapers: number;
  categories: CategorySummary[];
  entries: CatalogEntry[];
}

/**
 * Parse document-catalog.md to extract paper metadata
 */
export async function parseCatalog(catalogPath: string): Promise<ParsedCatalog | null> {
  try {
    await access(catalogPath);
  } catch {
    return null;
  }

  const content = await readFile(catalogPath, 'utf-8');
  const lines = content.split('\n');

  const entries: CatalogEntry[] = [];
  const categoryDocCount = new Map<string, Set<string>>();

  let lastUpdated = '';
  let currentMainCategory = '';
  let currentSubcategory = '';
  let inTable = false;
  let tableHeaderSeen = false;

  for (const line of lines) {
    // Extract last updated date
    if (line.startsWith('**Last updated:**')) {
      lastUpdated = line.replace('**Last updated:**', '').trim();
      continue;
    }

    // Parse main category headers (### 1. Theoretical Frameworks)
    const mainCategoryMatch = line.match(/^### \d+\.\s+(.+)$/);
    if (mainCategoryMatch) {
      currentMainCategory = mainCategoryMatch[1].trim();
      currentSubcategory = '';
      inTable = false;
      tableHeaderSeen = false;
      continue;
    }

    // Parse subcategory headers (#### 1.1 TAM/AI-TAM)
    const subCategoryMatch = line.match(/^#### \d+\.\d+\s+(.+)$/);
    if (subCategoryMatch) {
      currentSubcategory = subCategoryMatch[1].trim();
      inTable = false;
      tableHeaderSeen = false;
      continue;
    }

    // Skip the Paper Registry section - we get entries from topic tables
    if (line.startsWith('## Paper Registry')) {
      break;
    }

    // Detect table header row
    if (line.includes('| Paper |') && line.includes('| PageIndex Name |')) {
      inTable = true;
      tableHeaderSeen = false;
      continue;
    }

    // Skip table separator row (|---|---|...)
    if (inTable && line.match(/^\|[\s-|]+\|$/)) {
      tableHeaderSeen = true;
      continue;
    }

    // Parse table data rows
    if (inTable && tableHeaderSeen && line.startsWith('|') && line.endsWith('|')) {
      const entry = parseTableRow(line, currentMainCategory, currentSubcategory);
      if (entry) {
        // Check for duplicate (same paper in multiple categories)
        const existing = entries.find((e) => e.pageIndexName === entry.pageIndexName);
        if (existing) {
          // Merge categories
          for (const cat of entry.categories) {
            if (!existing.categories.includes(cat)) {
              existing.categories.push(cat);
            }
          }
          // Update focus/keyPages if existing doesn't have them
          if (!existing.focus && entry.focus) {
            existing.focus = entry.focus;
          }
          if (!existing.keyPages && entry.keyPages) {
            existing.keyPages = entry.keyPages;
          }
          // Use higher relevance
          if (compareRelevance(entry.relevance, existing.relevance) > 0) {
            existing.relevance = entry.relevance;
          }
        } else {
          entries.push(entry);
        }

        // Track category document counts
        for (const cat of entry.categories) {
          if (!categoryDocCount.has(cat)) {
            categoryDocCount.set(cat, new Set());
          }
          categoryDocCount.get(cat)!.add(entry.pageIndexName);
        }
      }
    }

    // Reset table state on empty lines
    if (line.trim() === '') {
      inTable = false;
      tableHeaderSeen = false;
    }
  }

  // Build category summaries
  const categories: CategorySummary[] = Array.from(categoryDocCount.entries())
    .map(([name, docs]) => ({
      name,
      documentCount: docs.size
    }))
    .sort((a, b) => b.documentCount - a.documentCount);

  return {
    lastUpdated,
    totalPapers: entries.length,
    categories,
    entries
  };
}

function parseTableRow(
  line: string,
  mainCategory: string,
  subcategory: string
): CatalogEntry | null {
  // Split by | and filter empty cells
  const cells = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean);

  if (cells.length < 5) return null;

  const [shortCitation, pageIndexNameCell, focus, keyPages, relevanceCell] = cells;

  // Extract document name from backticks
  const nameMatch = pageIndexNameCell.match(/`([^`]+)`/);
  if (!nameMatch) return null;

  const pageIndexName = nameMatch[1];

  // Build categories list
  const categories: string[] = [];
  if (subcategory) {
    categories.push(subcategory);
  }
  if (mainCategory && mainCategory !== subcategory) {
    categories.push(mainCategory);
  }

  return {
    shortCitation: shortCitation.trim(),
    pageIndexName,
    categories,
    relevance: parseRelevance(relevanceCell),
    keyPages: keyPages !== 'TBD' ? keyPages : undefined,
    focus: focus !== 'TBD' ? focus : undefined
  };
}

function parseRelevance(value: string): 'FOUNDATIONAL' | 'CORE' | 'SUPPORTING' {
  const upper = value.toUpperCase().trim();
  if (upper.includes('FOUNDATIONAL')) return 'FOUNDATIONAL';
  if (upper.includes('CORE')) return 'CORE';
  return 'SUPPORTING';
}

function compareRelevance(a: string, b: string): number {
  const order = { FOUNDATIONAL: 3, CORE: 2, SUPPORTING: 1 };
  return (order[a as keyof typeof order] || 0) - (order[b as keyof typeof order] || 0);
}

/**
 * Create a lookup map from PageIndex name to catalog entry
 */
export function createCatalogLookup(catalog: ParsedCatalog): Map<string, CatalogEntry> {
  return new Map(catalog.entries.map((e) => [e.pageIndexName, e]));
}
