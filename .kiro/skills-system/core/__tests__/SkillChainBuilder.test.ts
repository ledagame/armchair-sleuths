/**
 * Tests for SkillChainBuilder
 */

import { SkillChainBuilder } from '../SkillChainBuilder';
import { SkillRegistry } from '../SkillRegistry';
import { DependencyGraph } from '../DependencyGraph';
import type { Skill } from '../types';

describe('SkillChainBuilder', () => {
  let registry: SkillRegistry;
  let dependencyGraph: DependencyGraph;
  let builder: SkillChainBuilder;

  beforeEach(() => {
    registry = new SkillRegistry();
    dependencyGraph = new DependencyGraph();
    builder = new SkillChainBuilder(registry, dependencyGraph);
  });

  describe('buildSkillChain', () => {
    it('should build a chain with a single skill', async () => {
      const skill: Skill = {
        metadata: {
          name: 'test-skill',
          version: '1.0.0',
          description: 'Test skill',
          triggers: ['test'],
          dependencies: {},
          capabilities: [
            {
              name: 'test-action',
              description: 'Test action',
            },
          ],
        },
        promptContent: 'Test prompt',
        path: '/test/path',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill);
      dependencyGraph.addSkill(skill);

      const chain = builder.buildSkillChain('Test task', [skill]);

      expect(chain).toBeDefined();
      expect(chain.steps).toHaveLength(1);
      expect(chain.steps[0].skill.metadata.name).toBe('test-skill');
      expect(chain.steps[0].action).toBe('test-action');
      expect(chain.steps[0].status).toBe('pending');
      expect(chain.metadata.taskDescription).toBe('Test task');
      expect(chain.metadata.totalSteps).toBe(1);
    });

    it('should build a chain with multiple skills', async () => {
      const skill1: Skill = {
        metadata: {
          name: 'skill-1',
          version: '1.0.0',
          description: 'Skill 1',
          triggers: ['skill1'],
          dependencies: {},
          capabilities: [
            {
              name: 'action-1',
              description: 'Action 1',
            },
          ],
        },
        promptContent: 'Skill 1 prompt',
        path: '/test/skill1',
        lastModified: new Date(),
        status: 'active',
      };

      const skill2: Skill = {
        metadata: {
          name: 'skill-2',
          version: '1.0.0',
          description: 'Skill 2',
          triggers: ['skill2'],
          dependencies: {
            skills: ['skill-1'],
          },
          capabilities: [
            {
              name: 'action-2',
              description: 'Action 2',
            },
          ],
        },
        promptContent: 'Skill 2 prompt',
        path: '/test/skill2',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill1);
      await registry.addSkill(skill2);
      dependencyGraph.addSkill(skill1);
      dependencyGraph.addSkill(skill2);

      const chain = builder.buildSkillChain('Test task', [skill1, skill2]);

      expect(chain).toBeDefined();
      expect(chain.steps).toHaveLength(2);
      // skill-1 should come before skill-2 due to dependency
      expect(chain.steps[0].skill.metadata.name).toBe('skill-1');
      expect(chain.steps[1].skill.metadata.name).toBe('skill-2');
    });

    it('should throw error when no skills provided', () => {
      expect(() => {
        builder.buildSkillChain('Test task', []);
      }).toThrow('At least one skill is required to build a chain');
    });

    it('should estimate duration correctly', async () => {
      const skill: Skill = {
        metadata: {
          name: 'test-skill',
          version: '1.0.0',
          description: 'Test skill',
          triggers: ['test'],
          dependencies: {},
          capabilities: [
            {
              name: 'test-action',
              description: 'Test action',
            },
          ],
        },
        promptContent: 'Test prompt',
        path: '/test/path',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill);
      dependencyGraph.addSkill(skill);

      const chain = builder.buildSkillChain('Test task', [skill]);

      expect(chain.estimatedDuration).toBeGreaterThan(0);
      expect(chain.estimatedDuration).toBe(30000); // Default 30 seconds
    });

    it('should collect permissions correctly', async () => {
      const skill: Skill = {
        metadata: {
          name: 'test-skill',
          version: '1.0.0',
          description: 'Test skill',
          triggers: ['test'],
          dependencies: {},
          capabilities: [
            {
              name: 'test-action',
              description: 'Test action',
              script: 'test-script.ts',
            },
          ],
        },
        promptContent: 'Test prompt',
        path: '/test/path',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill);
      dependencyGraph.addSkill(skill);

      const chain = builder.buildSkillChain('Test task', [skill]);

      expect(chain.requiredPermissions).toHaveLength(1);
      expect(chain.requiredPermissions[0].type).toBe('filesystem');
      expect(chain.requiredPermissions[0].scope).toBe('/test/path');
    });
  });

  describe('validateChain', () => {
    it('should validate a valid chain', async () => {
      const skill: Skill = {
        metadata: {
          name: 'test-skill',
          version: '1.0.0',
          description: 'Test skill',
          triggers: ['test'],
          dependencies: {},
          capabilities: [
            {
              name: 'test-action',
              description: 'Test action',
            },
          ],
        },
        promptContent: 'Test prompt',
        path: '/test/path',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill);
      dependencyGraph.addSkill(skill);

      const chain = builder.buildSkillChain('Test task', [skill]);
      const validation = builder.validateChain(chain);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect empty chain', () => {
      const chain = {
        steps: [],
        estimatedDuration: 0,
        requiredPermissions: [],
        metadata: {
          taskDescription: 'Test',
          createdAt: new Date(),
          totalSteps: 0,
        },
      };

      const validation = builder.validateChain(chain);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Chain must have at least one step');
    });
  });

  describe('getChainSummary', () => {
    it('should generate a readable summary', async () => {
      const skill: Skill = {
        metadata: {
          name: 'test-skill',
          version: '1.0.0',
          description: 'Test skill',
          triggers: ['test'],
          dependencies: {},
          capabilities: [
            {
              name: 'test-action',
              description: 'Test action',
            },
          ],
        },
        promptContent: 'Test prompt',
        path: '/test/path',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill);
      dependencyGraph.addSkill(skill);

      const chain = builder.buildSkillChain('Test task', [skill]);
      const summary = builder.getChainSummary(chain);

      expect(summary).toContain('Task: Test task');
      expect(summary).toContain('Total Steps: 1');
      expect(summary).toContain('test-skill - test-action');
    });
  });
});
