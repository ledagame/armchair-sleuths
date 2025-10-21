/**
 * ContextTruncator - Intelligent context truncation
 * 
 * This module implements intelligent truncation algorithms that preserve
 * critical content while reducing context size to fit token limits.
 */

import { ContextSection } from './ContextMerger.js';
import { TokenCounter } from './TokenCounter.js';

export interface TruncationOptions {
  maxTokens: number;
  preserveTypes?: Array<ContextSection['type']>;
  minSectionSize?: number;
  addTruncationMarker?: boolean;
}

export interface TruncationResult {
  content: string;
  sections: ContextSection[];
  originalTokens: number;
  finalTokens: number;
  truncated: boolean;
  removedSections: ContextSection[];
}

/**
 * ContextTruncator class for intelligent context size reduction
 */
export class ContextTruncator {
  private tokenCounter: TokenCounter;

  constructor(tokenCounter?: TokenCounter) {
    this.tokenCounter = tokenCounter || new TokenCounter();
  }

  /**
   * Intelligently truncate context to fit token limit
   */
  intelligentTruncate(
    sections: ContextSection[],
    options: TruncationOptions
  ): TruncationResult {
    const {
      maxTokens,
      preserveTypes = ['steeringRules'],
      minSectionSize = 100,
      addTruncationMarker = true,
    } = options;

    // Calculate original tokens
    const originalTokens = sections.reduce((sum, s) => sum + (s.tokens || 0), 0);

    // If already under limit, return as-is
    if (originalTokens <= maxTokens) {
      return {
        content: sections.map(s => s.content).join('\n\n'),
        sections,
        originalTokens,
        finalTokens: originalTokens,
        truncated: false,
        removedSections: [],
      };
    }

    // Sort sections by priority (lower = higher priority)
    const sortedSections = [...sections].sort((a, b) => a.priority - b.priority);

    const keptSections: ContextSection[] = [];
    const removedSections: ContextSection[] = [];
    let currentTokens = 0;

    // First pass: Keep all preserved types
    for (const section of sortedSections) {
      if (preserveTypes.includes(section.type)) {
        keptSections.push(section);
        currentTokens += section.tokens || 0;
      }
    }

    // Second pass: Add other sections until we hit the limit
    for (const section of sortedSections) {
      if (preserveTypes.includes(section.type)) {
        continue; // Already added
      }

      const sectionTokens = section.tokens || 0;

      if (currentTokens + sectionTokens <= maxTokens) {
        // Section fits completely
        keptSections.push(section);
        currentTokens += sectionTokens;
      } else {
        // Try to partially include this section
        const availableTokens = maxTokens - currentTokens;

        if (availableTokens >= minSectionSize) {
          const truncatedSection = this.truncateSection(
            section,
            availableTokens,
            addTruncationMarker
          );
          keptSections.push(truncatedSection);
          currentTokens += truncatedSection.tokens || 0;
        } else {
          removedSections.push(section);
        }

        // Stop adding more sections
        break;
      }
    }

    // Add remaining sections to removed list
    for (const section of sortedSections) {
      if (!keptSections.includes(section) && !removedSections.includes(section)) {
        removedSections.push(section);
      }
    }

    // Sort kept sections back to original priority order
    keptSections.sort((a, b) => a.priority - b.priority);

    const content = keptSections.map(s => s.content).join('\n\n');
    const finalTokens = this.tokenCounter.count(content).tokens;

    return {
      content,
      sections: keptSections,
      originalTokens,
      finalTokens,
      truncated: true,
      removedSections,
    };
  }

  /**
   * Truncate a single section to fit token limit
   */
  private truncateSection(
    section: ContextSection,
    maxTokens: number,
    addMarker: boolean
  ): ContextSection {
    const lines = section.content.split('\n');
    const truncatedLines: string[] = [];
    let currentTokens = 0;

    // Keep the title/header
    if (lines[0].startsWith('#')) {
      truncatedLines.push(lines[0]);
      currentTokens += this.tokenCounter.count(lines[0]).tokens;
    }

    // Add lines until we hit the limit
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const lineTokens = this.tokenCounter.count(line).tokens;

      if (currentTokens + lineTokens <= maxTokens - (addMarker ? 20 : 0)) {
        truncatedLines.push(line);
        currentTokens += lineTokens;
      } else {
        break;
      }
    }

