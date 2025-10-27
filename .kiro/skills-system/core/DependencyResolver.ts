import { EventEmitter } from 'events';
import type { Skill } from './types.js';
import type { SkillRegistry } from './SkillRegistry.js';
import type {
  DependencyGraph,
  CircularDependency,
} from './DependencyGraph.js';

/**
 * DependencyResolver - Resolves skill dependencies recursively
 * 
 * This class provides:
 * - Recursive dependency resolution
 * - Circular dependency detection and handling
 * - Missing dependency detection
 * - Package and API dependency checking
 */
export class DependencyResolver extends EventEmitter {
  private registry: SkillRegistry;
  private dependencyGraph: DependencyGraph;

  constructor(registry: SkillRegistry, dependencyGraph: DependencyGraph) {
    super();
    this.registry = registry;
    this.dependencyGraph = dependencyGraph;
  }

  /**
   * Resolve all dependencies for a skill
   * @param skill Skill to resolve dependencies for
   * @returns Resolution result with all dependencies and errors
   */
  resolveDependencies(skill: Skill): DependencyResolutionResult {
    const result: DependencyResolutionResult = {
      skill: skill.metadata.name,
      skills: [],
      packages: [],
      apis: [],
      errors: [],
      warnings: [],
      circularDependencies: [],
    };

    // Check for circular dependencies first
    const circularDeps = this.detectCircularDependencies(skill);
    if (circularDeps.length > 0) {
      result.circularDependencies = circularDeps;
      result.warnings.push({
        type: 'circular_dependency',
        message: `Circular dependencies detected: ${circularDeps.map((cd) => cd.cycle.join(' -> ')).join('; ')}`,
        severity: 'warning',
        suggestion:
          'Remove one dependency from the cycle to break the circular dependency',
      });

      this.emit('resolver:circular-dependencies', {
        skill: skill.metadata.name,
        cycles: circularDeps,
        timestamp: new Date(),
      });
    }

    // Resolve skill dependencies (with cycle prevention)
    const visited = new Set<string>();
    this.resolveSkillDependencies(skill, result, visited);

    // Resolve package dependencies
    this.resolvePackageDependencies(skill, result);

    // Resolve API dependencies
    this.resolveAPIDependencies(skill, result);

    // Emit resolution event
    const success = result.errors.length === 0;
    this.emit('resolver:resolved', {
      skill: skill.metadata.name,
      success,
      skillCount: result.skills.length,
      packageCount: result.packages.length,
      apiCount: result.apis.length,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Resolve dependencies for multiple skills
   * @param skills Array of skills
   * @returns Combined resolution result
   */
  resolveMultipleDependencies(
    skills: Skill[]
  ): DependencyResolutionResult {
    const combinedResult: DependencyResolutionResult = {
      skill: skills.map((s) => s.metadata.name).join(', '),
      skills: [],
      packages: [],
      apis: [],
      errors: [],
      warnings: [],
      circularDependencies: [],
    };

    const allSkillNames = new Set<string>();
    const allPackages = new Set<string>();
    const allAPIs = new Set<string>();

    for (const skill of skills) {
      const result = this.resolveDependencies(skill);

      // Merge skills
      for (const depSkill of result.skills) {
        if (!allSkillNames.has(depSkill.metadata.name)) {
          allSkillNames.add(depSkill.metadata.name);
          combinedResult.skills.push(depSkill);
        }
      }

      // Merge packages
      for (const pkg of result.packages) {
        if (!allPackages.has(pkg.name)) {
          allPackages.add(pkg.name);
          combinedResult.packages.push(pkg);
        }
      }

      // Merge APIs
      for (const api of result.apis) {
        if (!allAPIs.has(api.name)) {
          allAPIs.add(api.name);
          combinedResult.apis.push(api);
        }
      }

      // Merge errors and warnings
      combinedResult.errors.push(...result.errors);
      combinedResult.warnings.push(...result.warnings);
      combinedResult.circularDependencies.push(
        ...result.circularDependencies
      );
    }

    return combinedResult;
  }

  /**
   * Check if all dependencies are available
   * @param skill Skill to check
   * @returns True if all dependencies are available
   */
  areDependenciesAvailable(skill: Skill): boolean {
    const result = this.resolveDependencies(skill);
    return result.errors.length === 0;
  }

  /**
   * Get missing dependencies for a skill
   * @param skill Skill to check
   * @returns Array of missing dependency names
   */
  getMissingDependencies(skill: Skill): string[] {
    const result = this.resolveDependencies(skill);
    return result.errors
      .filter((err) => err.type === 'missing_skill')
      .map((err) => err.dependency);
  }

  /**
   * Detect circular dependencies for a skill
   * @param skill Skill to check
   * @returns Array of circular dependency chains
   */
  private detectCircularDependencies(skill: Skill): CircularDependency[] {
    // Use DependencyGraph to detect cycles
    const cycles = this.dependencyGraph.detectCircularDependencies();

    // Filter cycles that involve this skill
    return cycles.filter((cycle) =>
      cycle.cycle.includes(skill.metadata.name)
    );
  }

  /**
   * Resolve skill dependencies recursively
   * @param skill Current skill
   * @param result Result object to populate
   * @param visited Set of visited skill names (to prevent infinite loops)
   */
  private resolveSkillDependencies(
    skill: Skill,
    result: DependencyResolutionResult,
    visited: Set<string>
  ): void {
    const skillName = skill.metadata.name;

    // Skip if already visited (prevents infinite loops in circular dependencies)
    if (visited.has(skillName)) {
      return;
    }

    visited.add(skillName);

    const skillDeps = skill.metadata.dependencies.skills || [];

    for (const depName of skillDeps) {
      // Check if dependency exists
      const depSkill = this.registry.getSkill(depName);

      if (!depSkill) {
        // Missing dependency
        result.errors.push({
          type: 'missing_skill',
          dependency: depName,
          message: `Required skill '${depName}' not found in registry`,
          severity: 'error',
          suggestion: `Install or create the '${depName}' skill`,
        });

        this.emit('resolver:missing-dependency', {
          skill: skillName,
          dependency: depName,
          type: 'skill',
          timestamp: new Date(),
        });

        continue;
      }

      // Check if dependency is in error state
      if (depSkill.status === 'error') {
        result.warnings.push({
          type: 'dependency_error',
          message: `Dependency '${depName}' is in error state`,
          severity: 'warning',
          suggestion: `Fix errors in '${depName}' skill before using`,
        });
      }

      // Add to result if not already added
      if (!result.skills.find((s) => s.metadata.name === depName)) {
        result.skills.push(depSkill);
      }

      // Recursively resolve dependencies of this dependency
      this.resolveSkillDependencies(depSkill, result, visited);
    }
  }

  /**
   * Resolve package dependencies
   * @param skill Skill to resolve packages for
   * @param result Result object to populate
   */
  private resolvePackageDependencies(
    skill: Skill,
    result: DependencyResolutionResult
  ): void {
    const packages = skill.metadata.dependencies.packages || [];

    for (const pkgSpec of packages) {
      // Parse package specification (name@version or just name)
      const [name, version] = this.parsePackageSpec(pkgSpec);

      // Check if package is installed (simplified check)
      const isInstalled = this.isPackageInstalled(name);

      if (!isInstalled) {
        result.errors.push({
          type: 'missing_package',
          dependency: name,
          message: `Required package '${name}' is not installed`,
          severity: 'error',
          suggestion: `Run: npm install ${pkgSpec}`,
        });

        this.emit('resolver:missing-dependency', {
          skill: skill.metadata.name,
          dependency: name,
          type: 'package',
          timestamp: new Date(),
        });
      } else {
        result.packages.push({
          name,
          version: version || 'latest',
          installed: true,
        });
      }
    }
  }

  /**
   * Resolve API dependencies
   * @param skill Skill to resolve APIs for
   * @param result Result object to populate
   */
  private resolveAPIDependencies(
    skill: Skill,
    result: DependencyResolutionResult
  ): void {
    const apis = skill.metadata.dependencies.apis || [];

    for (const apiName of apis) {
      // Check if API is available (simplified check)
      const isAvailable = this.isAPIAvailable(apiName);

      if (!isAvailable) {
        result.warnings.push({
          type: 'missing_api',
          message: `Required API '${apiName}' may not be available`,
          severity: 'warning',
          suggestion: `Ensure '${apiName}' API is configured and accessible`,
        });

        this.emit('resolver:missing-dependency', {
          skill: skill.metadata.name,
          dependency: apiName,
          type: 'api',
          timestamp: new Date(),
        });
      }

      result.apis.push({
        name: apiName,
        available: isAvailable,
      });
    }
  }

  /**
   * Parse package specification
   * @param spec Package spec (e.g., "package@1.0.0" or "package")
   * @returns [name, version]
   */
  private parsePackageSpec(spec: string): [string, string | undefined] {
    const parts = spec.split('@');

    if (parts.length === 1) {
      return [parts[0], undefined];
    }

    // Handle scoped packages (@scope/package@version)
    if (spec.startsWith('@')) {
      if (parts.length === 2) {
        return [spec, undefined];
      }
      return [`@${parts[1]}`, parts[2]];
    }

    return [parts[0], parts[1]];
  }

  /**
   * Check if a package is installed
   * @param packageName Package name
   * @returns True if installed
   */
  private isPackageInstalled(packageName: string): boolean {
    try {
      // Try to resolve the package
      require.resolve(packageName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if an API is available
   * @param apiName API name
   * @returns True if available
   */
  private isAPIAvailable(apiName: string): boolean {
    // Simplified check - in real implementation, this would check:
    // - Environment variables
    // - API configuration
    // - Network connectivity
    // - API key validity

    // For now, just check if there's an env var for this API
    const envVarName = `${apiName.toUpperCase().replace(/-/g, '_')}_API_KEY`;
    return process.env[envVarName] !== undefined;
  }
}

/**
 * Dependency resolution result
 */
export interface DependencyResolutionResult {
  skill: string;
  skills: Skill[];
  packages: PackageInfo[];
  apis: APIInfo[];
  errors: DependencyError[];
  warnings: DependencyWarning[];
  circularDependencies: CircularDependency[];
}

/**
 * Package information
 */
export interface PackageInfo {
  name: string;
  version: string;
  installed: boolean;
}

/**
 * API information
 */
export interface APIInfo {
  name: string;
  available: boolean;
}

/**
 * Dependency error
 */
export interface DependencyError {
  type: 'missing_skill' | 'missing_package' | 'missing_api';
  dependency: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion: string;
}

/**
 * Dependency warning
 */
export interface DependencyWarning {
  type:
    | 'circular_dependency'
    | 'dependency_error'
    | 'missing_api'
    | 'version_mismatch';
  message: string;
  severity: 'warning' | 'info';
  suggestion: string;
}

/**
 * Events emitted by DependencyResolver:
 * 
 * - 'resolver:resolved' - Dependencies resolved successfully
 * - 'resolver:circular-dependencies' - Circular dependencies detected
 * - 'resolver:missing-dependency' - Missing dependency found
 */
