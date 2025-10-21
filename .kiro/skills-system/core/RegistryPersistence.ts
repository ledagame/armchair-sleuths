import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { EventEmitter } from 'events';
import type { SkillRegistry, RegistryExport } from './SkillRegistry.js';

/**
 * RegistryPersistence - Handles saving and loading of skill registry
 * 
 * This class provides:
 * - Save registry to disk
 * - Load registry from disk
 * - Cache invalidation on file changes
 * - Automatic backup creation
 */
export class RegistryPersistence extends EventEmitter {
  private cacheDir: string;
  private cacheFile: string;
  private backupFile: string;

  constructor(cacheDir: string = '.kiro/cache') {
    super();
    this.cacheDir = cacheDir;
    this.cacheFile = join(cacheDir, 'skill-registry.json');
    this.backupFile = join(cacheDir, 'skill-registry.backup.json');
  }

  /**
   * Save registry to disk
   * @param registry Skill registry to save
   */
  async saveRegistry(registry: SkillRegistry): Promise<void> {
    try {
      // Ensure cache directory exists
      await mkdir(this.cacheDir, { recursive: true });

      // Export registry to JSON
      const data = registry.toJSON();
      const json = JSON.stringify(data, null, 2);

      // Create backup of existing cache file
      try {
        const existingData = await readFile(this.cacheFile, 'utf-8');
        await writeFile(this.backupFile, existingData, 'utf-8');

        this.emit('persistence:backup-created', {
          file: this.backupFile,
          timestamp: new Date(),
        });
      } catch (error) {
        // Backup file doesn't exist yet, ignore
      }

      // Write new cache file
      await writeFile(this.cacheFile, json, 'utf-8');

      this.emit('persistence:saved', {
        file: this.cacheFile,
        skillCount: data.skills.length,
        timestamp: new Date(),
      });
    } catch (error) {
      this.emit('persistence:save-error', {
        file: this.cacheFile,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Load registry from disk
   * @param registry Skill registry to load into
   * @returns True if loaded successfully
   */
  async loadRegistry(registry: SkillRegistry): Promise<boolean> {
    try {
      // Read cache file
      const json = await readFile(this.cacheFile, 'utf-8');
      const data: RegistryExport = JSON.parse(json);

      // Validate data format
      if (!this.validateRegistryData(data)) {
        this.emit('persistence:load-error', {
          file: this.cacheFile,
          error: 'Invalid registry data format',
          timestamp: new Date(),
        });
        return false;
      }

      // Import into registry
      await registry.fromJSON(data);

      this.emit('persistence:loaded', {
        file: this.cacheFile,
        skillCount: data.skills.length,
        exportedAt: data.exportedAt,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Cache file doesn't exist yet
        this.emit('persistence:cache-not-found', {
          file: this.cacheFile,
          timestamp: new Date(),
        });
        return false;
      }

      this.emit('persistence:load-error', {
        file: this.cacheFile,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });

      // Try to restore from backup
      return this.restoreFromBackup(registry);
    }
  }

  /**
   * Restore registry from backup file
   * @param registry Skill registry to restore into
   * @returns True if restored successfully
   */
  async restoreFromBackup(registry: SkillRegistry): Promise<boolean> {
    try {
      const json = await readFile(this.backupFile, 'utf-8');
      const data: RegistryExport = JSON.parse(json);

      if (!this.validateRegistryData(data)) {
        return false;
      }

      await registry.fromJSON(data);

      this.emit('persistence:restored-from-backup', {
        file: this.backupFile,
        skillCount: data.skills.length,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      this.emit('persistence:restore-error', {
        file: this.backupFile,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
      return false;
    }
  }

  /**
   * Check if cache file exists
   * @returns True if cache file exists
   */
  async cacheExists(): Promise<boolean> {
    try {
      await readFile(this.cacheFile, 'utf-8');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cache file modification time
   * @returns Modification time or null if file doesn't exist
   */
  async getCacheModifiedTime(): Promise<Date | null> {
    try {
      const { stat } = await import('fs/promises');
      const stats = await stat(this.cacheFile);
      return stats.mtime;
    } catch (error) {
      return null;
    }
  }

  /**
   * Invalidate cache (delete cache file)
   */
  async invalidateCache(): Promise<void> {
    try {
      const { unlink } = await import('fs/promises');
      await unlink(this.cacheFile);

      this.emit('persistence:cache-invalidated', {
        file: this.cacheFile,
        timestamp: new Date(),
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.emit('persistence:invalidate-error', {
          file: this.cacheFile,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Check if cache is stale (older than given time)
   * @param maxAge Maximum age in milliseconds
   * @returns True if cache is stale
   */
  async isCacheStale(maxAge: number): Promise<boolean> {
    const modifiedTime = await this.getCacheModifiedTime();

    if (!modifiedTime) {
      return true;
    }

    const age = Date.now() - modifiedTime.getTime();
    return age > maxAge;
  }

  /**
   * Validate registry data format
   * @param data Registry export data
   * @returns True if valid
   */
  private validateRegistryData(data: any): data is RegistryExport {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (!data.version || typeof data.version !== 'string') {
      return false;
    }

    if (!data.exportedAt || typeof data.exportedAt !== 'string') {
      return false;
    }

    if (!Array.isArray(data.skills)) {
      return false;
    }

    // Validate each skill entry
    for (const skill of data.skills) {
      if (!skill.metadata || typeof skill.metadata !== 'object') {
        return false;
      }

      if (!skill.metadata.name || typeof skill.metadata.name !== 'string') {
        return false;
      }

      if (!skill.path || typeof skill.path !== 'string') {
        return false;
      }

      if (!skill.lastModified || typeof skill.lastModified !== 'string') {
        return false;
      }

      if (!skill.status || !['active', 'inactive', 'error'].includes(skill.status)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get cache file path
   * @returns Cache file path
   */
  getCacheFilePath(): string {
    return this.cacheFile;
  }

  /**
   * Get backup file path
   * @returns Backup file path
   */
  getBackupFilePath(): string {
    return this.backupFile;
  }
}

/**
 * Events emitted by RegistryPersistence:
 * 
 * - 'persistence:saved' - Registry saved to disk
 * - 'persistence:loaded' - Registry loaded from disk
 * - 'persistence:backup-created' - Backup file created
 * - 'persistence:restored-from-backup' - Registry restored from backup
 * - 'persistence:cache-not-found' - Cache file not found
 * - 'persistence:cache-invalidated' - Cache invalidated
 * - 'persistence:save-error' - Error saving registry
 * - 'persistence:load-error' - Error loading registry
 * - 'persistence:restore-error' - Error restoring from backup
 * - 'persistence:invalidate-error' - Error invalidating cache
 */
