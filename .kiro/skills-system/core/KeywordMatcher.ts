import { EventEmitter } from 'events';
import type { Skill } from './types.js';
import type { SkillRegistry } from './SkillRegistry.js';
import type { KeywordIndexer, SearchResult } from './KeywordIndexer.js';

/**
 * KeywordMatcher - Matches user input against skill triggers
 * 
 * This class provides:
 * - Natural language keyword extraction
 * - Fuzzy matching against skill triggers
 * - Ranked results with confidence scores
 * - Multi-keyword matching
 */
export class KeywordMatcher extends EventEmitter {
  private registry: SkillRegistry;
  private indexer: KeywordIndexer;
  private fuzzyMatchThreshold: number;

  constructor(
    registry: SkillRegistry,
    indexer: KeywordIndexer,
    fuzzyMatchThreshold: number = 0.6
  ) {
    super();
    this.registry = registry;
    this.indexer = indexer;
    this.fuzzyMatchThreshold = fuzzyMatchThreshold;
  }

  /**
   * Match user input against skill triggers
   * @param userInput User's message or query
   * @param fuzzy Enable fuzzy matching
   * @returns Array of matched skills with scores
   */
  matchSkills(userInput: string, fuzzy: boolean = true): MatchResult[] {
    // Extract keywords from user input
    const keywords = this.extractKeywords(userInput);

    if (keywords.length === 0) {
      this.emit('matcher:no-keywords', {
        userInput,
        timestamp: new Date(),
      });
      return [];
    }

    // Search using indexer
    const searchResults = this.indexer.searchMultiple(keywords, fuzzy);

    // Filter by threshold
    const filteredResults = searchResults.filter(
      (result) => result.score >= this.fuzzyMatchThreshold
    );

    // Convert to MatchResult with Skill objects
    const matchResults: MatchResult[] = [];

    for (const result of filteredResults) {
      const skill = this.registry.getSkill(result.skillName);

      if (skill) {
        matchResults.push({
          skill,
          score: result.score,
          matchedKeywords: keywords.filter((kw) =>
            this.indexer
              .getKeywordsForSkill(result.skillName)
              .some((skillKw) => this.isKeywordMatch(kw, skillKw, fuzzy))
          ),
          matchCount: result.matchCount || 1,
        });
      }
    }

    // Sort by score (highest first)
    matchResults.sort((a, b) => {
      // First by match count
      if (a.matchCount !== b.matchCount) {
        return b.matchCount - a.matchCount;
      }
      // Then by score
      return b.score - a.score;
    });

    this.emit('matcher:matched', {
      userInput,
      keywords,
      matchCount: matchResults.length,
      topMatch: matchResults[0]?.skill.metadata.name,
      timestamp: new Date(),
    });

    return matchResults;
  }

  /**
   * Match a single keyword against skills
   * @param keyword Single keyword to match
   * @param fuzzy Enable fuzzy matching
   * @returns Array of matched skills with scores
   */
  matchKeyword(keyword: string, fuzzy: boolean = true): MatchResult[] {
    const searchResults = this.indexer.search(keyword, fuzzy);

    const filteredResults = searchResults.filter(
      (result) => result.score >= this.fuzzyMatchThreshold
    );

    const matchResults: MatchResult[] = [];

    for (const result of filteredResults) {
      const skill = this.registry.getSkill(result.skillName);

      if (skill) {
        matchResults.push({
          skill,
          score: result.score,
          matchedKeywords: [keyword],
          matchCount: 1,
        });
      }
    }

    matchResults.sort((a, b) => b.score - a.score);

    return matchResults;
  }

