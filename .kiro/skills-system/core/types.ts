/**
 * Type definitions for the Skills System
 */

export interface SkillMetadata {
  // Basic information
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;

  // Activation triggers
  triggers: string[];

  // Dependencies
  dependencies: {
    skills?: string[];
    apis?: string[];
    packages?: string[];
  };

  // Capabilities
  capabilities: SkillCapability[];

  // Configuration
  config?: Record<string, any>;

  // npm scripts
  npmScripts?: Record<string, string>;

  // Documentation
  documentation?: {
    readme?: string;
    references?: string[];
  };

  // Integration points
  integration?: {
    readsFrom?: string[];
    writesTo?: string[];
    influences?: string[];
  };

  // Version history
  changelog?: ChangelogEntry[];
}

export interface SkillCapability {
  name: string;
  description: string;
  script?: string;
  usage?: string;
  parameters?: CapabilityParameter[];
  examples?: string[];
}

export interface CapabilityParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  default?: any;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface Skill {
  metadata: SkillMetadata;
  promptContent: string;
  readmeContent?: string;
  path: string;
  lastModified: Date;
  status: 'active' | 'inactive' | 'error';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SkillsConfig {
  skills: {
    enabled: boolean;
    autoDiscovery: boolean;
    watchForChanges: boolean;
    skillsDirectory: string;
    cacheDirectory: string;
  };
  security: {
    sandbox: boolean;
    requireApproval: boolean;
    trustedSources: string[];
    maxExecutionTime: number;
    allowedPaths: string[];
    blockedPaths: string[];
  };
  performance: {
    maxActiveSkills: number;
    maxContextTokens: number;
    cacheSize: number;
    tokenCacheTTL: number;
  };
  discovery: {
    metadataFiles: string[];
    requiredFields: string[];
    validateOnDiscovery: boolean;
  };
  activation: {
    fuzzyMatchThreshold: number;
    maxSuggestions: number;
    autoActivateOnExactMatch: boolean;
  };
  marketplace: {
    enabled: boolean;
    url: string;
    autoUpdate: boolean;
    updateCheckInterval: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    logDiscovery: boolean;
    logActivation: boolean;
    logExecution: boolean;
  };
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
