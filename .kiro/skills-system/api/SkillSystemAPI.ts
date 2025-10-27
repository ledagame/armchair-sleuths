'use server';

/**
 * SkillSystemAPI - Server Actions for Skill System
 * 
 * This module provides server-side API functions that can be called from client components.
 * All functions are Server Actions and handle authentication automatically.
 */

import { SkillDiscoveryService } from '../core/SkillDiscoveryService.js';
import { SkillRegistry } from '../core/SkillRegistry.js';
import { SkillActivator } from '../core/SkillActivator.js';
import { KeywordMatcher } from '../core/KeywordMatcher.js';
import { DependencyResolver } from '../core/DependencyResolver.js';
import { SkillChainBuilder } from '../core/SkillChainBuilder.js';
import { ScriptExecutor } from '../core/ScriptExecutor.js';
import { ContextManager } from '../core/ContextManager.js';
import { ConfigLoader } from '../core/ConfigLoader.js';
import type {
  Skill,
  SkillMetadata,
  ValidationResult,
  SkillsConfig,
} from '../core/types.js';
import type {
  ActivationResult,
  ActiveSkill,
  ActivationStats,
} from '../core/SkillActivator.js';
import type { SkillChain } from '../core/SkillChainBuilder.js';
import type { ExecutionResult } from '../core/ScriptExecutor.js';

/**
 * Singleton instance of the skill system
 */
class SkillSystem {
  private static instance: SkillSystem | null = null;
  
  private discoveryService: SkillDiscoveryService;
  private registry: SkillRegistry;
  private activator: SkillActivator;
  private contextManager: ContextManager;
  private scriptExecutor: ScriptExecutor;
  private config: SkillsConfig;
  private initialized: boolean = false;

  private constructor() {
    // Load configuration
    const configLoader = new ConfigLoader();
    this.config = configLoader.loadConfig();

    // Initialize core components
    const skillsDir = this.config.skills.skillsDirectory;
    this.discoveryService = new SkillDiscoveryService(skillsDir);
    this.registry = new SkillRegistry();
    
    // Initialize keyword matcher
    const keywordMatcher = new KeywordMatcher(
      this.discoveryService.getIndexer(),
      this.config.activation.fuzzyMatchThreshold
    );

    // Initialize dependency resolver
    const dependencyResolver = new DependencyResolver(this.registry);

    // Initialize skill chain builder
    const chainBuilder = new SkillChainBuilder(this.registry);

    // Initialize skill activator
    this.activator = new SkillActivator(
      this.registry,
      keywordMatcher,
      dependencyResolver,
      chainBuilder,
      this.config.performance.maxActiveSkills
    );

    // Initialize context manager
    this.contextManager = new ContextManager(
      this.registry,
      this.config.performance.maxContextTokens
    );

    // Initialize script executor
    this.scriptExecutor = new ScriptExecutor(
      this.config.security.sandbox,
      this.config.security.maxExecutionTime,
      this.config.security.allowedPaths,
      this.config.security.blockedPaths
    );
  }

  static getInstance(): SkillSystem {
    if (!SkillSystem.instance) {
      SkillSystem.instance = new SkillSystem();
    }
    return SkillSystem.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Scan and discover skills
    const discoveredSkills = await this.discoveryService.scanSkills();

    // Populate registry
    for (const [name, skill] of discoveredSkills.entries()) {
      this.registry.registerSkill(skill);
    }

    // Start watching for changes if enabled
    if (this.config.skills.watchForChanges) {
      this.discoveryService.watchSkills();
    }

    this.initialized = true;
  }

  getDiscoveryService(): SkillDiscoveryService {
    return this.discoveryService;
  }

  getRegistry(): SkillRegistry {
    return this.registry;
  }

  getActivator(): SkillActivator {
    return this.activator;
  }

  getContextManager(): ContextManager {
    return this.contextManager;
  }

  getScriptExecutor(): ScriptExecutor {
    return this.scriptExecutor;
  }

  getConfig(): SkillsConfig {
    return this.config;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Initialize the skill system
 * Must be called before using any other API functions
 */
export async function initializeSkillSystem(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const system = SkillSystem.getInstance();
    await system.initialize();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get all discovered skills
 */
export async function getAllSkills(): Promise<Skill[]> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getRegistry().getAllSkills();
}

/**
 * Get a specific skill by name
 */
export async function getSkill(name: string): Promise<Skill | null> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getRegistry().getSkill(name) || null;
}

/**
 * Search for skills by keyword
 */
export async function searchSkills(
  query: string,
  fuzzy: boolean = true
): Promise<Array<{ skill: Skill; score: number }>> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  const results = system.getDiscoveryService().searchSkills(query, fuzzy);
  
  return results
    .filter((r) => r.skill !== undefined)
    .map((r) => ({
      skill: r.skill!,
      score: r.score,
    }));
}

/**
 * Activate skills by keywords
 */
export async function activateByKeywords(
  keywords: string,
  autoActivate: boolean = false
): Promise<ActivationResult> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().activateByKeywords(keywords, autoActivate);
}

