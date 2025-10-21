import { EventEmitter } from 'events';
import type { Skill, SkillMetadata } from './types.js';

/**
 * DependencyGraph - Manages skill dependencies and execution order
 * 
 * This class provides:
 * - Dependency graph construction
 * - Circular dependency detection
 * - Topological sorting for execution order
 * - Dependency resolution
 */
export class DependencyGraph extends EventEmitter {
  private graph: Map<string, Set<string>>; // skill -> dependencies
  private reverseGraph: Map<string, Set<string>>; // skill -> dependents

  constructor() {
    super();
    this.graph = new Map();
    this.reverseGraph = new Map();
  }

  /**
   * Add a skill to the dependency graph
   * @param skill Skill to add
   */
  addSkill(skill: Skill): void {
    const name = skill.metadata.name;
    const dependencies = skill.metadata.dependencies.skills || [];

    // Initialize graph nodes
    if (!this.graph.has(name)) {
      this.graph.set(name, new Set());
    }

    if (!this.reverseGraph.has(name)) {
      this.reverseGraph.set(name, new Set());
    }

    // Add dependencies
    for (const dep of dependencies) {
      this.graph.get(name)!.add(dep);

      // Update reverse graph
      if (!this.reverseGraph.has(dep)) {
        this.reverseGraph.set(dep, new Set());
      }
      this.reverseGraph.get(dep)!.add(name);
    }

    this.emit('graph:skill-added', {
      name,
      dependencies,
      timestamp: new Date(),
    });
  }

  /**
   * Remove a skill from the dependency graph
   * @param name Skill name
   */
  removeSkill(name: string): void {
    // Remove from graph
    const dependencies = this.graph.get(name);
    if (dependencies) {
      for (const dep of dependencies) {
        this.reverseGraph.get(dep)?.delete(name);
      }
    }
    this.graph.delete(name);

    // Remove from reverse graph
    const dependents = this.reverseGraph.get(name);
    if (dependents) {
      for (const dependent of dependents) {
        this.graph.get(dependent)?.delete(name);
      }
    }
    this.reverseGraph.delete(name);

    this.emit('graph:skill-removed', {
      name,
      timestamp: new Date(),
    });
  }

  /**
   * Get direct dependencies of a skill
   * @param name Skill name
   * @returns Array of dependency names
   */
  getDependencies(name: string): string[] {
    return Array.from(this.graph.get(name) || []);
  }

  /**
   * Get direct dependents of a skill (skills that depend on this skill)
   * @param name Skill name
   * @returns Array of dependent names
   */
  getDependents(name: string): string[] {
    return Array.from(this.reverseGraph.get(name) || []);
  }

  /**
   * Get all transitive dependencies of a skill (recursive)
   * @param name Skill name
   * @returns Array of all dependency names
   */
  getAllDependencies(name: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (skillName: string) => {
      if (visited.has(skillName)) {
        return;
      }

      visited.add(skillName);

      const deps = this.graph.get(skillName) || new Set();
      for (const dep of deps) {
        visit(dep);
        result.push(dep);
      }
    };

    visit(name);

    return result;
  }

  /**
   * Check if a skill has dependencies
   * @param name Skill name
   * @returns True if skill has dependencies
   */
  hasDependencies(name: string): boolean {
    const deps = this.graph.get(name);
    return deps !== undefined && deps.size > 0;
  }

  /**
   * Check if a skill has dependents
   * @param name Skill name
   * @returns True if skill has dependents
   */
  hasDependents(name: string): boolean {
    const dependents = this.reverseGraph.get(name);
    return dependents !== undefined && dependents.size > 0;
  }

  /**
   * Detect circular dependencies
   * @returns Array of circular dependency chains
   */
  detectCircularDependencies(): CircularDependency[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: CircularDependency[] = [];

    const detectCycle = (
      skillName: string,
      path: string[]
    ): boolean => {
      visited.add(skillName);
      recursionStack.add(skillName);
      path.push(skillName);

      const deps = this.graph.get(skillName) || new Set();

      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (detectCycle(dep, [...path])) {
            return true;
          }
        } else if (recursionStack.has(dep)) {
          // Found a cycle
          const cycleStart = path.indexOf(dep);
          const cycle = path.slice(cycleStart);
          cycle.push(dep); // Complete the cycle

          cycles.push({
            cycle,
            severity: 'error',
            message: `Circular dependency detected: ${cycle.join(' -> ')}`,
          });

          return true;
        }
      }

