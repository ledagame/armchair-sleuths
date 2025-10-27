/**
 * Unit tests for KeywordMatcher
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { KeywordMatcher, createKeywordMatcher } from '../KeywordMatcher';
import type { Skill } from '../types';

describe('KeywordMatcher', () => {
  let matcher: KeywordMatcher;
  let testSkills: Skill[];

  beforeEach(() => {
    matcher = createKeywordMatcher();
    
    // Create test skills
    testSkills = [
      {
        metadata: {
          name: 'suspect-ai-prompter',
          version: '1.0.0',
          description: 'Optimize AI suspect conversation prompts',
          triggers: ['improve prompt', 'optimize ai', 'test responses'],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test prompt content',
        path: '/skills/suspect-ai-prompter',
        lastModified: new Date(),
        status: 'active',
      },
      {
        metadata: {
          name: 'mystery-case-generator',
          version: '2.0.0',
          description: 'Generate mystery cases',
          triggers: ['generate case', 'create mystery', 'new case'],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test prompt content',
        path: '/skills/mystery-case-generator',
        lastModified: new Date(),
        status: 'active',
      },
      {
        metadata: {
          name: 'evidence-system-architect',
          version: '1.5.0',
          description: 'Design evidence collection system',
          triggers: ['evidence system', 'design evidence', 'evidence architecture'],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test prompt content',
        path: '/skills/evidence-system-architect',
        lastModified: new Date(),
        status: 'active',
      },
    ];
  });

  describe('exact matching', () => {
    it('should match exact trigger keyword', () => {
      const matches = matcher.match('improve prompt', testSkills);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].skill.metadata.name).toBe('suspect-ai-prompter');
      expect(matches[0].matchType).toBe('exact');
      expect(matches[0].score).toBeGreaterThan(0.9);
    });

    it('should match trigger keyword within sentence', () => {
      const matches = matcher.match('I want to generate case for testing', testSkills);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].skill.metadata.name).toBe('mystery-case-generator');
      expect(matches[0].matchedKeywords).toContain('generate case');
    });

    it('should be case insensitive by default', () => {
      const matches = matcher.match('IMPROVE PROMPT', testSkills);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].skill.metadata.name).toBe('suspect-ai-prompter');
    });

    it('should respect case sensitive option', () => {
      const matches = matcher.match('IMPROVE PROMPT', testSkills, {
        caseSensitive: true,
      });
      
      expect(matches).toHaveLength(0);
    });
  });

  describe('fuzzy matching', () => {
    it('should match with minor typos', () => {
      const matches = matcher.match('imrpove promtp', testSkills, {
        fuzzyMatch: true,
        minScore: 0.6,
      });
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].skill.metadata.name).toBe('suspect-ai-prompter');
      expect(matches[0].matchType).toBe('fuzzy');
    });

    it('should not match with too many typos', () => {
      const matches = matcher.match('xyz abc def', testSkills, {
        fuzzyMatch: true,
        minScore: 0.7,
      });
      
      expect(matches).toHaveLength(0);
    });

    it('should disable fuzzy matching when option is false', () => {
      const matches = matcher.match('imrpove promtp', testSkills, {
        fuzzyMatch: false,
      });
      
      expect(matches).toHaveLength(0);
    });
  });

  describe('partial matching', () => {
    it('should match partial words', () => {
      const matches = matcher.match('evidence', testSkills);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].skill.metadata.name).toBe('evidence-system-architect');
    });

    it('should match multiple partial words', () => {
      const matches = matcher.match('design system', testSkills);
      
      const evidenceSkill = matches.find(
        m => m.skill.metadata.name === 'evidence-system-architect'
      );
      
      expect(evidenceSkill).toBeDefined();
    });
  });

  describe('ranking', () => {
    it('should rank exact matches higher than fuzzy matches', () => {
      const matches = matcher.match('improve prompt and generate case', testSkills);
      
      expect(matches.length).toBeGreaterThan(1);
      expect(matches[0].matchType).toBe('exact');
      expect(matches[0].score).toBeGreaterThan(matches[1].score);
    });

    it('should rank by number of matched keywords', () => {
      const multiTriggerSkill: Skill = {
        metadata: {
          name: 'multi-trigger',
          version: '1.0.0',
          description: 'Test skill',
          triggers: ['test', 'example', 'demo'],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/multi-trigger',
        lastModified: new Date(),
        status: 'active',
      };

      const matches = matcher.match('test example demo', [multiTriggerSkill]);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].matchedKeywords).toHaveLength(3);
      expect(matches[0].score).toBeGreaterThan(0.9);
    });
  });

  describe('options', () => {
    it('should respect minScore threshold', () => {
      const matches = matcher.match('evidence', testSkills, {
        minScore: 0.9,
      });
      
      // Partial match should have lower score
      expect(matches.length).toBeLessThan(testSkills.length);
    });

    it('should respect maxResults limit', () => {
      const matches = matcher.match('test', testSkills, {
        maxResults: 1,
        minScore: 0.1,
      });
      
      expect(matches.length).toBeLessThanOrEqual(1);
    });
  });

  describe('extractKeywords', () => {
    it('should extract meaningful keywords', () => {
      const keywords = matcher.extractKeywords('I want to improve the prompt');
      
      expect(keywords).toContain('want');
      expect(keywords).toContain('improve');
      expect(keywords).toContain('prompt');
      expect(keywords).not.toContain('i');
      expect(keywords).not.toContain('to');
      expect(keywords).not.toContain('the');
    });

    it('should filter out stop words', () => {
      const keywords = matcher.extractKeywords('the quick brown fox');
      
      expect(keywords).not.toContain('the');
      expect(keywords).toContain('quick');
      expect(keywords).toContain('brown');
    });

    it('should filter out short words', () => {
      const keywords = matcher.extractKeywords('a b cd efg');
      
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('b');
      expect(keywords).not.toContain('cd');
      expect(keywords).toContain('efg');
    });
  });

  describe('findBestMatch', () => {
    it('should return single best match', () => {
      const match = matcher.findBestMatch('improve prompt', testSkills);
      
      expect(match).toBeDefined();
      expect(match?.skill.metadata.name).toBe('suspect-ai-prompter');
    });

    it('should return null when no match found', () => {
      const match = matcher.findBestMatch('xyz abc def', testSkills);
      
      expect(match).toBeNull();
    });
  });

  describe('hasMatch', () => {
    it('should return true when match exists', () => {
      const hasMatch = matcher.hasMatch('improve prompt', testSkills);
      
      expect(hasMatch).toBe(true);
    });

    it('should return false when no match exists', () => {
      const hasMatch = matcher.hasMatch('xyz abc def', testSkills);
      
      expect(hasMatch).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const matches = matcher.match('', testSkills);
      
      expect(matches).toHaveLength(0);
    });

    it('should handle empty skills array', () => {
      const matches = matcher.match('improve prompt', []);
      
      expect(matches).toHaveLength(0);
    });

    it('should handle skill with no triggers', () => {
      const noTriggerSkill: Skill = {
        metadata: {
          name: 'no-trigger',
          version: '1.0.0',
          description: 'Test',
          triggers: [],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/no-trigger',
        lastModified: new Date(),
        status: 'active',
      };

      const matches = matcher.match('test', [noTriggerSkill]);
      
      expect(matches).toHaveLength(0);
    });

    it('should handle very long input', () => {
      const longInput = 'improve prompt '.repeat(100);
      const matches = matcher.match(longInput, testSkills);
      
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const matches = matcher.match('improve-prompt!@#$%', testSkills);
      
      // Should still match despite special characters
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    it('should handle large number of skills efficiently', () => {
      // Create 100 test skills
      const manySkills: Skill[] = Array.from({ length: 100 }, (_, i) => ({
        metadata: {
          name: `skill-${i}`,
          version: '1.0.0',
          description: `Test skill ${i}`,
          triggers: [`trigger-${i}`, `keyword-${i}`],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: `/skills/skill-${i}`,
        lastModified: new Date(),
        status: 'active' as const,
      }));

      const startTime = Date.now();
      const matches = matcher.match('trigger-50', manySkills);
      const endTime = Date.now();

      expect(matches.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });
  });
});
