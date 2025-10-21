import type { Skill } from './types.js';
import type { DependencyGraph, CircularDependency } from './DependencyGraph.js';
import type { SkillRegistry } from './SkillRegistry.js';

/**
 * DependencyResolver - Resolves skill dependencies recursively
 * 
 * This class provides:
 * - Recursive dependency resolution
 * - Missing dependency detection
 * - Package and API dependency checking
 * - Circular dependency detection
 * - Execution order calculation
 */
export class DependencyResolver {
  private graph: DependencyGraph;
  private registry: SkillRegistry;

  constructor(graph: DependencyGraph, registry: SkillRegistry) {
    this.graph = graph;
    this.registry = registry;
  }

  /**
   * Resolve all dependencies for a skill
   * @param skillName Name of the skill
   * @returns Resolution result with all dependencies
   */
  resolve(skillName: string): ResolutionResult {
    const skill = this.registry.getSkill(skillName);

    if (!skill) {
      return {
        success: false,
        skill: null,
        dependencies: {
          skills: [],
          packages: [],
          apis: [],
        },
        missing: {
          skills: [skillName],
          packages: [],
          apis: [],
        },
        errors: [
          {
            type: 'skill_not_found',
            message: `Skill '${skillName}' not found in registry`,
            skillName,
          },
        ],
        executionOrder: null,
      };
    }

    // Check for circular dependencies
    const circularDeps = this.graph.detectCircularDependencies();
    const circularError = circularDeps.find((cycle) =>
      cycle.cycle.includes(skillName)
    );

    if (circularError) {
      return {
        success: false,
        skill,
        dependencies: {
          skills: [],
          packages: [],
          apis: [],
        },
        missing: {
          skills: [],
          packages: [],
          apis: [],
        },
        errors: [
          {
            type: 'circular_dependency',
            message: circularError.message,
            skillName,
            cycle: circularError.cycle,
          },
        ],
        executionOrder: null,
      };
    }

    // Resolve skill dependencies
    const skillDeps = this.resolveSkillDependencies(skillName);

    // Resolve package dependencies
    const packageDeps = this.resolvePackageDependencies(skill);

    // Resolve API dependencies
    const apiDeps = this.resolveAPIDependencies(skill);

    // Calculate execution order
    const executionOrder = this.calculateExecutionOrder(skillName, skillDeps);

    // Check if resolution was successful
    const success =
      skillDeps.missing.length === 0 &&
      packageDeps.missing.length === 0 &&
      apiDeps.missing.length === 0 &&
      executionOrder !== null;

    // Collect all errors
    const errors: ResolutionError[] = [];

    if (skillDeps.missing.length > 0) {
      errors.push({
        type: 'missing_skill_dependency',
        message: `Missing skill dependencies: ${skillDeps.missing.join(', ')}`,
        skillName,
        missing: skillDeps.missing,
      });
    }

    if (packageDeps.missing.length > 0) {
      errors.push({
        type: 'missing_package_dependency',
        message: `Missing package dependencies: ${packageDeps.missing.join(', ')}`,
        skillName,
        missing: packageDeps.missing,
      });
    }

    if (apiDeps.missing.length > 0) {
      errors.push({
        type: 'missing_api_dependency',
        message: `Missing API dependencies: ${apiDeps.missing.join(', ')}`,
        skillName,
        missing: apiDeps.missing,
      });
    }

    return {
      success,
      skill,
      dependencies: {
        skills: skillDeps.resolved,
        packages: packageDeps.resolved,
        apis: apiDeps.resolved,
      },
      missing: {
        skills: skillDeps.missing,
        packages: packageDeps.missing,
        apis: apiDeps.missing,
      },
      errors,
      executionOrder,
    };
  }

  /**
   * Resolve dependencies for multiple skills
   * @param skillNames Array of skill names
   * @returns Array of resolution results
   */
  resolveMultiple(skillNames: string[]): ResolutionResult[] {
    return skillNames.map((name) => this.resolve(name));
  }

  /**
   * Check if a skill's dependencies can be resolved
   * @param skillName Name of the skill
   * @returns True if all dependencies can be resolved
   */
  canResolve(skillName: string): boolean {
    const result = this.resolve(skillName);
    return result.success;
  }

  /**
   * Get missing dependencies for a skill
   * @param skillName Name of the skill
   * @returns Missing dependencies
   */
  getMissingDependencies(skillName: string): MissingDependencies {
    const result = this.resolve(skillName);
    return result.missing;
  }

  /**
   * Get execution order for a skill and its dependencies
   * @param skillName Name of the skill
   * @returns Execution order or null if cannot be resolved
   */
  getExecutionOrder(skillName: string): string[] | null {
    const result = this.resolve(skillName);
    return result.executionOrder;
  }

  /**
   * Resolve skill dependencies recursively
   * @param skillName Name of the skill
   * @returns Resolved and missing skill dependencies
   */
  private resolveSkillDependencies(skillName: string): {
    resolved: Skill[];
    missing: string[];
  } {
    const skill = this.registry.getSkill(skillName);

    if (!skill) {
      return { resolved: [], missing: [skillName] };
    }

    const skillDeps = skill.metadata.dependencies.skills || [];
    const resolved: Skill[] = [];
    const missing: string[] = [];

    // Get all transitive dependencies
    const allDepNames = this.graph.getAllDependencies(skillName);

    // Resolve each dependency
    for (const depName of allDepNames) {
      const depSkill = this.registry.getSkill(depName);

      if (depSkill) {
        resolved.push(depSkill);
      } else {
        missing.push(depName);
      }
    }

    return { resolved, missing };
  }

