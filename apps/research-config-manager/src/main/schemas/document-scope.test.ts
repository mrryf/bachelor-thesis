import { describe, it, expect } from 'vitest';
import {
  DocumentScopeSchema,
  DocumentScopeMetadataSchema,
  DocumentScopePreferencesSchema,
  PageIndexStateSchema,
  PageIndexEntrySchema,
  createDefaultScope
} from './document-scope';

describe('DocumentScopeMetadataSchema', () => {
  it('should validate complete metadata', () => {
    const valid = {
      totalDocuments: 10,
      totalPages: 500,
      estimatedTokens: 250000,
      enabledCount: 8,
      disabledCount: 2
    };

    expect(() => DocumentScopeMetadataSchema.parse(valid)).not.toThrow();
    expect(DocumentScopeMetadataSchema.parse(valid)).toEqual(valid);
  });

  it('should reject metadata with missing fields', () => {
    const invalid = {
      totalDocuments: 10,
      enabledCount: 8
    };

    expect(() => DocumentScopeMetadataSchema.parse(invalid)).toThrow();
  });

  it('should reject non-numeric values', () => {
    const invalid = {
      totalDocuments: 'ten',
      totalPages: 500,
      estimatedTokens: 250000,
      enabledCount: 8,
      disabledCount: 2
    };

    expect(() => DocumentScopeMetadataSchema.parse(invalid)).toThrow();
  });
});

describe('DocumentScopePreferencesSchema', () => {
  it('should validate valid preferences', () => {
    const valid = {
      defaultModel: 'sonnet',
      showModelIndicator: true
    };

    expect(() => DocumentScopePreferencesSchema.parse(valid)).not.toThrow();
  });

  it('should accept all valid model options', () => {
    const models = ['haiku', 'sonnet', 'opus'] as const;

    for (const model of models) {
      const prefs = { defaultModel: model, showModelIndicator: false };
      expect(() => DocumentScopePreferencesSchema.parse(prefs)).not.toThrow();
    }
  });

  it('should reject invalid model option', () => {
    const invalid = {
      defaultModel: 'gpt-4',
      showModelIndicator: true
    };

    expect(() => DocumentScopePreferencesSchema.parse(invalid)).toThrow();
  });
});

describe('DocumentScopeSchema', () => {
  it('should validate a minimal v1.0 config', () => {
    const valid = {
      version: '1.0',
      lastModified: '2026-01-26T12:00:00.000Z',
      enabled: ['doc1.pdf'],
      disabled: ['doc2.pdf']
    };

    const result = DocumentScopeSchema.parse(valid);
    expect(result.version).toBe('1.0');
    expect(result.enabled).toContain('doc1.pdf');
    expect(result.disabled).toContain('doc2.pdf');
  });

  it('should validate a complete v1.1 config with categories', () => {
    const valid = {
      version: '1.1',
      lastModified: '2026-01-26T12:00:00.000Z',
      enabled: ['doc1.pdf', 'doc2.pdf'],
      disabled: [],
      categories: {
        'doc1.pdf': ['TAM', 'Core'],
        'doc2.pdf': ['SEM']
      },
      categoryDefinitions: {
        TAM: 'Technology Acceptance Model papers',
        SEM: 'Structural Equation Modeling papers'
      },
      metadata: {
        totalDocuments: 2,
        totalPages: 100,
        estimatedTokens: 50000,
        enabledCount: 2,
        disabledCount: 0
      },
      preferences: {
        defaultModel: 'opus',
        showModelIndicator: false
      }
    };

    const result = DocumentScopeSchema.parse(valid);
    expect(result.version).toBe('1.1');
    expect(result.categories?.['doc1.pdf']).toContain('TAM');
    expect(result.categoryDefinitions?.TAM).toBe('Technology Acceptance Model papers');
  });

  it('should reject config without version', () => {
    const invalid = {
      lastModified: '2026-01-26T12:00:00.000Z',
      enabled: [],
      disabled: []
    };

    expect(() => DocumentScopeSchema.parse(invalid)).toThrow();
  });

  it('should reject config with invalid version', () => {
    const invalid = {
      version: '2.0',
      lastModified: '2026-01-26T12:00:00.000Z',
      enabled: [],
      disabled: []
    };

    expect(() => DocumentScopeSchema.parse(invalid)).toThrow();
  });

  it('should reject config without required arrays', () => {
    const invalid = {
      version: '1.0',
      lastModified: '2026-01-26T12:00:00.000Z'
    };

    expect(() => DocumentScopeSchema.parse(invalid)).toThrow();
  });

  it('should allow empty enabled/disabled arrays', () => {
    const valid = {
      version: '1.0',
      lastModified: '2026-01-26T12:00:00.000Z',
      enabled: [],
      disabled: []
    };

    expect(() => DocumentScopeSchema.parse(valid)).not.toThrow();
  });
});