    // Add truncation marker
    if (addMarker) {
      truncatedLines.push('');
      truncatedLines.push('[... content truncated for context size ...]');
    }

    const truncatedContent = truncatedLines.join('\n');

    return {
      ...section,
      content: truncatedContent,
      tokens: this.tokenCounter.count(truncatedContent).tokens,
    };
  }

  /**
   * Truncate to specific token count by removing characters
   */
  truncateToTokens(text: string, maxTokens: number): string {
    // Binary search for the right length
    let left = 0;
    let right = text.length;
    let result = text;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const substring = text.substring(0, mid);
      const tokens = this.tokenCounter.count(substring).tokens;

      if (tokens <= maxTokens) {
        result = substring;
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return result;
  }

  /**
   * Smart truncation that preserves sentence boundaries
   */
  smartTruncate(text: string, maxTokens: number): string {
    const truncated = this.truncateToTokens(text, maxTokens);

    // Find last sentence boundary
    const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
    let lastBoundary = -1;

    for (const ending of sentenceEndings) {
      const index = truncated.lastIndexOf(ending);
      if (index > lastBoundary) {
        lastBoundary = index + ending.length;
      }
    }

    // If we found a sentence boundary, truncate there
    if (lastBoundary > truncated.length * 0.8) {
      return truncated.substring(0, lastBoundary);
    }

    // Otherwise, truncate at word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > truncated.length * 0.9) {
      return truncated.substring(0, lastSpace);
    }

    return truncated;
  }

  /**
   * Remove specific section types to reduce size
   */
  removeSectionTypes(
    sections: ContextSection[],
    typesToRemove: Array<ContextSection['type']>
  ): ContextSection[] {
    return sections.filter(s => !typesToRemove.includes(s.type));
  }

  /**
   * Calculate how many tokens need to be removed
   */
  calculateExcessTokens(sections: ContextSection[], maxTokens: number): number {
    const totalTokens = sections.reduce((sum, s) => sum + (s.tokens || 0), 0);
    return Math.max(0, totalTokens - maxTokens);
  }

  /**
   * Get truncation strategy recommendation
   */
  recommendStrategy(
    sections: ContextSection[],
    maxTokens: number
  ): {
    strategy: 'none' | 'remove_references' | 'remove_examples' | 'truncate_all';
    excessTokens: number;
    recommendation: string;
  } {
    const excessTokens = this.calculateExcessTokens(sections, maxTokens);

    if (excessTokens === 0) {
      return {
        strategy: 'none',
        excessTokens: 0,
        recommendation: 'No truncation needed',
      };
    }

    const referencesTokens = sections
      .filter(s => s.type === 'skillReferences')
      .reduce((sum, s) => sum + (s.tokens || 0), 0);

    if (excessTokens <= referencesTokens) {
      return {
        strategy: 'remove_references',
        excessTokens,
        recommendation: 'Remove reference sections',
      };
    }

    const examplesTokens = sections
      .filter(s => s.type === 'skillExamples')
      .reduce((sum, s) => sum + (s.tokens || 0), 0);

    if (excessTokens <= referencesTokens + examplesTokens) {
      return {
        strategy: 'remove_examples',
        excessTokens,
        recommendation: 'Remove references and examples',
      };
    }

    return {
      strategy: 'truncate_all',
      excessTokens,
      recommendation: 'Truncate all non-essential sections',
    };
  }
}

/**
 * Singleton instance
 */
let globalContextTruncator: ContextTruncator | null = null;

export function getContextTruncator(): ContextTruncator {
  if (!globalContextTruncator) {
    globalContextTruncator = new ContextTruncator();
  }
  return globalContextTruncator;
}

/**
 * Convenience function for quick truncation
 */
export function truncateContext(
  sections: ContextSection[],
  maxTokens: number
): string {
  const truncator = getContextTruncator();
  const result = truncator.intelligentTruncate(sections, { maxTokens });
  return result.content;
}
