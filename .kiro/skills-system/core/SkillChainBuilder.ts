import { EventEmitter } from 'events';
import type { Skill } from './types.js';
import type { DependencyGraph } from './DependencyGraph.js';
import type {
  DependencyResolver,
  DependencyResolutionResult,
} from './DependencyResolver.js';

/**
 * SkillChainBuilder - Builds execution chains for complex tasks
 * 
 * This class provides:
 * - Skill execution order determination
 * - Duration estimation
 * - Permission aggregation
 * - Input/output flow definition
 */
export class SkillChainBuilder extends EventEmitter {
  private dependencyGraph: DependencyGraph;
  private dependencyResolver: DependencyResolver;

  constructor(
    dependencyGraph: DependencyGraph,
    dependencyResolver: DependencyResolver
  ) {
    super();
    this.dependencyGraph = dependencyGraph;
    this.dependencyResolver = dependencyResolver;
  }

  /**
   * Build execution chain for a single skill
   * @param skill Skill to build chain for
   * @returns Skill chain with execution steps
   */
  buildChain(skill: Skill): SkillChain {
    // Resolve dependencies
    const resolution = this.dependencyResolver.resolveDependencies(skill);

    // Check for errors
    if (resolution.errors.length > 0) {
      this.emit('chain:build-failed', {
        skill: skill.metadata.name,
        errors: resolution.errors,
        timestamp: new Date(),
      });

      return {
        skill: skill.metadata.name,
        steps: [],
        estimatedDuration: 0,
        requiredPermissions: [],
        errors: resolution.errors.map((e) => e.message),
        warnings: resolution.warnings.map((w) => w.message),
        status: 'failed',
      };
    }

    // Get execution order
    const allSkills = [...resolution.skills, skill];
    const skillNames = allSkills.map((s) => s.metadata.name);
    const executionOrder = this.dependencyGraph.topologicalSort(skillNames);

    if (!executionOrder) {
      // Topological sort failed (circular dependencies)
      this.emit('chain:build-failed', {
        skill: skill.metadata.name,
        reason: 'Circular dependencies detected',
        timestamp: new Date(),
      });

      return {
        skill: skill.metadata.name,
        steps: [],
        estimatedDuration: 0,
        requiredPermissions: [],
        errors: ['Cannot build chain: circular dependencies detected'],
        warnings: resolution.warnings.map((w) => w.message),
        status: 'failed',
      };
    }

    // Build steps
    const steps: SkillChainStep[] = [];
    let totalDuration = 0;
    const allPermissions = new Set<string>();

    for (const skillName of executionOrder) {
      const stepSkill = allSkills.find((s) => s.metadata.name === skillName);

      if (!stepSkill) continue;

      const step = this.buildStep(stepSkill, steps.length);
      steps.push(step);

      totalDuration += step.estimatedDuration;

      // Collect permissions
      if (stepSkill.metadata.config?.permissions) {
        for (const perm of stepSkill.metadata.config.permissions) {
          allPermissions.add(JSON.stringify(perm));
        }
      }
    }

    const chain: SkillChain = {
      skill: skill.metadata.name,
      steps,
      estimatedDuration: totalDuration,
      requiredPermissions: Array.from(allPermissions).map((p) =>
        JSON.parse(p)
      ),
      errors: [],
      warnings: resolution.warnings.map((w) => w.message),
      status: 'ready',
    };

    this.emit('chain:built', {
      skill: skill.metadata.name,
      stepCount: steps.length,
      estimatedDuration: totalDuration,
      timestamp: new Date(),
    });

    return chain;
  }

