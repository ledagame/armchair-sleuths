/**
 * ArchetypeManager.ts
 *
 * Manages archetype data and provides utilities for archetype validation,
 * including vocabulary conflict detection between archetypes.
 *
 * Part of Task 4.3: Archetype-Specific Guidelines Enhancement
 * Task 7.1: Performance optimization with caching
 */

import {
  ArchetypeName,
  getArchetypeData,
  ARCHETYPE_PROMPTS,
  preloadAllArchetypes,
  clearArchetypeCache
} from './ArchetypePrompts.js';

export interface VocabularyConflict {
  conflictRate: number;  // 0-1, percentage of overlapping vocabulary
  conflicts: string[];   // List of conflicting words
}

/**
 * Performance metrics for archetype loading
 */
export interface ArchetypeLoadingMetrics {
  totalLoads: number;
  cacheHits: number;
  cacheMisses: number;
  averageLoadTime: number;
  maxLoadTime: number;
  minLoadTime: number;
}

/**
 * ArchetypeManager class for managing and validating archetype data
 * Task 7.1: Enhanced with performance optimization and caching
 */
export class ArchetypeManager {
  private loadingMetrics: Map<ArchetypeName, number[]> = new Map();
  private cacheWarmed: boolean = false;
  /**
   * Load all available archetypes
   */
  loadAllArchetypes(): ArchetypeName[] {
    return [
      'Wealthy Heir',
      'Loyal Butler',
      'Talented Artist',
      'Business Partner',
      'Former Police Officer'
    ];
  }

  /**
   * Task 7.1: Warm up the cache by preloading all archetypes
   * Target: < 100ms total loading time
   * 
   * @returns Total time taken to warm up cache in milliseconds
   */
  warmUpCache(): number {
    if (this.cacheWarmed) {
      console.log('✅ Cache already warmed up');
      return 0;
    }

    const startTime = performance.now();
    
    console.log('🔥 Warming up archetype cache...');
    preloadAllArchetypes();
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    this.cacheWarmed = true;
    
    console.log(`✅ Cache warmed up in ${totalTime.toFixed(2)}ms`);
    
    if (totalTime > 100) {
      console.warn(`⚠️  Cache warm-up took ${totalTime.toFixed(2)}ms (target: < 100ms)`);
    }
    
    return totalTime;
  }

  /**
   * Task 7.1: Load archetype with performance measurement
   * 
   * @param archetypeName - Name of the archetype to load
   * @returns Archetype data
   */
  loadArchetypeWithMetrics(archetypeName: ArchetypeName): ReturnType<typeof getArchetypeData> {
    const startTime = performance.now();
    
    const data = getArchetypeData(archetypeName);
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Record metrics
    if (!this.loadingMetrics.has(archetypeName)) {
      this.loadingMetrics.set(archetypeName, []);
    }
    this.loadingMetrics.get(archetypeName)!.push(loadTime);
    
    // Log if loading is slow
    if (loadTime > 100) {
      console.warn(
        `⚠️  Slow archetype load: ${archetypeName} took ${loadTime.toFixed(2)}ms (target: < 100ms)`
      );
    }
    
    return data;
  }

  /**
   * Task 7.1: Get performance metrics for archetype loading
   * 
   * @param archetypeName - Optional archetype name to get specific metrics
   * @returns Performance metrics
   */
  getLoadingMetrics(archetypeName?: ArchetypeName): ArchetypeLoadingMetrics | Map<ArchetypeName, ArchetypeLoadingMetrics> {
    if (archetypeName) {
      const times = this.loadingMetrics.get(archetypeName) || [];
      
      if (times.length === 0) {
        return {
          totalLoads: 0,
          cacheHits: 0,
          cacheMisses: 0,
          averageLoadTime: 0,
          maxLoadTime: 0,
          minLoadTime: 0
        };
      }
      
      // First load is cache miss, rest are cache hits
      const cacheMisses = Math.min(1, times.length);
      const cacheHits = Math.max(0, times.length - 1);
      
      return {
        totalLoads: times.length,
        cacheHits,
        cacheMisses,
        averageLoadTime: times.reduce((a, b) => a + b, 0) / times.length,
        maxLoadTime: Math.max(...times),
        minLoadTime: Math.min(...times)
      };
    }
    
    // Return metrics for all archetypes
    const allMetrics = new Map<ArchetypeName, ArchetypeLoadingMetrics>();
    
    for (const name of this.loadAllArchetypes()) {
      allMetrics.set(name, this.getLoadingMetrics(name) as ArchetypeLoadingMetrics);
    }
    
    return allMetrics;
  }

  /**
   * Task 7.1: Clear cache and reset metrics (useful for testing)
   */
  clearCacheAndMetrics(): void {
    clearArchetypeCache();
    this.loadingMetrics.clear();
    this.cacheWarmed = false;
    console.log('🧹 Cache and metrics cleared');
  }

