# Claude Skills Integration - Design Document

## Overview

This design document outlines the technical architecture for integrating Claude's Skills system into Kiro IDE. The system will enable automatic skill discovery, activation, and execution while maintaining seamless integration with Kiro's existing steering rules and hooks.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Kiro IDE                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Chat UI    │◄────►│ Skill Engine │◄────►│  Steering │ │
│  │              │      │              │      │   System  │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                      │                     │       │
│         │                      │                     │       │
│  ┌──────▼──────┐      ┌───────▼──────┐      ┌──────▼────┐ │
│  │  UI Layer   │      │ Skill Registry│      │  Context  │ │
│  │  - Cards    │      │ - Discovery   │      │  Manager  │ │
│  │  - Panels   │      │ - Activation  │      │  - Merge  │ │
│  │  - Dialogs  │      │ - Execution   │      │  - Cache  │ │
│  └─────────────┘      └──────────────┘      └───────────┘ │
│                               │                             │
│                      ┌────────▼────────┐                    │
│                      │  Skill Storage  │                    │
│                      │  skills/        │                    │
│                      │  - SKILL.md     │                    │
│                      │  - SKILL.yaml   │                    │
│                      │  - README.md    │                    │
│                      └─────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Skill Engine Core                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ Skill Discovery  │         │  Skill Validator │          │
│  │ - File Scanner   │────────►│  - Schema Check  │          │
│  │ - Metadata Parse │         │  - Dependency    │          │
│  │ - Index Builder  │         │  - Security      │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Skill Registry  │◄───────►│  Context Manager │          │
│  │  - In-Memory Map │         │  - Token Counter │          │
│  │  - Fast Lookup   │         │  - Smart Merge   │          │
│  │  - Version Track │         │  - Cache Layer   │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ Skill Activator  │         │ Script Executor  │          │
│  │ - Keyword Match  │         │ - Sandbox        │          │
│  │ - Dependency     │         │ - Progress Track │          │
│  │ - Chain Builder  │         │ - Error Handler  │          │
│  └──────────────────┘         └──────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Skill Discovery Service

**Purpose**: Scan and register skills from the `skills/` directory

**Interface**:
```typescript
interface SkillDiscoveryService {
  // Scan skills directory and build registry
  scanSkills(): Promise<SkillRegistry>;
  
  // Watch for file changes and update registry
  watchSkills(): void;
  
  // Validate skill structure
  validateSkill(skillPath: string): ValidationResult;
  
  // Parse skill metadata
  parseSkillMetadata(skillPath: string): SkillMetadata;
}

interface SkillMetadata {
  name: string;
  version: string;
  description: string;
  triggers: string[];
  dependencies: string[];
  capabilities: SkillCapability[];
  npmScripts?: Record<string, string>;
  security?: SecurityConfig;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

**Implementation Details**:
- Use `chokidar` for file watching
- Parse YAML with `js-yaml`
- Parse Markdown with `marked`
- Build inverted index for fast keyword lookup
- Cache parsed metadata in memory

### 2. Skill Registry

**Purpose**: Maintain in-memory registry of all available skills

**Interface**:
```typescript
interface SkillRegistry {
  // Register a new skill
  register(skill: Skill): void;
  
  // Unregister a skill
  unregister(skillName: string): void;
  
  // Find skills by keyword
  findByKeyword(keyword: string): Skill[];
  
  // Find skill by name
  findByName(name: string): Skill | null;
  
  // Get all skills
  getAllSkills(): Skill[];
  
  // Get skill dependencies
  getDependencies(skillName: string): Skill[];
}

interface Skill {
  metadata: SkillMetadata;
  promptContent: string;
  readmeContent: string;
  path: string;
  lastModified: Date;
  status: 'active' | 'inactive' | 'error';
}
```

**Data Structure**:
```typescript
class SkillRegistryImpl {
  private skills: Map<string, Skill>;
  private keywordIndex: Map<string, Set<string>>; // keyword -> skill names
  private dependencyGraph: Map<string, Set<string>>; // skill -> dependencies
  
  constructor() {
    this.skills = new Map();
    this.keywordIndex = new Map();
    this.dependencyGraph = new Map();
  }
}
```

### 3. Skill Activator

**Purpose**: Activate skills based on user requests and manage skill lifecycle

**Interface**:
```typescript
interface SkillActivator {
  // Activate skills by keywords
  activateByKeywords(keywords: string[]): ActivationResult;
  
