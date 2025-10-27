/**
 * ScriptExecutor - Executes skill scripts in sandboxed environments
 * 
 * This module integrates sandbox creation, permission checking, resource limiting,
 * rollback management, and execution tracking to provide safe script execution.
 */

import { SandboxCreator, Sandbox, SandboxConfig, ExecutionResult as SandboxExecutionResult } from '../sandbox/SandboxCreator';
import { PermissionChecker, Permission, PermissionCheckResult } from '../sandbox/PermissionChecker';
import { ResourceLimiter, ResourceLimits, ResourceViolation } from '../sandbox/ResourceLimiter';
import { RollbackManager, Checkpoint, FileChange } from './RollbackManager';
import { ExecutionTracker, ExecutionStatus } from './ExecutionTracker';

/**
 * Script to execute
 */
export interface Script {
  /** Script name */
  name: string;
  
  /** Command to execute */
  command: string;
  
  /** Command arguments */
  args: string[];
  
  /** Working directory */
  workingDir: string;
  
  /** Required permissions */
  permissions: Permission[];
  
  /** Description */
  description?: string;
  
  /** Estimated duration in milliseconds */
  estimatedDuration?: number;
}

/**
 * Script execution options
 */
export interface ScriptExecutionOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** Whether to use sandbox */
  sandbox?: boolean;
  
  /** Whether to allow network access */
  allowNetwork?: boolean;
  
  /** Whether to allow file system access */
  allowFileSystem?: boolean;
  
  /** Maximum memory usage in MB */
  maxMemory?: number;
  
  /** Whether to create rollback checkpoint */
  createCheckpoint?: boolean;
  
  /** Whether to auto-rollback on error */
  autoRollbackOnError?: boolean;
  
  /** Environment variables */
  env?: Record<string, string>;
  
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Script execution result
 */
export interface ScriptExecutionResult {
  /** Execution ID */
  executionId: string;
  
  /** Script that was executed */
  script: Script;
  
  /** Exit code */
  exitCode: number;
  
  /** Standard output */
  stdout: string;
  
  /** Standard error */
  stderr: string;
  
  /** Duration in milliseconds */
  duration: number;
  
  /** Whether execution timed out */
  timedOut: boolean;
  
  /** Files modified during execution */
  filesModified: string[];
  
  /** Checkpoint ID if created */
  checkpointId?: string;
  
  /** Resource violations if any */
  resourceViolations: ResourceViolation[];
  
  /** Whether execution was successful */
  success: boolean;
  
  /** Error if execution failed */
  error?: Error;
}

/**
 * ScriptExecutor - Main class for executing scripts safely
 */
export class ScriptExecutor {
  private sandboxCreator: SandboxCreator;
  private permissionChecker: PermissionChecker;
  private rollbackManager: RollbackManager;
  private executionTracker: ExecutionTracker;

  constructor(
    sandboxCreator: SandboxCreator,
    permissionChecker: PermissionChecker,
    rollbackManager: RollbackManager,
    executionTracker: ExecutionTracker
  ) {
    this.sandboxCreator = sandboxCreator;
    this.permissionChecker = permissionChecker;
    this.rollbackManager = rollbackManager;
    this.executionTracker = executionTracker;
  }