  /**
   * Build execution chain for multiple skills
   * @param skills Array of skills
   * @param taskDescription Description of the task
   * @returns Combined skill chain
   */
  buildMultiSkillChain(
    skills: Skill[],
    taskDescription: string
  ): SkillChain {
    // Resolve dependencies for all skills
    const resolution =
      this.dependencyResolver.resolveMultipleDependencies(skills);

    // Check for errors
    if (resolution.errors.length > 0) {
      this.emit('chain:build-failed', {
        skills: skills.map((s) => s.metadata.name),
        errors: resolution.errors,
        timestamp: new Date(),
      });

      return {
        skill: taskDescription,
        steps: [],
        estimatedDuration: 0,
        requiredPermissions: [],
        errors: resolution.errors.map((e) => e.message),
        warnings: resolution.warnings.map((w) => w.message),
        status: 'failed',
      };
    }

    // Get all skills including dependencies
    const allSkills = [...resolution.skills, ...skills];

    // Remove duplicates
    const uniqueSkills = Array.from(
      new Map(allSkills.map((s) => [s.metadata.name, s])).values()
    );

    // Get execution order
    const skillNames = uniqueSkills.map((s) => s.metadata.name);
    const executionOrder = this.dependencyGraph.topologicalSort(skillNames);

    if (!executionOrder) {
      return {
        skill: taskDescription,
        steps: [],
        estimatedDuration: 0,
        requiredPermissions: [],
        errors: ['Cannot build chain: circular dependencies detected'],
        warnings: resolution.warnings.map((w) => w.message),
        status: 'failed',
      };
    }

    // Build steps
    const steps: SkillChainStep[] = [];
    let totalDuration = 0;
    const allPermissions = new Set<string>();

    for (const skillName of executionOrder) {
      const stepSkill = uniqueSkills.find(
        (s) => s.metadata.name === skillName
      );

      if (!stepSkill) continue;

      const step = this.buildStep(stepSkill, steps.length);
      steps.push(step);

      totalDuration += step.estimatedDuration;

      // Collect permissions
      if (stepSkill.metadata.config?.permissions) {
        for (const perm of stepSkill.metadata.config.permissions) {
          allPermissions.add(JSON.stringify(perm));
        }
      }
    }

    const chain: SkillChain = {
      skill: taskDescription,
      steps,
      estimatedDuration: totalDuration,
      requiredPermissions: Array.from(allPermissions).map((p) =>
        JSON.parse(p)
      ),
      errors: [],
      warnings: resolution.warnings.map((w) => w.message),
      status: 'ready',
    };

    this.emit('chain:built', {
      task: taskDescription,
      stepCount: steps.length,
      estimatedDuration: totalDuration,
      timestamp: new Date(),
    });

    return chain;
  }

  /**
   * Build a single step in the chain
   * @param skill Skill for this step
   * @param stepIndex Step index
   * @returns Chain step
   */
  private buildStep(skill: Skill, stepIndex: number): SkillChainStep {
    // Estimate duration based on skill capabilities
    const estimatedDuration = this.estimateDuration(skill);

    // Determine inputs and outputs
    const inputs = this.determineInputs(skill);
    const outputs = this.determineOutputs(skill);

    // Get action description
    const action = this.getActionDescription(skill);

    return {
      stepNumber: stepIndex + 1,
      skill,
      action,
      inputs,
      outputs,
      estimatedDuration,
      status: 'pending',
      startTime: undefined,
      endTime: undefined,
      error: undefined,
    };
  }

  /**
   * Estimate duration for a skill
   * @param skill Skill to estimate
   * @returns Estimated duration in seconds
   */
  private estimateDuration(skill: Skill): number {
    // Base duration
    let duration = 30; // 30 seconds default

    // Adjust based on capabilities
    const capabilityCount = skill.metadata.capabilities.length;
    duration += capabilityCount * 10; // 10 seconds per capability

    // Adjust based on scripts
    if (skill.metadata.npmScripts) {
      const scriptCount = Object.keys(skill.metadata.npmScripts).length;
      duration += scriptCount * 20; // 20 seconds per script
    }

    // Adjust based on dependencies
    const depCount =
      (skill.metadata.dependencies.skills?.length || 0) +
      (skill.metadata.dependencies.packages?.length || 0);
    duration += depCount * 5; // 5 seconds per dependency

    return duration;
  }

  /**
   * Determine inputs for a skill
   * @param skill Skill to analyze
   * @returns Input definitions
   */
  private determineInputs(skill: Skill): Record<string, any> {
    const inputs: Record<string, any> = {};

    // Check integration points
    if (skill.metadata.integration?.readsFrom) {
      for (const source of skill.metadata.integration.readsFrom) {
        inputs[source] = {
          type: 'file',
          required: true,
          description: `Input from ${source}`,
        };
      }
    }

    // Check capability parameters
    for (const capability of skill.metadata.capabilities) {
      if (capability.parameters) {
        for (const param of capability.parameters) {
          inputs[param.name] = {
            type: param.type,
            required: param.required,
            description: param.description,
            default: param.default,
          };
        }
      }
    }

    return inputs;
  }