  // Activate specific skill
  activateSkill(skillName: string): ActivationResult;
  
  // Deactivate skill
  deactivateSkill(skillName: string): void;
  
  // Get active skills
  getActiveSkills(): Skill[];
  
  // Build skill chain for complex tasks
  buildSkillChain(task: string): SkillChain;
}

interface ActivationResult {
  activated: Skill[];
  failed: ActivationFailure[];
  dependencies: Skill[];
}

interface SkillChain {
  steps: SkillChainStep[];
  estimatedDuration: number;
  requiredPermissions: Permission[];
}

interface SkillChainStep {
  skill: Skill;
  action: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
}
```

### 4. Context Manager

**Purpose**: Manage AI context by merging skill prompts with steering rules

**Interface**:
```typescript
interface ContextManager {
  // Build context for AI
  buildContext(activeSkills: Skill[]): AIContext;
  
  // Merge skill prompts with steering rules
  mergeContexts(skillPrompts: string[], steeringRules: string[]): string;
  
  // Optimize context size
  optimizeContext(context: string, maxTokens: number): string;
  
  // Cache context
  cacheContext(key: string, context: string): void;
  
  // Get cached context
  getCachedContext(key: string): string | null;
}

interface AIContext {
  systemPrompt: string;
  skillPrompts: string[];
  steeringRules: string[];
  totalTokens: number;
  truncated: boolean;
}
```

**Context Merging Strategy**:
```typescript
class ContextMerger {
  merge(skillPrompts: string[], steeringRules: string[]): string {
    // Priority order:
    // 1. Steering rules (highest priority)
    // 2. Active skill prompts
    // 3. Skill examples and references
    
    const sections = [
      '# System Context',
      '## Steering Rules',
      ...steeringRules,
      '## Active Skills',
      ...skillPrompts,
    ];
    
    return sections.join('\n\n');
  }
  
  optimize(context: string, maxTokens: number): string {
    // Token counting with tiktoken
    const tokens = this.countTokens(context);
    
    if (tokens <= maxTokens) {
      return context;
    }
    
    // Truncation strategy:
    // 1. Keep all steering rules (mandatory)
    // 2. Keep skill core prompts
    // 3. Truncate skill examples
    // 4. Truncate skill references
    
    return this.intelligentTruncate(context, maxTokens);
  }
  
  private intelligentTruncate(context: string, maxTokens: number): string {
    // Parse context into sections
    const sections = this.parseContextSections(context);
    
    // Priority levels for truncation
    const priorities = {
      steeringRules: 1,      // Never truncate
      skillCorePrompt: 2,    // Truncate last
      skillExamples: 3,      // Truncate second
      skillReferences: 4,    // Truncate first
    };
    
    // Calculate tokens for each section
    const sectionTokens = sections.map(section => ({
      ...section,
      tokens: this.countTokens(section.content),
      priority: priorities[section.type],
    }));
    
    // Sort by priority (higher priority = lower number)
    sectionTokens.sort((a, b) => a.priority - b.priority);
    
    let currentTokens = sectionTokens.reduce((sum, s) => sum + s.tokens, 0);
    const truncatedSections: typeof sectionTokens = [];
    
    // Keep sections in priority order until we hit the limit
    for (const section of sectionTokens) {
      if (currentTokens <= maxTokens) {
        truncatedSections.push(section);
      } else {
        // Try to partially include this section
        const availableTokens = maxTokens - (currentTokens - section.tokens);
        
        if (availableTokens > 100) { // Minimum useful size
          const truncatedContent = this.truncateToTokens(
            section.content,
            availableTokens
          );
          
          truncatedSections.push({
            ...section,
            content: truncatedContent + '\n\n[... truncated for context size]',
            tokens: availableTokens,
          });
        }
        
        break;
      }
      
      currentTokens -= section.tokens;
    }
    
    // Reconstruct context
    return truncatedSections
      .sort((a, b) => a.priority - b.priority)
      .map(s => s.content)
      .join('\n\n');
  }
  
