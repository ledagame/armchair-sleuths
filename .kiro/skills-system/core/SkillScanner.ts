import { watch, FSWatcher } from 'chokidar';
import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { EventEmitter } from 'events';

/**
 * SkillScanner - Scans and watches the skills directory for valid skill folders
 * 
 * A valid skill folder must contain either:
 * - SKILL.md or PROMPT.md (skill prompt file)
 * - SKILL.yaml (skill metadata file)
 */
export class SkillScanner extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private skillsDir: string;
  private isWatching: boolean = false;

  constructor(skillsDir: string = './skills') {
    super();
    this.skillsDir = skillsDir;
  }

  /**
   * Scan the skills directory and find all valid skill folders
   * @returns Array of skill folder paths relative to skillsDir
   */
  async scanSkills(): Promise<string[]> {
    const skillFolders: string[] = [];

    try {
      const entries = await readdir(this.skillsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillPath = join(this.skillsDir, entry.name);
          
          if (await this.isValidSkillFolder(skillPath)) {
            skillFolders.push(entry.name);
            this.emit('skill:discovered', {
              name: entry.name,
              path: skillPath,
            });
          }
        }
      }

      this.emit('scan:complete', {
        count: skillFolders.length,
        skills: skillFolders,
      });

      return skillFolders;
    } catch (error) {
      this.emit('scan:error', {
        error: error instanceof Error ? error.message : String(error),
        skillsDir: this.skillsDir,
      });
      throw error;
    }
  }

  /**
   * Start watching the skills directory for changes
   */
  watchSkills(): void {
    if (this.isWatching) {
      console.warn('SkillScanner is already watching');
      return;
    }

    this.watcher = watch(this.skillsDir, {
      persistent: true,
      ignoreInitial: true,
      depth: 2, // Watch skill folders and their immediate children
      ignored: /(^|[\/\\])\../, // Ignore dotfiles
    });

    this.watcher
      .on('add', (path) => this.handleFileAdded(path))
      .on('change', (path) => this.handleFileChanged(path))
      .on('unlink', (path) => this.handleFileRemoved(path))
      .on('addDir', (path) => this.handleDirAdded(path))
      .on('unlinkDir', (path) => this.handleDirRemoved(path))
      .on('error', (error) => this.handleWatchError(error as Error));

    this.isWatching = true;
    this.emit('watch:started', { skillsDir: this.skillsDir });
  }

  /**
   * Stop watching the skills directory
   */
  async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.isWatching = false;
      this.emit('watch:stopped');
    }
  }

  /**
   * Check if a folder is a valid skill folder
   * @param folderPath Absolute path to the folder
   * @returns true if the folder contains required skill files
   */
  private async isValidSkillFolder(folderPath: string): Promise<boolean> {
    try {
      const files = await readdir(folderPath);
      
      // Check for SKILL.md, PROMPT.md, or SKILL.yaml
      const hasSkillMd = files.includes('SKILL.md');
      const hasPromptMd = files.includes('PROMPT.md');
      const hasSkillYaml = files.includes('SKILL.yaml');

      return hasSkillMd || hasPromptMd || hasSkillYaml;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the skill name from a file path
   * @param filePath Path to a file within a skill folder
   * @returns Skill name (folder name) or null if not in a skill folder
   */
  private getSkillNameFromPath(filePath: string): string | null {
    const relativePath = relative(this.skillsDir, filePath);
    const parts = relativePath.split(/[\/\\]/);
    
    // If the file is directly in skillsDir, it's not in a skill folder
    if (parts.length < 2) {
      return null;
    }

    return parts[0];
  }

  /**
   * Handle file added event
   */
  private async handleFileAdded(filePath: string): Promise<void> {
    const skillName = this.getSkillNameFromPath(filePath);
    
    if (!skillName) return;

    const skillPath = join(this.skillsDir, skillName);
    
    if (await this.isValidSkillFolder(skillPath)) {
      this.emit('skill:added', {
        name: skillName,
        path: skillPath,
        file: filePath,
      });
    }
  }

  /**
   * Handle file changed event
   */
  private handleFileChanged(filePath: string): void {
    const skillName = this.getSkillNameFromPath(filePath);
    
    if (!skillName) return;

    this.emit('skill:modified', {
      name: skillName,
      path: join(this.skillsDir, skillName),
      file: filePath,
    });
  }

  /**
   * Handle file removed event
   */
  private async handleFileRemoved(filePath: string): Promise<void> {
    const skillName = this.getSkillNameFromPath(filePath);
    
    if (!skillName) return;

    const skillPath = join(this.skillsDir, skillName);
    
    // Check if the skill folder is still valid after file removal
    try {
      const isValid = await this.isValidSkillFolder(skillPath);
      
      if (!isValid) {
        this.emit('skill:invalidated', {
          name: skillName,
          path: skillPath,
          reason: 'Required files removed',
        });
      } else {
        this.emit('skill:modified', {
          name: skillName,
          path: skillPath,
          file: filePath,
        });
      }
    } catch (error) {
      // Folder might have been deleted
      this.emit('skill:removed', {
        name: skillName,
        path: skillPath,
      });
    }
  }

  /**
   * Handle directory added event
   */
  private async handleDirAdded(dirPath: string): Promise<void> {
    const skillName = this.getSkillNameFromPath(dirPath);
    
    if (!skillName) return;

    const skillPath = join(this.skillsDir, skillName);
    
    if (await this.isValidSkillFolder(skillPath)) {
      this.emit('skill:discovered', {
        name: skillName,
        path: skillPath,
      });
    }
  }

  /**
   * Handle directory removed event
   */
  private handleDirRemoved(dirPath: string): void {
    const skillName = this.getSkillNameFromPath(dirPath);
    
    if (!skillName) return;

    this.emit('skill:removed', {
      name: skillName,
      path: join(this.skillsDir, skillName),
    });
  }

  /**
   * Handle watch error
   */
  private handleWatchError(error: Error): void {
    this.emit('watch:error', {
      error: error.message,
      skillsDir: this.skillsDir,
    });
  }
}

/**
 * Events emitted by SkillScanner:
 * 
 * - 'skill:discovered' - New skill folder found
 * - 'skill:added' - Skill became valid (required files added)
 * - 'skill:modified' - Skill files changed
 * - 'skill:removed' - Skill folder deleted
 * - 'skill:invalidated' - Skill became invalid (required files removed)
 * - 'scan:complete' - Initial scan completed
 * - 'scan:error' - Error during scanning
 * - 'watch:started' - File watching started
 * - 'watch:stopped' - File watching stopped
 * - 'watch:error' - Error during file watching
 */
