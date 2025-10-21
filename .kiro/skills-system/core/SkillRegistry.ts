import { EventEmitter } from 'events';
import type { Skill, SkillMetadata } from './types.js';

/**
 * SkillRegistry - In-memory registry for managing skills
 * 
 * This class provides:
 * - Thread-safe CRUD operations for skills
 * - Efficient lookup by name
 * - Filtering and searching capabilities
 * - Event emission for registry changes
 */
export class SkillRegistry extends EventEmitter {
  private skills: Map<string, Skill>;
  private operationLock: Promise<void> = Promise.resolve();

  constructor() {
    super();
    this.skills = new Map();
  }

  /**
   * Add a skill to the registry
   * @param skill Skill to add
   * @returns True if added, false if already exists
   */
  async addSkill(skill: Skill): Promise<boolean> {
    return this.withLock(async () => {
      const name = skill.metadata.name;

      if (this.skills.has(name)) {
        this.emit('registry:add-failed', {
          name,
          reason: 'Skill already exists',
          timestamp: new Date(),
        });
        return false;
      }

      this.skills.set(name, skill);

      this.emit('registry:skill-added', {
        name,
        version: skill.metadata.version,
        status: skill.status,
        timestamp: new Date(),
      });

      return true;
    });
  }

  /**
   * Update a skill in the registry
   * @param skill Updated skill
   * @returns True if updated, false if not found
   */
  async updateSkill(skill: Skill): Promise<boolean> {
    return this.withLock(async () => {
      const name = skill.metadata.name;

      if (!this.skills.has(name)) {
        this.emit('registry:update-failed', {
          name,
          reason: 'Skill not found',
          timestamp: new Date(),
        });
        return false;
      }

      const oldSkill = this.skills.get(name)!;
      this.skills.set(name, skill);

      this.emit('registry:skill-updated', {
        name,
        oldVersion: oldSkill.metadata.version,
        newVersion: skill.metadata.version,
        oldStatus: oldSkill.status,
        newStatus: skill.status,
        timestamp: new Date(),
      });

      return true;
    });
  }

  /**
   * Remove a skill from the registry
   * @param name Skill name
   * @returns True if removed, false if not found
   */
  async removeSkill(name: string): Promise<boolean> {
    return this.withLock(async () => {
      if (!this.skills.has(name)) {
        this.emit('registry:remove-failed', {
          name,
          reason: 'Skill not found',
          timestamp: new Date(),
        });
        return false;
      }

      const skill = this.skills.get(name)!;
      this.skills.delete(name);

      this.emit('registry:skill-removed', {
        name,
        version: skill.metadata.version,
        timestamp: new Date(),
      });

      return true;
    });
  }

  /**
   * Get a skill by name
   * @param name Skill name
   * @returns Skill or undefined
   */
  getSkill(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  /**
   * Check if a skill exists
   * @param name Skill name
   * @returns True if exists
   */
  hasSkill(name: string): boolean {
    return this.skills.has(name);
  }

  /**
   * Get all skills
   * @returns Array of all skills
   */
  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get all skill names
   * @returns Array of skill names
   */
  getAllSkillNames(): string[] {
    return Array.from(this.skills.keys());
  }

  /**
   * Get skills by status
   * @param status Skill status
   * @returns Array of skills with the given status
   */
  getSkillsByStatus(status: 'active' | 'inactive' | 'error'): Skill[] {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.status === status
    );
  }

  /**
   * Get skills by author
   * @param author Author name
   * @returns Array of skills by the author
   */
  getSkillsByAuthor(author: string): Skill[] {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.metadata.author === author
    );
  }

  /**
   * Search skills by name or description
   * @param query Search query
   * @returns Array of matching skills
   */
  searchSkills(query: string): Skill[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.skills.values()).filter((skill) => {
      const nameMatch = skill.metadata.name.toLowerCase().includes(lowerQuery);
      const descMatch = skill.metadata.description
        .toLowerCase()
        .includes(lowerQuery);

      return nameMatch || descMatch;
    });
  }

  /**
   * Filter skills by predicate
   * @param predicate Filter function
   * @returns Array of matching skills
   */
  filterSkills(predicate: (skill: Skill) => boolean): Skill[] {
    return Array.from(this.skills.values()).filter(predicate);
  }

  /**
   * Get registry size
   * @returns Number of skills in registry
   */
  size(): number {
    return this.skills.size;
  }

  /**
   * Clear all skills from registry
   */
  async clear(): Promise<void> {
    return this.withLock(async () => {
      const count = this.skills.size;
      this.skills.clear();

      this.emit('registry:cleared', {
        count,
        timestamp: new Date(),
      });
    });
  }

  /**
   * Get registry statistics
   * @returns Registry statistics
   */
  getStats(): RegistryStats {
    const skills = Array.from(this.skills.values());

    return {
      total: skills.length,
      active: skills.filter((s) => s.status === 'active').length,
      inactive: skills.filter((s) => s.status === 'inactive').length,
      error: skills.filter((s) => s.status === 'error').length,
      authors: new Set(
        skills.map((s) => s.metadata.author).filter(Boolean)
      ).size,
    };
  }

  /**
   * Export registry as JSON
   * @returns Registry data as JSON
   */
  toJSON(): RegistryExport {
    const skills = Array.from(this.skills.values()).map((skill) => ({
      metadata: skill.metadata,
      path: skill.path,
      lastModified: skill.lastModified.toISOString(),
      status: skill.status,
    }));

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      skills,
    };
  }

  /**
   * Import registry from JSON
   * @param data Registry export data
   */
  async fromJSON(data: RegistryExport): Promise<void> {
    return this.withLock(async () => {
      this.skills.clear();

      for (const skillData of data.skills) {
        const skill: Skill = {
          metadata: skillData.metadata,
          promptContent: '', // Will be loaded from file
          path: skillData.path,
          lastModified: new Date(skillData.lastModified),
          status: skillData.status,
        };

        this.skills.set(skill.metadata.name, skill);
      }

      this.emit('registry:imported', {
        count: data.skills.length,
        timestamp: new Date(),
      });
    });
  }

  /**
   * Execute operation with lock to ensure thread safety
   * @param operation Operation to execute
   * @returns Operation result
   */
  private async withLock<T>(operation: () => Promise<T>): Promise<T> {
    // Wait for previous operation to complete
    await this.operationLock;

    // Create new lock for this operation
    let resolve: () => void;
    this.operationLock = new Promise((r) => {
      resolve = r;
    });

    try {
      // Execute operation
      const result = await operation();
      return result;
    } finally {
      // Release lock
      resolve!();
    }
  }
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
  authors: number;
}

/**
 * Registry export format
 */
export interface RegistryExport {
  version: string;
  exportedAt: string;
  skills: Array<{
    metadata: SkillMetadata;
    path: string;
    lastModified: string;
    status: 'active' | 'inactive' | 'error';
  }>;
}

/**
 * Events emitted by SkillRegistry:
 * 
 * - 'registry:skill-added' - Skill added to registry
 * - 'registry:skill-updated' - Skill updated in registry
 * - 'registry:skill-removed' - Skill removed from registry
 * - 'registry:add-failed' - Failed to add skill
 * - 'registry:update-failed' - Failed to update skill
 * - 'registry:remove-failed' - Failed to remove skill
 * - 'registry:cleared' - Registry cleared
 * - 'registry:imported' - Registry imported from JSON
 */