  private parseContextSections(context: string): ContextSection[] {
    // Parse markdown sections
    const sections: ContextSection[] = [];
    const lines = context.split('\n');
    
    let currentSection: ContextSection | null = null;
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        const title = line.substring(3);
        currentSection = {
          type: this.inferSectionType(title),
          title,
          content: line + '\n',
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }
  
  private inferSectionType(title: string): string {
    if (title.includes('Steering')) return 'steeringRules';
    if (title.includes('Example')) return 'skillExamples';
    if (title.includes('Reference')) return 'skillReferences';
    return 'skillCorePrompt';
  }
}

interface ContextSection {
  type: string;
  title: string;
  content: string;
}
```

### 5. Script Executor

**Purpose**: Execute skill automation scripts safely in a sandboxed environment

**Interface**:
```typescript
interface ScriptExecutor {
  // Execute script with security checks
  execute(script: Script, options: ExecutionOptions): Promise<ExecutionResult>;
  
  // Cancel running script
  cancel(executionId: string): Promise<void>;
  
  // Get execution status
  getStatus(executionId: string): ExecutionStatus;
  
  // Rollback changes
  rollback(executionId: string): Promise<void>;
}

interface Script {
  name: string;
  command: string;
  args: string[];
  workingDir: string;
  permissions: Permission[];
}

interface ExecutionOptions {
  timeout: number;
  sandbox: boolean;
  allowNetwork: boolean;
  allowFileSystem: boolean;
  maxMemory: number;
}

interface ExecutionResult {
  executionId: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  filesModified: string[];
}

interface ExecutionStatus {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  output: string[];
}
```

**Sandboxing Strategy**:
```typescript
class SandboxExecutor {
  private rollbackManager: RollbackManager;
  
  async execute(script: Script, options: ExecutionOptions): Promise<ExecutionResult> {
    // Create rollback checkpoint before execution
    const checkpoint = await this.rollbackManager.createCheckpoint(script.workingDir);
    
    try {
      // Create isolated environment
      const sandbox = await this.createSandbox({
        workingDir: script.workingDir,
        allowedPaths: [script.workingDir],
        allowNetwork: options.allowNetwork,
        maxMemory: options.maxMemory,
      });
      
      // Execute with resource limits
      const result = await sandbox.run(script.command, script.args, {
        timeout: options.timeout,
        env: this.sanitizeEnv(process.env),
      });
      
      // Track file changes for rollback
      const fileChanges = await this.rollbackManager.detectChanges(
        checkpoint,
        script.workingDir
      );
      
      // Cleanup
      await sandbox.destroy();
      
      return {
        ...result,
        filesModified: fileChanges.map(c => c.path),
        checkpointId: checkpoint.id,
      };
    } catch (error) {
      // Auto-rollback on error if configured
      if (options.autoRollbackOnError) {
        await this.rollbackManager.rollback(checkpoint.id);
      }
      
      throw error;
    }
  }
}

class RollbackManager {
  private checkpoints: Map<string, Checkpoint>;
  
  async createCheckpoint(workingDir: string): Promise<Checkpoint> {
    const checkpoint: Checkpoint = {
      id: generateId(),
      timestamp: new Date(),
      workingDir,
      fileSnapshots: await this.snapshotFiles(workingDir),
    };
    
    this.checkpoints.set(checkpoint.id, checkpoint);
    return checkpoint;
  }
  
  async detectChanges(checkpoint: Checkpoint, workingDir: string): Promise<FileChange[]> {
    const currentFiles = await this.scanFiles(workingDir);
    const changes: FileChange[] = [];
    
    // Detect modifications
    for (const [path, currentContent] of currentFiles) {
      const originalContent = checkpoint.fileSnapshots.get(path);
      
      if (!originalContent) {
        // New file created
        changes.push({
          path,
          operation: 'create',
          after: currentContent,
        });
      } else if (originalContent !== currentContent) {
        // File modified
        changes.push({
          path,
          operation: 'modify',
          before: originalContent,
          after: currentContent,
        });
      }
    }
    
    // Detect deletions
    for (const [path, originalContent] of checkpoint.fileSnapshots) {
      if (!currentFiles.has(path)) {
        changes.push({
          path,
          operation: 'delete',
          before: originalContent,
        });
      }
    }
    
    return changes;
  }
  
  async rollback(checkpointId: string): Promise<void> {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }
    
    // Restore all files to checkpoint state
    for (const [path, content] of checkpoint.fileSnapshots) {
      await fs.writeFile(path, content);
    }
    
    // Remove files created after checkpoint
    const currentFiles = await this.scanFiles(checkpoint.workingDir);
    for (const [path] of currentFiles) {
      if (!checkpoint.fileSnapshots.has(path)) {
        await fs.unlink(path);
      }
    }
  }
  
