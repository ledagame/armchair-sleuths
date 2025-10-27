/**
 * DependencyManager - Resolves and manages all types of dependencies
 * 
 * This module handles skill dependencies, package dependencies, and API dependencies,
 * ensuring all requirements are met before script execution.
 */

import { Skill } from './types';
import { SkillRegistry } from './SkillRegistry';
import { PackageManager, InstallResult } from './PackageManager';
import { DependencyGraph } from './DependencyGraph';

/**
 * Dependency types
 */
export enum DependencyType {
  SKILL = 'skill',
  PACKAGE = 'package',
  API = 'api',
}

/**
 * Dependency information
 */
export interface Dependency {
  /** Dependency type */
  type: DependencyType;
  
  /** Dependency name */
  name: string;
  
  /** Required version (for packages) */
  version?: string;
  
  /** Whether dependency is required */
  required: boolean;
}

/**
 * Dependency resolution result
 */
export interface DependencyResolution {
  /** Resolved skill dependencies */
  skills: Skill[];
  
  /** Resolved package dependencies */
  packages: PackageInfo[];
  
  /** Resolved API dependencies */
  apis: APIInfo[];
  
  /** Missing dependencies */
  missing: Dependency[];
  
  /** Errors encountered */
  errors: DependencyError[];
  
  /** Whether all required dependencies are resolved */
  allResolved: boolean;
}

/**
 * Package information
 */
export interface PackageInfo {
  /** Package name */
  name: string;
  
  /** Installed version */
  version: string;
  
  /** Whether package is installed */
  installed: boolean;
}

/**
 * API information
 */
export interface APIInfo {
  /** API name */
  name: string;
  
  /** Whether API is available */
  available: boolean;
  
  /** API endpoint if applicable */
  endpoint?: string;
}

/**
 * Dependency error
 */
export interface DependencyError {
  /** Dependency type */
  type: DependencyType;
  
  /** Dependency name */
  dependency: string;
  
  /** Error message */
  message: string;
  
  /** Suggested fix */
  fix?: string;
}

/**
 * Installation options
 */
export interface InstallOptions {
  /** Whether to install missing packages */
  installPackages?: boolean;
  
  /** Whether to install dev dependencies */
  installDev?: boolean;
  
  /** Timeout for installation in milliseconds */
  timeout?: number;
}

/**
 * DependencyManager - Manages all types of dependencies
 */
export class DependencyManager {
  private skillRegistry: SkillRegistry;
  private packageManager: PackageManager;
  private dependencyGraph: DependencyGraph;
  private apiRegistry: Map<string, APIInfo> = new Map();

  constructor(
    skillRegistry: SkillRegistry,
    packageManager: PackageManager,
    dependencyGraph: DependencyGraph
  ) {
    this.skillRegistry = skillRegistry;
    this.packageManager = packageManager;
    this.dependencyGraph = dependencyGraph;
  }

  /**
   * Resolve all dependencies for a skill
   */
  async resolveDependencies(skill: Skill): Promise<DependencyResolution> {
    const resolution: DependencyResolution = {
      skills: [],
      packages: [],
      apis: [],
      missing: [],
      errors: [],
      allResolved: true,
    };

    // Resolve skill dependencies
    await this.resolveSkillDependencies(skill, resolution);

    // Resolve package dependencies
    await this.resolvePackageDependencies(skill, resolution);

    // Resolve API dependencies
    await this.resolveAPIDependencies(skill, resolution);

    // Check if all required dependencies are resolved
    resolution.allResolved = resolution.missing.length === 0 && resolution.errors.length === 0;

    return resolution;
  }

  /**
   * Install missing dependencies
   */
  async installDependencies(
    skill: Skill,
    options: InstallOptions = {}
  ): Promise<InstallResult> {
    const resolution = await this.resolveDependencies(skill);

    if (!options.installPackages) {
      return {
        success: false,
        installed: [],
        failed: [],
        errors: [{
          package: '',
          message: 'Package installation is disabled',
        }],
        output: '',
      };
    }

    // Get missing packages
    const missingPackages = resolution.missing
      .filter(dep => dep.type === DependencyType.PACKAGE)
      .map(dep => dep.version ? `${dep.name}@${dep.version}` : dep.name);

    if (missingPackages.length === 0) {
      return {
        success: true,
        installed: [],
        failed: [],
        errors: [],
        output: 'No missing packages to install',
      };
    }

    // Install missing packages
    return await this.packageManager.install(missingPackages);
  }

  /**
   * Check if all dependencies are satisfied
   */
  async areDependenciesSatisfied(skill: Skill): Promise<boolean> {
    const resolution = await this.resolveDependencies(skill);
    return resolution.allResolved;
  }

  /**
   * Get missing dependencies
   */
  async getMissingDependencies(skill: Skill): Promise<Dependency[]> {
    const resolution = await this.resolveDependencies(skill);
    return resolution.missing;
  }

  /**
   * Get dependency errors
   */
  async getDependencyErrors(skill: Skill): Promise<DependencyError[]> {
    const resolution = await this.resolveDependencies(skill);
    return resolution.errors;
  }

  /**
   * Register an API
   */
  registerAPI(name: string, info: APIInfo): void {
    this.apiRegistry.set(name, info);
  }

  /**
   * Unregister an API
   */
  unregisterAPI(name: string): void {
    this.apiRegistry.delete(name);
  }

  /**
   * Check if API is available
   */
  isAPIAvailable(name: string): boolean {
    const api = this.apiRegistry.get(name);
    return api?.available || false;
  }

