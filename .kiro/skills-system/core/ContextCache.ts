/**
 * ContextCache - LRU cache for context storage
 * 
 * This module provides caching functionality for built contexts to improve
 * performance and reduce redundant context building operations.
 */

import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';

export interface CachedContext {
  content: string;
  timestamp: Date;
  skillNames: string[];
  steeringRules: string[];
  tokens: number;
  metadata?: Record<string, any>;
}

export interface CacheOptions {
  maxSize?: number;
  ttl?: number; // milliseconds
  updateAgeOnGet?: boolean;
  updateAgeOnHas?: boolean;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

/**
 * ContextCache class for caching built contexts
 */
export class ContextCache {
  private cache: LRUCache<string, CachedContext>;
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache<string, CachedContext>({
      max: options.maxSize || 50,
      ttl: options.ttl || 1000 * 60 * 60, // 1 hour default
      updateAgeOnGet: options.updateAgeOnGet ?? true,
      updateAgeOnHas: options.updateAgeOnHas ?? false,
      dispose: () => {
        this.evictions++;
      },
    });
  }

  /**
   * Generate cache key from skill names and steering rules
   */
  private generateKey(skillNames: string[], steeringRules: string[]): string {
    const data = {
      skills: skillNames.sort(),
      steering: steeringRules.sort(),
    };
    
    const hash = createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  /**
   * Get cached context
   */
  get(skillNames: string[], steeringRules: string[]): CachedContext | null {
    const key = this.generateKey(skillNames, steeringRules);
    const cached = this.cache.get(key);

    if (cached) {
      this.hits++;
      return cached;
    }

    this.misses++;
    return null;
  }

  /**
   * Set context in cache
   */
  set(
    skillNames: string[],
    steeringRules: string[],
    content: string,
    tokens: number,
    metadata?: Record<string, any>
  ): void {
    const key = this.generateKey(skillNames, steeringRules);
    
    const cachedContext: CachedContext = {
      content,
      timestamp: new Date(),
      skillNames: [...skillNames],
      steeringRules: [...steeringRules],
      tokens,
      metadata,
    };

    this.cache.set(key, cachedContext);
  }

  /**
   * Check if context exists in cache
   */
  has(skillNames: string[], steeringRules: string[]): boolean {
    const key = this.generateKey(skillNames, steeringRules);
    return this.cache.has(key);
  }

  /**
   * Invalidate cache entry
   */
  invalidate(skillNames: string[], steeringRules: string[]): boolean {
    const key = this.generateKey(skillNames, steeringRules);
    return this.cache.delete(key);
  }

  /**
   * Invalidate all entries containing a specific skill
   */
  invalidateSkill(skillName: string): number {
    let invalidated = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.skillNames.includes(skillName)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  /**
   * Invalidate all entries containing a specific steering rule
   */
  invalidateSteering(steeringRule: string): number {
    let invalidated = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.steeringRules.includes(steeringRule)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      size: this.cache.size,
      maxSize: this.cache.max || 0,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      evictions: this.evictions,
    };
  }

  /**
   * Get all cached entries
   */
  getAllEntries(): CachedContext[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get entries by skill name
   */
  getEntriesBySkill(skillName: string): CachedContext[] {
    const entries: CachedContext[] = [];

    for (const value of this.cache.values()) {
      if (value.skillNames.includes(skillName)) {
        entries.push(value);
      }
    }

    return entries;
  }

  /**
   * Prune expired entries
   */
  prune(): number {
    const sizeBefore = this.cache.size;
    this.cache.purgeStale();
    return sizeBefore - this.cache.size;
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getSizeInBytes(): number {
    let totalSize = 0;

    for (const value of this.cache.values()) {
      // Approximate size calculation
      totalSize += value.content.length * 2; // UTF-16 encoding
      totalSize += JSON.stringify(value.skillNames).length * 2;
      totalSize += JSON.stringify(value.steeringRules).length * 2;
      totalSize += 100; // Overhead for metadata and timestamps
    }

    return totalSize;
  }

  /**
   * Get cache efficiency metrics
   */
  getEfficiencyMetrics(): {
    hitRate: number;
    avgTokensPerEntry: number;
    cacheUtilization: number;
    avgAge: number;
  } {
    const stats = this.getStats();
    const entries = this.getAllEntries();

    const avgTokens = entries.length > 0
      ? entries.reduce((sum, e) => sum + e.tokens, 0) / entries.length
      : 0;

    const cacheUtilization = stats.maxSize > 0
      ? stats.size / stats.maxSize
      : 0;

    const now = Date.now();
    const avgAge = entries.length > 0
      ? entries.reduce((sum, e) => sum + (now - e.timestamp.getTime()), 0) / entries.length
      : 0;

    return {
      hitRate: stats.hitRate,
      avgTokensPerEntry: avgTokens,
      cacheUtilization,
      avgAge: avgAge / 1000, // Convert to seconds
    };
  }

  /**
   * Export cache for persistence
   */
  export(): string {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      value,
    }));

    return JSON.stringify({
      entries,
      stats: this.getStats(),
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import cache from persistence
   */
  import(data: string): number {
    try {
      const parsed = JSON.parse(data);
      let imported = 0;

      for (const { key, value } of parsed.entries) {
        // Restore Date objects
        value.timestamp = new Date(value.timestamp);
        this.cache.set(key, value);
        imported++;
      }

      return imported;
    } catch (error) {
      console.error('Failed to import cache:', error);
      return 0;
    }
  }
}

/**
 * Singleton instance
 */
let globalContextCache: ContextCache | null = null;

export function getContextCache(options?: CacheOptions): ContextCache {
  if (!globalContextCache) {
    globalContextCache = new ContextCache(options);
  }
  return globalContextCache;
}

/**
 * Convenience function for getting cached context
 */
export function getCachedContext(
  skillNames: string[],
  steeringRules: string[]
): CachedContext | null {
  const cache = getContextCache();
  return cache.get(skillNames, steeringRules);
}

/**
 * Convenience function for caching context
 */
export function cacheContext(
  skillNames: string[],
  steeringRules: string[],
  content: string,
  tokens: number,
  metadata?: Record<string, any>
): void {
  const cache = getContextCache();
  cache.set(skillNames, steeringRules, content, tokens, metadata);
}