  /**
   * Determine outputs for a skill
   * @param skill Skill to analyze
   * @returns Output definitions
   */
  private determineOutputs(skill: Skill): Record<string, any> {
    const outputs: Record<string, any> = {};

    // Check integration points
    if (skill.metadata.integration?.writesTo) {
      for (const target of skill.metadata.integration.writesTo) {
        outputs[target] = {
          type: 'file',
          description: `Output to ${target}`,
        };
      }
    }

    // Default output
    outputs.result = {
      type: 'object',
      description: 'Skill execution result',
    };

    return outputs;
  }

  /**
   * Get action description for a skill
   * @param skill Skill to describe
   * @returns Action description
   */
  private getActionDescription(skill: Skill): string {
    // Use skill description as action
    return skill.metadata.description;
  }

  /**
   * Validate a skill chain
   * @param chain Chain to validate
   * @returns Validation result
   */
  validateChain(chain: SkillChain): ChainValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if chain has steps
    if (chain.steps.length === 0) {
      errors.push('Chain has no steps');
    }

    // Check for missing inputs
    for (let i = 0; i < chain.steps.length; i++) {
      const step = chain.steps[i];

      // Check if required inputs are provided by previous steps
      for (const [inputName, inputDef] of Object.entries(step.inputs)) {
        if (inputDef.required && !inputDef.default) {
          // Check if any previous step provides this input
          const provided = chain.steps
            .slice(0, i)
            .some((prevStep) => prevStep.outputs[inputName]);

          if (!provided) {
            warnings.push(
              `Step ${step.stepNumber}: Required input '${inputName}' may not be provided`
            );
          }
        }
      }
    }

    // Check for circular data flow
    const dataFlow = this.analyzeDataFlow(chain);
    if (dataFlow.hasCycles) {
      errors.push('Circular data flow detected in chain');
    }

    const valid = errors.length === 0;

    return {
      valid,
      errors,
      warnings,
    };
  }

  /**
   * Analyze data flow in a chain
   * @param chain Chain to analyze
   * @returns Data flow analysis
   */
  private analyzeDataFlow(chain: SkillChain): DataFlowAnalysis {
    const graph = new Map<number, Set<number>>();

    // Build data flow graph
    for (let i = 0; i < chain.steps.length; i++) {
      const step = chain.steps[i];
      graph.set(i, new Set());

      // Check which previous steps this step depends on
      for (const inputName of Object.keys(step.inputs)) {
        for (let j = 0; j < i; j++) {
          const prevStep = chain.steps[j];
          if (prevStep.outputs[inputName]) {
            graph.get(i)!.add(j);
          }
        }
      }
    }

    // Check for cycles (simplified)
    const hasCycles = false; // In a linear chain, there shouldn't be cycles

    return {
      graph,
      hasCycles,
    };
  }
}

/**
 * Skill chain definition
 */
export interface SkillChain {
  skill: string;
  steps: SkillChainStep[];
  estimatedDuration: number;
  requiredPermissions: Permission[];
  errors: string[];
  warnings: string[];
  status: 'ready' | 'running' | 'completed' | 'failed';
}

/**
 * Skill chain step
 */
export interface SkillChainStep {
  stepNumber: number;
  skill: Skill;
  action: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  estimatedDuration: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

/**
 * Permission definition
 */
export interface Permission {
  type: 'filesystem' | 'network' | 'system' | 'env';
  scope: string;
  reason: string;
}

/**
 * Chain validation result
 */
export interface ChainValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Data flow analysis
 */
interface DataFlowAnalysis {
  graph: Map<number, Set<number>>;
  hasCycles: boolean;
}

/**
 * Events emitted by SkillChainBuilder:
 * 
 * - 'chain:built' - Chain built successfully
 * - 'chain:build-failed' - Chain build failed
 */
