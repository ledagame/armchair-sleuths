import type { Skill } from './types.js';
import type { KeywordIndexer, SearchResult } from './KeywordIndexer.js';
import type { SkillRegistry } from './SkillRegistry.js';

/**
 * KeywordMatcher - Matches user input against skill triggers
 * 
 * This class provides:
 * - Intelligent keyword extraction from user input
 * - Fuzzy matching against skill triggers
 * - Ranked results based on relevance
 * - Context-aware matching
 */
export class KeywordMatcher {
  private indexer: KeywordIndexer;
  private registry: SkillRegistry;

  // Common stop words to filter out
  private stopWords = new Set([
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'been',
    'be',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'should',
    'could',
    'can',
    'may',
    'might',
    'must',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
    'my',
    'your',
    'his',
    'her',
    'its',
    'our',
    'their',
    'this',
    'that',
    'these',
    'those',
  ]);

  constructor(indexer: KeywordIndexer, registry: SkillRegistry) {
    this.indexer = indexer;
    this.registry = registry;
  }

  /**
   * Match user input against skill triggers
   * @param userInput User's message or query
   * @param options Matching options
   * @returns Array of matching skills with scores
   */
  match(userInput: string, options: MatchOptions = {}): MatchResult[] {
    const {
      fuzzy = true,
      minScore = 0.6,
      maxResults = 10,
      includeInactive = false,
    } = options;

    // Extract keywords from user input
    const keywords = this.extractKeywords(userInput);

    if (keywords.length === 0) {
      return [];
    }

    // Search using the indexer
    const searchResults = this.indexer.searchMultiple(keywords, fuzzy);

    // Convert to match results with full skill data
    const matchResults: MatchResult[] = [];

    for (const result of searchResults) {
      const skill = this.registry.getSkill(result.skillName);

      if (!skill) {
        continue;
      }

      // Filter by status if needed
      if (!includeInactive && skill.status !== 'active') {
        continue;
      }

      // Filter by minimum score
      if (result.score < minScore) {
        continue;
      }

      matchResults.push({
        skill,
        score: result.score,
        matchedKeywords: keywords.filter((kw) =>
          this.skillMatchesKeyword(skill, kw, fuzzy)
        ),
        matchCount: result.matchCount || 0,
      });
    }

    // Sort by score and match count
    matchResults.sort((a, b) => {
      // Prioritize match count
      if (a.matchCount !== b.matchCount) {
        return b.matchCount - a.matchCount;
      }
      // Then by score
      return b.score - a.score;
    });

    // Limit results
    return matchResults.slice(0, maxResults);
  }

  /**
   * Find exact matches for a keyword
   * @param keyword Keyword to match
   * @returns Array of skills that exactly match the keyword
   */
  findExactMatches(keyword: string): Skill[] {
    const normalized = this.normalizeKeyword(keyword);
    const skillNames = this.indexer.getSkillsForKeyword(normalized);

    return skillNames
      .map((name) => this.registry.getSkill(name))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  /**
   * Find skills by trigger phrase
   * @param phrase Trigger phrase
   * @param fuzzy Enable fuzzy matching
   * @returns Array of matching skills
   */
  findByTrigger(phrase: string, fuzzy: boolean = true): MatchResult[] {
    const normalized = this.normalizeKeyword(phrase);

    // Try exact match first
    const exactMatches = this.findExactMatches(normalized);

    if (exactMatches.length > 0) {
      return exactMatches.map((skill) => ({
        skill,
        score: 1.0,
        matchedKeywords: [phrase],
        matchCount: 1,
      }));
    }

    // Fall back to fuzzy matching
    if (fuzzy) {
      return this.match(phrase, { fuzzy: true, minScore: 0.7 });
    }

    return [];
  }

  /**
   * Check if user input contains any skill triggers
   * @param userInput User's message
   * @returns True if any triggers are found
   */
  containsTriggers(userInput: string): boolean {
    const keywords = this.extractKeywords(userInput);
    return keywords.some((keyword) => {
      const results = this.indexer.search(keyword, false);
      return results.length > 0;
    });
  }

  /**
   * Get all possible triggers from user input
   * @param userInput User's message
   * @returns Array of detected trigger phrases
   */
  detectTriggers(userInput: string): string[] {
    const keywords = this.extractKeywords(userInput);
    const triggers = new Set<string>();

    for (const keyword of keywords) {
      const results = this.indexer.search(keyword, true);

      for (const result of results) {
        if (result.score > 0.7) {
          const skill = this.registry.getSkill(result.skillName);
          if (skill && skill.metadata.triggers) {
            for (const trigger of skill.metadata.triggers) {
              if (
                this.normalizeKeyword(trigger).includes(
                  this.normalizeKeyword(keyword)
                )
              ) {
                triggers.add(trigger);
              }
            }
          }
        }
      }
    }

    return Array.from(triggers);
  }

  /**
   * Extract meaningful keywords from user input
   * @param input User input text
   * @returns Array of extracted keywords
   */
  private extractKeywords(input: string): string[] {
    // Normalize input
    const normalized = input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, ' ') // Replace special chars with space
      .replace(/\s+/g, ' '); // Normalize whitespace

    // Split into words
    const words = normalized.split(' ');

    // Filter out stop words and short words
    const keywords = words.filter(
      (word) => word.length > 2 && !this.stopWords.has(word)
    );

    // Also extract multi-word phrases (bigrams and trigrams)
    const phrases: string[] = [];

    // Bigrams (2-word phrases)
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (this.isValidPhrase(phrase)) {
        phrases.push(phrase);
      }
    }

