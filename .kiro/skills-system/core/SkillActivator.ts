import { EventEmitter } from 'events';
import type { Skill } from './types.js';
import type { SkillRegistry } from './SkillRegistry.js';
import type { KeywordMatcher, MatchResult } from './KeywordMatcher.js';
import type {
  DependencyResolver,
  DependencyResolutionResult,
} from './DependencyResolver.js';
import type { SkillChainBuilder, SkillChain } from './SkillChainBuilder.js';

/**
 * SkillActivator - Activates skills and manages their lifecycle
 * 
 * This class provides:
 * - Skill activation by keywords or name
 * - Dependency resolution and loading
 * - Active skill tracking
 * - Activation failure handling
 * - Skill chain building for complex tasks
 */
export class SkillActivator extends EventEmitter {
  private registry: SkillRegistry;
  private keywordMatcher: KeywordMatcher;
  private dependencyResolver: DependencyResolver;
  private chainBuilder: SkillChainBuilder;
  private activeSkills: Map<string, ActiveSkill>;
  private maxActiveSkills: number;

  constructor(
    registry: SkillRegistry,
    keywordMatcher: KeywordMatcher,
    dependencyResolver: DependencyResolver,
    chainBuilder: SkillChainBuilder,
    maxActiveSkills: number = 10
  ) {
    super();
    this.registry = registry;
    this.keywordMatcher = keywordMatcher;
    this.dependencyResolver = dependencyResolver;
    this.chainBuilder = chainBuilder;
    this.activeSkills = new Map();
    this.maxActiveSkills = maxActiveSkills;
  }

  /**
   * Activate skills by keywords from user input
   * @param keywords User input containing keywords
   * @param autoActivate Automatically activate if only one match
   * @returns Activation result
   */
  activateByKeywords(
    keywords: string,
    autoActivate: boolean = false
  ): ActivationResult {
    // Match skills
    const matches = this.keywordMatcher.matchSkills(keywords, true);

    if (matches.length === 0) {
      this.emit('activator:no-matches', {
        keywords,
        timestamp: new Date(),
      });

      return {
        activated: [],
        failed: [],
        dependencies: [],
        suggestions: [],
        requiresUserSelection: false,
      };
    }

    // Auto-activate if only one match and autoActivate is true
    if (matches.length === 1 && autoActivate) {
      return this.activateSkill(matches[0].skill.metadata.name);
    }

    // Multiple matches - require user selection
    this.emit('activator:multiple-matches', {
      keywords,
      matchCount: matches.length,
      timestamp: new Date(),
    });

    return {
      activated: [],
      failed: [],
      dependencies: [],
      suggestions: matches.map((m) => m.skill),
      requiresUserSelection: true,
    };
  }

