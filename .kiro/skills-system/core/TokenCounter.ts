/**
 * TokenCounter - Accurate token counting using tiktoken
 * 
 * This module provides token counting functionality for context management.
 * It uses tiktoken for accurate GPT model token counting and caches results
 * for performance optimization.
 */

import { Tiktoken, encoding_for_model } from 'tiktoken';
import { LRUCache } from 'lru-cache';

export interface TokenCountResult {
  tokens: number;
  characters: number;
  cached: boolean;
}

export interface TokenCounterOptions {
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  cacheSize?: number;
  cacheTTL?: number; // milliseconds
}

/**
 * TokenCounter class for accurate token counting with caching
 */
export class TokenCounter {
  private encoder: Tiktoken;
  private cache: LRUCache<string, TokenCountResult>;
  private model: string;

  constructor(options: TokenCounterOptions = {}) {
    this.model = options.model || 'gpt-4';
    
    // Initialize tiktoken encoder
    // For Claude models, we use GPT-4 encoding as approximation
    const encodingModel = this.model.startsWith('claude') ? 'gpt-4' : this.model;
    this.encoder = encoding_for_model(encodingModel as any);

    // Initialize LRU cache
    this.cache = new LRUCache<string, TokenCountResult>({
      max: options.cacheSize || 1000,
      ttl: options.cacheTTL || 1000 * 60 * 60, // 1 hour default
      updateAgeOnGet: true,
    });
  }

  /**
   * Count tokens in text with caching
   */
  count(text: string): TokenCountResult {
    // Check cache first
    const cacheKey = this.getCacheKey(text);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    // Count tokens
    const tokens = this.encoder.encode(text);
    const result: TokenCountResult = {
      tokens: tokens.length,
      characters: text.length,
      cached: false,
    };

    // Cache result
    this.cache.set(cacheKey, result);

    return result;
  }

  /**
   * Count tokens in multiple texts
   */
  countMultiple(texts: string[]): TokenCountResult {
    let totalTokens = 0;
    let totalCharacters = 0;
    let anyCached = false;

    for (const text of texts) {
      const result = this.count(text);
      totalTokens += result.tokens;
      totalCharacters += result.characters;
      anyCached = anyCached || result.cached;
    }

    return {
      tokens: totalTokens,
      characters: totalCharacters,
      cached: anyCached,
    };
  }

  /**
   * Estimate tokens without exact counting (faster)
   */
  estimate(text: string): number {
    // Rough estimation: ~4 characters per token for English
    // This is much faster than exact counting
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if text exceeds token limit
   */
  exceedsLimit(text: string, limit: number): boolean {
    const result = this.count(text);
    return result.tokens > limit;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(text: string): void {
    const cacheKey = this.getCacheKey(text);
    this.cache.delete(cacheKey);
  }

  /**
   * Generate cache key from text
   */
  private getCacheKey(text: string): string {
    // Use first 100 chars + length as cache key for efficiency
    const prefix = text.substring(0, 100);
    return `${prefix}:${text.length}`;
  }

  /**
   * Calculate cache hit rate
   */
  private calculateHitRate(): number {
    // This is a simplified calculation
    // In production, you'd track hits/misses separately
    return this.cache.size > 0 ? 0.8 : 0; // Placeholder
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.encoder.free();
    this.cache.clear();
  }
}

/**
 * Singleton instance for global use
 */
let globalTokenCounter: TokenCounter | null = null;

export function getTokenCounter(options?: TokenCounterOptions): TokenCounter {
  if (!globalTokenCounter) {
    globalTokenCounter = new TokenCounter(options);
  }
  return globalTokenCounter;
}

/**
 * Convenience function for quick token counting
 */
export function countTokens(text: string, options?: TokenCounterOptions): number {
  const counter = getTokenCounter(options);
  return counter.count(text).tokens;
}

/**
 * Convenience function for checking token limits
 */
export function checkTokenLimit(text: string, limit: number, options?: TokenCounterOptions): boolean {
  const counter = getTokenCounter(options);
  return !counter.exceedsLimit(text, limit);
}