/**
 * Activate a specific skill by name
 */
export async function activateSkill(skillName: string): Promise<ActivationResult> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().activateSkill(skillName);
}

/**
 * Activate multiple skills
 */
export async function activateMultipleSkills(
  skillNames: string[]
): Promise<ActivationResult> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().activateMultipleSkills(skillNames);
}

/**
 * Deactivate a skill
 */
export async function deactivateSkill(skillName: string): Promise<boolean> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().deactivateSkill(skillName);
}

/**
 * Deactivate all skills
 */
export async function deactivateAllSkills(): Promise<void> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  system.getActivator().deactivateAll();
}

/**
 * Get all active skills
 */
export async function getActiveSkills(): Promise<Skill[]> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().getActiveSkills();
}

/**
 * Check if a skill is active
 */
export async function isSkillActive(skillName: string): Promise<boolean> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().isSkillActive(skillName);
}

/**
 * Get active skill info
 */
export async function getActiveSkillInfo(
  skillName: string
): Promise<ActiveSkill | null> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().getActiveSkillInfo(skillName) || null;
}

/**
 * Get activation statistics
 */
export async function getActivationStats(): Promise<ActivationStats> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().getStats();
}

/**
 * Build execution chain for active skills
 */
export async function buildChainForActiveSkills(
  taskDescription: string
): Promise<SkillChain> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().buildChainForActiveSkills(taskDescription);
}

/**
 * Build execution chain for a specific skill
 */
export async function buildChainForSkill(
  skillName: string
): Promise<SkillChain | null> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getActivator().buildChainForSkill(skillName);
}

/**
 * Execute a script from a skill
 */
export async function executeScript(
  skillName: string,
  scriptName: string,
  args: string[] = []
): Promise<ExecutionResult> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  const skill = system.getRegistry().getSkill(skillName);
  
  if (!skill) {
    return {
      success: false,
      exitCode: 1,
      stdout: '',
      stderr: `Skill '${skillName}' not found`,
      duration: 0,
      error: new Error(`Skill '${skillName}' not found`),
    };
  }

  const script = skill.metadata.npmScripts?.[scriptName];
  
  if (!script) {
    return {
      success: false,
      exitCode: 1,
      stdout: '',
      stderr: `Script '${scriptName}' not found in skill '${skillName}'`,
      duration: 0,
      error: new Error(`Script '${scriptName}' not found`),
    };
  }

  return system.getScriptExecutor().executeScript(
    skill.path,
    scriptName,
    args
  );
}

/**
 * Build context for active skills
 */
export async function buildContext(): Promise<string> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  const activeSkills = system.getActivator().getActiveSkills();
  
  return system.getContextManager().buildContext(activeSkills);
}

/**
 * Optimize context to fit within token limit
 */
export async function optimizeContext(
  context: string,
  maxTokens?: number
): Promise<string> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getContextManager().optimizeContext(context, maxTokens);
}

/**
 * Validate a skill
 */
export async function validateSkill(
  skillPath: string
): Promise<ValidationResult> {
  const system = SkillSystem.getInstance();
  
  if (!system.isInitialized()) {
    await system.initialize();
  }

  return system.getDiscoveryService().validateSkill(skillPath);
}

/**
 * Get skill system configuration
 */
export async function getConfig(): Promise<SkillsConfig> {
  const system = SkillSystem.getInstance();
  return system.getConfig();
}

/**
 * Get skill system status
 */
export async function getSystemStatus(): Promise<{
  initialized: boolean;
  totalSkills: number;
  activeSkills: number;
  config: SkillsConfig;
}> {
  const system = SkillSystem.getInstance();
  
  const initialized = system.isInitialized();
  
  if (!initialized) {
    return {
      initialized: false,
      totalSkills: 0,
      activeSkills: 0,
      config: system.getConfig(),
    };
  }

  const allSkills = system.getRegistry().getAllSkills();
  const activeSkills = system.getActivator().getActiveSkills();

  return {
    initialized: true,
    totalSkills: allSkills.length,
    activeSkills: activeSkills.length,
    config: system.getConfig(),
  };
}

/**
 * Refresh skill registry (re-scan skills directory)
 */
export async function refreshSkills(): Promise<{
  success: boolean;
  totalSkills: number;
  error?: string;
}> {
  try {
    const system = SkillSystem.getInstance();
    
    // Re-scan skills
    const discoveredSkills = await system.getDiscoveryService().scanSkills();

    // Clear and repopulate registry
    const registry = system.getRegistry();
    const allSkills = registry.getAllSkills();
    
    for (const skill of allSkills) {
      registry.unregisterSkill(skill.metadata.name);
    }

    for (const [name, skill] of discoveredSkills.entries()) {
      registry.registerSkill(skill);
    }

    return {
      success: true,
      totalSkills: discoveredSkills.size,
    };
  } catch (error) {
    return {
      success: false,
      totalSkills: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