describe('PageIndexEntrySchema', () => {
  it('should validate a complete entry', () => {
    const valid = {
      pageindex_name: 'Davis - 1989 - TAM.pdf',
      indexed_at: '2026-01-20T10:00:00.000Z',
      pages: 15,
      note: 'Seminal TAM paper',
      marked_manually: false
    };

    expect(() => PageIndexEntrySchema.parse(valid)).not.toThrow();
  });

  it('should validate entry with only required fields', () => {
    const valid = {
      indexed_at: '2026-01-20T10:00:00.000Z'
    };

    expect(() => PageIndexEntrySchema.parse(valid)).not.toThrow();
  });

  it('should allow manually marked entries without pageindex_name', () => {
    const valid = {
      indexed_at: '2026-01-20T10:00:00.000Z',
      marked_manually: true,
      note: 'Skipped - not relevant'
    };

    const result = PageIndexEntrySchema.parse(valid);
    expect(result.pageindex_name).toBeUndefined();
    expect(result.marked_manually).toBe(true);
  });
});

describe('PageIndexStateSchema', () => {
  it('should validate a complete state', () => {
    const valid = {
      version: '1.0',
      last_sync: '2026-01-26T12:00:00.000Z',
      note: 'Production state',
      indexed_papers: {
        'davis1989': {
          pageindex_name: 'Davis - 1989 - TAM.pdf',
          indexed_at: '2026-01-20T10:00:00.000Z',
          pages: 15
        }
      },
      failed_papers: {
        'broken1999': {
          reason: 'PDF corrupted',
          last_attempt: '2026-01-25T10:00:00.000Z'
        }
      }
    };

    expect(() => PageIndexStateSchema.parse(valid)).not.toThrow();
  });

  it('should validate state without optional fields', () => {
    const valid = {
      version: '1.0',
      last_sync: '2026-01-26T12:00:00.000Z',
      indexed_papers: {}
    };

    expect(() => PageIndexStateSchema.parse(valid)).not.toThrow();
  });
});

describe('createDefaultScope', () => {
  it('should create a valid default scope', () => {
    const scope = createDefaultScope();

    expect(() => DocumentScopeSchema.parse(scope)).not.toThrow();
    expect(scope.version).toBe('1.0');
    expect(scope.enabled).toEqual([]);
    expect(scope.disabled).toEqual([]);
  });

  it('should have valid lastModified timestamp', () => {
    const before = new Date().toISOString();
    const scope = createDefaultScope();
    const after = new Date().toISOString();

    expect(scope.lastModified >= before).toBe(true);
    expect(scope.lastModified <= after).toBe(true);
  });

  it('should have zeroed metadata', () => {
    const scope = createDefaultScope();

    expect(scope.metadata?.totalDocuments).toBe(0);
    expect(scope.metadata?.totalPages).toBe(0);
    expect(scope.metadata?.estimatedTokens).toBe(0);
    expect(scope.metadata?.enabledCount).toBe(0);
    expect(scope.metadata?.disabledCount).toBe(0);
  });
});
