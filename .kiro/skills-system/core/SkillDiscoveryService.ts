import { EventEmitter } from 'events';
import { join } from 'path';
import { SkillScanner } from './SkillScanner.js';
import { MetadataParser } from './MetadataParser.js';
import { SkillValidator } from './SkillValidator.js';
import { KeywordIndexer } from './KeywordIndexer.js';
import type {
  Skill,
  SkillMetadata,
  ValidationResult,
  ParseResult,
} from './types.js';

/**
 * SkillRegistry - In-memory registry of all discovered skills
 */
export type SkillRegistry = Map<string, Skill>;

/**
 * SkillDiscoveryService - Central service for discovering, validating, and indexing skills
 * 
 * This service integrates:
 * - SkillScanner: Scans and watches the skills directory
 * - MetadataParser: Parses SKILL.yaml and SKILL.md files
 * - SkillValidator: Validates skill structure and metadata
 * - KeywordIndexer: Builds keyword index for fast lookup
 */
export class SkillDiscoveryService extends EventEmitter {
  private scanner: SkillScanner;
  private parser: MetadataParser;
  private validator: SkillValidator;
  private indexer: KeywordIndexer;
  private registry: SkillRegistry;
  private skillsDir: string;
  private isInitialized: boolean = false;

  constructor(skillsDir: string = './skills') {
    super();
    this.skillsDir = skillsDir;
    this.scanner = new SkillScanner(skillsDir);
    this.parser = new MetadataParser();
    this.validator = new SkillValidator();
    this.indexer = new KeywordIndexer();
    this.registry = new Map();

    // Forward scanner events
    this.setupScannerEventHandlers();
  }