      recursionStack.delete(skillName);
      return false;
    };

    // Check all skills
    for (const skillName of this.graph.keys()) {
      if (!visited.has(skillName)) {
        detectCycle(skillName, []);
      }
    }

    if (cycles.length > 0) {
      this.emit('graph:circular-dependencies', {
        cycles,
        timestamp: new Date(),
      });
    }

    return cycles;
  }

  /**
   * Perform topological sort to get execution order
   * @param skills Array of skill names to sort
   * @returns Sorted array of skill names, or null if circular dependency exists
   */
  topologicalSort(skills: string[]): string[] | null {
    // Check for circular dependencies first
    const cycles = this.detectCircularDependencies();
    if (cycles.length > 0) {
      this.emit('graph:sort-failed', {
        reason: 'Circular dependencies detected',
        cycles,
        timestamp: new Date(),
      });
      return null;
    }

    // Build subgraph for the given skills
    const subgraph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Initialize subgraph
    for (const skill of skills) {
      subgraph.set(skill, new Set());
      inDegree.set(skill, 0);
    }

    // Build subgraph edges
    for (const skill of skills) {
      const deps = this.graph.get(skill) || new Set();

      for (const dep of deps) {
        if (skills.includes(dep)) {
          subgraph.get(skill)!.add(dep);
          inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
        }
      }
    }

    // Kahn's algorithm for topological sort
    const queue: string[] = [];
    const result: string[] = [];

    // Find all nodes with in-degree 0
    for (const [skill, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(skill);
      }
    }

    while (queue.length > 0) {
      const skill = queue.shift()!;
      result.push(skill);

      // Reduce in-degree of dependents
      const deps = subgraph.get(skill) || new Set();
      for (const dep of deps) {
        const newDegree = (inDegree.get(dep) || 0) - 1;
        inDegree.set(dep, newDegree);

        if (newDegree === 0) {
          queue.push(dep);
        }
      }
    }

    // Check if all skills were processed
    if (result.length !== skills.length) {
      this.emit('graph:sort-failed', {
        reason: 'Not all skills could be sorted',
        processed: result.length,
        total: skills.length,
        timestamp: new Date(),
      });
      return null;
    }

    // Reverse to get execution order (dependencies first)
    result.reverse();

    this.emit('graph:sorted', {
      skills: result,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Resolve dependencies for a skill
   * @param name Skill name
   * @param availableSkills Set of available skill names
   * @returns Resolution result
   */
  resolveDependencies(
    name: string,
    availableSkills: Set<string>
  ): DependencyResolution {
    const allDeps = this.getAllDependencies(name);
    const missing: string[] = [];
    const resolved: string[] = [];

    for (const dep of allDeps) {
      if (availableSkills.has(dep)) {
        resolved.push(dep);
      } else {
        missing.push(dep);
      }
    }

    const success = missing.length === 0;

    if (!success) {
      this.emit('graph:resolution-failed', {
        skill: name,
        missing,
        timestamp: new Date(),
      });
    }

    return {
      skill: name,
      resolved,
      missing,
      success,
    };
  }

  /**
   * Get execution order for a skill and its dependencies
   * @param name Skill name
   * @param availableSkills Set of available skill names
   * @returns Execution order or null if dependencies cannot be resolved
   */
  getExecutionOrder(
    name: string,
    availableSkills: Set<string>
  ): string[] | null {
    // Resolve dependencies
    const resolution = this.resolveDependencies(name, availableSkills);

    if (!resolution.success) {
      return null;
    }

    // Get all skills to execute (including the target skill)
    const skillsToExecute = [...resolution.resolved, name];

    // Sort topologically
    return this.topologicalSort(skillsToExecute);
  }

  /**
   * Clear the dependency graph
   */
  clear(): void {
    this.graph.clear();
    this.reverseGraph.clear();

    this.emit('graph:cleared', {
      timestamp: new Date(),
    });
  }

  /**
   * Get graph statistics
   * @returns Graph statistics
   */
  getStats(): GraphStats {
    let totalDependencies = 0;
    let maxDependencies = 0;
    let skillsWithDeps = 0;

    for (const deps of this.graph.values()) {
      const depCount = deps.size;
      totalDependencies += depCount;

      if (depCount > 0) {
        skillsWithDeps++;
      }

      if (depCount > maxDependencies) {
        maxDependencies = depCount;
      }
    }

    return {
      totalSkills: this.graph.size,
      totalDependencies,
      skillsWithDependencies: skillsWithDeps,
      maxDependencies,
      averageDependencies:
        skillsWithDeps > 0 ? totalDependencies / skillsWithDeps : 0,
    };
  }
}

/**
 * Circular dependency information
 */
export interface CircularDependency {
  cycle: string[];
  severity: 'error' | 'warning';
  message: string;
}

/**
 * Dependency resolution result
 */
export interface DependencyResolution {
  skill: string;
  resolved: string[];
  missing: string[];
  success: boolean;
}

/**
 * Graph statistics
 */
export interface GraphStats {
  totalSkills: number;
  totalDependencies: number;
  skillsWithDependencies: number;
  maxDependencies: number;
  averageDependencies: number;
}

/**
 * Events emitted by DependencyGraph:
 * 
 * - 'graph:skill-added' - Skill added to graph
 * - 'graph:skill-removed' - Skill removed from graph
 * - 'graph:circular-dependencies' - Circular dependencies detected
 * - 'graph:sort-failed' - Topological sort failed
 * - 'graph:sorted' - Skills sorted successfully
 * - 'graph:resolution-failed' - Dependency resolution failed
 * - 'graph:cleared' - Graph cleared
 */
