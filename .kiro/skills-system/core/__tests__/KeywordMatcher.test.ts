import { describe, it, expect, beforeEach } from 'vitest';
import { KeywordMatcher } from '../KeywordMatcher.js';
import { KeywordIndexer } from '../KeywordIndexer.js';
import { SkillRegistry } from '../SkillRegistry.js';
import type { Skill, SkillMetadata } from '../types.js';

describe('KeywordMatcher', () => {
  let matcher: KeywordMatcher;
  let indexer: KeywordIndexer;
  let registry: SkillRegistry;

  beforeEach(() => {
    indexer = new KeywordIndexer();
    registry = new SkillRegistry();
    matcher = new KeywordMatcher(indexer, registry);

    // Add test skills
    const testSkills: Skill[] = [
      {
        metadata: {
          name: 'suspect-ai-prompter',
          version: '1.0.0',
          description: 'Optimize AI suspect conversation prompts',
          triggers: ['improve prompt', 'optimize ai', 'test responses'],
          dependencies: {
            skills: [],
            apis: [],
            packages: [],
          },
          capabilities: [
            {
              name: 'prompt-improvement',
              description: 'Improve prompt quality',
              usage: 'improve prompt',
              parameters: [],
              examples: [],
            },
          ],
          author: 'Test Author',
          license: 'MIT',
        },
        promptContent: 'Test prompt content',
        path: '/test/path',
        lastModified: new Date(),
        status: 'active',
      },
      {
        metadata: {
          name: 'mystery-case-generator',
          version: '2.0.0',
          description: 'Generate mystery cases',
          triggers: ['generate case', 'create mystery', 'new case'],
          dependencies: {
            skills: [],
            apis: [],
            packages: [],
          },
          capabilities: [],
          author: 'Test Author',
          license: 'MIT',
        },
        promptContent: 'Test prompt content',
        path: '/test/path',
        lastModified: new Date(),
        status: 'active',
      },
      {
        metadata: {
          name: 'inactive-skill',
          version: '1.0.0',
          description: 'Inactive test skill',
          triggers: ['inactive test'],
          dependencies: {
            skills: [],
            apis: [],
            packages: [],
          },
          capabilities: [],
          author: 'Test Author',
          license: 'MIT',
        },
        promptContent: 'Test prompt content',
        path: '/test/path',
        lastModified: new Date(),
        status: 'inactive',
      },
    ];

    // Add skills to registry and indexer
    for (const skill of testSkills) {
      registry.addSkill(skill);
      indexer.addSkill(skill.metadata);
    }
  });

  describe('match', () => {
    it('should find exact matches', () => {
      const results = matcher.match('improve prompt');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.metadata.name).toBe('suspect-ai-prompter');
      expect(results[0].score).toBe(1.0);
    });

    it('should find fuzzy matches', () => {
      const results = matcher.match('improve prompts', { fuzzy: true });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.metadata.name).toBe('suspect-ai-prompter');
      expect(results[0].score).toBeGreaterThan(0.6);
    });

    it('should extract keywords from natural language', () => {
      const results = matcher.match(
        'I want to improve the prompt for my AI assistant'
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.metadata.name).toBe('suspect-ai-prompter');
    });

    it('should rank results by relevance', () => {
      const results = matcher.match('generate new mystery case');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.metadata.name).toBe('mystery-case-generator');
      expect(results[0].matchCount).toBeGreaterThan(0);
    });

    it('should filter by minimum score', () => {
      const results = matcher.match('xyz', { minScore: 0.9 });

      expect(results.length).toBe(0);
    });

    it('should limit results', () => {
      const results = matcher.match('test', { maxResults: 1 });

      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should exclude inactive skills by default', () => {
      const results = matcher.match('inactive test');

      expect(results.length).toBe(0);
    });

    it('should include inactive skills when requested', () => {
      const results = matcher.match('inactive test', {
        includeInactive: true,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.metadata.name).toBe('inactive-skill');
    });
  });

  describe('findExactMatches', () => {
    it('should find exact keyword matches', () => {
      const results = matcher.findExactMatches('improve prompt');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].metadata.name).toBe('suspect-ai-prompter');
    });

    it('should return empty array for no matches', () => {
      const results = matcher.findExactMatches('nonexistent keyword');

      expect(results.length).toBe(0);
    });
  });

  describe('findByTrigger', () => {
    it('should find skills by exact trigger', () => {
      const results = matcher.findByTrigger('generate case');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.metadata.name).toBe('mystery-case-generator');
      expect(results[0].score).toBe(1.0);
    });

    it('should find skills by fuzzy trigger', () => {
      const results = matcher.findByTrigger('generate cases', true);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.metadata.name).toBe('mystery-case-generator');
    });

    it('should not find fuzzy matches when disabled', () => {
      const results = matcher.findByTrigger('generate cases', false);

      expect(results.length).toBe(0);
    });
  });

  describe('containsTriggers', () => {
    it('should detect triggers in user input', () => {
      const hasTriggers = matcher.containsTriggers('improve prompt');

      expect(hasTriggers).toBe(true);
    });

    it('should return false for no triggers', () => {
      const hasTriggers = matcher.containsTriggers('random text');

      expect(hasTriggers).toBe(false);
    });
  });

  describe('detectTriggers', () => {
    it('should extract trigger phrases from input', () => {
      const triggers = matcher.detectTriggers(
        'I want to improve prompt and generate case'
      );

      expect(triggers.length).toBeGreaterThan(0);
      expect(triggers).toContain('improve prompt');
    });

    it('should return empty array for no triggers', () => {
      const triggers = matcher.detectTriggers('random text');

      expect(triggers.length).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return matcher statistics', () => {
      const stats = matcher.getStats();

      expect(stats.totalSkills).toBe(3);
      expect(stats.activeSkills).toBe(2);
      expect(stats.totalKeywords).toBeGreaterThan(0);
      expect(stats.averageKeywordsPerSkill).toBeGreaterThan(0);
    });
  });
});