  private async snapshotFiles(dir: string): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile()) {
        const fullPath = path.join(entry.path, entry.name);
        const content = await fs.readFile(fullPath, 'utf-8');
        files.set(fullPath, content);
      }
    }
    
    return files;
  }
}

interface Checkpoint {
  id: string;
  timestamp: Date;
  workingDir: string;
  fileSnapshots: Map<string, string>;
}
```

### 6. UI Components

**Purpose**: Provide rich UI for skill interaction

#### UI Integration with Kiro IDE

```
┌─────────────────────────────────────────────────────────────┐
│                     Kiro IDE Window                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Files   │  │  Search  │  │  Skills  │◄─ New Tab        │
│  └──────────┘  └──────────┘  └──────────┘                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │   Editor Area       │  │   Skill Panel (Side)         │ │
│  │                     │  │  ┌────────────────────────┐  │ │
│  │   [Code]            │  │  │ Skill: suspect-prompter│  │ │
│  │                     │  │  ├────────────────────────┤  │ │
│  │                     │  │  │ README                 │  │ │
│  │                     │  │  │ Examples               │  │ │
│  │                     │  │  │ Scripts                │  │ │
│  │                     │  │  │ [Run Script] [Close]   │  │ │
│  │                     │  │  └────────────────────────┘  │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┤
│  │   Chat Interface                                          │
│  │  ┌────────────────────────────────────────────────────┐  │
│  │  │ User: Improve suspect prompts                      │  │
│  │  │                                                     │  │
│  │  │ 🎯 Skill Activated: suspect-ai-prompter           │  │
│  │  │ [View Details] [Deactivate]                       │  │
│  │  │                                                     │  │
│  │  │ AI: I'll help you improve the suspect prompts...  │  │
│  │  │                                                     │  │
│  │  │ 📝 Suggested Actions:                              │  │
│  │  │ [Analyze PROMPT.md] [Generate Examples]           │  │
│  │  │ [Validate Quality]                                 │  │
│  │  └────────────────────────────────────────────────────┘  │
│  └──────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

#### Skill Card Component
```typescript
interface SkillCardProps {
  skill: Skill;
  onActivate: (skill: Skill) => void;
  onViewDetails: (skill: Skill) => void;
}

// Visual Design:
// ┌─────────────────────────────────────┐
// │ 🎭 Suspect AI Prompter      v2.0.0 │
// │ ✅ Active                           │
// ├─────────────────────────────────────┤
// │ Optimize AI suspect conversation    │
// │ prompts and test emotional states   │
// ├─────────────────────────────────────┤
// │ [Activate] [Details] [⋮]           │
// └─────────────────────────────────────┘
```

#### Skill Panel Component
```typescript
interface SkillPanelProps {
  skill: Skill;
  onClose: () => void;
  onExecuteScript: (script: string) => void;
}

// Visual Design:
// ┌─────────────────────────────────────┐
// │ Suspect AI Prompter          [✕]   │
// ├─────────────────────────────────────┤
// │ [Overview] [Scripts] [Examples]     │
// ├─────────────────────────────────────┤
// │                                     │
// │ ## Overview                         │
// │ This skill optimizes AI suspect...  │
// │                                     │
// │ ## Available Scripts                │
// │ ▶ suspect:test                      │
// │   Test suspect responses            │
// │   [Run Script]                      │
// │                                     │
// │ ▶ suspect:add-archetype             │
// │   Add new suspect archetype         │
// │   [Run Script]                      │
// │                                     │
// └─────────────────────────────────────┘
```

#### Script Execution Dialog
```typescript
interface ScriptExecutionDialogProps {
  script: Script;
  onConfirm: () => void;
  onCancel: () => void;
}

// Visual Design:
// ┌─────────────────────────────────────┐
// │ Confirm Script Execution            │
// ├─────────────────────────────────────┤
// │ Script: suspect:test                │
// │ Command: tsx scripts/test.ts        │
// │                                     │
// │ 🔒 Required Permissions:            │
// │ • Read: ./skills/suspect-prompter   │
// │ • Execute: npm/tsx                  │
// │                                     │
// │ ⏱️ Estimated Duration: ~30s         │
// │                                     │
// │ [Cancel] [Confirm]                  │
// └─────────────────────────────────────┘
```

