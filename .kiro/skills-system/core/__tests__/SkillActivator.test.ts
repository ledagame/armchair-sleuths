/**
 * SkillActivator Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillActivator, createSkillActivator } from '../SkillActivator';
import { SkillRegistry } from '../SkillRegistry';
import { KeywordMatcher } from '../KeywordMatcher';
import { DependencyResolver } from '../DependencyResolver';
import { SkillChainBuilder } from '../SkillChainBuilder';
import { DependencyGraph } from '../DependencyGraph';
import type { Skill } from '../types';

describe('SkillActivator', () => {
  let registry: SkillRegistry;
  let keywordMatcher: KeywordMatcher;
  let dependencyResolver: DependencyResolver;
  let dependencyGraph: DependencyGraph;
  let skillChainBuilder: SkillChainBuilder;
  let activator: SkillActivator;

  // Test skills
  const testSkill1: Skill = {
    metadata: {
      name: 'test-skill-1',
      version: '1.0.0',
      description: 'Test skill 1',
      triggers: ['test', 'skill1'],
      dependencies: {},
      capabilities: [
        {
          name: 'test-capability',
          description: 'Test capability',
        },
      ],
    },
    promptContent: 'Test prompt 1',
    path: '/test/skill1',
    lastModified: new Date(),
    status: 'active',
  };

  const testSkill2: Skill = {
    metadata: {
      name: 'test-skill-2',
      version: '1.0.0',
      description: 'Test skill 2',
      triggers: ['test', 'skill2'],
      dependencies: {
        skills: ['test-skill-1'],
      },
      capabilities: [
        {
          name: 'test-capability-2',
          description: 'Test capability 2',
        },
      ],
    },
    promptContent: 'Test prompt 2',
    path: '/test/skill2',
    lastModified: new Date(),
    status: 'active',
  };

  const testSkill3: Skill = {
    metadata: {
      name: 'test-skill-3',
      version: '1.0.0',
      description: 'Test skill 3',
      triggers: ['another', 'skill3'],
      dependencies: {},
      capabilities: [
        {
          name: 'test-capability-3',
          description: 'Test capability 3',
        },
      ],
    },
    promptContent: 'Test prompt 3',
    path: '/test/skill3',
    lastModified: new Date(),
    status: 'active',
  };

  beforeEach(async () => {
    // Create fresh instances
    registry = new SkillRegistry();
    keywordMatcher = new KeywordMatcher();
    dependencyGraph = new DependencyGraph();
    dependencyResolver = new DependencyResolver(registry);
    skillChainBuilder = new SkillChainBuilder(registry, dependencyGraph);
    activator = createSkillActivator(
      registry,
      keywordMatcher,
      dependencyResolver,
      skillChainBuilder
    );

    // Add test skills to registry
    await registry.addSkill(testSkill1);
    await registry.addSkill(testSkill2);
    await registry.addSkill(testSkill3);

    // Build dependency graph
    dependencyGraph.addSkill(testSkill1);
    dependencyGraph.addSkill(testSkill2);
    dependencyGraph.addSkill(testSkill3);
  });

  describe('activateByKeywords', () => {
    it('should activate skills matching keywords', () => {
      const result = activator.activateByKeywords(['test']);

      expect(result.success).toBe(true);
      expect(result.activated.length).toBeGreaterThan(0);
      expect(result.failed.length).toBe(0);
    });

    it('should return empty result for no keywords', () => {
      const result = activator.activateByKeywords([]);

      expect(result.success).toBe(false);
      expect(result.activated.length).toBe(0);
      expect(result.failed.length).toBe(1);
      expect(result.failed[0].reason).toContain('No keywords');
    });

    it('should return empty result for no matches', () => {
      const result = activator.activateByKeywords(['nonexistent']);

      expect(result.success).toBe(false);
      expect(result.activated.length).toBe(0);
      expect(result.failed.length).toBe(1);
      expect(result.failed[0].reason).toContain('No matching skills');
    });

    it('should activate dependencies when enabled', () => {
      // Directly activate test-skill-2 which has test-skill-1 as dependency
      const result = activator.activateSkill('test-skill-2', {
        activateDependencies: true,
      });

      expect(result.success).toBe(true);
      // Should activate test-skill-2
      expect(result.activated.length).toBe(1);
      expect(result.activated[0].metadata.name).toBe('test-skill-2');
      // Should also activate test-skill-1 as dependency
      expect(result.dependencies.length).toBe(1);
      expect(result.dependencies[0].metadata.name).toBe('test-skill-1');
    });

    it('should not activate dependencies when disabled', () => {
      const result = activator.activateByKeywords(['skill2'], {
        activateDependencies: false,
      });

      expect(result.success).toBe(true);
      // Should activate matched skills
      expect(result.activated.length).toBeGreaterThan(0);
      // Should not activate dependencies
      expect(result.dependencies.length).toBe(0);
    });

    it('should respect minMatchScore option', () => {
      const result = activator.activateByKeywords(['test'], {
        minMatchScore: 0.9,
      });

      // With high threshold, should get fewer or no matches
      expect(result.activated.length).toBeLessThanOrEqual(2);
    });

    it('should respect maxSkills option', () => {
      const result = activator.activateByKeywords(['test'], {
        maxSkills: 1,
      });

      expect(result.activated.length).toBeLessThanOrEqual(1);
    });

    it('should not reactivate already active skills by default', () => {
      // First activation
      const result1 = activator.activateByKeywords(['skill1']);
      expect(result1.success).toBe(true);
      expect(result1.activated.length).toBeGreaterThan(0);

      // Second activation - should fail for already active skills
      const result2 = activator.activateByKeywords(['skill1']);
      expect(result2.success).toBe(false);
      expect(result2.activated.length).toBe(0);
      expect(result2.failed.length).toBeGreaterThan(0);
      expect(result2.failed.some(f => f.type === 'already_active')).toBe(true);
    });

    it('should allow reactivation when enabled', () => {
      // First activation
      activator.activateByKeywords(['skill1']);

      // Second activation with allowReactivation
      const result = activator.activateByKeywords(['skill1'], {
        allowReactivation: true,
      });

      expect(result.success).toBe(true);
      expect(result.activated.length).toBeGreaterThan(0);
    });
  });

  describe('activateSkill', () => {
    it('should activate skill by name', () => {
      const result = activator.activateSkill('test-skill-1');

      expect(result.success).toBe(true);
      expect(result.activated.length).toBe(1);
      expect(result.activated[0].metadata.name).toBe('test-skill-1');
      expect(result.failed.length).toBe(0);
    });

    it('should fail for nonexistent skill', () => {
      const result = activator.activateSkill('nonexistent-skill');

      expect(result.success).toBe(false);
      expect(result.activated.length).toBe(0);
      expect(result.failed.length).toBe(1);
      expect(result.failed[0].type).toBe('not_found');
    });

    it('should activate dependencies', () => {
      const result = activator.activateSkill('test-skill-2');

      expect(result.success).toBe(true);
      expect(result.activated.length).toBe(1);
      expect(result.dependencies.length).toBe(1);
      expect(result.dependencies[0].metadata.name).toBe('test-skill-1');
    });

    it('should not reactivate already active skill', () => {
      activator.activateSkill('test-skill-1');
      const result = activator.activateSkill('test-skill-1');

      expect(result.success).toBe(false);
      expect(result.failed[0].type).toBe('already_active');
    });
  });

  describe('deactivateSkill', () => {
    it('should deactivate active skill', () => {
      activator.activateSkill('test-skill-1');
      const result = activator.deactivateSkill('test-skill-1');

      expect(result).toBe(true);
      expect(activator.isActive('test-skill-1')).toBe(false);
    });

    it('should return false for inactive skill', () => {
      const result = activator.deactivateSkill('test-skill-1');

      expect(result).toBe(false);
    });

    it('should emit deactivation event', () => {
      const listener = vi.fn();
      activator.on('skill:deactivated', listener);

      activator.activateSkill('test-skill-1');
      activator.deactivateSkill('test-skill-1');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          skill: expect.objectContaining({
            metadata: expect.objectContaining({
              name: 'test-skill-1',
            }),
          }),
        })
      );
    });
  });

  describe('deactivateAll', () => {
    it('should deactivate all active skills', () => {
      activator.activateSkill('test-skill-1');
      activator.activateSkill('test-skill-3');

      expect(activator.getActiveCount()).toBe(2);

      activator.deactivateAll();

      expect(activator.getActiveCount()).toBe(0);
      expect(activator.isActive('test-skill-1')).toBe(false);
      expect(activator.isActive('test-skill-3')).toBe(false);
    });

    it('should emit cleared event', () => {
      const listener = vi.fn();
      activator.on('activation:cleared', listener);

      activator.activateSkill('test-skill-1');
      activator.deactivateAll();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          count: 1,
        })
      );
    });
  });

  describe('getActiveSkills', () => {
    it('should return empty array when no skills active', () => {
      const skills = activator.getActiveSkills();

      expect(skills).toEqual([]);
    });

    it('should return all active skills', () => {
      activator.activateSkill('test-skill-1');
      activator.activateSkill('test-skill-3');

      const skills = activator.getActiveSkills();

      expect(skills.length).toBe(2);
      expect(skills.map(s => s.metadata.name)).toContain('test-skill-1');
      expect(skills.map(s => s.metadata.name)).toContain('test-skill-3');
    });
  });

  describe('getActiveSkillNames', () => {
    it('should return active skill names', () => {
      activator.activateSkill('test-skill-1');
      activator.activateSkill('test-skill-3');

      const names = activator.getActiveSkillNames();

      expect(names).toContain('test-skill-1');
      expect(names).toContain('test-skill-3');
      expect(names.length).toBe(2);
    });
  });

  describe('isActive', () => {
    it('should return true for active skill', () => {
      activator.activateSkill('test-skill-1');

      expect(activator.isActive('test-skill-1')).toBe(true);
    });

    it('should return false for inactive skill', () => {
      expect(activator.isActive('test-skill-1')).toBe(false);
    });
  });

  describe('getActiveCount', () => {
    it('should return 0 when no skills active', () => {
      expect(activator.getActiveCount()).toBe(0);
    });

    it('should return correct count', () => {
      activator.activateSkill('test-skill-1');
      expect(activator.getActiveCount()).toBe(1);

      activator.activateSkill('test-skill-3');
      expect(activator.getActiveCount()).toBe(2);

      activator.deactivateSkill('test-skill-1');
      expect(activator.getActiveCount()).toBe(1);
    });
  });

  describe('buildSkillChain', () => {
    it('should build chain from active skills', () => {
      activator.activateSkill('test-skill-1');
      activator.activateSkill('test-skill-2');

      const chain = activator.buildSkillChain('Test task');

      expect(chain).toBeDefined();
      expect(chain.steps.length).toBeGreaterThan(0);
      expect(chain.metadata.taskDescription).toBe('Test task');
    });

    it('should build chain from specified skills', () => {
      const chain = activator.buildSkillChain('Test task', [
        'test-skill-1',
        'test-skill-3',
      ]);

      expect(chain).toBeDefined();
      expect(chain.steps.length).toBeGreaterThan(0);
    });

    it('should throw error when no skills available', () => {
      expect(() => {
        activator.buildSkillChain('Test task');
      }).toThrow('No skills available');
    });
  });

  describe('getActivationHistory', () => {
    it('should return empty history initially', () => {
      const history = activator.getActivationHistory();

      expect(history).toEqual([]);
    });

    it('should record activations', () => {
      activator.activateSkill('test-skill-1');

      const history = activator.getActivationHistory();

      expect(history.length).toBe(1);
      expect(history[0].type).toBe('activation');
      expect(history[0].skillName).toBe('test-skill-1');
    });

    it('should record deactivations', () => {
      activator.activateSkill('test-skill-1');
      activator.deactivateSkill('test-skill-1');

      const history = activator.getActivationHistory();

      expect(history.length).toBe(2);
      expect(history[0].type).toBe('deactivation');
      expect(history[1].type).toBe('activation');
    });

    it('should respect limit parameter', () => {
      activator.activateSkill('test-skill-1');
      activator.activateSkill('test-skill-2');
      activator.activateSkill('test-skill-3');

      const history = activator.getActivationHistory(2);

      expect(history.length).toBe(2);
    });
  });

  describe('clearHistory', () => {
    it('should clear activation history', () => {
      activator.activateSkill('test-skill-1');
      activator.clearHistory();

      const history = activator.getActivationHistory();

      expect(history).toEqual([]);
    });

    it('should emit cleared event', () => {
      const listener = vi.fn();
      activator.on('history:cleared', listener);

      activator.clearHistory();

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      activator.activateSkill('test-skill-1');
      activator.activateSkill('test-skill-2');
      activator.deactivateSkill('test-skill-1');

      const stats = activator.getStats();

      // skill-2 activation also activates skill-1 as dependency
      expect(stats.totalActivations).toBeGreaterThanOrEqual(2);
      expect(stats.totalDeactivations).toBe(1);
      expect(stats.currentlyActive).toBeGreaterThanOrEqual(1);
    });

    it('should track most used skills', () => {
      activator.activateSkill('test-skill-1');
      activator.deactivateSkill('test-skill-1');
      activator.activateSkill('test-skill-1', { allowReactivation: true });

      const stats = activator.getStats();

      expect(stats.mostUsedSkills.length).toBeGreaterThan(0);
      expect(stats.mostUsedSkills[0].name).toBe('test-skill-1');
      expect(stats.mostUsedSkills[0].count).toBe(2);
    });
  });

  describe('events', () => {
    it('should emit activation event', () => {
      const listener = vi.fn();
      activator.on('skill:activated', listener);

      activator.activateSkill('test-skill-1');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          skill: expect.objectContaining({
            metadata: expect.objectContaining({
              name: 'test-skill-1',
            }),
          }),
          isDependency: false,
        })
      );
    });

    it('should emit completion event', () => {
      const listener = vi.fn();
      activator.on('activation:completed', listener);

      activator.activateSkill('test-skill-1');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          result: expect.objectContaining({
            success: true,
            activated: expect.arrayContaining([
              expect.objectContaining({
                metadata: expect.objectContaining({
                  name: 'test-skill-1',
                }),
              }),
            ]),
          }),
        })
      );
    });
  });
});
