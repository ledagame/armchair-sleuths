/**
 * ContextMerger - Merge skill prompts with steering rules
 * 
 * This module handles the intelligent merging of skill prompts and steering rules
 * with priority-based ordering and markdown section parsing.
 */

import { Skill } from './types.js';
import { TokenCounter } from './TokenCounter.js';

export interface ContextSection {
  type: 'steeringRules' | 'skillCorePrompt' | 'skillExamples' | 'skillReferences' | 'other';
  title: string;
  content: string;
  priority: number;
  tokens?: number;
}

export interface MergeOptions {
  maxTokens?: number;
  includeExamples?: boolean;
  includeReferences?: boolean;
  priorityOrder?: string[];
}

export interface MergedContext {
  content: string;
  sections: ContextSection[];
  totalTokens: number;
  truncated: boolean;
}

/**
 * ContextMerger class for merging skill prompts with steering rules
 */
export class ContextMerger {
  private tokenCounter: TokenCounter;

  constructor(tokenCounter?: TokenCounter) {
    this.tokenCounter = tokenCounter || new TokenCounter();
  }

  /**
   * Merge skill prompts with steering rules
   */
  merge(
    skillPrompts: string[],
    steeringRules: string[],
    options: MergeOptions = {}
  ): MergedContext {
    const sections: ContextSection[] = [];

    // Add steering rules (highest priority)
    for (const rule of steeringRules) {
      const ruleSections = this.parseMarkdownSections(rule, 'steeringRules');
      sections.push(...ruleSections);
    }

    // Add skill prompts
    for (const prompt of skillPrompts) {
      const promptSections = this.parseMarkdownSections(prompt, 'skillCorePrompt');
      sections.push(...promptSections);
    }

    // Calculate tokens for each section
    for (const section of sections) {
      section.tokens = this.tokenCounter.count(section.content).tokens;
    }

    // Sort by priority
    sections.sort((a, b) => a.priority - b.priority);

    // Build merged content
    const content = sections.map(s => s.content).join('\n\n');
    const totalTokens = sections.reduce((sum, s) => sum + (s.tokens || 0), 0);

    return {
      content,
      sections,
      totalTokens,
      truncated: false,
    };
  }

  /**
   * Parse markdown content into sections
   */
  parseMarkdownSections(content: string, defaultType: ContextSection['type']): ContextSection[] {
    const sections: ContextSection[] = [];
    const lines = content.split('\n');
    
    let currentSection: ContextSection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check for markdown headers
      if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n');
          sections.push(currentSection);
        }

        // Start new section
        const title = line.replace(/^#+\s+/, '');
        const type = this.inferSectionType(title, defaultType);
        const priority = this.getPriorityForType(type);

        currentSection = {
          type,
          title,
          content: '',
          priority,
        };
        currentContent = [line];
      } else if (currentSection) {
        currentContent.push(line);
      } else {
        // Content before first header
        if (!currentSection) {
          currentSection = {
            type: defaultType,
            title: 'Introduction',
            content: '',
            priority: this.getPriorityForType(defaultType),
          };
          currentContent = [];
        }
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n');
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Infer section type from title
   */
  private inferSectionType(title: string, defaultType: ContextSection['type']): ContextSection['type'] {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('steering') || lowerTitle.includes('rule')) {
      return 'steeringRules';
    }
    if (lowerTitle.includes('example')) {
      return 'skillExamples';
    }
    if (lowerTitle.includes('reference') || lowerTitle.includes('documentation')) {
      return 'skillReferences';
    }
    if (lowerTitle.includes('prompt') || lowerTitle.includes('instruction')) {
      return 'skillCorePrompt';
    }

    return defaultType;
  }

  /**
   * Get priority for section type (lower number = higher priority)
   */
  private getPriorityForType(type: ContextSection['type']): number {
    const priorities = {
      steeringRules: 1,      // Never truncate
      skillCorePrompt: 2,    // Truncate last
      skillExamples: 3,      // Truncate second
      skillReferences: 4,    // Truncate first
      other: 5,
    };

    return priorities[type] || 5;
  }

  /**
   * Merge with priority-based ordering
   */
  mergeWithPriority(
    contexts: Array<{ content: string; priority: number; label: string }>
  ): string {
    // Sort by priority (lower number = higher priority)
    const sorted = [...contexts].sort((a, b) => a.priority - b.priority);

    // Build merged content with labels
    const sections = sorted.map(ctx => {
      return `# ${ctx.label}\n\n${ctx.content}`;
    });

    return sections.join('\n\n---\n\n');
  }

  /**
   * Extract specific section types
   */
  extractSectionsByType(
    sections: ContextSection[],
    type: ContextSection['type']
  ): ContextSection[] {
    return sections.filter(s => s.type === type);
  }

  /**
   * Calculate total tokens for sections
   */
  calculateTotalTokens(sections: ContextSection[]): number {
    return sections.reduce((sum, s) => sum + (s.tokens || 0), 0);
  }

  /**
   * Remove sections by type
   */
  removeSectionsByType(
    sections: ContextSection[],
    type: ContextSection['type']
  ): ContextSection[] {
    return sections.filter(s => s.type !== type);
  }

  /**
   * Merge sections back into content
   */
  sectionsToContent(sections: ContextSection[]): string {
    return sections.map(s => s.content).join('\n\n');
  }
}

/**
 * Singleton instance
 */
let globalContextMerger: ContextMerger | null = null;

export function getContextMerger(): ContextMerger {
  if (!globalContextMerger) {
    globalContextMerger = new ContextMerger();
  }
  return globalContextMerger;
}

/**
 * Convenience function for quick merging
 */
export function mergeContexts(
  skillPrompts: string[],
  steeringRules: string[],
  options?: MergeOptions
): string {
  const merger = getContextMerger();
  const result = merger.merge(skillPrompts, steeringRules, options);
  return result.content;
}