#### Progress Indicator
```typescript
interface ProgressIndicatorProps {
  execution: ExecutionStatus;
  onCancel: () => void;
}

// Visual Design:
// ┌─────────────────────────────────────┐
// │ Running: suspect:test               │
// ├─────────────────────────────────────┤
// │ ████████████░░░░░░░░ 60%           │
// │ Current: Testing emotional states   │
// │                                     │
// │ ▼ Output (click to expand)          │
// │ ┌─────────────────────────────────┐ │
// │ │ Testing COOPERATIVE state...    │ │
// │ │ ✓ Test passed                   │ │
// │ │ Testing NERVOUS state...        │ │
// │ └─────────────────────────────────┘ │
// │                                     │
// │ [Cancel Execution]                  │
// └─────────────────────────────────────┘
```

#### Skill Chain Visualizer
```typescript
interface SkillChainVisualizerProps {
  chain: SkillChain;
  currentStep: number;
  onRetry: (step: number) => void;
  onSkip: (step: number) => void;
  onAbort: () => void;
}

// Visual Design:
// ┌─────────────────────────────────────┐
// │ Skill Chain: Improve Suspect System │
// ├─────────────────────────────────────┤
// │                                     │
// │ ✓ 1. Analyze PROMPT.md              │
// │   └─ suspect-ai-prompter            │
// │                                     │
// │ ▶ 2. Generate Examples              │
// │   └─ suspect-ai-prompter            │
// │   [Retry] [Skip]                    │
// │                                     │
// │ ⏸ 3. Validate Quality               │
// │   └─ suspect-ai-prompter            │
// │                                     │
// │ Progress: 1/3 steps completed       │
// │                                     │
// │ [Abort Chain]                       │
// └─────────────────────────────────────┘
```

#### Skill Creation Wizard
```typescript
interface SkillCreationWizardProps {
  onComplete: (skill: SkillMetadata) => void;
  onCancel: () => void;
}

// Visual Design:
// ┌─────────────────────────────────────┐
// │ Create New Skill (Step 1/4)         │
// ├─────────────────────────────────────┤
// │                                     │
// │ Basic Information                   │
// │                                     │
// │ Skill Name:                         │
// │ [my-awesome-skill____________]      │
// │                                     │
// │ Description:                        │
// │ [This skill helps with...____]      │
// │                                     │
// │ Version:                            │
// │ [1.0.0]                             │
// │                                     │
// │ Author:                             │
// │ [Your Name__________________]       │
// │                                     │
// │ [Cancel] [Back] [Next]              │
// └─────────────────────────────────────┘

// Step 2: Triggers and Keywords
// ┌─────────────────────────────────────┐
// │ Create New Skill (Step 2/4)         │
// ├─────────────────────────────────────┤
// │                                     │
// │ Trigger Keywords                    │
// │                                     │
// │ Add keywords that activate this     │
// │ skill when mentioned:               │
// │                                     │
// │ [improve prompt_____________] [Add] │
// │                                     │
// │ Current Keywords:                   │
// │ • improve prompt [✕]                │
// │ • optimize ai [✕]                   │
// │ • test responses [✕]                │
// │                                     │
// │ [Cancel] [Back] [Next]              │
// └─────────────────────────────────────┘

// Step 3: Dependencies
// ┌─────────────────────────────────────┐
// │ Create New Skill (Step 3/4)         │
// ├─────────────────────────────────────┤
// │                                     │
// │ Dependencies                        │
// │                                     │
// │ Required Skills:                    │
// │ [Select skills...___________] [Add] │
// │ • mystery-case-generator [✕]        │
// │                                     │
// │ Required APIs:                      │
// │ [Select APIs...____________] [Add]  │
// │ • gemini-ai [✕]                     │
// │                                     │
// │ Required Packages:                  │
// │ [npm package name_______] [Add]     │
// │ • yaml [✕]                          │
// │ • inquirer [✕]                      │
// │                                     │
// │ [Cancel] [Back] [Next]              │
// └─────────────────────────────────────┘

// Step 4: Capabilities
// ┌─────────────────────────────────────┐
// │ Create New Skill (Step 4/4)         │
// ├─────────────────────────────────────┤
// │                                     │
// │ Capabilities                        │
// │                                     │
// │ Add capabilities this skill         │
// │ provides:                           │
// │                                     │
// │ Capability Name:                    │
// │ [prompt-improvement_________]       │
// │                                     │
// │ Description:                        │
// │ [Analyze and improve prompts]       │
// │                                     │
// │ Script (optional):                  │
// │ [scripts/improve-prompt.ts__]       │
// │                                     │
// │ [Add Capability]                    │
// │                                     │
// │ Added Capabilities:                 │
// │ • prompt-improvement [Edit] [✕]     │
// │                                     │
// │ [Cancel] [Back] [Create Skill]      │
// └─────────────────────────────────────┘
```

