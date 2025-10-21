/**
 * Configuration Loader for Claude Skills System
 * Loads and validates configuration from .kiro/config/skills.yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import type {
  SkillsConfig,
  ConfigValidationResult,
} from './types.js';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: SkillsConfig = {
  skills: {
    enabled: true,
    autoDiscovery: true,
    watchForChanges: true,
    skillsDirectory: 'skills',
    cacheDirectory: '.kiro/cache',
  },
  security: {
    sandbox: true,
    requireApproval: true,
    trustedSources: ['official', 'verified'],
    maxExecutionTime: 30000,
    allowedPaths: ['src', 'scripts', '.kiro/skills-system'],
    blockedPaths: ['node_modules', '.git', '.env'],
  },
  performance: {
    maxActiveSkills: 10,
    maxContextTokens: 150000,
    cacheSize: 100,
    tokenCacheTTL: 300000,
  },
  discovery: {
    metadataFiles: ['SKILL.yaml', 'SKILL.md'],
    requiredFields: ['name', 'version', 'description'],
    validateOnDiscovery: true,
  },
  activation: {
    fuzzyMatchThreshold: 0.8,
    maxSuggestions: 5,
    autoActivateOnExactMatch: false,
  },
  marketplace: {
    enabled: false,
    url: 'https://skills.kiro.dev',
    autoUpdate: false,
    updateCheckInterval: 86400000,
  },
  logging: {
    level: 'info',
    logDiscovery: true,
    logActivation: true,
    logExecution: true,
  },
};

/**
 * Configuration Loader class
 */
export class ConfigLoader {
  private config: SkillsConfig;
  private configPath: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.configPath = path.join(workspaceRoot, '.kiro', 'config', 'skills.yaml');
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Load configuration from file
   * Falls back to default config if file doesn't exist
   */
  public load(): SkillsConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf8');
        const loadedConfig = yaml.load(fileContent) as Partial<SkillsConfig>;
        
        // Deep merge with defaults
        this.config = this.mergeWithDefaults(loadedConfig);
        
        // Validate configuration
        const validation = this.validate();
        if (!validation.valid) {
          console.warn('Configuration validation failed:', validation.errors);
          console.warn('Using default configuration');
          this.config = DEFAULT_CONFIG;
        }
      } else {
        console.info(`Configuration file not found at ${this.configPath}, using defaults`);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      console.info('Using default configuration');
      this.config = DEFAULT_CONFIG;
    }

    return this.config;
  }

  /**
   * Get current configuration
   */
  public getConfig(): SkillsConfig {
    return this.config;
  }

  /**
   * Validate configuration
   */
  public validate(): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate skills settings
    if (typeof this.config.skills.enabled !== 'boolean') {
      errors.push('skills.enabled must be a boolean');
    }

    // Validate security settings
    if (this.config.security.maxExecutionTime <= 0) {
      errors.push('security.maxExecutionTime must be positive');
    }
    if (this.config.security.maxExecutionTime > 300000) {
      warnings.push('security.maxExecutionTime is very high (>5 minutes)');
    }

    // Validate performance settings
    if (this.config.performance.maxActiveSkills <= 0) {
      errors.push('performance.maxActiveSkills must be positive');
    }
    if (this.config.performance.maxContextTokens <= 0) {
      errors.push('performance.maxContextTokens must be positive');
    }
    if (this.config.performance.maxContextTokens > 200000) {
      warnings.push('performance.maxContextTokens exceeds Claude API limits');
    }

    // Validate activation settings
    if (
      this.config.activation.fuzzyMatchThreshold < 0 ||
      this.config.activation.fuzzyMatchThreshold > 1
    ) {
      errors.push('activation.fuzzyMatchThreshold must be between 0 and 1');
    }

    // Validate logging settings
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(this.config.logging.level)) {
      errors.push(`logging.level must be one of: ${validLogLevels.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Save current configuration to file
   */
  public save(): void {
    try {
      const yamlContent = yaml.dump(this.config, {
        indent: 2,
        lineWidth: 100,
      });

      // Ensure directory exists
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(this.configPath, yamlContent, 'utf8');
      console.info(`Configuration saved to ${this.configPath}`);
    } catch (error) {
      console.error('Error saving configuration:', error);
      throw error;
    }
  }

  /**
   * Deep merge loaded config with defaults
   */
  private mergeWithDefaults(loaded: Partial<SkillsConfig>): SkillsConfig {
    return {
      skills: { ...DEFAULT_CONFIG.skills, ...loaded.skills },
      security: { ...DEFAULT_CONFIG.security, ...loaded.security },
      performance: { ...DEFAULT_CONFIG.performance, ...loaded.performance },
      discovery: { ...DEFAULT_CONFIG.discovery, ...loaded.discovery },
      activation: { ...DEFAULT_CONFIG.activation, ...loaded.activation },
      marketplace: { ...DEFAULT_CONFIG.marketplace, ...loaded.marketplace },
      logging: { ...DEFAULT_CONFIG.logging, ...loaded.logging },
    };
  }

  /**
   * Get configuration value by path (e.g., 'skills.enabled')
   */
  public get(path: string): unknown {
    const keys = path.split('.');
    let value: unknown = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Set configuration value by path
   */
  public set(path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop();

    if (!lastKey) {
      throw new Error('Invalid configuration path');
    }

    let target: Record<string, unknown> = this.config as unknown as Record<string, unknown>;

    for (const key of keys) {
      if (!(key in target)) {
        target[key] = {};
      }
      target = target[key] as Record<string, unknown>;
    }

    target[lastKey] = value;
  }
}

/**
 * Singleton instance
 */
let configLoaderInstance: ConfigLoader | null = null;

/**
 * Get or create ConfigLoader instance
 */
export function getConfigLoader(workspaceRoot?: string): ConfigLoader {
  if (!configLoaderInstance) {
    configLoaderInstance = new ConfigLoader(workspaceRoot);
    configLoaderInstance.load();
  }
  return configLoaderInstance;
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetConfigLoader(): void {
  configLoaderInstance = null;
}
