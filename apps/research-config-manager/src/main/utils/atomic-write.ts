import { writeFile, rename, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

/**
 * Atomically write content to a file by first writing to a temp file
 * and then renaming. This prevents partial writes from corrupting the file.
 */
export async function atomicWriteFile(filePath: string, content: string): Promise<void> {
  const dir = dirname(filePath);
  const tempPath = join(dir, `.${randomUUID()}.tmp`);

  try {
    // Ensure directory exists
    await mkdir(dir, { recursive: true });

    // Write to temp file
    await writeFile(tempPath, content, 'utf-8');

    // Atomic rename
    await rename(tempPath, filePath);
  } catch (error) {
    // Clean up temp file if it exists
    try {
      const { unlink } = await import('fs/promises');
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Atomically write JSON to a file with pretty formatting
 */
export async function atomicWriteJson<T>(filePath: string, data: T): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await atomicWriteFile(filePath, content);
}