  /**
   * Execute a script
   */
  async execute(
    script: Script,
    options: ScriptExecutionOptions = {}
  ): Promise<ScriptExecutionResult> {
    // Start tracking execution
    const executionId = this.executionTracker.startExecution(
      script.name,
      script.command,
      script.args,
      options.metadata
    );

    let checkpoint: Checkpoint | undefined;
    let sandbox: Sandbox | undefined;
    let resourceLimiter: ResourceLimiter | undefined;

    try {
      // Step 1: Check permissions
      this.executionTracker.startStep(executionId, 'Checking permissions');
      await this.checkPermissions(script.permissions);
      this.executionTracker.completeStep(executionId, 0, true);

      // Step 2: Create checkpoint if requested
      if (options.createCheckpoint !== false) {
        this.executionTracker.startStep(executionId, 'Creating checkpoint');
        checkpoint = await this.rollbackManager.createCheckpoint(
          script.workingDir,
          {
            description: `Before executing ${script.name}`,
            scriptName: script.name,
          }
        );
        this.executionTracker.completeStep(executionId, 1, true);
      }

      // Step 3: Create sandbox if requested
      if (options.sandbox !== false) {
        this.executionTracker.startStep(executionId, 'Creating sandbox');
        const sandboxConfig: SandboxConfig = {
          workingDir: script.workingDir,
          allowedPaths: [script.workingDir],
          allowNetwork: options.allowNetwork || false,
          maxMemory: options.maxMemory || 512,
          timeout: options.timeout,
          env: options.env,
        };
        sandbox = await this.sandboxCreator.createSandbox(sandboxConfig);
        this.executionTracker.completeStep(executionId, 2, true);
      }

      // Step 4: Set up resource limiter
      this.executionTracker.startStep(executionId, 'Setting up resource limits');
      const resourceLimits: ResourceLimits = {
        maxMemoryMB: options.maxMemory || 512,
        maxExecutionTimeMs: options.timeout || 30000,
        maxConcurrentProcesses: 1,
      };
      resourceLimiter = new ResourceLimiter(resourceLimits);
      resourceLimiter.startMonitoring();
      this.executionTracker.completeStep(executionId, 3, true);

      // Step 5: Execute script
      this.executionTracker.startStep(executionId, 'Executing script');
      this.executionTracker.updateStatus(executionId, ExecutionStatus.RUNNING);

      const executionResult = await this.executeInSandbox(
        sandbox,
        script,
        options,
        executionId
      );

      resourceLimiter.stopMonitoring();
      this.executionTracker.completeStep(executionId, 4, executionResult.exitCode === 0);

      // Step 6: Detect file changes
      let filesModified: string[] = [];
      if (checkpoint) {
        this.executionTracker.startStep(executionId, 'Detecting file changes');
        const changes = await this.rollbackManager.detectChanges(
          checkpoint,
          script.workingDir
        );
        filesModified = changes.map(change => change.path);
        this.executionTracker.completeStep(executionId, 5, true);
      }

      // Cleanup sandbox
      if (sandbox) {
        await sandbox.destroy();
      }

      // Determine success
      const success = executionResult.exitCode === 0;
      
      if (success) {
        this.executionTracker.updateStatus(executionId, ExecutionStatus.COMPLETED);
      } else {
        this.executionTracker.updateStatus(executionId, ExecutionStatus.FAILED);
        this.executionTracker.setError(
          executionId,
          `Script exited with code ${executionResult.exitCode}`,
          executionResult.exitCode
        );
      }

      return {
        executionId,
        script,
        exitCode: executionResult.exitCode,
        stdout: executionResult.stdout,
        stderr: executionResult.stderr,
        duration: executionResult.duration,
        timedOut: executionResult.timedOut,
        filesModified,
        checkpointId: checkpoint?.id,
        resourceViolations: resourceLimiter?.getViolations() || [],
        success,
      };

    } catch (error) {
      // Handle execution error
      this.executionTracker.setError(executionId, error as Error);
      this.executionTracker.updateStatus(executionId, ExecutionStatus.FAILED);

      // Auto-rollback if requested
      if (options.autoRollbackOnError && checkpoint) {
        try {
          await this.rollbackManager.rollback(checkpoint.id);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }

      // Cleanup
      if (sandbox) {
        await sandbox.destroy();
      }
      if (resourceLimiter) {
        resourceLimiter.stopMonitoring();
      }

      throw error;
    }
  }

  /**
   * Cancel a running execution
   */
  async cancel(executionId: string): Promise<void> {
    const state = this.executionTracker.getExecution(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (state.status !== ExecutionStatus.RUNNING) {
      throw new Error(`Execution ${executionId} is not running`);
    }

    this.executionTracker.updateStatus(executionId, ExecutionStatus.CANCELLED);
    
    // Note: Actual process cancellation would need to be implemented
    // by storing process references and killing them
  }

  /**
   * Rollback changes from an execution
   */
  async rollback(executionId: string): Promise<void> {
    const state = this.executionTracker.getExecution(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const checkpointId = state.metadata?.checkpointId;
    if (!checkpointId) {
      throw new Error(`No checkpoint found for execution ${executionId}`);
    }

    await this.rollbackManager.rollback(checkpointId);
  }

  /**
   * Get execution status
   */
  getStatus(executionId: string): ExecutionStatus | undefined {
    const state = this.executionTracker.getExecution(executionId);
    return state?.status;
  }

  /**
   * Get execution result
   */
  getResult(executionId: string): ScriptExecutionResult | undefined {
    const state = this.executionTracker.getExecution(executionId);
    if (!state) return undefined;

    return {
      executionId: state.executionId,
      script: {
        name: state.scriptName,
        command: state.command,
        args: state.args,
        workingDir: '',
        permissions: [],
      },
      exitCode: state.exitCode || -1,
      stdout: this.executionTracker.getStdout(executionId),
      stderr: this.executionTracker.getStderr(executionId),
      duration: state.duration || 0,
      timedOut: state.status === ExecutionStatus.TIMEOUT,
      filesModified: [],
      checkpointId: state.metadata?.checkpointId,
      resourceViolations: [],
      success: state.status === ExecutionStatus.COMPLETED,
      error: state.error ? new Error(state.error.message) : undefined,
    };
  }

  /**
   * Check permissions before execution
   */
  private async checkPermissions(permissions: Permission[]): Promise<void> {
    const results = await this.permissionChecker.checkPermissions(permissions);
    
    const denied = results.filter(result => !result.granted);
    
    if (denied.length > 0) {
      const deniedList = denied
        .map(result => `${result.permission.type}: ${result.denialReason}`)
        .join('\n');
      
      throw new Error(`Permission denied:\n${deniedList}`);
    }
  }

  /**
   * Execute script in sandbox
   */
  private async executeInSandbox(
    sandbox: Sandbox | undefined,
    script: Script,
    options: ScriptExecutionOptions,
    executionId: string
  ): Promise<SandboxExecutionResult> {
    if (!sandbox) {
      throw new Error('Sandbox not created');
    }

    // Run the script
    const result = await sandbox.run(script.command, script.args, {
      timeout: options.timeout,
      env: options.env,
    });

    // Capture output
    if (result.stdout) {
      const lines = result.stdout.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          this.executionTracker.addOutput(executionId, 'stdout', line);
        }
      });
    }

    if (result.stderr) {
      const lines = result.stderr.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          this.executionTracker.addOutput(executionId, 'stderr', line);
        }
      });
    }

    return result;
  }
}

/**
 * Create a default script executor
 */
export function createScriptExecutor(
  workspaceRoot: string
): ScriptExecutor {
  const sandboxCreator = new SandboxCreator();
  
  // Import the createPermissionChecker function
  const { createPermissionChecker } = require('../sandbox/PermissionChecker');
  const permissionChecker = createPermissionChecker(workspaceRoot);
  
  const { createRollbackManager } = require('./RollbackManager');
  const rollbackManager = createRollbackManager();
  
  const { createExecutionTracker } = require('./ExecutionTracker');
  const executionTracker = createExecutionTracker();

  return new ScriptExecutor(
    sandboxCreator,
    permissionChecker,
    rollbackManager,
    executionTracker
  );
}
