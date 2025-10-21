/**
 * ContextManager - Central context management system
 * 
 * This module integrates all context management components (token counting,
 * merging, truncation, and caching) to provide a unified interface for
 * building and optimizing AI contexts.
 */

import { Skill } from './types.js';
import { TokenCounter } from './TokenCounter.js';
import { ContextMerger, ContextSection, MergeOptions } from './ContextMerger.js';
import { ContextTruncator, TruncationOptions } from './ContextTruncator.js';
import { ContextCache, CachedContext } from './ContextCache.js';

export interface AIContext {
  systemPrompt: string;
  skillPrompts: string[];
  steeringRules: string[];
  totalTokens: number;
  truncated: boolean;
  cached: boolean;
  sections: ContextSection[];
  metadata: {
    skillNames: string[];
    buildTime: number;
    cacheHit: boolean;
  };
}

export interface ContextBuildOptions {
  maxTokens?: number;
  includeExamples?: boolean;
  includeReferences?: boolean;
  useCache?: boolean;
  preserveTypes?: Array<ContextSection['type']>;
}

export interface ContextOptimizationResult {
  original: AIContext;
  optimized: AIContext;
  tokensSaved: number;
  optimizationApplied: string[];
}

/**
 * ContextManager class - Central context management
 */
export class ContextManager {
  private tokenCounter: TokenCounter;
  private contextMerger: ContextMerger;
  private contextTruncator: ContextTruncator;
  private contextCache: ContextCache;

  constructor(
    tokenCounter?: TokenCounter,
    contextMerger?: ContextMerger,
    contextTruncator?: ContextTruncator,
    contextCache?: ContextCache
  ) {
    this.tokenCounter = tokenCounter || new TokenCounter();
    this.contextMerger = contextMerger || new ContextMerger(this.tokenCounter);
    this.contextTruncator = contextTruncator || new ContextTruncator(this.tokenCounter);
    this.contextCache = contextCache || new ContextCache();
  }

  /**
   * Build AI context from active skills and steering rules
   */
  async buildContext(
    activeSkills: Skill[],
    steeringRules: string[],
    options: ContextBuildOptions = {}
  ): Promise<AIContext> {
    const startTime = Date.now();
    const skillNames = activeSkills.map(s => s.metadata.name);

    // Check cache first
    if (options.useCache !== false) {
      const cached = this.contextCache.get(skillNames, steeringRules);
      if (cached) {
        return this.cachedToAIContext(cached, true);
      }
    }

    // Extract skill prompts
    const skillPrompts = activeSkills.map(s => s.promptContent);

    // Merge contexts
    const mergeOptions: MergeOptions = {
      maxTokens: options.maxTokens,
      includeExamples: options.includeExamples,
      includeReferences: options.includeReferences,
    };

    const merged = this.contextMerger.merge(skillPrompts, steeringRules, mergeOptions);

    // Truncate if necessary
    let finalSections = merged.sections;
    let truncated = false;

    if (options.maxTokens && merged.totalTokens > options.maxTokens) {
      const truncationOptions: TruncationOptions = {
        maxTokens: options.maxTokens,
        preserveTypes: options.preserveTypes || ['steeringRules'],
        addTruncationMarker: true,
      };

      const truncationResult = this.contextTruncator.intelligentTruncate(
        merged.sections,
        truncationOptions
      );

      finalSections = truncationResult.sections;
      truncated = true;
    }

    // Build final context
    const systemPrompt = finalSections.map(s => s.content).join('\n\n');
    const totalTokens = this.tokenCounter.count(systemPrompt).tokens;

    const context: AIContext = {
      systemPrompt,
      skillPrompts,
      steeringRules,
      totalTokens,
      truncated,
      cached: false,
      sections: finalSections,
      metadata: {
        skillNames,
        buildTime: Date.now() - startTime,
        cacheHit: false,
      },
    };

    // Cache the result
    if (options.useCache !== false) {
      this.contextCache.set(
        skillNames,
        steeringRules,
        systemPrompt,
        totalTokens,
        {
          truncated,
          buildTime: context.metadata.buildTime,
        }
      );
    }

    return context;
  }

  /**
   * Optimize existing context
   */
  optimizeContext(
    context: AIContext,
    targetTokens: number
  ): ContextOptimizationResult {
    const optimizationApplied: string[] = [];
    let optimizedSections = [...context.sections];

    // Step 1: Remove references if needed
    if (context.totalTokens > targetTokens) {
      const withoutReferences = this.contextTruncator.removeSectionTypes(
        optimizedSections,
        ['skillReferences']
      );
      
      const tokensAfter = this.contextMerger.calculateTotalTokens(withoutReferences);
      
      if (tokensAfter <= targetTokens) {
        optimizedSections = withoutReferences;
        optimizationApplied.push('Removed reference sections');
      }
    }

    // Step 2: Remove examples if still needed
    if (this.contextMerger.calculateTotalTokens(optimizedSections) > targetTokens) {
      const withoutExamples = this.contextTruncator.removeSectionTypes(
        optimizedSections,
        ['skillExamples']
      );
      
      const tokensAfter = this.contextMerger.calculateTotalTokens(withoutExamples);
      
      if (tokensAfter <= targetTokens) {
        optimizedSections = withoutExamples;
        optimizationApplied.push('Removed example sections');
      }
    }

    // Step 3: Intelligent truncation if still needed
    if (this.contextMerger.calculateTotalTokens(optimizedSections) > targetTokens) {
      const truncationResult = this.contextTruncator.intelligentTruncate(
        optimizedSections,
        {
          maxTokens: targetTokens,
          preserveTypes: ['steeringRules'],
          addTruncationMarker: true,
        }
      );
      
      optimizedSections = truncationResult.sections;
      optimizationApplied.push('Applied intelligent truncation');
    }

    // Build optimized context
    const optimizedPrompt = optimizedSections.map(s => s.content).join('\n\n');
    const optimizedTokens = this.tokenCounter.count(optimizedPrompt).tokens;

    const optimized: AIContext = {
      ...context,
      systemPrompt: optimizedPrompt,
      totalTokens: optimizedTokens,
      truncated: true,
      sections: optimizedSections,
    };

    return {
      original: context,
      optimized,
      tokensSaved: context.totalTokens - optimizedTokens,
      optimizationApplied,
    };
  }

