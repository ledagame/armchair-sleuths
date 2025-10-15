/**
 * MemoryStorageAdapter.ts
 *
 * In-memory implementation of IStorageAdapter for unit testing.
 * This adapter uses JavaScript Map and Set data structures to simulate
 * key-value storage operations without requiring external dependencies like Redis.
 *
 * NOTE: This adapter is intended for unit tests only. All data is stored in memory
 * and will be lost when the process terminates. For production use, implement
 * a persistent storage adapter (e.g., RedisStorageAdapter).
 */

import { IStorageAdapter } from './IStorageAdapter';

/**
 * In-memory storage adapter using JavaScript Map and Set.
 * Perfect for unit testing without external dependencies.
 *
 * @example
 * ```typescript
 * const adapter = new MemoryStorageAdapter();
 * await adapter.set('key', 'value');
 * const value = await adapter.get('key'); // 'value'
 * await adapter.clear(); // Clean up after tests
 * ```
 */
export class MemoryStorageAdapter implements IStorageAdapter {
  /**
   * Map storing regular key-value pairs.
   * Keys and values are both strings to match Redis behavior.
   */
  private keyValueStore: Map<string, string>;

  /**
   * Map storing sets identified by their key.
   * Each key maps to a Set of string members.
   */
  private setStore: Map<string, Set<string>>;

  constructor() {
    this.keyValueStore = new Map();
    this.setStore = new Map();
  }

  /**
   * Retrieves a value by key from the key-value store.
   *
   * @param key - The key to retrieve
   * @returns The value as a string, or null if key doesn't exist
   */
  async get(key: string): Promise<string | null> {
    return this.keyValueStore.get(key) ?? null;
  }

  /**
   * Sets a value for a key in the key-value store.
   *
   * @param key - The key to set
   * @param value - The value to store (must be a string)
   */
  async set(key: string, value: string): Promise<void> {
    this.keyValueStore.set(key, value);
  }

  /**
   * Adds a member to a set stored at key.
   * If the set doesn't exist, it is created automatically.
   *
   * @param key - The key of the set
   * @param member - The member to add to the set
   */
  async sAdd(key: string, member: string): Promise<void> {
    let set = this.setStore.get(key);

    if (!set) {
      set = new Set<string>();
      this.setStore.set(key, set);
    }

    set.add(member);
  }

  /**
   * Retrieves all members of a set stored at key.
   *
   * @param key - The key of the set
   * @returns Array of all members in the set, or empty array if set doesn't exist
   */
  async sMembers(key: string): Promise<string[]> {
    const set = this.setStore.get(key);
    return set ? Array.from(set) : [];
  }

  /**
   * Deletes one or more keys from both the key-value store and set store.
   *
   * @param keys - The key(s) to delete
   */
  async del(...keys: string[]): Promise<void> {
    for (const key of keys) {
      this.keyValueStore.delete(key);
      this.setStore.delete(key);
    }
  }

  /**
   * Clears all data from both stores.
   * Useful for cleaning up between unit tests.
   *
   * @example
   * ```typescript
   * afterEach(async () => {
   *   await adapter.clear();
   * });
   * ```
   */
  async clear(): Promise<void> {
    this.keyValueStore.clear();
    this.setStore.clear();
  }

  /**
   * Returns the number of keys in the key-value store.
   * Useful for test assertions.
   *
   * @returns The number of keys stored
   */
  getKeyCount(): number {
    return this.keyValueStore.size;
  }

  /**
   * Returns the number of sets in the set store.
   * Useful for test assertions.
   *
   * @returns The number of sets stored
   */
  getSetCount(): number {
    return this.setStore.size;
  }

  /**
   * Checks if a key exists in either store.
   * Useful for test assertions.
   *
   * @param key - The key to check
   * @returns True if the key exists in either store
   */
  hasKey(key: string): boolean {
    return this.keyValueStore.has(key) || this.setStore.has(key);
  }
}