## Dependency Management

### Dependency Resolution Strategy

```typescript
class DependencyManager {
  private registry: SkillRegistry;
  private packageManager: PackageManager;
  
  async resolveDependencies(skill: Skill): Promise<DependencyResolution> {
    const resolution: DependencyResolution = {
      skills: [],
      packages: [],
      apis: [],
      errors: [],
    };
    
    // Resolve skill dependencies
    for (const depName of skill.dependencies.skills) {
      const depSkill = this.registry.findByName(depName);
      
      if (!depSkill) {
        resolution.errors.push({
          type: 'missing_skill',
          dependency: depName,
          message: `Required skill '${depName}' not found`,
        });
      } else {
        resolution.skills.push(depSkill);
        
        // Recursively resolve dependencies
        const subDeps = await this.resolveDependencies(depSkill);
        resolution.skills.push(...subDeps.skills);
        resolution.packages.push(...subDeps.packages);
        resolution.apis.push(...subDeps.apis);
      }
    }
    
    // Resolve package dependencies
    for (const packageName of skill.dependencies.packages) {
      const installed = await this.packageManager.isInstalled(packageName);
      
      if (!installed) {
        resolution.errors.push({
          type: 'missing_package',
          dependency: packageName,
          message: `Required package '${packageName}' not installed`,
          fix: `npm install ${packageName}`,
        });
      } else {
        resolution.packages.push({
          name: packageName,
          version: await this.packageManager.getVersion(packageName),
        });
      }
    }
    
    // Resolve API dependencies
    for (const apiName of skill.dependencies.apis) {
      const available = await this.checkAPIAvailability(apiName);
      
      if (!available) {
        resolution.errors.push({
          type: 'missing_api',
          dependency: apiName,
          message: `Required API '${apiName}' not available`,
        });
      } else {
        resolution.apis.push({ name: apiName });
      }
    }
    
    return resolution;
  }
  
  async installDependencies(skill: Skill): Promise<InstallResult> {
    const resolution = await this.resolveDependencies(skill);
    
    if (resolution.errors.length > 0) {
      return {
        success: false,
        errors: resolution.errors,
      };
    }
    
    // Install missing packages
    const packagesToInstall = skill.dependencies.packages.filter(
      pkg => !resolution.packages.find(p => p.name === pkg)
    );
    
    if (packagesToInstall.length > 0) {
      await this.packageManager.install(packagesToInstall);
    }
    
    return {
      success: true,
      installed: {
        skills: resolution.skills.map(s => s.name),
        packages: packagesToInstall,
      },
    };
  }
}

interface DependencyResolution {
  skills: Skill[];
  packages: PackageInfo[];
  apis: APIInfo[];
  errors: DependencyError[];
}

interface PackageInfo {
  name: string;
  version: string;
}

interface APIInfo {
  name: string;
}

interface DependencyError {
  type: 'missing_skill' | 'missing_package' | 'missing_api';
  dependency: string;
  message: string;
  fix?: string;
}
```

### Sandbox Package Management

```typescript
class SandboxPackageManager {
  private sandboxDir: string;
  
  async createSandboxEnvironment(skill: Skill): Promise<SandboxEnvironment> {
    // Create isolated node_modules for this skill
    const sandboxPath = path.join(this.sandboxDir, skill.name);
    await fs.mkdir(sandboxPath, { recursive: true });
    
    // Create package.json with skill dependencies
    const packageJson = {
      name: `sandbox-${skill.name}`,
      version: '1.0.0',
      dependencies: this.buildDependencyMap(skill.dependencies.packages),
    };
    
    await fs.writeFile(
      path.join(sandboxPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Install dependencies in sandbox
    await this.runNpmInstall(sandboxPath);
    
    return {
      path: sandboxPath,
      nodeModulesPath: path.join(sandboxPath, 'node_modules'),
      cleanup: async () => {
        await fs.rm(sandboxPath, { recursive: true, force: true });
      },
    };
  }
  
  private buildDependencyMap(packages: string[]): Record<string, string> {
    const deps: Record<string, string> = {};
    
    for (const pkg of packages) {
      // Parse package@version or use latest
      const [name, version] = pkg.split('@');
      deps[name] = version || 'latest';
    }
    
    return deps;
  }
  
  private async runNpmInstall(dir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install'], {
        cwd: dir,
        stdio: 'pipe',
      });
      
      npm.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  }
}

interface SandboxEnvironment {
  path: string;
  nodeModulesPath: string;
  cleanup: () => Promise<void>;
}
```