  /**
   * Resolve package dependencies
   * @param skill Skill to check
   * @returns Resolved and missing package dependencies
   */
  private resolvePackageDependencies(skill: Skill): {
    resolved: PackageDependency[];
    missing: string[];
  } {
    const packages = skill.metadata.dependencies.packages || [];
    const resolved: PackageDependency[] = [];
    const missing: string[] = [];

    for (const pkg of packages) {
      // Parse package name and version
      const [name, version] = this.parsePackageString(pkg);

      // Check if package is available (simplified check)
      // In a real implementation, this would check node_modules or package.json
      const isAvailable = this.isPackageAvailable(name);

      if (isAvailable) {
        resolved.push({
          name,
          version: version || 'latest',
          required: true,
        });
      } else {
        missing.push(pkg);
      }
    }

    return { resolved, missing };
  }

  /**
   * Resolve API dependencies
   * @param skill Skill to check
   * @returns Resolved and missing API dependencies
   */
  private resolveAPIDependencies(skill: Skill): {
    resolved: APIDependency[];
    missing: string[];
  } {
    const apis = skill.metadata.dependencies.apis || [];
    const resolved: APIDependency[] = [];
    const missing: string[] = [];

    for (const api of apis) {
      // Check if API is available (simplified check)
      // In a real implementation, this would check API configuration
      const isAvailable = this.isAPIAvailable(api);

      if (isAvailable) {
        resolved.push({
          name: api,
          available: true,
        });
      } else {
        missing.push(api);
      }
    }

    return { resolved, missing };
  }

  /**
   * Calculate execution order for a skill and its dependencies
   * @param skillName Name of the skill
   * @param dependencies Resolved skill dependencies
   * @returns Execution order or null if cannot be calculated
   */
  private calculateExecutionOrder(
    skillName: string,
    dependencies: { resolved: Skill[]; missing: string[] }
  ): string[] | null {
    // Cannot calculate order if there are missing dependencies
    if (dependencies.missing.length > 0) {
      return null;
    }

    // Get all skill names to execute
    const skillNames = [
      ...dependencies.resolved.map((s) => s.metadata.name),
      skillName,
    ];

    // Use dependency graph to calculate topological order
    return this.graph.topologicalSort(skillNames);
  }

  /**
   * Parse package string into name and version
   * @param pkg Package string (e.g., "lodash@4.17.21" or "lodash")
   * @returns Tuple of [name, version]
   */
  private parsePackageString(pkg: string): [string, string | null] {
    const parts = pkg.split('@');

    if (parts.length === 1) {
      return [parts[0], null];
    }

    // Handle scoped packages (e.g., "@types/node@18.0.0")
    if (pkg.startsWith('@')) {
      if (parts.length === 2) {
        return [pkg, null];
      }
      return [`@${parts[1]}`, parts[2]];
    }

    return [parts[0], parts[1]];
  }

  /**
   * Check if a package is available
   * @param name Package name
   * @returns True if available
   */
  private isPackageAvailable(name: string): boolean {
    // Simplified check - in real implementation, check node_modules or package.json
    // For now, assume all packages are available
    return true;
  }

  /**
   * Check if an API is available
   * @param name API name
   * @returns True if available
   */
  private isAPIAvailable(name: string): boolean {
    // Simplified check - in real implementation, check API configuration
    // For now, assume all APIs are available
    return true;
  }

  /**
   * Get resolver statistics
   * @returns Resolver statistics
   */
  getStats(): ResolverStats {
    const graphStats = this.graph.getStats();
    const registryStats = this.registry.getStats();

    return {
      totalSkills: registryStats.total,
      skillsWithDependencies: graphStats.skillsWithDependencies,
      averageDependencies: graphStats.averageDependencies,
      maxDependencies: graphStats.maxDependencies,
    };
  }
}

/**
 * Resolution result
 */
export interface ResolutionResult {
  /** Whether resolution was successful */
  success: boolean;

  /** The skill being resolved */
  skill: Skill | null;

  /** Resolved dependencies */
  dependencies: {
    skills: Skill[];
    packages: PackageDependency[];
    apis: APIDependency[];
  };

  /** Missing dependencies */
  missing: MissingDependencies;

  /** Resolution errors */
  errors: ResolutionError[];

  /** Execution order (null if cannot be calculated) */
  executionOrder: string[] | null;
}

/**
 * Missing dependencies
 */
export interface MissingDependencies {
  skills: string[];
  packages: string[];
  apis: string[];
}

/**
 * Package dependency
 */
export interface PackageDependency {
  name: string;
  version: string;
  required: boolean;
}

/**
 * API dependency
 */
export interface APIDependency {
  name: string;
  available: boolean;
}

/**
 * Resolution error
 */
export interface ResolutionError {
  type:
    | 'skill_not_found'
    | 'circular_dependency'
    | 'missing_skill_dependency'
    | 'missing_package_dependency'
    | 'missing_api_dependency';
  message: string;
  skillName: string;
  missing?: string[];
  cycle?: string[];
}

/**
 * Resolver statistics
 */
export interface ResolverStats {
  totalSkills: number;
  skillsWithDependencies: number;
  averageDependencies: number;
  maxDependencies: number;
}
