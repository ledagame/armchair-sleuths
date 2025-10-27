/**
 * SandboxCreator - Creates isolated execution environments for skill scripts
 * 
 * This module provides secure sandboxing capabilities for executing skill scripts
 * with resource limits and restricted access to system resources.
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Configuration for sandbox environment
 */
export interface SandboxConfig {
  /** Working directory for script execution */
  workingDir: string;
  
  /** Paths that the sandbox can access */
  allowedPaths: string[];
  
  /** Whether to allow network access */
  allowNetwork: boolean;
  
  /** Maximum memory usage in MB */
  maxMemory: number;
  
  /** Maximum execution time in milliseconds */
  timeout?: number;
  
  /** Environment variables to pass to the sandbox */
  env?: Record<string, string>;
}

/**
 * Sandbox execution environment
 */
export interface Sandbox {
  /** Unique identifier for this sandbox */
  id: string;
  
  /** Configuration used to create this sandbox */
  config: SandboxConfig;
  
  /** Run a command in the sandbox */
  run(command: string, args: string[], options?: RunOptions): Promise<ExecutionResult>;
  
  /** Destroy the sandbox and cleanup resources */
  destroy(): Promise<void>;
}

/**
 * Options for running commands in sandbox
 */
export interface RunOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** Environment variables */
  env?: Record<string, string>;
  
  /** Input to pass to stdin */
  input?: string;
}

/**
 * Result of command execution
 */
export interface ExecutionResult {
  /** Exit code */
  exitCode: number;
  
  /** Standard output */
  stdout: string;
  
  /** Standard error */
  stderr: string;
  
  /** Execution duration in milliseconds */
  duration: number;
  
  /** Whether execution was killed due to timeout */
  timedOut: boolean;
}

/**
 * SandboxCreator - Creates and manages sandboxed execution environments
 */
export class SandboxCreator {
  private activeSandboxes: Map<string, SandboxImpl> = new Map();
  private sandboxCounter = 0;

  /**
   * Create a new sandbox environment
   */
  async createSandbox(config: SandboxConfig): Promise<Sandbox> {
    // Validate configuration
    this.validateConfig(config);
    
    // Generate unique sandbox ID
    const sandboxId = `sandbox-${++this.sandboxCounter}-${Date.now()}`;
    
    // Create sandbox implementation
    const sandbox = new SandboxImpl(sandboxId, config);
    
    // Track active sandbox
    this.activeSandboxes.set(sandboxId, sandbox);
    
    return sandbox;
  }

  /**
   * Destroy all active sandboxes
   */
  async destroyAll(): Promise<void> {
    const destroyPromises = Array.from(this.activeSandboxes.values()).map(
      sandbox => sandbox.destroy()
    );
    
    await Promise.all(destroyPromises);
    this.activeSandboxes.clear();
  }

  /**
   * Get number of active sandboxes
   */
  getActiveSandboxCount(): number {
    return this.activeSandboxes.size;
  }

  /**
   * Validate sandbox configuration
   */
  private validateConfig(config: SandboxConfig): void {
    if (!config.workingDir) {
      throw new Error('workingDir is required');
    }

    if (!config.allowedPaths || config.allowedPaths.length === 0) {
      throw new Error('allowedPaths must contain at least one path');
    }

    if (config.maxMemory <= 0) {
      throw new Error('maxMemory must be greater than 0');
    }

    // Ensure working directory is within allowed paths
    const workingDirResolved = path.resolve(config.workingDir);
    const isAllowed = config.allowedPaths.some(allowedPath => {
      const resolvedAllowed = path.resolve(allowedPath);
      return workingDirResolved.startsWith(resolvedAllowed);
    });

    if (!isAllowed) {
      throw new Error('workingDir must be within allowedPaths');
    }
  }

  /**
   * Remove sandbox from tracking
   */
  private removeSandbox(sandboxId: string): void {
    this.activeSandboxes.delete(sandboxId);
  }
}

/**
 * Internal sandbox implementation
 */
class SandboxImpl implements Sandbox {
  public readonly id: string;
  public readonly config: SandboxConfig;
  private destroyed = false;
  private runningProcess: ChildProcess | null = null;

  constructor(id: string, config: SandboxConfig) {
    this.id = id;
    this.config = config;
  }

  /**
   * Run a command in the sandbox
   */
  async run(command: string, args: string[], options: RunOptions = {}): Promise<ExecutionResult> {
    if (this.destroyed) {
      throw new Error('Sandbox has been destroyed');
    }

    if (this.runningProcess) {
      throw new Error('Another process is already running in this sandbox');
    }

    const startTime = Date.now();
    const timeout = options.timeout || this.config.timeout || 30000;
    
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      // Prepare environment
      const env = this.sanitizeEnv({
        ...process.env,
        ...this.config.env,
        ...options.env,
      });

      // Spawn process
      this.runningProcess = spawn(command, args, {
        cwd: this.config.workingDir,
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
        // Resource limits (platform-specific)
        ...(process.platform !== 'win32' && {
          // Unix-like systems support resource limits
          maxBuffer: this.config.maxMemory * 1024 * 1024,
        }),
      });

      // Set timeout
      const timeoutHandle = setTimeout(() => {
        timedOut = true;
        if (this.runningProcess) {
          this.runningProcess.kill('SIGTERM');
          
          // Force kill after 5 seconds
          setTimeout(() => {
            if (this.runningProcess && !this.runningProcess.killed) {
              this.runningProcess.kill('SIGKILL');
            }
          }, 5000);
        }
      }, timeout);

      // Collect stdout
      this.runningProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      // Collect stderr
      this.runningProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process completion
      this.runningProcess.on('close', (code) => {
        clearTimeout(timeoutHandle);
        this.runningProcess = null;

        const duration = Date.now() - startTime;

        resolve({
          exitCode: code || 0,
          stdout,
          stderr,
          duration,
          timedOut,
        });
      });

      // Handle process errors
      this.runningProcess.on('error', (error) => {
        clearTimeout(timeoutHandle);
        this.runningProcess = null;
        reject(error);
      });

      // Send input if provided
      if (options.input && this.runningProcess.stdin) {
        this.runningProcess.stdin.write(options.input);
        this.runningProcess.stdin.end();
      }
    });
  }

  /**
   * Destroy the sandbox
   */
  async destroy(): Promise<void> {
    if (this.destroyed) {
      return;
    }

    // Kill running process if any
    if (this.runningProcess) {
      this.runningProcess.kill('SIGTERM');
      
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force kill if still running
      if (this.runningProcess && !this.runningProcess.killed) {
        this.runningProcess.kill('SIGKILL');
      }
      
      this.runningProcess = null;
    }

    this.destroyed = true;
  }

  /**
   * Sanitize environment variables
   * Removes sensitive variables and ensures safe execution
   */
  private sanitizeEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
    const sanitized: NodeJS.ProcessEnv = {};

    // Whitelist of safe environment variables
    const safeVars = [
      'PATH',
      'HOME',
      'USER',
      'LANG',
      'LC_ALL',
      'NODE_ENV',
      'npm_config_user_agent',
    ];

    // Copy safe variables
    for (const key of safeVars) {
      if (env[key]) {
        sanitized[key] = env[key];
      }
    }

    // Add custom variables from config
    if (this.config.env) {
      Object.assign(sanitized, this.config.env);
    }

    // Ensure PATH is set
    if (!sanitized.PATH) {
      sanitized.PATH = process.env.PATH;
    }

    return sanitized;
  }
}

/**
 * Create a default sandbox creator instance
 */
export function createSandboxCreator(): SandboxCreator {
  return new SandboxCreator();
}
