import { z } from 'zod';

export const DocumentScopeMetadataSchema = z.object({
  totalDocuments: z.number(),
  totalPages: z.number(),
  estimatedTokens: z.number(),
  enabledCount: z.number(),
  disabledCount: z.number()
});

export const DocumentScopePreferencesSchema = z.object({
  defaultModel: z.enum(['haiku', 'sonnet', 'opus']),
  showModelIndicator: z.boolean()
});

export const DocumentScopeSchema = z.object({
  version: z.enum(['1.0', '1.1']),
  lastModified: z.string(),
  enabled: z.array(z.string()),
  disabled: z.array(z.string()),
  // v1.1: document name -> array of category names
  categories: z.record(z.string(), z.array(z.string())).optional(),
  // v1.1: category name -> description
  categoryDefinitions: z.record(z.string(), z.string()).optional(),
  metadata: DocumentScopeMetadataSchema.optional(),
  preferences: DocumentScopePreferencesSchema.optional()
});

export type DocumentScope = z.infer<typeof DocumentScopeSchema>;
export type DocumentScopeMetadata = z.infer<typeof DocumentScopeMetadataSchema>;

export const PageIndexEntrySchema = z.object({
  pageindex_name: z.string().optional(),
  indexed_at: z.string(),
  pages: z.number().optional(),
  note: z.string().optional(),
  marked_manually: z.boolean().optional()
});

export const PageIndexStateSchema = z.object({
  version: z.string(),
  last_sync: z.string(),
  note: z.string().optional(),
  indexed_papers: z.record(z.string(), PageIndexEntrySchema),
  failed_papers: z
    .record(
      z.string(),
      z.object({
        reason: z.string(),
        last_attempt: z.string()
      })
    )
    .optional()
});

export type PageIndexState = z.infer<typeof PageIndexStateSchema>;
export type PageIndexEntry = z.infer<typeof PageIndexEntrySchema>;

export function createDefaultScope(): DocumentScope {
  return {
    version: '1.0',
    lastModified: new Date().toISOString(),
    enabled: [],
    disabled: [],
    metadata: {
      totalDocuments: 0,
      totalPages: 0,
      estimatedTokens: 0,
      enabledCount: 0,
      disabledCount: 0
    }
  };
}