### Circular Dependency Detection

```typescript
class CircularDependencyDetector {
  detectCircular(skill: Skill, registry: SkillRegistry): CircularDependency | null {
    const visited = new Set<string>();
    const stack = new Set<string>();
    
    const dfs = (currentSkill: Skill): CircularDependency | null => {
      visited.add(currentSkill.name);
      stack.add(currentSkill.name);
      
      for (const depName of currentSkill.dependencies.skills) {
        const depSkill = registry.findByName(depName);
        
        if (!depSkill) continue;
        
        if (stack.has(depName)) {
          // Circular dependency found
          return {
            cycle: Array.from(stack).concat(depName),
            message: `Circular dependency detected: ${Array.from(stack).join(' -> ')} -> ${depName}`,
          };
        }
        
        if (!visited.has(depName)) {
          const circular = dfs(depSkill);
          if (circular) return circular;
        }
      }
      
      stack.delete(currentSkill.name);
      return null;
    };
    
    return dfs(skill);
  }
}

interface CircularDependency {
  cycle: string[];
  message: string;
}
```

## Data Models

### Skill Model
```typescript
interface Skill {
  // Metadata
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  
  // Triggers
  triggers: string[];
  
  // Dependencies
  dependencies: {
    skills: string[];
    apis: string[];
    packages: string[];
  };
  
  // Capabilities
  capabilities: SkillCapability[];
  
  // Content
  promptContent: string;
  readmeContent: string;
  
  // Scripts
  npmScripts: Record<string, string>;
  
  // Security
  security: {
    sandbox: boolean;
    permissions: Permission[];
    trustedSource: boolean;
  };
  
  // Metadata
  path: string;
  lastModified: Date;
  status: 'active' | 'inactive' | 'error';
  
  // Analytics
  analytics: {
    usageCount: number;
    successRate: number;
    averageDuration: number;
    lastUsed: Date;
  };
}
```

### Skill Capability Model
```typescript
interface SkillCapability {
  name: string;
  description: string;
  script?: string;
  usage: string;
  parameters: CapabilityParameter[];
  examples: string[];
}

interface CapabilityParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  default?: any;
}
```

### Permission Model
```typescript
interface Permission {
  type: 'filesystem' | 'network' | 'system' | 'env';
  scope: string;
  reason: string;
}

// Examples:
// { type: 'filesystem', scope: 'read:./src', reason: 'Read source files' }
// { type: 'network', scope: 'https://api.example.com', reason: 'Fetch data' }
// { type: 'system', scope: 'exec:npm', reason: 'Run npm commands' }
```

### Execution State Model
```typescript
interface ExecutionState {
  executionId: string;
  script: Script;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  
  // Checkpoints for resuming
  checkpoints: Checkpoint[];
  currentCheckpoint: number;
  
  // File changes for rollback
  fileChanges: FileChange[];
  
  // Output
  output: OutputLine[];
  
  // Error
  error?: ExecutionError;
}

interface Checkpoint {
  step: number;
  timestamp: Date;
  state: Record<string, any>;
}

interface FileChange {
  path: string;
  operation: 'create' | 'modify' | 'delete';
  before?: string;
  after?: string;
}
```

## Error Handling

### Error Types
```typescript
enum SkillErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ACTIVATION_ERROR = 'ACTIVATION_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  SECURITY_ERROR = 'SECURITY_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
}

interface SkillError {
  type: SkillErrorType;
  message: string;
  details: string;
  skillName?: string;
  stackTrace?: string;
  suggestions: string[];
  helpUrl?: string;
}
```

