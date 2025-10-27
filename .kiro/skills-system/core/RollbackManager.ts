/**
 * RollbackManager - Manages file snapshots and rollback operations
 * 
 * This module creates checkpoints of file states before script execution
 * and provides rollback capabilities to restore previous states.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Checkpoint representing a snapshot of file states
 */
export interface Checkpoint {
  /** Unique identifier for this checkpoint */
  id: string;
  
  /** Timestamp when checkpoint was created */
  timestamp: Date;
  
  /** Working directory that was snapshotted */
  workingDir: string;
  
  /** Map of file paths to their content */
  fileSnapshots: Map<string, string>;
  
  /** Metadata about the checkpoint */
  metadata?: {
    description?: string;
    skillName?: string;
    scriptName?: string;
  };
}

/**
 * File change detected between checkpoint and current state
 */
export interface FileChange {
  /** Path to the file */
  path: string;
  
  /** Type of operation */
  operation: 'create' | 'modify' | 'delete';
  
  /** Content before change (for modify/delete) */
  before?: string;
  
  /** Content after change (for create/modify) */
  after?: string;
  
  /** Hash of content before change */
  beforeHash?: string;
  
  /** Hash of content after change */
  afterHash?: string;
}

/**
 * Rollback result
 */
export interface RollbackResult {
  /** Whether rollback was successful */
  success: boolean;
  
  /** Checkpoint that was restored */
  checkpoint: Checkpoint;
  
  /** Files that were restored */
  restoredFiles: string[];
  
  /** Files that were deleted (created after checkpoint) */
  deletedFiles: string[];
  
  /** Any errors encountered */
  errors: RollbackError[];
}

/**
 * Rollback error
 */
export interface RollbackError {
  /** File path where error occurred */
  path: string;
  
  /** Error message */
  message: string;
  
  /** Original error */
  error: Error;
}

/**
 * Options for creating checkpoints
 */
export interface CheckpointOptions {
  /** Description of the checkpoint */
  description?: string;
  
  /** Skill name associated with this checkpoint */
  skillName?: string;
  
  /** Script name associated with this checkpoint */
  scriptName?: string;
  
  /** File patterns to include (glob patterns) */
  include?: string[];
  
  /** File patterns to exclude (glob patterns) */
  exclude?: string[];
  
  /** Maximum file size to snapshot in bytes */
  maxFileSize?: number;
}

/**
 * RollbackManager - Manages file snapshots and rollback operations
 */
export class RollbackManager {
  private checkpoints: Map<string, Checkpoint> = new Map();
  private checkpointCounter = 0;

  /**
   * Create a checkpoint of the current file state
   */
  async createCheckpoint(
    workingDir: string,
    options: CheckpointOptions = {}
  ): Promise<Checkpoint> {
    const checkpointId = this.generateCheckpointId();
    const fileSnapshots = await this.snapshotFiles(workingDir, options);

    const checkpoint: Checkpoint = {
      id: checkpointId,
      timestamp: new Date(),
      workingDir,
      fileSnapshots,
      metadata: {
        description: options.description,
        skillName: options.skillName,
        scriptName: options.scriptName,
      },
    };

    this.checkpoints.set(checkpointId, checkpoint);
    return checkpoint;
  }

  /**
   * Detect changes between checkpoint and current state
   */
  async detectChanges(
    checkpoint: Checkpoint,
    workingDir: string
  ): Promise<FileChange[]> {
    const currentFiles = await this.scanFiles(workingDir);
    const changes: FileChange[] = [];

    // Detect modifications and deletions
    for (const [filePath, originalContent] of checkpoint.fileSnapshots) {
      const currentContent = currentFiles.get(filePath);

      if (currentContent === undefined) {
        // File was deleted
        changes.push({
          path: filePath,
          operation: 'delete',
          before: originalContent,
          beforeHash: this.hashContent(originalContent),
        });
      } else if (originalContent !== currentContent) {
        // File was modified
        changes.push({
          path: filePath,
          operation: 'modify',
          before: originalContent,
          after: currentContent,
          beforeHash: this.hashContent(originalContent),
          afterHash: this.hashContent(currentContent),
        });
      }
    }

    // Detect new files
    for (const [filePath, currentContent] of currentFiles) {
      if (!checkpoint.fileSnapshots.has(filePath)) {
        changes.push({
          path: filePath,
          operation: 'create',
          after: currentContent,
          afterHash: this.hashContent(currentContent),
        });
      }
    }

    return changes;
  }

