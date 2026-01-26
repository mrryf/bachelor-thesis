import { ConfigService } from './config-service';
import { getPageIndexClient, type PageIndexDocument } from './pageindex-client';
import type { RefreshResult } from '../../shared/types';

export class RefreshService {
  constructor(private configService: ConfigService) {}

  async refresh(): Promise<RefreshResult> {
    try {
      // 1. Fetch current documents from PageIndex
      const pageIndexClient = getPageIndexClient();
      let pageIndexDocs: PageIndexDocument[];

      try {
        pageIndexDocs = await pageIndexClient.listDocuments();
      } catch (error) {
        // If MCP client fails, fall back to returning current state
        console.error('Failed to connect to PageIndex:', error);
        return {
          success: false,
          totalDocuments: 0,
          newDocuments: [],
          removedDocuments: [],
          error: 'Could not connect to PageIndex MCP server'
        };
      }

      const pageIndexNames = new Set(pageIndexDocs.map((d) => d.name));

      // 2. Read existing state
      const existingState = await this.configService.readPageIndexState();
      const existingNames = new Set(
        existingState
          ? Object.values(existingState.indexed_papers)
              .filter((p) => p.pageindex_name)
              .map((p) => p.pageindex_name!)
          : []
      );

      // 3. Identify changes
      const newDocs = pageIndexDocs.filter((d) => !existingNames.has(d.name));
      const removedDocs = [...existingNames].filter((n) => !pageIndexNames.has(n));

      // 4. Read current scope
      const scope = await this.configService.readScope();

      if (newDocs.length > 0 || removedDocs.length > 0) {
        // 5. Update scope: add new documents to disabled list (user opts-in)
        const currentEnabled = new Set(scope?.enabled || []);
        const currentDisabled = new Set(scope?.disabled || []);

        // Remove deleted documents from both lists
        for (const removed of removedDocs) {
          currentEnabled.delete(removed);
          currentDisabled.delete(removed);
        }

        // Add new documents to disabled list
        for (const newDoc of newDocs) {
          currentDisabled.add(newDoc.name);
        }

        // 6. Save updated scope
        await this.configService.writeScope({
          version: '1.0',
          lastModified: new Date().toISOString(),
          enabled: Array.from(currentEnabled),
          disabled: Array.from(currentDisabled),
          metadata: {
            totalDocuments: pageIndexDocs.length,
            totalPages: 0, // Will be updated on next listDocuments call
            estimatedTokens: 0,
            enabledCount: currentEnabled.size,
            disabledCount: currentDisabled.size
          }
        });
      }

      return {
        success: true,
        totalDocuments: pageIndexDocs.length,
        newDocuments: newDocs.map((d) => d.name),
        removedDocuments: removedDocs
      };
    } catch (error) {
      console.error('Refresh failed:', error);
      return {
        success: false,
        totalDocuments: 0,
        newDocuments: [],
        removedDocuments: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance
let serviceInstance: RefreshService | null = null;

export function getRefreshService(configService: ConfigService): RefreshService {
  if (!serviceInstance) {
    serviceInstance = new RefreshService(configService);
  }
  return serviceInstance;
}