  /**
   * Task 7.1: Get cache status
   */
  getCacheStatus(): {
    warmed: boolean;
    totalLoads: number;
    uniqueArchetypesLoaded: number;
  } {
    let totalLoads = 0;
    
    for (const times of this.loadingMetrics.values()) {
      totalLoads += times.length;
    }
    
    return {
      warmed: this.cacheWarmed,
      totalLoads,
      uniqueArchetypesLoaded: this.loadingMetrics.size
    };
  }

  /**
   * Get vocabulary set for an archetype (primary + secondary)
   */
  private getVocabularySet(archetypeName: ArchetypeName): Set<string> {
    const data = getArchetypeData(archetypeName);
    if (!data) {
      return new Set();
    }

    const allVocabulary = [
      ...data.vocabulary.primary,
      ...data.vocabulary.secondary
    ];

    // Normalize to lowercase for comparison
    return new Set(allVocabulary.map(word => word.toLowerCase()));
  }

  /**
   * Check vocabulary conflict between two archetypes
   *
   * @param archetype1 - First archetype name
   * @param archetype2 - Second archetype name
   * @returns VocabularyConflict object with conflict rate and list of conflicts
   *
   * Requirements: 4.6, 4.7
   */
  checkVocabularyConflict(
    archetype1: ArchetypeName,
    archetype2: ArchetypeName
  ): VocabularyConflict {
    const vocab1 = this.getVocabularySet(archetype1);
    const vocab2 = this.getVocabularySet(archetype2);

    // Find intersection (common words)
    const conflicts: string[] = [];
    for (const word of vocab1) {
      if (vocab2.has(word)) {
        conflicts.push(word);
      }
    }

    // Calculate conflict rate
    // Rate = (number of common words) / (total unique words in both sets)
    const totalUniqueWords = new Set([...vocab1, ...vocab2]).size;
    const conflictRate = totalUniqueWords > 0
      ? conflicts.length / totalUniqueWords
      : 0;

    return {
      conflictRate,
      conflicts: conflicts.sort()  // Sort alphabetically for consistency
    };
  }

  /**
   * Check if a new archetype has acceptable vocabulary uniqueness
   *
   * @param newArchetypeName - Name of the new archetype
   * @param newVocabulary - Vocabulary for the new archetype (primary + secondary)
   * @returns Object with validation result and conflicts with existing archetypes
   */
  validateNewArchetypeVocabulary(
    newArchetypeName: string,
    newVocabulary: string[]
  ): {
    isValid: boolean;
    maxConflictRate: number;
    conflicts: Array<{
      archetype: ArchetypeName;
      conflictRate: number;
      conflictingWords: string[];
    }>;
  } {
    const existingArchetypes = this.loadAllArchetypes();
    const newVocabSet = new Set(newVocabulary.map(w => w.toLowerCase()));

    const conflicts: Array<{
      archetype: ArchetypeName;
      conflictRate: number;
      conflictingWords: string[];
    }> = [];

    let maxConflictRate = 0;

    for (const existingArchetype of existingArchetypes) {
      const existingVocabSet = this.getVocabularySet(existingArchetype);

      // Find common words
      const commonWords: string[] = [];
      for (const word of newVocabSet) {
        if (existingVocabSet.has(word)) {
          commonWords.push(word);
        }
      }

      // Calculate conflict rate
      const totalUniqueWords = new Set([...newVocabSet, ...existingVocabSet]).size;
      const conflictRate = totalUniqueWords > 0
        ? commonWords.length / totalUniqueWords
        : 0;

      if (commonWords.length > 0) {
        conflicts.push({
          archetype: existingArchetype,
          conflictRate,
          conflictingWords: commonWords.sort()
        });
      }

      maxConflictRate = Math.max(maxConflictRate, conflictRate);
    }

    // Requirement 4.7: Warn if conflict rate > 50%
    const isValid = maxConflictRate <= 0.5;

    return {
      isValid,
      maxConflictRate,
      conflicts: conflicts.sort((a, b) => b.conflictRate - a.conflictRate)
    };
  }

  /**
   * Get a summary of vocabulary conflicts across all archetypes
   */
  getVocabularyConflictMatrix(): Map<string, Map<string, VocabularyConflict>> {
    const archetypes = this.loadAllArchetypes();
    const matrix = new Map<string, Map<string, VocabularyConflict>>();

    for (let i = 0; i < archetypes.length; i++) {
      const archetype1 = archetypes[i];
      const row = new Map<string, VocabularyConflict>();

      for (let j = 0; j < archetypes.length; j++) {
        if (i === j) continue;  // Skip self-comparison

        const archetype2 = archetypes[j];
        const conflict = this.checkVocabularyConflict(archetype1, archetype2);
        row.set(archetype2, conflict);
      }

      matrix.set(archetype1, row);
    }

    return matrix;
  }
}

/**
 * Singleton instance for convenience
 */
export const archetypeManager = new ArchetypeManager();