    // Trigrams (3-word phrases)
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (this.isValidPhrase(phrase)) {
        phrases.push(phrase);
      }
    }

    // Combine keywords and phrases, remove duplicates
    return Array.from(new Set([...keywords, ...phrases]));
  }

  /**
   * Check if a phrase is valid (not all stop words)
   * @param phrase Phrase to check
   * @returns True if valid
   */
  private isValidPhrase(phrase: string): boolean {
    const words = phrase.split(' ');
    // At least one word should not be a stop word
    return words.some((word) => !this.stopWords.has(word));
  }

  /**
   * Check if a skill matches a keyword
   * @param skill Skill to check
   * @param keyword Keyword to match
   * @param fuzzy Enable fuzzy matching
   * @returns True if matches
   */
  private skillMatchesKeyword(
    skill: Skill,
    keyword: string,
    fuzzy: boolean
  ): boolean {
    const normalized = this.normalizeKeyword(keyword);

    // Check triggers
    if (skill.metadata.triggers) {
      for (const trigger of skill.metadata.triggers) {
        const normalizedTrigger = this.normalizeKeyword(trigger);

        if (fuzzy) {
          if (
            normalizedTrigger.includes(normalized) ||
            normalized.includes(normalizedTrigger)
          ) {
            return true;
          }
        } else {
          if (normalizedTrigger === normalized) {
            return true;
          }
        }
      }
    }

    // Check skill name
    const normalizedName = this.normalizeKeyword(skill.metadata.name);
    if (fuzzy) {
      if (
        normalizedName.includes(normalized) ||
        normalized.includes(normalizedName)
      ) {
        return true;
      }
    } else {
      if (normalizedName === normalized) {
        return true;
      }
    }

    return false;
  }

  /**
   * Normalize keyword for matching
   * @param keyword Raw keyword
   * @returns Normalized keyword
   */
  private normalizeKeyword(keyword: string): string {
    return keyword
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Get matcher statistics
   * @returns Matcher statistics
   */
  getStats(): MatcherStats {
    const indexStats = this.indexer.getStats();
    const registryStats = this.registry.getStats();

    return {
      totalSkills: registryStats.total,
      activeSkills: registryStats.active,
      totalKeywords: indexStats.totalKeywords,
      averageKeywordsPerSkill: indexStats.averageKeywordsPerSkill,
    };
  }
}

/**
 * Match options
 */
export interface MatchOptions {
  /** Enable fuzzy matching (default: true) */
  fuzzy?: boolean;

  /** Minimum score threshold (default: 0.6) */
  minScore?: number;

  /** Maximum number of results (default: 10) */
  maxResults?: number;

  /** Include inactive skills (default: false) */
  includeInactive?: boolean;
}

/**
 * Match result
 */
export interface MatchResult {
  /** Matched skill */
  skill: Skill;

  /** Match score (0-1) */
  score: number;

  /** Keywords that matched */
  matchedKeywords: string[];

  /** Number of keyword matches */
  matchCount: number;
}

/**
 * Matcher statistics
 */
export interface MatcherStats {
  totalSkills: number;
  activeSkills: number;
  totalKeywords: number;
  averageKeywordsPerSkill: number;
}
