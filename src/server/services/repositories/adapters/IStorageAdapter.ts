/**
 * IStorageAdapter.ts
 *
 * Storage adapter interface that abstracts key-value storage operations.
 * This interface allows KVStoreManager to work with different storage backends
 * (Redis, in-memory, file system, etc.) without modification.
 */

/**
 * Storage adapter interface for key-value operations.
 * Abstracts the underlying storage implementation (Redis, in-memory, etc.)
 */
export interface IStorageAdapter {
  /**
   * Retrieves a value by key.
   *
   * @param key - The key to retrieve
   * @returns The value as a string, or null if key doesn't exist
   */
  get(key: string): Promise<string | null>;

  /**
   * Sets a value for a key.
   *
   * @param key - The key to set
   * @param value - The value to store (must be a string)
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Adds a member to a set stored at key.
   * If the set doesn't exist, it is created.
   *
   * @param key - The key of the set
   * @param member - The member to add to the set
   */
  sAdd(key: string, member: string): Promise<void>;

  /**
   * Retrieves all members of a set stored at key.
   *
   * @param key - The key of the set
   * @returns Array of all members in the set, or empty array if set doesn't exist
   */
  sMembers(key: string): Promise<string[]>;

  /**
   * Deletes one or more keys.
   *
   * @param key - The key(s) to delete
   */
  del(...key: string[]): Promise<void>;
}
