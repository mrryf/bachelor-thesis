import { readFile, access } from 'fs/promises';
import type { BibTexAuthor } from '../../shared/types';

export interface BibTexEntry {
  key: string;
  type: string;
  title: string;
  shortTitle?: string;
  authors: BibTexAuthor[];
  year: number;
  abstract?: string;
  keywords?: string[];
  doi?: string;
  url?: string;
  journal?: string;
  pages?: string;
  volume?: string;
  number?: string;
  publisher?: string;
  language?: string;
}

export interface ParsedBibTex {
  entries: BibTexEntry[];
  parseErrors: string[];
}

/**
 * Parse a BibTeX file and extract structured entries
 */
export async function parseBibTexFile(filePath: string): Promise<ParsedBibTex | null> {
  try {
    await access(filePath);
  } catch {
    return null;
  }

  const content = await readFile(filePath, 'utf-8');
  return parseBibTexContent(content);
}

/**
 * Parse BibTeX content string
 */
export function parseBibTexContent(content: string): ParsedBibTex {
  const entries: BibTexEntry[] = [];
  const parseErrors: string[] = [];

  // Match individual entries: @type{key, ... }
  const entryRegex = /@(\w+)\s*\{([^,]+),([^@]*?)(?=\n@|\n*$)/gs;

  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const [, type, key, fieldsBlock] = match;

    try {
      const entry = parseEntry(type, key.trim(), fieldsBlock);
      if (entry) {
        entries.push(entry);
      }
    } catch (error) {
      parseErrors.push(`Failed to parse entry ${key}: ${(error as Error).message}`);
    }
  }

  return { entries, parseErrors };
}

/**
 * Parse a single BibTeX entry
 */
function parseEntry(type: string, key: string, fieldsBlock: string): BibTexEntry | null {
  const fields = parseFields(fieldsBlock);

  const title = fields.get('title');
  const year = fields.get('year');
  const author = fields.get('author');

  // Required fields
  if (!title || !year) {
    return null;
  }

  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return null;
  }

  const entry: BibTexEntry = {
    key,
    type: type.toLowerCase(),
    title: cleanLatexString(title),
    year: yearNum,
    authors: author ? parseAuthors(author) : []
  };

  // Optional fields
  const shortTitle = fields.get('shorttitle');
  if (shortTitle) entry.shortTitle = cleanLatexString(shortTitle);

  const abstract = fields.get('abstract');
  if (abstract) entry.abstract = cleanLatexString(abstract);

  const keywords = fields.get('keywords');
  if (keywords) entry.keywords = parseKeywords(keywords);

  const doi = fields.get('doi');
  if (doi) entry.doi = cleanLatexString(doi);

  const url = fields.get('url');
  if (url) entry.url = cleanLatexString(url);

  const journal = fields.get('journal');
  if (journal) entry.journal = cleanLatexString(journal);

  const pages = fields.get('pages');
  if (pages) entry.pages = cleanLatexString(pages);

  const volume = fields.get('volume');
  if (volume) entry.volume = cleanLatexString(volume);

  const number = fields.get('number');
  if (number) entry.number = cleanLatexString(number);

  const publisher = fields.get('publisher');
  if (publisher) entry.publisher = cleanLatexString(publisher);

  const language = fields.get('language');
  if (language) entry.language = cleanLatexString(language);

  return entry;
}

/**
 * Parse BibTeX fields from a block of text
 */
function parseFields(block: string): Map<string, string> {
  const fields = new Map<string, string>();

  // Match field = value pairs, handling braces and quotes
  // Field pattern: fieldname = {value} or fieldname = "value" or fieldname = number
  let remaining = block;
  const fieldPattern = /(\w+)\s*=\s*/g;

  let fieldMatch;
  while ((fieldMatch = fieldPattern.exec(remaining)) !== null) {
    const fieldName = fieldMatch[1].toLowerCase();
    const valueStart = fieldMatch.index + fieldMatch[0].length;

    const value = extractValue(remaining.slice(valueStart));
    if (value !== null) {
      fields.set(fieldName, value);
    }
  }

  return fields;
}

/**
 * Extract a field value starting from the current position
 * Handles {braced}, "quoted", and bare values
 */
function extractValue(text: string): string | null {
  const trimmed = text.trimStart();

  if (trimmed.startsWith('{')) {
    return extractBracedValue(trimmed);
  } else if (trimmed.startsWith('"')) {
    return extractQuotedValue(trimmed);
  } else {
    // Bare value (number or single word)
    const match = trimmed.match(/^(\d+|\w+)/);
    return match ? match[1] : null;
  }
}

/**
 * Extract value enclosed in braces, handling nested braces
 */
function extractBracedValue(text: string): string | null {
  if (!text.startsWith('{')) return null;

  let depth = 0;
  let i = 0;

  for (; i < text.length; i++) {
    if (text[i] === '{' && (i === 0 || text[i - 1] !== '\\')) {
      depth++;
    } else if (text[i] === '}' && text[i - 1] !== '\\') {
      depth--;
      if (depth === 0) {
        return text.slice(1, i);
      }
    }
  }

  // Unbalanced braces - try to extract what we can
  const endIdx = text.indexOf('},');
  if (endIdx !== -1) {
    return text.slice(1, endIdx);
  }

  return null;
}