  /**
   * Merge multiple contexts
   */
  mergeContexts(contexts: AIContext[]): AIContext {
    const allSections: ContextSection[] = [];
    const allSkillPrompts: string[] = [];
    const allSteeringRules: string[] = [];
    const allSkillNames: string[] = [];

    for (const context of contexts) {
      allSections.push(...context.sections);
      allSkillPrompts.push(...context.skillPrompts);
      allSteeringRules.push(...context.steeringRules);
      allSkillNames.push(...context.metadata.skillNames);
    }

    // Remove duplicates
    const uniqueSections = this.deduplicateSections(allSections);
    const uniqueSkillPrompts = [...new Set(allSkillPrompts)];
    const uniqueSteeringRules = [...new Set(allSteeringRules)];
    const uniqueSkillNames = [...new Set(allSkillNames)];

    // Sort by priority
    uniqueSections.sort((a, b) => a.priority - b.priority);

    const systemPrompt = uniqueSections.map(s => s.content).join('\n\n');
    const totalTokens = this.tokenCounter.count(systemPrompt).tokens;

    return {
      systemPrompt,
      skillPrompts: uniqueSkillPrompts,
      steeringRules: uniqueSteeringRules,
      totalTokens,
      truncated: false,
      cached: false,
      sections: uniqueSections,
      metadata: {
        skillNames: uniqueSkillNames,
        buildTime: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Invalidate cache for specific skill
   */
  invalidateSkillCache(skillName: string): number {
    return this.contextCache.invalidateSkill(skillName);
  }

  /**
   * Invalidate cache for specific steering rule
   */
  invalidateSteeringCache(steeringRule: string): number {
    return this.contextCache.invalidateSteering(steeringRule);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.contextCache.clear();
    this.tokenCounter.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      context: this.contextCache.getStats(),
      tokens: this.tokenCounter.getCacheStats(),
      efficiency: this.contextCache.getEfficiencyMetrics(),
    };
  }

  /**
   * Analyze context composition
   */
  analyzeContext(context: AIContext): {
    sectionBreakdown: Record<string, number>;
    tokenDistribution: Record<string, number>;
    recommendations: string[];
  } {
    const sectionBreakdown: Record<string, number> = {};
    const tokenDistribution: Record<string, number> = {};
    const recommendations: string[] = [];

    // Count sections by type
    for (const section of context.sections) {
      sectionBreakdown[section.type] = (sectionBreakdown[section.type] || 0) + 1;
      tokenDistribution[section.type] = (tokenDistribution[section.type] || 0) + (section.tokens || 0);
    }

    // Generate recommendations
    const totalTokens = context.totalTokens;
    const referencesTokens = tokenDistribution['skillReferences'] || 0;
    const examplesTokens = tokenDistribution['skillExamples'] || 0;

    if (referencesTokens > totalTokens * 0.3) {
      recommendations.push('Consider removing reference sections to reduce context size');
    }

    if (examplesTokens > totalTokens * 0.4) {
      recommendations.push('Example sections are taking up significant space');
    }

    if (context.truncated) {
      recommendations.push('Context was truncated - consider reducing active skills');
    }

    return {
      sectionBreakdown,
      tokenDistribution,
      recommendations,
    };
  }

  /**
   * Convert cached context to AIContext
   */
  private cachedToAIContext(cached: CachedContext, cacheHit: boolean): AIContext {
    const sections = this.contextMerger.parseMarkdownSections(
      cached.content,
      'skillCorePrompt'
    );

    return {
      systemPrompt: cached.content,
      skillPrompts: [],
      steeringRules: cached.steeringRules,
      totalTokens: cached.tokens,
      truncated: cached.metadata?.truncated || false,
      cached: true,
      sections,
      metadata: {
        skillNames: cached.skillNames,
        buildTime: 0,
        cacheHit,
      },
    };
  }

  /**
   * Deduplicate sections by content
   */
  private deduplicateSections(sections: ContextSection[]): ContextSection[] {
    const seen = new Set<string>();
    const unique: ContextSection[] = [];

    for (const section of sections) {
      const key = `${section.type}:${section.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(section);
      }
    }

    return unique;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.tokenCounter.dispose();
    this.contextCache.clear();
  }
}

/**
 * Singleton instance
 */
let globalContextManager: ContextManager | null = null;

export function getContextManager(): ContextManager {
  if (!globalContextManager) {
    globalContextManager = new ContextManager();
  }
  return globalContextManager;
}

/**
 * Convenience function for building context
 */
export async function buildContext(
  activeSkills: Skill[],
  steeringRules: string[],
  options?: ContextBuildOptions
): Promise<AIContext> {
  const manager = getContextManager();
  return manager.buildContext(activeSkills, steeringRules, options);
}

/**
 * Convenience function for optimizing context
 */
export function optimizeContext(
  context: AIContext,
  targetTokens: number
): ContextOptimizationResult {
  const manager = getContextManager();
  return manager.optimizeContext(context, targetTokens);
}