  /**
   * Resolve skill dependencies
   */
  private async resolveSkillDependencies(
    skill: Skill,
    resolution: DependencyResolution
  ): Promise<void> {
    const skillDeps = skill.metadata.dependencies.skills || [];

    for (const depName of skillDeps) {
      const depSkill = this.skillRegistry.findByName(depName);

      if (!depSkill) {
        resolution.missing.push({
          type: DependencyType.SKILL,
          name: depName,
          required: true,
        });
        resolution.errors.push({
          type: DependencyType.SKILL,
          dependency: depName,
          message: `Required skill '${depName}' not found`,
          fix: `Install skill '${depName}' or remove it from dependencies`,
        });
        resolution.allResolved = false;
      } else {
        resolution.skills.push(depSkill);

        // Recursively resolve dependencies
        const subResolution = await this.resolveDependencies(depSkill);
        resolution.skills.push(...subResolution.skills);
        resolution.packages.push(...subResolution.packages);
        resolution.apis.push(...subResolution.apis);
        resolution.missing.push(...subResolution.missing);
        resolution.errors.push(...subResolution.errors);
      }
    }

    // Remove duplicates
    resolution.skills = this.removeDuplicateSkills(resolution.skills);
  }

  /**
   * Resolve package dependencies
   */
  private async resolvePackageDependencies(
    skill: Skill,
    resolution: DependencyResolution
  ): Promise<void> {
    const packageDeps = skill.metadata.dependencies.packages || [];

    for (const packageSpec of packageDeps) {
      const [packageName, version] = this.parsePackageSpec(packageSpec);
      const installed = await this.packageManager.isInstalled(packageName);

      if (!installed) {
        resolution.missing.push({
          type: DependencyType.PACKAGE,
          name: packageName,
          version,
          required: true,
        });
        resolution.errors.push({
          type: DependencyType.PACKAGE,
          dependency: packageName,
          message: `Required package '${packageName}' not installed`,
          fix: `Run: npm install ${packageSpec}`,
        });
        resolution.allResolved = false;
      } else {
        const installedVersion = await this.packageManager.getVersion(packageName);
        resolution.packages.push({
          name: packageName,
          version: installedVersion || '',
          installed: true,
        });
      }
    }
  }

  /**
   * Resolve API dependencies
   */
  private async resolveAPIDependencies(
    skill: Skill,
    resolution: DependencyResolution
  ): Promise<void> {
    const apiDeps = skill.metadata.dependencies.apis || [];

    for (const apiName of apiDeps) {
      const api = this.apiRegistry.get(apiName);

      if (!api || !api.available) {
        resolution.missing.push({
          type: DependencyType.API,
          name: apiName,
          required: true,
        });
        resolution.errors.push({
          type: DependencyType.API,
          dependency: apiName,
          message: `Required API '${apiName}' not available`,
          fix: `Ensure API '${apiName}' is configured and accessible`,
        });
        resolution.allResolved = false;
      } else {
        resolution.apis.push(api);
      }
    }
  }

  /**
   * Parse package specification (name@version)
   */
  private parsePackageSpec(spec: string): [string, string] {
    const parts = spec.split('@');

    if (spec.startsWith('@')) {
      // Scoped package: @scope/package@version
      if (parts.length >= 3) {
        const name = `@${parts[1]}`;
        const version = parts.slice(2).join('@');
        return [name, version];
      } else {
        return [spec, 'latest'];
      }
    } else {
      // Regular package: package@version
      if (parts.length >= 2) {
        const name = parts[0];
        const version = parts.slice(1).join('@');
        return [name, version];
      } else {
        return [spec, 'latest'];
      }
    }
  }

  /**
   * Remove duplicate skills
   */
  private removeDuplicateSkills(skills: Skill[]): Skill[] {
    const seen = new Set<string>();
    const unique: Skill[] = [];

    for (const skill of skills) {
      if (!seen.has(skill.metadata.name)) {
        seen.add(skill.metadata.name);
        unique.push(skill);
      }
    }

    return unique;
  }

  /**
   * Get dependency tree for a skill
   */
  async getDependencyTree(skill: Skill): Promise<DependencyTree> {
    const tree: DependencyTree = {
      skill: skill.metadata.name,
      dependencies: [],
    };

    const resolution = await this.resolveDependencies(skill);

    // Add skill dependencies
    for (const depSkill of resolution.skills) {
      const subTree = await this.getDependencyTree(depSkill);
      tree.dependencies.push(subTree);
    }

    return tree;
  }

  /**
   * Detect circular dependencies
   */
  async detectCircularDependencies(skill: Skill): Promise<string[] | null> {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = async (currentSkill: Skill): Promise<string[] | null> => {
      visited.add(currentSkill.metadata.name);
      stack.add(currentSkill.metadata.name);

      const skillDeps = currentSkill.metadata.dependencies.skills || [];

      for (const depName of skillDeps) {
        const depSkill = this.skillRegistry.findByName(depName);

        if (!depSkill) continue;

        if (stack.has(depName)) {
          // Circular dependency found
          return Array.from(stack).concat(depName);
        }

        if (!visited.has(depName)) {
          const circular = await dfs(depSkill);
          if (circular) return circular;
        }
      }

      stack.delete(currentSkill.metadata.name);
      return null;
    };

    return dfs(skill);
  }
}

/**
 * Dependency tree structure
 */
export interface DependencyTree {
  /** Skill name */
  skill: string;
  
  /** Child dependencies */
  dependencies: DependencyTree[];
}

/**
 * Create a dependency manager
 */
export function createDependencyManager(
  skillRegistry: SkillRegistry,
  packageManager: PackageManager,
  dependencyGraph: DependencyGraph
): DependencyManager {
  return new DependencyManager(skillRegistry, packageManager, dependencyGraph);
}