/**
 * Extract value enclosed in quotes
 */
function extractQuotedValue(text: string): string | null {
  if (!text.startsWith('"')) return null;

  let i = 1;
  while (i < text.length) {
    if (text[i] === '"' && text[i - 1] !== '\\') {
      return text.slice(1, i);
    }
    i++;
  }

  return null;
}

/**
 * Parse BibTeX author field into structured authors
 * Handles formats:
 * - "LastName, FirstName"
 * - "FirstName LastName"
 * - Multiple authors separated by " and "
 */
export function parseAuthors(authorField: string): BibTexAuthor[] {
  const authors: BibTexAuthor[] = [];

  // Split by " and " (case insensitive)
  const authorStrings = authorField.split(/\s+and\s+/i);

  for (const authorStr of authorStrings) {
    const trimmed = cleanLatexString(authorStr.trim());
    if (!trimmed) continue;

    const author = parseAuthorName(trimmed);
    if (author) {
      authors.push(author);
    }
  }

  return authors;
}

/**
 * Parse a single author name string
 */
function parseAuthorName(name: string): BibTexAuthor | null {
  if (!name) return null;

  // Handle "LastName, FirstName" format
  if (name.includes(',')) {
    const [surname, ...rest] = name.split(',');
    const givenName = rest.join(',').trim();
    return {
      surname: surname.trim(),
      givenName: givenName || undefined,
      full: name
    };
  }

  // Handle "FirstName LastName" format
  // Take the last word as surname (handles middle names)
  const parts = name.split(/\s+/);
  if (parts.length === 1) {
    return {
      surname: parts[0],
      full: name
    };
  }

  const surname = parts[parts.length - 1];
  const givenName = parts.slice(0, -1).join(' ');

  return {
    surname,
    givenName: givenName || undefined,
    full: name
  };
}

/**
 * Parse keywords field into array
 */
function parseKeywords(keywordsField: string): string[] {
  // Keywords are typically comma-separated
  return keywordsField
    .split(',')
    .map((kw) => cleanLatexString(kw.trim()))
    .filter((kw) => kw.length > 0);
}

/**
 * Clean LaTeX special characters and formatting
 */
export function cleanLatexString(text: string): string {
  return (
    text
      // Remove braces used for case protection
      .replace(/\{([^{}]*)\}/g, '$1')
      // Handle common LaTeX escapes
      .replace(/\\&/g, '&')
      .replace(/\\_/g, '_')
      .replace(/\\%/g, '%')
      .replace(/\\#/g, '#')
      .replace(/\\$/g, '$')
      .replace(/\\~/g, '~')
      .replace(/\\textendash/g, '–')
      .replace(/\\textemdash/g, '—')
      // Handle LaTeX quotes
      .replace(/``/g, '"')
      .replace(/''/g, '"')
      .replace(/`/g, "'")
      // Handle special characters
      .replace(/---/g, '—')
      .replace(/--/g, '–')
      // Handle LaTeX accents (common ones)
      .replace(/\\"a/g, 'ä')
      .replace(/\\"o/g, 'ö')
      .replace(/\\"u/g, 'ü')
      .replace(/\\"A/g, 'Ä')
      .replace(/\\"O/g, 'Ö')
      .replace(/\\"U/g, 'Ü')
      .replace(/\\ss/g, 'ß')
      .replace(/\\'e/g, 'é')
      .replace(/\\'a/g, 'á')
      .replace(/\\`e/g, 'è')
      .replace(/\\`a/g, 'à')
      .replace(/\\c\{c\}/g, 'ç')
      .replace(/\\~n/g, 'ñ')
      // Remove any remaining backslashes before letters
      .replace(/\\([a-zA-Z])/g, '$1')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Normalize a surname for matching purposes
 * Removes diacritics and converts to lowercase
 */
export function normalizeSurname(name: string): string {
  return (
    name
      .toLowerCase()
      // NFD decomposition separates base characters from combining diacritical marks
      .normalize('NFD')
      // Remove combining diacritical marks (accents, umlauts, etc.)
      .replace(/[\u0300-\u036f]/g, '')
      // Handle German sharp s
      .replace(/ß/g, 'ss')
      // Remove non-letter characters
      .replace(/[^a-z]/g, '')
  );
}

/**
 * Extract first author surname from a BibTeX entry
 */
export function extractFirstAuthorSurname(entry: BibTexEntry): string | null {
  if (entry.authors.length === 0) {
    return null;
  }
  return entry.authors[0].surname;
}

/**
 * Create a lookup map from BibTeX key to entry
 */
export function createBibTexLookup(entries: BibTexEntry[]): Map<string, BibTexEntry> {
  return new Map(entries.map((e) => [e.key, e]));
}

/**
 * Create a lookup map from normalized author+year to entries
 * (multiple entries may have same author+year)
 */
export function createAuthorYearLookup(entries: BibTexEntry[]): Map<string, BibTexEntry[]> {
  const lookup = new Map<string, BibTexEntry[]>();

  for (const entry of entries) {
    const surname = extractFirstAuthorSurname(entry);
    if (!surname) continue;

    const key = `${normalizeSurname(surname)}_${entry.year}`;
    const existing = lookup.get(key) || [];
    existing.push(entry);
    lookup.set(key, existing);
  }

  return lookup;
}