### Error Recovery Strategies
```typescript
class ErrorRecoveryManager {
  async recover(error: SkillError): Promise<RecoveryResult> {
    switch (error.type) {
      case SkillErrorType.VALIDATION_ERROR:
        return this.recoverFromValidation(error);
      
      case SkillErrorType.DEPENDENCY_ERROR:
        return this.recoverFromDependency(error);
      
      case SkillErrorType.EXECUTION_ERROR:
        return this.recoverFromExecution(error);
      
      default:
        return { recovered: false, message: 'Manual intervention required' };
    }
  }
  
  private async recoverFromValidation(error: SkillError): Promise<RecoveryResult> {
    // Attempt to fix common validation issues
    // - Missing required fields
    // - Invalid YAML syntax
    // - Incorrect file structure
    
    return {
      recovered: true,
      message: 'Validation errors fixed',
      actions: ['Reload skill', 'View changes'],
    };
  }
}
```

## Testing Strategy

### Unit Tests
- Skill discovery and parsing
- Skill registry operations
- Context merging logic
- Script execution (mocked)
- Error handling

### Integration Tests
- End-to-end skill activation
- Script execution with real sandbox
- UI component interactions
- File system operations

### Security Tests
- Sandbox escape attempts
- Permission violations
- Malicious script detection
- Resource limit enforcement

### Performance Tests
- Registry loading with 100+ skills
- Keyword search performance
- Context optimization
- Concurrent script execution

## Security Considerations

### Sandboxing
- Use Node.js `vm` module for script isolation
- Limit file system access to project directory
- Proxy network requests through security layer
- Enforce resource limits (CPU, memory, time)

### Permission System
- Explicit permission requests
- User approval for sensitive operations
- Permission audit log
- Revocable permissions

### Code Signing
- Verify skill integrity with checksums
- Support for signed skills from trusted sources
- Warning for unsigned or modified skills

### Network Security
- HTTPS-only for external requests
- URL whitelist for network access
- Request/response logging
- Rate limiting

## Performance Optimization

### Caching Strategy
```typescript
class SkillCache {
  private promptCache: LRUCache<string, string>;
  private metadataCache: LRUCache<string, SkillMetadata>;
  private contextCache: LRUCache<string, AIContext>;
  
  constructor() {
    this.promptCache = new LRUCache({ max: 100 });
    this.metadataCache = new LRUCache({ max: 500 });
    this.contextCache = new LRUCache({ max: 50 });
  }
  
  // Cache invalidation on file changes
  invalidate(skillName: string): void {
    this.promptCache.delete(skillName);
    this.metadataCache.delete(skillName);
    // Invalidate all contexts containing this skill
    this.contextCache.clear();
  }
}
```

### Lazy Loading
- Load skill content only when activated
- Defer README parsing until viewed
- Stream large files instead of loading entirely

### Indexing
- Build inverted index for keyword search
- Use trie for prefix matching
- Cache search results

### Virtual Scrolling
- Render only visible skill cards
- Lazy load skill details on scroll
- Pagination for large lists

## Deployment Considerations

### File Structure
```
.kiro/
├── skills/
│   ├── skill-name/
│   │   ├── SKILL.md
│   │   ├── SKILL.yaml
│   │   ├── README.md
│   │   ├── scripts/
│   │   └── references/
│   └── ...
├── cache/
│   ├── skill-registry.json
│   ├── skill-index.json
│   └── ...
└── logs/
    ├── skill-execution.log
    └── skill-errors.log
```

### Configuration
```yaml
# .kiro/config/skills.yaml
skills:
  enabled: true
  autoDiscovery: true
  watchForChanges: true
  
  security:
    sandbox: true
    requireApproval: true
    trustedSources:
      - 'official'
      - 'verified'
  
  performance:
    maxActiveSkills: 10
    maxContextTokens: 150000
    cacheSize: 100
  
  marketplace:
    enabled: true
    url: 'https://skills.kiro.dev'
    autoUpdate: false
```

### Migration Path
1. Phase 1: Core skill engine (discovery, registry, activation)
2. Phase 2: UI components (cards, panels, dialogs)
3. Phase 3: Script execution and sandboxing
4. Phase 4: Skill chaining and workflows
5. Phase 5: Marketplace and community features

## Next Steps

After design approval, proceed to implementation tasks:
1. Implement Skill Discovery Service
2. Build Skill Registry
3. Create Context Manager
4. Develop UI Components
5. Implement Script Executor
6. Add Security Layer
7. Build Marketplace Integration
8. Write Tests
9. Documentation
10. Beta Testing