  /**
   * Rollback to a checkpoint
   */
  async rollback(checkpointId: string): Promise<RollbackResult> {
    const checkpoint = this.checkpoints.get(checkpointId);
    
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    const restoredFiles: string[] = [];
    const deletedFiles: string[] = [];
    const errors: RollbackError[] = [];

    // Restore all files from checkpoint
    for (const [filePath, content] of checkpoint.fileSnapshots) {
      try {
        // Ensure parent directory exists
        const parentDir = path.dirname(filePath);
        await fs.mkdir(parentDir, { recursive: true });

        // Write file content
        await fs.writeFile(filePath, content, 'utf-8');
        restoredFiles.push(filePath);
      } catch (error) {
        errors.push({
          path: filePath,
          message: `Failed to restore file: ${error.message}`,
          error: error as Error,
        });
      }
    }

    // Delete files created after checkpoint
    const currentFiles = await this.scanFiles(checkpoint.workingDir);
    for (const [filePath] of currentFiles) {
      if (!checkpoint.fileSnapshots.has(filePath)) {
        try {
          await fs.unlink(filePath);
          deletedFiles.push(filePath);
        } catch (error) {
          errors.push({
            path: filePath,
            message: `Failed to delete file: ${error.message}`,
            error: error as Error,
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      checkpoint,
      restoredFiles,
      deletedFiles,
      errors,
    };
  }

  /**
   * Get a checkpoint by ID
   */
  getCheckpoint(checkpointId: string): Checkpoint | undefined {
    return this.checkpoints.get(checkpointId);
  }

  /**
   * Get all checkpoints
   */
  getAllCheckpoints(): Checkpoint[] {
    return Array.from(this.checkpoints.values());
  }

  /**
   * Delete a checkpoint
   */
  deleteCheckpoint(checkpointId: string): boolean {
    return this.checkpoints.delete(checkpointId);
  }

  /**
   * Clear all checkpoints
   */
  clearCheckpoints(): void {
    this.checkpoints.clear();
  }

  /**
   * Get checkpoint count
   */
  getCheckpointCount(): number {
    return this.checkpoints.size;
  }

  /**
   * Preview changes that would be made by rollback
   */
  async previewRollback(checkpointId: string): Promise<FileChange[]> {
    const checkpoint = this.checkpoints.get(checkpointId);
    
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    return this.detectChanges(checkpoint, checkpoint.workingDir);
  }

  /**
   * Snapshot files in a directory
   */
  private async snapshotFiles(
    dir: string,
    options: CheckpointOptions = {}
  ): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    const maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default

    try {
      const entries = await fs.readdir(dir, {
        recursive: true,
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (entry.isFile()) {
          const fullPath = path.join(entry.path, entry.name);
          const relativePath = path.relative(dir, fullPath);

          // Skip if excluded
          if (this.shouldExclude(relativePath, options)) {
            continue;
          }

          // Skip if not included
          if (options.include && !this.shouldInclude(relativePath, options)) {
            continue;
          }

          try {
            // Check file size
            const stats = await fs.stat(fullPath);
            if (stats.size > maxFileSize) {
              console.warn(`Skipping large file: ${fullPath} (${stats.size} bytes)`);
              continue;
            }

            // Read file content
            const content = await fs.readFile(fullPath, 'utf-8');
            files.set(fullPath, content);
          } catch (error) {
            // Skip files that can't be read (binary files, permission issues, etc.)
            console.warn(`Skipping file: ${fullPath} - ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory: ${dir}`, error);
    }

    return files;
  }

  /**
   * Scan files in a directory
   */
  private async scanFiles(dir: string): Promise<Map<string, string>> {
    const files = new Map<string, string>();

    try {
      const entries = await fs.readdir(dir, {
        recursive: true,
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (entry.isFile()) {
          const fullPath = path.join(entry.path, entry.name);

          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            files.set(fullPath, content);
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory: ${dir}`, error);
    }

    return files;
  }

  /**
   * Check if file should be excluded
   */
  private shouldExclude(filePath: string, options: CheckpointOptions): boolean {
    if (!options.exclude) {
      return false;
    }

    // Simple pattern matching (can be enhanced with glob library)
    return options.exclude.some(pattern => {
      return filePath.includes(pattern) || filePath.match(new RegExp(pattern));
    });
  }

  /**
   * Check if file should be included
   */
  private shouldInclude(filePath: string, options: CheckpointOptions): boolean {
    if (!options.include) {
      return true;
    }

    // Simple pattern matching (can be enhanced with glob library)
    return options.include.some(pattern => {
      return filePath.includes(pattern) || filePath.match(new RegExp(pattern));
    });
  }

  /**
   * Generate unique checkpoint ID
   */
  private generateCheckpointId(): string {
    return `checkpoint-${++this.checkpointCounter}-${Date.now()}`;
  }

  /**
   * Hash content for comparison
   */
  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

/**
 * Create a default rollback manager
 */
export function createRollbackManager(): RollbackManager {
  return new RollbackManager();
}
