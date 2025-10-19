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
   * Adds a member to a set stored as a JSON array.
   * If the set doesn't exist, it is created automatically.
   *
   * Note: Devvit Redis doesn't support native SET operations (sAdd, sMembers),
   * so we emulate sets using JSON arrays stored as strings.
   *
   * @param key - The key of the set
   * @param member - The member to add to the set
   */
  async sAdd(key: string, member: string): Promise<void> {
    try {
      const existing = await redis.get(key);
      let members: string[] = [];

      if (existing) {
        try {
          members = JSON.parse(existing);
          // Validate that it's actually an array
          if (!Array.isArray(members)) {
            console.warn(`⚠️ DevvitAdapter.sAdd: Key "${key}" contains non-array data, resetting to empty array`);
            members = [];
          }
        } catch (parseError) {
          console.error(`❌ DevvitAdapter.sAdd: JSON.parse failed for key "${key}", resetting to empty array`, parseError);
          members = [];
        }
      }

      // Add member if it doesn't already exist (set behavior)
      if (!members.includes(member)) {
        members.push(member);
        await redis.set(key, JSON.stringify(members));
        console.log(`✅ DevvitAdapter.sAdd: Added "${member}" to set "${key}" (now ${members.length} members)`);
      } else {
        console.log(`ℹ️ DevvitAdapter.sAdd: Member "${member}" already exists in set "${key}"`);
      }
    } catch (error) {
      console.error(`❌ DevvitAdapter.sAdd: Critical error for key "${key}"`, error);
      throw error;
    }
  }

  /**
   * Retrieves all members of a set stored as a JSON array.
   *
   * @param key - The key of the set
   * @returns Array of all members in the set, or empty array if set doesn't exist
   */
  async sMembers(key: string): Promise<string[]> {
    try {
      const data = await redis.get(key);

      if (!data) {
        console.log(`ℹ️ DevvitAdapter.sMembers: Key "${key}" not found, returning empty array`);
        return [];
      }

      try {
        const members = JSON.parse(data);

        if (!Array.isArray(members)) {
          console.error(`❌ DevvitAdapter.sMembers: Key "${key}" contains non-array data:`, data);
          return [];
        }

        console.log(`✅ DevvitAdapter.sMembers: Retrieved ${members.length} members from set "${key}"`);
        return members;
      } catch (parseError) {
        console.error(`❌ DevvitAdapter.sMembers: JSON.parse failed for key "${key}"`, parseError);
        console.error(`   Raw data: ${data}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ DevvitAdapter.sMembers: Critical error for key "${key}"`, error);
      return [];
    }
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
      // ✅ Spread the array as Devvit redis.del expects individual arguments
      await redis.del(...key);
    }
  }
}
