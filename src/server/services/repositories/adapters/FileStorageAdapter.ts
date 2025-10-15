/**
 * FileStorageAdapter.ts
 *
 * File-based storage adapter for local development and script execution.
 * This adapter implements the IStorageAdapter interface using Node.js file system operations,
 * allowing the application to run without Redis during local development or standalone scripts.
 *
 * Storage Structure:
 * - Each key is stored as a separate JSON file
 * - Redis keys (e.g., "mystery:123") are converted to safe filenames (e.g., "mystery_123.json")
 * - Set operations store arrays in JSON format
 * - All data is stored in a configurable directory (default: ./local-data)
 *
 * Use Cases:
 * - Local development without Redis
 * - Standalone scripts and utilities
 * - Testing and debugging
 * - CI/CD environments without Redis
 */

import { promises as fs } from 'fs';
import path from 'path';
import { IStorageAdapter } from './IStorageAdapter';

/**
 * File-based storage adapter for local development.
 * Implements IStorageAdapter using the Node.js file system.
 */
export class FileStorageAdapter implements IStorageAdapter {
  private readonly dataDir: string;

  /**
   * Creates a new FileStorageAdapter instance.
   *
   * @param dataDir - Directory to store data files (default: ./local-data)
   */
  constructor(dataDir: string = './local-data') {
    this.dataDir = dataDir;
  }

  /**
   * Converts a Redis key to a safe filename.
   * Replaces colons with underscores and adds .json extension.
   *
   * @param key - The Redis key (e.g., "mystery:123")
   * @returns Safe filename (e.g., "mystery_123.json")
   */
  private keyToFilename(key: string): string {
    const safeKey = key.replace(/:/g, '_');
    return `${safeKey}.json`;
  }

  /**
   * Gets the full file path for a key.
   *
   * @param key - The storage key
   * @returns Full file path
   */
  private getFilePath(key: string): string {
    return path.join(this.dataDir, this.keyToFilename(key));
  }

  /**
   * Ensures the data directory exists.
   * Creates the directory if it doesn't exist.
   */
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Ignore error if directory already exists
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Retrieves a value by key.
   *
   * @param key - The key to retrieve
   * @returns The value as a string, or null if key doesn't exist
   */
  async get(key: string): Promise<string | null> {
    try {
      const filePath = this.getFilePath(key);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return data.value;
    } catch (error) {
      // Return null if file doesn't exist
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Sets a value for a key.
   *
   * @param key - The key to set
   * @param value - The value to store (must be a string)
   */
  async set(key: string, value: string): Promise<void> {
    await this.ensureDataDir();
    const filePath = this.getFilePath(key);
    const data = { value };
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Adds a member to a set stored at key.
   * If the set doesn't exist, it is created.
   * Automatically avoids duplicates.
   *
   * @param key - The key of the set
   * @param member - The member to add to the set
   */
  async sAdd(key: string, member: string): Promise<void> {
    await this.ensureDataDir();
    const filePath = this.getFilePath(key);

    let members: string[] = [];

    // Try to read existing set
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      members = data.members || [];
    } catch (error) {
      // File doesn't exist, start with empty array
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    // Add member if not already present
    if (!members.includes(member)) {
      members.push(member);
    }

    // Write back to file
    const data = { members };
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Retrieves all members of a set stored at key.
   *
   * @param key - The key of the set
   * @returns Array of all members in the set, or empty array if set doesn't exist
   */
  async sMembers(key: string): Promise<string[]> {
    try {
      const filePath = this.getFilePath(key);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return data.members || [];
    } catch (error) {
      // Return empty array if file doesn't exist
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Deletes one or more keys.
   * Silently ignores keys that don't exist.
   *
   * @param keys - The key(s) to delete
   */
  async del(...keys: string[]): Promise<void> {
    for (const key of keys) {
      try {
        const filePath = this.getFilePath(key);
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore error if file doesn't exist
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
    }
  }
}
