/**
 * PageIndex MCP Client
 *
 * Connects to the PageIndex MCP server to fetch document list and metadata.
 * Used for the Refresh feature to discover newly indexed documents.
 *
 * Note: Requires @modelcontextprotocol/sdk package:
 *   npm install @modelcontextprotocol/sdk
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface PageIndexDocument {
  name: string;
  pageCount?: number;
  status: string;
}

export class PageIndexClient {
  private client: Client | null = null;
  private isConnecting = false;

  async connect(): Promise<void> {
    if (this.client || this.isConnecting) return;

    this.isConnecting = true;

    try {
      // PageIndex MCP server command
      // The server is typically started via npx or a direct path
      // Filter out undefined env values
      const env: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined) {
          env[key] = value;
        }
      }

      const transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', '@anthropic/pageindex'],
        env
      });

      this.client = new Client(
        { name: 'research-config-manager', version: '1.0.0' },
        { capabilities: {} }
      );

      await this.client.connect(transport);
    } finally {
      this.isConnecting = false;
    }
  }

  async listDocuments(limit = 100): Promise<PageIndexDocument[]> {
    await this.ensureConnected();

    const allDocs: PageIndexDocument[] = [];
    let cursor: string | undefined;

    do {
      const result = await this.client!.callTool({
        name: 'find_relevant_documents',
        arguments: { limit, cursor }
      });

      const parsed = this.parseDocumentList(result);
      allDocs.push(...parsed.documents);
      cursor = parsed.nextCursor;
    } while (cursor);

    return allDocs;
  }

  async getDocument(docName: string): Promise<PageIndexDocument | null> {
    await this.ensureConnected();

    try {
      const result = await this.client!.callTool({
        name: 'get_document',
        arguments: { doc_name: docName }
      });

      return this.parseDocument(result);
    } catch {
      return null;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.client) {
      await this.connect();
    }
  }

  private parseDocumentList(result: unknown): {
    documents: PageIndexDocument[];
    nextCursor?: string;
  } {
    // Parse MCP tool result into documents array
    // The result format depends on the actual PageIndex MCP response
    const content = (result as Record<string, unknown>)?.content;
    if (!Array.isArray(content) || content.length === 0) {
      return { documents: [] };
    }

    const textContent = content[0] as Record<string, unknown>;
    if (textContent?.type !== 'text' || typeof textContent.text !== 'string') {
      return { documents: [] };
    }

    try {
      const data = JSON.parse(textContent.text as string);

      // Handle array format or object with documents key
      const docs = Array.isArray(data)
        ? data
        : Array.isArray(data.documents)
          ? data.documents
          : [];

      const documents: PageIndexDocument[] = docs.map(
        (d: Record<string, unknown>) => ({
          name: (d.name || d.doc_name || '') as string,
          pageCount: (d.pageCount || d.page_count || d.pages) as number | undefined,
          status: (d.status || 'unknown') as string
        })
      );

      return {
        documents,
        nextCursor: data.cursor || data.next_cursor
      };
    } catch {
      return { documents: [] };
    }
  }

  private parseDocument(result: unknown): PageIndexDocument | null {
    const content = (result as Record<string, unknown>)?.content;
    if (!Array.isArray(content) || content.length === 0) {
      return null;
    }

    const textContent = content[0] as Record<string, unknown>;
    if (textContent?.type !== 'text' || typeof textContent.text !== 'string') {
      return null;
    }

    try {
      const data = JSON.parse(textContent.text as string);
      return {
        name: data.name || data.doc_name || '',
        pageCount: data.pageCount || data.page_count || data.pages,
        status: data.status || 'unknown'
      };
    } catch {
      return null;
    }
  }

  disconnect(): void {
    this.client?.close();
    this.client = null;
  }
}

// Singleton instance
let clientInstance: PageIndexClient | null = null;

export function getPageIndexClient(): PageIndexClient {
  if (!clientInstance) {
    clientInstance = new PageIndexClient();
  }
  return clientInstance;
}