  /**
   * Get exact matches for a keyword
   * @param keyword Keyword to match exactly
   * @returns Array of skills that match exactly
   */
  getExactMatches(keyword: string): Skill[] {
    const normalizedKeyword = this.normalizeKeyword(keyword);
    const skillNames = this.indexer.getSkillsForKeyword(normalizedKeyword);

    return skillNames
      .map((name) => this.registry.getSkill(name))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  /**
   * Check if user input contains any skill triggers
   * @param userInput User's message
   * @returns True if any triggers are found
   */
  containsTriggers(userInput: string): boolean {
    const keywords = this.extractKeywords(userInput);
    return keywords.length > 0;
  }

  /**
   * Get all possible skill suggestions for user input
   * @param userInput User's message
   * @param maxSuggestions Maximum number of suggestions
   * @returns Array of suggested skills
   */
  getSuggestions(
    userInput: string,
    maxSuggestions: number = 5
  ): MatchResult[] {
    const matches = this.matchSkills(userInput, true);
    return matches.slice(0, maxSuggestions);
  }

  /**
   * Extract keywords from user input
   * @param input User input string
   * @returns Array of extracted keywords
   */
  private extractKeywords(input: string): string[] {
    // Normalize input
    const normalized = input.toLowerCase().trim();

    // Split into words
    const words = normalized.split(/\s+/);

    // Remove stop words
    const stopWords = new Set([
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
      'may',
      'might',
      'can',
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
      'please',
      'help',
      'want',
      'need',
    ]);

    const keywords = words.filter(
      (word) => word.length > 2 && !stopWords.has(word)
    );

    // Also extract multi-word phrases (bigrams and trigrams)
    const phrases: string[] = [];

    // Bigrams
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (
        !stopWords.has(words[i]) ||
        !stopWords.has(words[i + 1])
      ) {
        phrases.push(bigram);
      }
    }

    // Trigrams
    for (let i = 0; i < words.length - 2; i++) {
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phrases.push(trigram);
    }

    // Combine keywords and phrases
    const allKeywords = [...keywords, ...phrases];

    // Remove duplicates
    return Array.from(new Set(allKeywords));
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
   * Check if two keywords match
   * @param keyword1 First keyword
   * @param keyword2 Second keyword
   * @param fuzzy Enable fuzzy matching
   * @returns True if keywords match
   */
  private isKeywordMatch(
    keyword1: string,
    keyword2: string,
    fuzzy: boolean
  ): boolean {
    const norm1 = this.normalizeKeyword(keyword1);
    const norm2 = this.normalizeKeyword(keyword2);

    // Exact match
    if (norm1 === norm2) {
      return true;
    }

    // Contains match
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      return true;
    }

    // Fuzzy match
    if (fuzzy) {
      const similarity = this.calculateSimilarity(norm1, norm2);
      return similarity >= this.fuzzyMatchThreshold;
    }

    return false;
  }

  /**
   * Calculate similarity between two strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Similarity score (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    // Levenshtein distance
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    return 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance
   * @param str1 First string
   * @param str2 Second string
   * @returns Edit distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str1.length][str2.length];
  }

  /**
   * Update fuzzy match threshold
   * @param threshold New threshold (0-1)
   */
  setFuzzyMatchThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Threshold must be between 0 and 1');
    }
    this.fuzzyMatchThreshold = threshold;

    this.emit('matcher:threshold-updated', {
      threshold,
      timestamp: new Date(),
    });
  }

  /**
   * Get current fuzzy match threshold
   * @returns Current threshold
   */
  getFuzzyMatchThreshold(): number {
    return this.fuzzyMatchThreshold;
  }

  /**
   * Get matcher statistics
   * @returns Matcher statistics
   */
  getStats(): MatcherStats {
    return {
      totalSkills: this.registry.size(),
      totalKeywords: this.indexer.getAllKeywords().length,
      fuzzyMatchThreshold: this.fuzzyMatchThreshold,
    };
  }
}

/**
 * Match result with skill and score
 */
export interface MatchResult {
  skill: Skill;
  score: number;
  matchedKeywords: string[];
  matchCount: number;
}

/**
 * Matcher statistics
 */
export interface MatcherStats {
  totalSkills: number;
  totalKeywords: number;
  fuzzyMatchThreshold: number;
}

/**
 * Events emitted by KeywordMatcher:
 * 
 * - 'matcher:matched' - Skills matched successfully
 * - 'matcher:no-keywords' - No keywords extracted from input
 * - 'matcher:threshold-updated' - Fuzzy match threshold updated
 */