  /**
   * Activate a specific skill by name
   * @param skillName Name of the skill to activate
   * @returns Activation result
   */
  activateSkill(skillName: string): ActivationResult {
    const result: ActivationResult = {
      activated: [],
      failed: [],
      dependencies: [],
      suggestions: [],
      requiresUserSelection: false,
    };

    // Check if skill exists
    const skill = this.registry.getSkill(skillName);

    if (!skill) {
      result.failed.push({
        skillName,
        reason: 'Skill not found in registry',
        error: new Error(`Skill '${skillName}' not found`),
      });

      this.emit('activator:activation-failed', {
        skillName,
        reason: 'not_found',
        timestamp: new Date(),
      });

      return result;
    }

    // Check if already active
    if (this.activeSkills.has(skillName)) {
      this.emit('activator:already-active', {
        skillName,
        timestamp: new Date(),
      });

      return {
        activated: [skill],
        failed: [],
        dependencies: [],
        suggestions: [],
        requiresUserSelection: false,
      };
    }

    // Check max active skills limit
    if (this.activeSkills.size >= this.maxActiveSkills) {
      result.failed.push({
        skillName,
        reason: `Maximum active skills limit (${this.maxActiveSkills}) reached`,
        error: new Error('Too many active skills'),
      });

      this.emit('activator:activation-failed', {
        skillName,
        reason: 'max_limit_reached',
        timestamp: new Date(),
      });

      return result;
    }

    // Resolve dependencies
    const resolution = this.dependencyResolver.resolveDependencies(skill);

    // Check for critical errors
    const criticalErrors = resolution.errors.filter(
      (e) => e.severity === 'error'
    );

    if (criticalErrors.length > 0) {
      result.failed.push({
        skillName,
        reason: 'Dependency resolution failed',
        error: new Error(criticalErrors.map((e) => e.message).join('; ')),
        resolution,
      });

      this.emit('activator:activation-failed', {
        skillName,
        reason: 'dependency_error',
        errors: criticalErrors,
        timestamp: new Date(),
      });

      return result;
    }

    // Activate dependencies first
    for (const depSkill of resolution.skills) {
      if (!this.activeSkills.has(depSkill.metadata.name)) {
        const depResult = this.activateSkill(depSkill.metadata.name);

        // If dependency activation failed, fail this activation too
        if (depResult.failed.length > 0) {
          result.failed.push({
            skillName,
            reason: `Dependency '${depSkill.metadata.name}' activation failed`,
            error: new Error('Dependency activation failed'),
          });

          return result;
        }

        result.dependencies.push(...depResult.activated);
      }
    }

    // Activate the skill
    const activeSkill: ActiveSkill = {
      skill,
      activatedAt: new Date(),
      resolution,
      chain: undefined,
    };

    this.activeSkills.set(skillName, activeSkill);
    result.activated.push(skill);

    this.emit('activator:skill-activated', {
      skillName,
      dependencyCount: resolution.skills.length,
      warnings: resolution.warnings,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Activate multiple skills
   * @param skillNames Array of skill names
   * @returns Combined activation result
   */
  activateMultipleSkills(skillNames: string[]): ActivationResult {
    const combinedResult: ActivationResult = {
      activated: [],
      failed: [],
      dependencies: [],
      suggestions: [],
      requiresUserSelection: false,
    };

    for (const skillName of skillNames) {
      const result = this.activateSkill(skillName);

      combinedResult.activated.push(...result.activated);
      combinedResult.failed.push(...result.failed);
      combinedResult.dependencies.push(...result.dependencies);
    }

    // Remove duplicates from activated and dependencies
    combinedResult.activated = Array.from(
      new Map(
        combinedResult.activated.map((s) => [s.metadata.name, s])
      ).values()
    );

    combinedResult.dependencies = Array.from(
      new Map(
        combinedResult.dependencies.map((s) => [s.metadata.name, s])
      ).values()
    );

    return combinedResult;
  }

  /**
   * Deactivate a skill
   * @param skillName Name of the skill to deactivate
   * @returns True if deactivated successfully
   */
  deactivateSkill(skillName: string): boolean {
    if (!this.activeSkills.has(skillName)) {
      this.emit('activator:not-active', {
        skillName,
        timestamp: new Date(),
      });
      return false;
    }

    // Check if any other active skills depend on this skill
    const dependents = this.findDependentSkills(skillName);

    if (dependents.length > 0) {
      this.emit('activator:deactivation-blocked', {
        skillName,
        dependents: dependents.map((s) => s.metadata.name),
        timestamp: new Date(),
      });

      // Deactivate dependents first
      for (const dependent of dependents) {
        this.deactivateSkill(dependent.metadata.name);
      }
    }

    this.activeSkills.delete(skillName);

    this.emit('activator:skill-deactivated', {
      skillName,
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * Deactivate all skills
   */
  deactivateAll(): void {
    const skillNames = Array.from(this.activeSkills.keys());

    for (const skillName of skillNames) {
      this.deactivateSkill(skillName);
    }

    this.emit('activator:all-deactivated', {
      count: skillNames.length,
      timestamp: new Date(),
    });
  }

  /**
   * Get all active skills
   * @returns Array of active skills
   */
  getActiveSkills(): Skill[] {
    return Array.from(this.activeSkills.values()).map((as) => as.skill);
  }

  /**
   * Check if a skill is active
   * @param skillName Skill name
   * @returns True if active
   */
  isSkillActive(skillName: string): boolean {
    return this.activeSkills.has(skillName);
  }

  /**
   * Get active skill info
   * @param skillName Skill name
   * @returns Active skill info or undefined
   */
  getActiveSkillInfo(skillName: string): ActiveSkill | undefined {
    return this.activeSkills.get(skillName);
  }

  /**
   * Build execution chain for active skills
   * @param taskDescription Description of the task
   * @returns Skill chain
   */
  buildChainForActiveSkills(taskDescription: string): SkillChain {
    const activeSkills = this.getActiveSkills();

    if (activeSkills.length === 0) {
      return {
        skill: taskDescription,
        steps: [],
        estimatedDuration: 0,
        requiredPermissions: [],
        errors: ['No active skills to build chain'],
        warnings: [],
        status: 'failed',
      };
    }

    return this.chainBuilder.buildMultiSkillChain(
      activeSkills,
      taskDescription
    );
  }

  /**
   * Build execution chain for a specific skill
   * @param skillName Skill name
   * @returns Skill chain
   */
  buildChainForSkill(skillName: string): SkillChain | null {
    const skill = this.registry.getSkill(skillName);

    if (!skill) {
      return null;
    }

    return this.chainBuilder.buildChain(skill);
  }

  /**
   * Find skills that depend on a given skill
   * @param skillName Skill name
   * @returns Array of dependent skills
   */
  private findDependentSkills(skillName: string): Skill[] {
    const dependents: Skill[] = [];

    for (const [name, activeSkill] of this.activeSkills.entries()) {
      if (name === skillName) continue;

      const deps = activeSkill.skill.metadata.dependencies.skills || [];

      if (deps.includes(skillName)) {
        dependents.push(activeSkill.skill);
      }
    }

    return dependents;
  }

  /**
   * Get activation statistics
   * @returns Activation statistics
   */
  getStats(): ActivationStats {
    const activeSkills = Array.from(this.activeSkills.values());

    return {
      totalActive: activeSkills.length,
      maxActive: this.maxActiveSkills,
      averageActiveDuration:
        activeSkills.length > 0
          ? activeSkills.reduce((sum, as) => {
              const duration =
                Date.now() - as.activatedAt.getTime();
              return sum + duration;
            }, 0) / activeSkills.length
          : 0,
      oldestActivation:
        activeSkills.length > 0
          ? Math.min(...activeSkills.map((as) => as.activatedAt.getTime()))
          : 0,
    };
  }

  /**
   * Set maximum active skills limit
   * @param limit New limit
   */
  setMaxActiveSkills(limit: number): void {
    if (limit < 1) {
      throw new Error('Max active skills must be at least 1');
    }

    this.maxActiveSkills = limit;

    this.emit('activator:max-limit-updated', {
      limit,
      timestamp: new Date(),
    });
  }

  /**
   * Get maximum active skills limit
   * @returns Current limit
   */
  getMaxActiveSkills(): number {
    return this.maxActiveSkills;
  }
}

/**
 * Activation result
 */
export interface ActivationResult {
  activated: Skill[];
  failed: ActivationFailure[];
  dependencies: Skill[];
  suggestions: Skill[];
  requiresUserSelection: boolean;
}

/**
 * Activation failure
 */
export interface ActivationFailure {
  skillName: string;
  reason: string;
  error: Error;
  resolution?: DependencyResolutionResult;
}

/**
 * Active skill information
 */
export interface ActiveSkill {
  skill: Skill;
  activatedAt: Date;
  resolution: DependencyResolutionResult;
  chain?: SkillChain;
}

/**
 * Activation statistics
 */
export interface ActivationStats {
  totalActive: number;
  maxActive: number;
  averageActiveDuration: number;
  oldestActivation: number;
}

/**
 * Events emitted by SkillActivator:
 * 
 * - 'activator:skill-activated' - Skill activated successfully
 * - 'activator:skill-deactivated' - Skill deactivated
 * - 'activator:activation-failed' - Skill activation failed
 * - 'activator:no-matches' - No skills matched keywords
 * - 'activator:multiple-matches' - Multiple skills matched keywords
 * - 'activator:already-active' - Skill is already active
 * - 'activator:not-active' - Skill is not active
 * - 'activator:deactivation-blocked' - Deactivation blocked by dependents
 * - 'activator:all-deactivated' - All skills deactivated
 * - 'activator:max-limit-updated' - Max active skills limit updated
 */
