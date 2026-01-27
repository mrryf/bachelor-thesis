import { describe, it, expect } from 'vitest';
import {
  parseBibTexContent,
  parseAuthors,
  cleanLatexString,
  normalizeSurname,
  extractFirstAuthorSurname,
  createAuthorYearLookup
} from './bibtex-parser';
import { validateBibTexAuthor } from '../../shared/types';

describe('bibtex-parser', () => {
  describe('BibTexAuthor validation', () => {
    it('validates correct author objects', () => {
      const validAuthor = {
        surname: 'Davis',
        givenName: 'Fred',
        full: 'Davis, Fred'
      };

      expect(validateBibTexAuthor(validAuthor)).toBe(true);
    });

    it('validates author without given name', () => {
      const validAuthor = {
        surname: 'Davis',
        full: 'Davis'
      };

      expect(validateBibTexAuthor(validAuthor)).toBe(true);
    });

    it('rejects author with empty surname', () => {
      const invalidAuthor = {
        surname: '',
        full: 'Davis'
      };

      expect(validateBibTexAuthor(invalidAuthor)).toBe(false);
    });

    it('rejects author missing required fields', () => {
      expect(validateBibTexAuthor({ surname: 'Davis' })).toBe(false);
      expect(validateBibTexAuthor({ full: 'Davis' })).toBe(false);
      expect(validateBibTexAuthor(null)).toBe(false);
      expect(validateBibTexAuthor(undefined)).toBe(false);
    });
  });

  describe('parseBibTexContent', () => {
    it('parses a simple article entry', () => {
      const content = `
@article{davis_perceived_1989,
  author = {Davis, Fred D.},
  title = {Perceived Usefulness, Perceived Ease of Use, and User Acceptance of Information Technology},
  year = {1989},
  journal = {MIS Quarterly}
}
`;
      const result = parseBibTexContent(content);

      expect(result.entries).toHaveLength(1);
      expect(result.parseErrors).toHaveLength(0);

      const entry = result.entries[0];
      expect(entry.key).toBe('davis_perceived_1989');
      expect(entry.type).toBe('article');
      expect(entry.year).toBe(1989);
      expect(entry.authors).toHaveLength(1);
      expect(entry.authors[0].surname).toBe('Davis');
      expect(entry.authors[0].givenName).toBe('Fred D.');
      expect(entry.journal).toBe('MIS Quarterly');
    });

    it('parses entry with abstract and keywords', () => {
      const content = `
@article{abbass_social_2019,
  author = {Abbass, Hussein A.},
  title = {Social Integration of Artificial Intelligence},
  year = {2019},
  abstract = {AI is finding more uses in human society.},
  keywords = {Trust, Human-AI teaming, Adaptive automation}
}
`;
      const result = parseBibTexContent(content);
      const entry = result.entries[0];

      expect(entry.abstract).toBe('AI is finding more uses in human society.');
      expect(entry.keywords).toEqual(['Trust', 'Human-AI teaming', 'Adaptive automation']);
    });

    it('parses multiple authors correctly', () => {
      const content = `
@article{baron_moderator_1986,
  author = {Baron, Reuben and Kenny, David},
  title = {The moderator-mediator variable distinction},
  year = {1986}
}
`;
      const result = parseBibTexContent(content);
      const entry = result.entries[0];

      expect(entry.authors).toHaveLength(2);
      expect(entry.authors[0].surname).toBe('Baron');
      expect(entry.authors[1].surname).toBe('Kenny');
    });

    it('handles entry with DOI and URL', () => {
      const content = `
@article{test_entry_2020,
  author = {Test, Author},
  title = {Test Title},
  year = {2020},
  doi = {10.1000/test},
  url = {https://example.com}
}
`;
      const result = parseBibTexContent(content);
      const entry = result.entries[0];

      expect(entry.doi).toBe('10.1000/test');
      expect(entry.url).toBe('https://example.com');
    });

    it('parses multiple entries', () => {
      const content = `
@article{first_2020,
  author = {First, Author},
  title = {First Title},
  year = {2020}
}

@book{second_2021,
  author = {Second, Author},
  title = {Second Title},
  year = {2021}
}
`;
      const result = parseBibTexContent(content);

      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].key).toBe('first_2020');
      expect(result.entries[0].type).toBe('article');
      expect(result.entries[1].key).toBe('second_2021');
      expect(result.entries[1].type).toBe('book');
    });
  });

  describe('parseAuthors', () => {
    it('parses single author in "LastName, FirstName" format', () => {
      const authors = parseAuthors('Davis, Fred D.');

      expect(authors).toHaveLength(1);
      expect(authors[0].surname).toBe('Davis');
      expect(authors[0].givenName).toBe('Fred D.');
    });

    it('parses single author in "FirstName LastName" format', () => {
      const authors = parseAuthors('Fred Davis');

      expect(authors).toHaveLength(1);
      expect(authors[0].surname).toBe('Davis');
      expect(authors[0].givenName).toBe('Fred');
    });

    it('parses multiple authors separated by "and"', () => {
      const authors = parseAuthors('Baron, Reuben and Kenny, David');

      expect(authors).toHaveLength(2);
      expect(authors[0].surname).toBe('Baron');
      expect(authors[1].surname).toBe('Kenny');
    });

    it('handles complex author names', () => {
      const authors = parseAuthors('van der Berg, Jan');

      expect(authors).toHaveLength(1);
      // In "LastName, FirstName" format with prefix
      expect(authors[0].surname).toBe('van der Berg');
    });
  });

  describe('cleanLatexString', () => {
    it('removes braces used for case protection', () => {
      expect(cleanLatexString('{AI} in {Healthcare}')).toBe('AI in Healthcare');
    });

    it('converts LaTeX accents', () => {
      expect(cleanLatexString('R\\"otzel')).toBe('Rötzel');
      expect(cleanLatexString('K\\"uper')).toBe('Küper');
      expect(cleanLatexString('\\ss')).toBe('ß');
    });

    it('handles LaTeX dashes', () => {
      expect(cleanLatexString('pages 1--10')).toBe('pages 1–10');
      expect(cleanLatexString('long---dash')).toBe('long—dash');
    });

    it('handles escaped special characters', () => {
      expect(cleanLatexString('R\\&D')).toBe('R&D');
      expect(cleanLatexString('50\\%')).toBe('50%');
    });
  });

  describe('normalizeSurname', () => {
    it('converts to lowercase', () => {
      expect(normalizeSurname('Davis')).toBe('davis');
    });

    it('removes diacritics', () => {
      expect(normalizeSurname('Rötzel')).toBe('rotzel');
      expect(normalizeSurname('Küper')).toBe('kuper');
      expect(normalizeSurname('Müller')).toBe('muller');
    });

    it('converts German sharp s', () => {
      expect(normalizeSurname('Saßmannshausen')).toBe('sassmannshausen');
    });

    it('removes non-letter characters', () => {
      expect(normalizeSurname("O'Brien")).toBe('obrien');
      expect(normalizeSurname('Baron-Smith')).toBe('baronsmith');
    });
  });

  describe('extractFirstAuthorSurname', () => {
    it('returns first author surname', () => {
      const entry = {
        key: 'test',
        type: 'article',
        title: 'Test',
        year: 2020,
        authors: [
          { surname: 'Baron', givenName: 'Reuben', full: 'Baron, Reuben' },
          { surname: 'Kenny', givenName: 'David', full: 'Kenny, David' }
        ]
      };

      expect(extractFirstAuthorSurname(entry)).toBe('Baron');
    });

    it('returns null for entry with no authors', () => {
      const entry = {
        key: 'test',
        type: 'article',
        title: 'Test',
        year: 2020,
        authors: []
      };

      expect(extractFirstAuthorSurname(entry)).toBeNull();
    });
  });

  describe('createAuthorYearLookup', () => {
    it('creates lookup by normalized surname and year', () => {
      const entries = [
        {
          key: 'davis_1989',
          type: 'article',
          title: 'Test 1',
          year: 1989,
          authors: [{ surname: 'Davis', givenName: 'Fred', full: 'Davis, Fred' }]
        },
        {
          key: 'baron_1986',
          type: 'article',
          title: 'Test 2',
          year: 1986,
          authors: [{ surname: 'Baron', givenName: 'Reuben', full: 'Baron, Reuben' }]
        }
      ];

      const lookup = createAuthorYearLookup(entries);

      expect(lookup.get('davis_1989')).toHaveLength(1);
      expect(lookup.get('baron_1986')).toHaveLength(1);
    });

    it('handles multiple entries with same author+year', () => {
      const entries = [
        {
          key: 'davis_1989a',
          type: 'article',
          title: 'Test 1',
          year: 1989,
          authors: [{ surname: 'Davis', givenName: 'Fred', full: 'Davis, Fred' }]
        },
        {
          key: 'davis_1989b',
          type: 'article',
          title: 'Test 2',
          year: 1989,
          authors: [{ surname: 'Davis', givenName: 'Fred', full: 'Davis, Fred' }]
        }
      ];

      const lookup = createAuthorYearLookup(entries);

      expect(lookup.get('davis_1989')).toHaveLength(2);
    });
  });
});
