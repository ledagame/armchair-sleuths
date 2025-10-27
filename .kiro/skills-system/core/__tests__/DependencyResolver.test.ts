/**
 * Unit tests for DependencyResolver
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyResolver, createDependencyResolver } from '../DependencyResolver';
import { SkillRegistry } from '../SkillRegistry';
import type { Skill } from '../types';

describe('DependencyResolver', () => {
  let registry: SkillRegistry;
  let resolver: DependencyResolver;

  beforeEach(() => {
    registry = new SkillRegistry();
    resolver = createDependencyResolver(registry);
  });

  describe('basic resolution', () => {
    it('should resolve skill with no dependencies', async () => {
      const skill: Skill = {
        metadata: {
          name: 'simple-skill',
          version: '1.0.0',
          description: 'Simple skill',
          triggers: [],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/simple-skill',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill);

      const result = resolver.resolve('simple-skill');

      expect(result.success).toBe(true);
      expect(result.resolved).toHaveLength(1);
      expect(result.resolved[0].metadata.name).toBe('simple-skill');
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing skill', () => {
      const result = resolver.resolve('non-existent');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing');
      expect(result.errors[0].skillName).toBe('non-existent');
    });
  });

  describe('dependency resolution', () => {
    it('should resolve linear dependencies', async () => {
      // A depends on B, B depends on C
      const skillC: Skill = {
        metadata: {
          name: 'skill-c',
          version: '1.0.0',
          description: 'Skill C',
          triggers: [],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-c',
        lastModified: new Date(),
        status: 'active',
      };

      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {
            skills: ['skill-c'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-b'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillC);
      await registry.addSkill(skillB);
      await registry.addSkill(skillA);

      const result = resolver.resolve('skill-a');

      expect(result.success).toBe(true);
      expect(result.resolved).toHaveLength(3);
      
      // Check execution order: C should come before B, B before A
      const names = result.resolved.map(s => s.metadata.name);
      expect(names.indexOf('skill-c')).toBeLessThan(names.indexOf('skill-b'));
      expect(names.indexOf('skill-b')).toBeLessThan(names.indexOf('skill-a'));
    });

    it('should resolve diamond dependencies', async () => {
      // A depends on B and C, both B and C depend on D
      const skillD: Skill = {
        metadata: {
          name: 'skill-d',
          version: '1.0.0',
          description: 'Skill D',
          triggers: [],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-d',
        lastModified: new Date(),
        status: 'active',
      };

      const skillC: Skill = {
        metadata: {
          name: 'skill-c',
          version: '1.0.0',
          description: 'Skill C',
          triggers: [],
          dependencies: {
            skills: ['skill-d'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-c',
        lastModified: new Date(),
        status: 'active',
      };

      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {
            skills: ['skill-d'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-b', 'skill-c'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillD);
      await registry.addSkill(skillC);
      await registry.addSkill(skillB);
      await registry.addSkill(skillA);

      const result = resolver.resolve('skill-a');

      expect(result.success).toBe(true);
      expect(result.resolved).toHaveLength(4);
      
      // D should come before B and C
      const names = result.resolved.map(s => s.metadata.name);
      expect(names.indexOf('skill-d')).toBeLessThan(names.indexOf('skill-b'));
      expect(names.indexOf('skill-d')).toBeLessThan(names.indexOf('skill-c'));
      
      // B and C should come before A
      expect(names.indexOf('skill-b')).toBeLessThan(names.indexOf('skill-a'));
      expect(names.indexOf('skill-c')).toBeLessThan(names.indexOf('skill-a'));
    });

    it('should handle missing dependencies', async () => {
      const skill: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['missing-skill'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill);

      const result = resolver.resolve('skill-a');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing');
      expect(result.errors[0].dependency).toBe('missing-skill');
    });
  });

  describe('circular dependency detection', () => {
    it('should detect direct circular dependency', async () => {
      // A depends on B, B depends on A
      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-b'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {
            skills: ['skill-a'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillA);
      await registry.addSkill(skillB);

      const result = resolver.resolve('skill-a');

      expect(result.success).toBe(false);
      expect(result.circular).toBeDefined();
      expect(result.circular?.cycle).toContain('skill-a');
      expect(result.circular?.cycle).toContain('skill-b');
    });

    it('should detect indirect circular dependency', async () => {
      // A → B → C → A
      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-b'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {
            skills: ['skill-c'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      const skillC: Skill = {
        metadata: {
          name: 'skill-c',
          version: '1.0.0',
          description: 'Skill C',
          triggers: [],
          dependencies: {
            skills: ['skill-a'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-c',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillA);
      await registry.addSkill(skillB);
      await registry.addSkill(skillC);

      const result = resolver.resolve('skill-a');

      expect(result.success).toBe(false);
      expect(result.circular).toBeDefined();
      expect(result.circular?.cycle.length).toBeGreaterThan(2);
    });

    it('should detect self-dependency', async () => {
      const skill: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-a'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill);

      const result = resolver.resolve('skill-a');

      expect(result.success).toBe(false);
      expect(result.circular).toBeDefined();
    });
  });

  describe('execution order', () => {
    it('should return correct execution order', async () => {
      const skillC: Skill = {
        metadata: {
          name: 'skill-c',
          version: '1.0.0',
          description: 'Skill C',
          triggers: [],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-c',
        lastModified: new Date(),
        status: 'active',
      };

      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {
            skills: ['skill-c'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-b'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillC);
      await registry.addSkill(skillB);
      await registry.addSkill(skillA);

      const order = resolver.getExecutionOrder([skillA, skillB, skillC]);

      expect(order).not.toBeNull();
      expect(order).toHaveLength(3);
      
      const names = order!.map(s => s.metadata.name);
      expect(names.indexOf('skill-c')).toBeLessThan(names.indexOf('skill-b'));
      expect(names.indexOf('skill-b')).toBeLessThan(names.indexOf('skill-a'));
    });

    it('should return null for circular dependencies', async () => {
      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-b'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {
            skills: ['skill-a'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillA);
      await registry.addSkill(skillB);

      const order = resolver.getExecutionOrder([skillA, skillB]);

      expect(order).toBeNull();
    });
  });

  describe('utility methods', () => {
    it('should get all dependencies', async () => {
      const skillC: Skill = {
        metadata: {
          name: 'skill-c',
          version: '1.0.0',
          description: 'Skill C',
          triggers: [],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-c',
        lastModified: new Date(),
        status: 'active',
      };

      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {
            skills: ['skill-c'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-b'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillC);
      await registry.addSkill(skillB);
      await registry.addSkill(skillA);

      const deps = resolver.getDependencies('skill-a');

      expect(deps).toContain('skill-b');
      expect(deps).toContain('skill-c');
      expect(deps).not.toContain('skill-a');
    });

    it('should check if skill depends on another', async () => {
      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-b'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillB);
      await registry.addSkill(skillA);

      expect(resolver.dependsOn('skill-a', 'skill-b')).toBe(true);
      expect(resolver.dependsOn('skill-b', 'skill-a')).toBe(false);
    });

    it('should get dependency tree', async () => {
      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['skill-b'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillB);
      await registry.addSkill(skillA);

      const tree = resolver.getDependencyTree('skill-a');

      expect(tree).not.toBeNull();
      expect(tree?.skill).toBe('skill-a');
      expect(tree?.dependencies).toHaveLength(1);
      expect(tree?.dependencies[0].skill).toBe('skill-b');
    });
  });

  describe('validation', () => {
    it('should validate all skills in registry', async () => {
      const skillA: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {},
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      const skillB: Skill = {
        metadata: {
          name: 'skill-b',
          version: '1.0.0',
          description: 'Skill B',
          triggers: [],
          dependencies: {
            skills: ['skill-a'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-b',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skillA);
      await registry.addSkill(skillB);

      const validation = resolver.validateAll();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.circularDependencies).toHaveLength(0);
    });

    it('should detect validation errors', async () => {
      const skill: Skill = {
        metadata: {
          name: 'skill-a',
          version: '1.0.0',
          description: 'Skill A',
          triggers: [],
          dependencies: {
            skills: ['missing-skill'],
          },
          capabilities: [],
        },
        promptContent: 'Test',
        path: '/skills/skill-a',
        lastModified: new Date(),
        status: 'active',
      };

      await registry.addSkill(skill);

      const validation = resolver.validateAll();

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});