  /**
   * Scan skills directory and build registry
   * @returns Registry of all discovered skills
   */
  async scanSkills(): Promise<SkillRegistry> {
    this.emit('discovery:started', {
      skillsDir: this.skillsDir,
      timestamp: new Date(),
    });

    try {
      // Scan for skill folders
      const skillFolders = await this.scanner.scanSkills();

      this.emit('discovery:scan-complete', {
        count: skillFolders.length,
        folders: skillFolders,
      });

      // Process each skill folder
      const processedSkills: SkillMetadata[] = [];

      for (const skillFolder of skillFolders) {
        const skillPath = join(this.skillsDir, skillFolder);

        try {
          // Parse skill metadata
          const skill = await this.processSkill(skillPath, skillFolder);

          if (skill) {
            this.registry.set(skill.metadata.name, skill);
            processedSkills.push(skill.metadata);

            this.emit('skill:registered', {
              name: skill.metadata.name,
              version: skill.metadata.version,
              path: skillPath,
            });
          }
        } catch (error) {
          this.emit('skill:error', {
            folder: skillFolder,
            path: skillPath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Build keyword index
      this.indexer.buildIndex(processedSkills);

      this.emit('discovery:index-built', {
        stats: this.indexer.getStats(),
      });

      this.isInitialized = true;

      this.emit('discovery:complete', {
        totalSkills: this.registry.size,
        validSkills: Array.from(this.registry.values()).filter(
          (s) => s.status === 'active'
        ).length,
        errorSkills: Array.from(this.registry.values()).filter(
          (s) => s.status === 'error'
        ).length,
        timestamp: new Date(),
      });

      return this.registry;
    } catch (error) {
      this.emit('discovery:error', {
        error: error instanceof Error ? error.message : String(error),
        skillsDir: this.skillsDir,
      });
      throw error;
    }
  }

  /**
   * Start watching skills directory for changes
   */
  watchSkills(): void {
    if (!this.isInitialized) {
      throw new Error(
        'SkillDiscoveryService must be initialized with scanSkills() before watching'
      );
    }

    this.scanner.watchSkills();

    this.emit('watch:started', {
      skillsDir: this.skillsDir,
      timestamp: new Date(),
    });
  }

  /**
   * Stop watching skills directory
   */
  async stopWatching(): Promise<void> {
    await this.scanner.stopWatching();

    this.emit('watch:stopped', {
      timestamp: new Date(),
    });
  }

  /**
   * Get the skill registry
   * @returns Current skill registry
   */
  getRegistry(): SkillRegistry {
    return this.registry;
  }

  /**
   * Get the keyword indexer
   * @returns Keyword indexer instance
   */
  getIndexer(): KeywordIndexer {
    return this.indexer;
  }

  /**
   * Get a skill by name
   * @param name Skill name
   * @returns Skill or undefined
   */
  getSkill(name: string): Skill | undefined {
    return this.registry.get(name);
  }

  /**
   * Get all skills
   * @returns Array of all skills
   */
  getAllSkills(): Skill[] {
    return Array.from(this.registry.values());
  }

  /**
   * Search for skills by keyword
   * @param query Search query
   * @param fuzzy Enable fuzzy matching
   * @returns Array of matching skills with scores
   */
  searchSkills(query: string, fuzzy: boolean = true) {
    const results = this.indexer.search(query, fuzzy);

    return results.map((result) => ({
      skill: this.registry.get(result.skillName),
      score: result.score,
    }));
  }

  /**
   * Validate a skill
   * @param skillPath Path to skill folder
   * @returns Validation result
   */
  async validateSkill(skillPath: string): Promise<ValidationResult> {
    try {
      // Parse metadata
      const parseResult = await this.parser.parseSkillMetadata(skillPath);

      if (!parseResult.success || !parseResult.data) {
        return {
          valid: false,
          errors: [
            {
              field: 'metadata',
              message: parseResult.error || 'Failed to parse metadata',
              severity: 'error',
            },
          ],
          warnings: [],
        };
      }

      // Validate
      const validationResult = await this.validator.validateSkill(
        skillPath,
        parseResult.data.metadata
      );

      return validationResult;
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            field: 'general',
            message: error instanceof Error ? error.message : String(error),
            severity: 'error',
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * Parse skill metadata
   * @param skillPath Path to skill folder
   * @returns Skill metadata
   */
  async parseSkillMetadata(skillPath: string): Promise<SkillMetadata | null> {
    try {
      const parseResult = await this.parser.parseSkillMetadata(skillPath);

      if (!parseResult.success || !parseResult.data) {
        return null;
      }

      return parseResult.data.metadata;
    } catch (error) {
      return null;
    }
  }

  /**
   * Process a skill folder: parse, validate, and create Skill object
   * @param skillPath Absolute path to skill folder
   * @param skillFolder Skill folder name
   * @returns Skill object or null if processing failed
   */
  private async processSkill(
    skillPath: string,
    skillFolder: string
  ): Promise<Skill | null> {
    try {
      // Parse metadata and prompt content
      const parseResult = await this.parser.parseSkillMetadata(skillPath);

      if (!parseResult.success || !parseResult.data) {
        this.emit('skill:parse-error', {
          folder: skillFolder,
          path: skillPath,
          error: parseResult.error || 'Failed to parse skill',
        });
        return null;
      }

      const { metadata, promptContent } = parseResult.data;

      // Validate skill
      const validationResult = await this.validator.validateSkill(
        skillPath,
        metadata
      );

      // Determine skill status
      let status: 'active' | 'inactive' | 'error' = 'active';

      if (!validationResult.valid) {
        status = 'error';
        this.emit('skill:validation-error', {
          name: metadata.name,
          path: skillPath,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        });
      } else if (validationResult.warnings.length > 0) {
        this.emit('skill:validation-warning', {
          name: metadata.name,
          path: skillPath,
          warnings: validationResult.warnings,
        });
      }

      // Try to read README.md
      let readmeContent: string | undefined;
      try {
        const readmeResult = await this.parser.parseMarkdown(
          join(skillPath, 'README.md')
        );
        if (readmeResult.success && readmeResult.data) {
          readmeContent = readmeResult.data;
        }
      } catch (error) {
        // README is optional, ignore error
      }

      // Get file modification time
      const { stat } = await import('fs/promises');
      const stats = await stat(skillPath);

      // Create Skill object
      const skill: Skill = {
        metadata,
        promptContent,
        readmeContent,
        path: skillPath,
        lastModified: stats.mtime,
        status,
      };

      return skill;
    } catch (error) {
      this.emit('skill:process-error', {
        folder: skillFolder,
        path: skillPath,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Setup event handlers for scanner events
   */
  private setupScannerEventHandlers(): void {
    // Skill discovered during initial scan
    this.scanner.on('skill:discovered', async (event) => {
      this.emit('scanner:skill-discovered', event);
    });

    // Skill added (became valid)
    this.scanner.on('skill:added', async (event) => {
      const skill = await this.processSkill(event.path, event.name);

      if (skill) {
        this.registry.set(skill.metadata.name, skill);
        this.indexer.addSkill(skill.metadata);

        this.emit('skill:added', {
          name: skill.metadata.name,
          version: skill.metadata.version,
          path: event.path,
        });
      }
    });

    // Skill modified
    this.scanner.on('skill:modified', async (event) => {
      const skill = await this.processSkill(event.path, event.name);

      if (skill) {
        // Remove old skill from index
        const oldSkill = this.registry.get(skill.metadata.name);
        if (oldSkill) {
          this.indexer.removeSkill(oldSkill.metadata.name);
        }

        // Update registry and index
        this.registry.set(skill.metadata.name, skill);
        this.indexer.addSkill(skill.metadata);

        this.emit('skill:modified', {
          name: skill.metadata.name,
          version: skill.metadata.version,
          path: event.path,
          file: event.file,
        });
      }
    });

    // Skill removed
    this.scanner.on('skill:removed', (event) => {
      const skill = this.registry.get(event.name);

      if (skill) {
        this.registry.delete(skill.metadata.name);
        this.indexer.removeSkill(skill.metadata.name);

        this.emit('skill:removed', {
          name: skill.metadata.name,
          path: event.path,
        });
      }
    });

    // Skill invalidated (required files removed)
    this.scanner.on('skill:invalidated', (event) => {
      const skill = this.registry.get(event.name);

      if (skill) {
        skill.status = 'error';

        this.emit('skill:invalidated', {
          name: skill.metadata.name,
          path: event.path,
          reason: event.reason,
        });
      }
    });

    // Scanner errors
    this.scanner.on('scan:error', (event) => {
      this.emit('scanner:error', event);
    });

    this.scanner.on('watch:error', (event) => {
      this.emit('scanner:watch-error', event);
    });
  }
}

/**
 * Events emitted by SkillDiscoveryService:
 * 
 * Discovery Events:
 * - 'discovery:started' - Discovery process started
 * - 'discovery:scan-complete' - Initial scan completed
 * - 'discovery:index-built' - Keyword index built
 * - 'discovery:complete' - Discovery process completed
 * - 'discovery:error' - Error during discovery
 * 
 * Skill Events:
 * - 'skill:registered' - Skill registered in registry
 * - 'skill:added' - New skill added (during watch)
 * - 'skill:modified' - Skill modified (during watch)
 * - 'skill:removed' - Skill removed (during watch)
 * - 'skill:invalidated' - Skill became invalid
 * - 'skill:error' - Error processing skill
 * - 'skill:parse-error' - Error parsing skill metadata
 * - 'skill:validation-error' - Skill validation failed
 * - 'skill:validation-warning' - Skill has validation warnings
 * - 'skill:process-error' - Error during skill processing
 * 
 * Watch Events:
 * - 'watch:started' - File watching started
 * - 'watch:stopped' - File watching stopped
 * 
 * Scanner Events (forwarded):
 * - 'scanner:skill-discovered' - Scanner discovered a skill
 * - 'scanner:error' - Scanner error
 * - 'scanner:watch-error' - Scanner watch error
 */

