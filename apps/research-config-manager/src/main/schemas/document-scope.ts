import { z } from 'zod';

export const DocumentScopeMetadataSchema = z.object({
  totalDocuments: z.number(),
  totalPages: z.number(),
  estimatedTokens: z.number(),
  enabledCount: z.number(),
  disabledCount: z.number()
});

export const DocumentScopeSchema = z.object({
  version: z.literal('1.0'),
  lastModified: z.string(),
  enabled: z.array(z.string()),
  disabled: z.array(z.string()),
  categories: z
    .record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        documents: z.array(z.string())
      })
    )
    .optional(),
  metadata: DocumentScopeMetadataSchema.optional()
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
