/**
 * DevvitStorageAdapter.ts
 *
 * Production storage adapter for Devvit runtime environment.
 * This adapter wraps Devvit's Redis client to provide a standardized
 * IStorageAdapter interface for the KVStoreManager.
 *
 * Usage:
 * - Used in production when running on Reddit's Devvit platform
 * - Provides direct access to Devvit's managed Redis instance
 * - All operations are asynchronous and delegated to the underlying Redis client
 */

import { redis } from '@devvit/web/server';
import { IStorageAdapter } from './IStorageAdapter';

/**
 * Production storage adapter using Devvit's Redis client.
 *
 * This adapter wraps the `@devvit/redis` client to implement the IStorageAdapter
 * interface. It should be used when deploying to the Devvit runtime environment,
 * where it provides access to Reddit's managed Redis infrastructure.
 *
 * All methods are thin wrappers around the corresponding Redis operations,
 * ensuring minimal overhead and maximum compatibility with Devvit's platform.
 */
export class DevvitStorageAdapter implements IStorageAdapter {
  /**
   * Retrieves a value by key from Redis.
   *
   * @param key - The key to retrieve
   * @returns The value as a string, or null if key doesn't exist
   */
  async get(key: string): Promise<string | null> {
    return await redis.get(key);
  }

  /**
   * Sets a value for a key in Redis.
   *
   * @param key - The key to set
   * @param value - The value to store (must be a string)
   */
  async set(key: string, value: string): Promise<void> {
    await redis.set(key, value);
  }

  /**
   * Adds a member to a Redis set stored at key.
   * If the set doesn't exist, it is created automatically.
   *
   * @param key - The key of the set
   * @param member - The member to add to the set
   */
  async sAdd(key: string, member: string): Promise<void> {
    await redis.sAdd(key, [member]);
  }

  /**
   * Retrieves all members of a Redis set stored at key.
   *
   * @param key - The key of the set
   * @returns Array of all members in the set, or empty array if set doesn't exist
   */
  async sMembers(key: string): Promise<string[]> {
    return await redis.sMembers(key);
  }

  /**
   * Deletes one or more keys from Redis.
   *
   * Handles variadic arguments to support deleting multiple keys
   * in a single operation for improved performance.
   *
   * @param key - The key(s) to delete (accepts one or more keys)
   */
  async del(...key: string[]): Promise<void> {
    if (key.length > 0) {
      await redis.del(key);
    }
  }
}
