import type { SkillMetadata } from './types.js';

/**
 * KeywordIndexer - Builds and maintains an inverted index for fast skill lookup
 */
export class KeywordIndexer {
  // Inverted index: keyword -> Set of skill names
  private index: Map<string, Set<string>>;

  // Skill to keywords mapping (for removal)
  private skillKeywords: Map<string, Set<string>>;

  constructor() {
    this.index = new Map();
    this.skillKeywords = new Map();
  }

  /**
   * Build index from multiple skills
   * @param skills Array of skill metadata
   */
  buildIndex(skills: SkillMetadata[]): void {
    this.clear();

    for (const skill of skills) {
      this.addSkill(skill);
    }
  }

  /**
   * Add a skill to the index
   * @param skill Skill metadata
   */
  addSkill(skill: SkillMetadata): void {
    const skillName = skill.name;
    const keywords = new Set<string>();

    // Index trigger keywords
    if (skill.triggers) {
      for (const trigger of skill.triggers) {
        const normalized = this.normalizeKeyword(trigger);
        this.addToIndex(normalized, skillName);
        keywords.add(normalized);

        // Also index individual words in multi-word triggers
        const words = normalized.split(/\s+/);
        if (words.length > 1) {
          for (const word of words) {
            if (word.length > 2) {
              // Skip very short words
              this.addToIndex(word, skillName);
              keywords.add(word);
            }
          }
        }
      }
    }

    // Index skill name
    const normalizedName = this.normalizeKeyword(skill.name);
    this.addToIndex(normalizedName, skillName);
    keywords.add(normalizedName);

    // Index capability names
    if (skill.capabilities) {
      for (const capability of skill.capabilities) {
        const normalizedCap = this.normalizeKeyword(capability.name);
        this.addToIndex(normalizedCap, skillName);
        keywords.add(normalizedCap);
      }
    }

    // Store keywords for this skill
    this.skillKeywords.set(skillName, keywords);
  }

  /**
   * Remove a skill from the index
   * @param skillName Name of the skill to remove
   */
  removeSkill(skillName: string): void {
    const keywords = this.skillKeywords.get(skillName);

    if (!keywords) {
      return;
    }

    // Remove skill from all keyword entries
    for (const keyword of keywords) {
      const skills = this.index.get(keyword);
      if (skills) {
        skills.delete(skillName);
        if (skills.size === 0) {
          this.index.delete(keyword);
        }
      }
    }

    this.skillKeywords.delete(skillName);
  }

  /**
   * Search for skills by keyword
   * @param query Search query
   * @param fuzzy Enable fuzzy matching
   * @returns Array of matching skill names with scores
   */
  search(query: string, fuzzy: boolean = true): SearchResult[] {
    const normalizedQuery = this.normalizeKeyword(query);
    const results = new Map<string, number>();

    // Exact match
    const exactMatches = this.index.get(normalizedQuery);
    if (exactMatches) {
      for (const skillName of exactMatches) {
        results.set(skillName, 1.0); // Perfect score
      }
    }

    // Fuzzy match if enabled
    if (fuzzy) {
      for (const [keyword, skills] of this.index.entries()) {
        const similarity = this.calculateSimilarity(normalizedQuery, keyword);

        if (similarity > 0.6) {
          // Threshold for fuzzy match
          for (const skillName of skills) {
            const currentScore = results.get(skillName) || 0;
            // Keep the highest score
            if (similarity > currentScore) {
              results.set(skillName, similarity);
            }
          }
        }
      }
    }

    // Convert to array and sort by score
    return Array.from(results.entries())
      .map(([skillName, score]) => ({ skillName, score }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Search for skills by multiple keywords
   * @param queries Array of search queries
   * @param fuzzy Enable fuzzy matching
   * @returns Array of matching skill names with combined scores
   */
  searchMultiple(queries: string[], fuzzy: boolean = true): SearchResult[] {
    const allResults = new Map<string, number[]>();

    // Search for each query
    for (const query of queries) {
      const results = this.search(query, fuzzy);

      for (const result of results) {
        if (!allResults.has(result.skillName)) {
          allResults.set(result.skillName, []);
        }
        allResults.get(result.skillName)!.push(result.score);
      }
    }

    // Calculate combined scores (average of all matches)
    return Array.from(allResults.entries())
      .map(([skillName, scores]) => ({
        skillName,
        score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        matchCount: scores.length,
      }))
      .sort((a, b) => {
        // Sort by match count first, then by score
        if (a.matchCount !== b.matchCount) {
          return b.matchCount - a.matchCount;
        }
        return b.score - a.score;
      });
  }

  /**
   * Get all indexed keywords
   * @returns Array of all keywords
   */
  getAllKeywords(): string[] {
    return Array.from(this.index.keys());
  }

  /**
   * Get skills for a specific keyword
   * @param keyword Keyword to lookup
   * @returns Array of skill names
   */
  getSkillsForKeyword(keyword: string): string[] {
    const normalized = this.normalizeKeyword(keyword);
    const skills = this.index.get(normalized);
    return skills ? Array.from(skills) : [];
  }

  /**
   * Get keywords for a specific skill
   * @param skillName Skill name
   * @returns Array of keywords
   */
  getKeywordsForSkill(skillName: string): string[] {
    const keywords = this.skillKeywords.get(skillName);
    return keywords ? Array.from(keywords) : [];
  }

  /**
   * Clear the entire index
   */
  clear(): void {
    this.index.clear();
    this.skillKeywords.clear();
  }

  /**
   * Get index statistics
   * @returns Index statistics
   */
  getStats(): IndexStats {
    return {
      totalKeywords: this.index.size,
      totalSkills: this.skillKeywords.size,
      averageKeywordsPerSkill:
        this.skillKeywords.size > 0
          ? Array.from(this.skillKeywords.values()).reduce(
              (sum, keywords) => sum + keywords.size,
              0
            ) / this.skillKeywords.size
          : 0,
    };
  }

  /**
   * Add keyword-skill mapping to index
   * @param keyword Normalized keyword
   * @param skillName Skill name
   */
  private addToIndex(keyword: string, skillName: string): void {
    if (!this.index.has(keyword)) {
      this.index.set(keyword, new Set());
    }
    this.index.get(keyword)!.add(skillName);
  }

  /**
   * Normalize keyword for indexing
   * @param keyword Raw keyword
   * @returns Normalized keyword
   */
  private normalizeKeyword(keyword: string): string {
    return keyword
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   * @param str1 First string
   * @param str2 Second string
   * @returns Similarity score (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Quick checks
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    // Check if one string contains the other
    if (str1.includes(str2) || str2.includes(str1)) {
      return 0.9;
    }

    // Levenshtein distance
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    return 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Edit distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str1.length][str2.length];
  }
}

export interface SearchResult {
  skillName: string;
  score: number;
  matchCount?: number;
}

export interface IndexStats {
  totalKeywords: number;
  totalSkills: number;
  averageKeywordsPerSkill: number;
}
