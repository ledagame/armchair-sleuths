/**
 * ExecutionTracker - Tracks script execution status and output
 * 
 * This module monitors script execution, captures output, and maintains
 * execution state for progress tracking and debugging.
 */

import { EventEmitter } from 'events';

/**
 * Execution status
 */
export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

/**
 * Output line from script execution
 */
export interface OutputLine {
  /** Line number */
  lineNumber: number;
  
  /** Timestamp */
  timestamp: Date;
  
  /** Output stream (stdout or stderr) */
  stream: 'stdout' | 'stderr';
  
  /** Content of the line */
  content: string;
  
  /** Log level if detected */
  level?: 'info' | 'warn' | 'error' | 'debug';
}

/**
 * Execution step in a multi-step process
 */
export interface ExecutionStep {
  /** Step number */
  stepNumber: number;
  
  /** Step name/description */
  name: string;
  
  /** Step status */
  status: ExecutionStatus;
  
  /** Start time */
  startTime?: Date;
  
  /** End time */
  endTime?: Date;
  
  /** Duration in milliseconds */
  duration?: number;
  
  /** Output from this step */
  output: OutputLine[];
  
  /** Error if step failed */
  error?: ExecutionError;
}

/**
 * Execution error
 */
export interface ExecutionError {
  /** Error message */
  message: string;
  
  /** Error code */
  code?: string | number;
  
  /** Stack trace */
  stackTrace?: string;
  
  /** Timestamp */
  timestamp: Date;
}

/**
 * Execution state
 */
export interface ExecutionState {
  /** Unique execution ID */
  executionId: string;
  
  /** Script name */
  scriptName: string;
  
  /** Command being executed */
  command: string;
  
  /** Command arguments */
  args: string[];
  
  /** Current status */
  status: ExecutionStatus;
  
  /** Start time */
  startTime: Date;
  
  /** End time */
  endTime?: Date;
  
  /** Duration in milliseconds */
  duration?: number;
  
  /** Current step (for multi-step processes) */
  currentStep?: number;
  
  /** All steps */
  steps: ExecutionStep[];
  
  /** All output lines */
  output: OutputLine[];
  
  /** Exit code */
  exitCode?: number;
  
  /** Error if execution failed */
  error?: ExecutionError;
  
  /** Progress percentage (0-100) */
  progress: number;
  
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * ExecutionTracker - Tracks and monitors script execution
 */
export class ExecutionTracker extends EventEmitter {
  private executions: Map<string, ExecutionState> = new Map();
  private executionCounter = 0;

  /**
   * Start tracking a new execution
   */
  startExecution(
    scriptName: string,
    command: string,
    args: string[],
    metadata?: Record<string, any>
  ): string {
    const executionId = this.generateExecutionId();

    const state: ExecutionState = {
      executionId,
      scriptName,
      command,
      args,
      status: ExecutionStatus.PENDING,
      startTime: new Date(),
      steps: [],
      output: [],
      progress: 0,
      metadata,
    };

    this.executions.set(executionId, state);
    this.emit('execution:started', state);

    return executionId;
  }

  /**
   * Update execution status
   */
  updateStatus(executionId: string, status: ExecutionStatus): void {
    const state = this.getExecution(executionId);
    if (!state) return;

    state.status = status;

    if (status === ExecutionStatus.COMPLETED || 
        status === ExecutionStatus.FAILED || 
        status === ExecutionStatus.CANCELLED ||
        status === ExecutionStatus.TIMEOUT) {
      state.endTime = new Date();
      state.duration = state.endTime.getTime() - state.startTime.getTime();
      state.progress = 100;
    }

    this.emit('execution:status', state);
  }

  /**
   * Add output line
   */
  addOutput(
    executionId: string,
    stream: 'stdout' | 'stderr',
    content: string
  ): void {
    const state = this.getExecution(executionId);
    if (!state) return;

    const outputLine: OutputLine = {
      lineNumber: state.output.length + 1,
      timestamp: new Date(),
      stream,
      content,
      level: this.detectLogLevel(content),
    };

    state.output.push(outputLine);
    this.emit('execution:output', { executionId, outputLine });

    // Update current step output if in a step
    if (state.currentStep !== undefined) {
      const step = state.steps[state.currentStep];
      if (step) {
        step.output.push(outputLine);
      }
    }
  }

  /**
   * Set execution error
   */
  setError(
    executionId: string,
    error: Error | string,
    code?: string | number
  ): void {
    const state = this.getExecution(executionId);
    if (!state) return;

    const executionError: ExecutionError = {
      message: typeof error === 'string' ? error : error.message,
      code,
      stackTrace: typeof error === 'object' ? error.stack : undefined,
      timestamp: new Date(),
    };

    state.error = executionError;
    state.status = ExecutionStatus.FAILED;
    this.emit('execution:error', { executionId, error: executionError });
  }

  /**
   * Set exit code
   */
  setExitCode(executionId: string, exitCode: number): void {
    const state = this.getExecution(executionId);
    if (!state) return;

    state.exitCode = exitCode;

    if (exitCode === 0) {
      this.updateStatus(executionId, ExecutionStatus.COMPLETED);
    } else {
      this.updateStatus(executionId, ExecutionStatus.FAILED);
    }
  }

  /**
   * Update progress
   */
  updateProgress(executionId: string, progress: number): void {
    const state = this.getExecution(executionId);
    if (!state) return;

    state.progress = Math.max(0, Math.min(100, progress));
    this.emit('execution:progress', { executionId, progress: state.progress });
  }

  /**
   * Start a new step
   */
  startStep(executionId: string, stepName: string): number {
    const state = this.getExecution(executionId);
    if (!state) return -1;

    const stepNumber = state.steps.length;

    const step: ExecutionStep = {
      stepNumber,
      name: stepName,
      status: ExecutionStatus.RUNNING,
      startTime: new Date(),
      output: [],
    };

    state.steps.push(step);
    state.currentStep = stepNumber;
    state.status = ExecutionStatus.RUNNING;

    this.emit('execution:step:started', { executionId, step });

    return stepNumber;
  }

  /**
   * Complete a step
   */
  completeStep(
    executionId: string,
    stepNumber: number,
    success: boolean = true
  ): void {
    const state = this.getExecution(executionId);
    if (!state) return;

    const step = state.steps[stepNumber];
    if (!step) return;

    step.status = success ? ExecutionStatus.COMPLETED : ExecutionStatus.FAILED;
    step.endTime = new Date();
    step.duration = step.endTime.getTime() - (step.startTime?.getTime() || 0);

    this.emit('execution:step:completed', { executionId, step });

    // Update progress based on completed steps
    const completedSteps = state.steps.filter(
      s => s.status === ExecutionStatus.COMPLETED
    ).length;
    const progress = (completedSteps / state.steps.length) * 100;
    this.updateProgress(executionId, progress);
  }

  /**
   * Fail a step
   */
  failStep(
    executionId: string,
    stepNumber: number,
    error: Error | string
  ): void {
    const state = this.getExecution(executionId);
    if (!state) return;

    const step = state.steps[stepNumber];
    if (!step) return;

    step.status = ExecutionStatus.FAILED;
    step.endTime = new Date();
    step.duration = step.endTime.getTime() - (step.startTime?.getTime() || 0);
    step.error = {
      message: typeof error === 'string' ? error : error.message,
      stackTrace: typeof error === 'object' ? error.stack : undefined,
      timestamp: new Date(),
    };

    this.emit('execution:step:failed', { executionId, step });
  }

  /**
   * Get execution state
   */
  getExecution(executionId: string): ExecutionState | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all executions
   */
  getAllExecutions(): ExecutionState[] {
    return Array.from(this.executions.values());
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): ExecutionState[] {
    return this.getAllExecutions().filter(
      state => state.status === ExecutionStatus.RUNNING || 
               state.status === ExecutionStatus.PENDING
    );
  }

  /**
   * Get completed executions
   */
  getCompletedExecutions(): ExecutionState[] {
    return this.getAllExecutions().filter(
      state => state.status === ExecutionStatus.COMPLETED
    );
  }

  /**
   * Get failed executions
   */
  getFailedExecutions(): ExecutionState[] {
    return this.getAllExecutions().filter(
      state => state.status === ExecutionStatus.FAILED
    );
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executions.clear();
  }

  /**
   * Delete execution
   */
  deleteExecution(executionId: string): boolean {
    return this.executions.delete(executionId);
  }

  /**
   * Get execution count
   */
  getExecutionCount(): number {
    return this.executions.size;
  }

  /**
   * Get output for execution
   */
  getOutput(executionId: string): OutputLine[] {
    const state = this.getExecution(executionId);
    return state ? state.output : [];
  }

  /**
   * Get stdout only
   */
  getStdout(executionId: string): string {
    const output = this.getOutput(executionId);
    return output
      .filter(line => line.stream === 'stdout')
      .map(line => line.content)
      .join('\n');
  }

  /**
   * Get stderr only
   */
  getStderr(executionId: string): string {
    const output = this.getOutput(executionId);
    return output
      .filter(line => line.stream === 'stderr')
      .map(line => line.content)
      .join('\n');
  }

  /**
   * Get execution summary
   */
  getSummary(executionId: string): string {
    const state = this.getExecution(executionId);
    if (!state) return 'Execution not found';

    const lines = [
      `Execution: ${state.scriptName}`,
      `Status: ${state.status}`,
      `Duration: ${state.duration || 0}ms`,
      `Progress: ${state.progress}%`,
    ];

    if (state.exitCode !== undefined) {
      lines.push(`Exit Code: ${state.exitCode}`);
    }

    if (state.error) {
      lines.push(`Error: ${state.error.message}`);
    }

    if (state.steps.length > 0) {
      lines.push(`\nSteps:`);
      state.steps.forEach(step => {
        lines.push(`  ${step.stepNumber + 1}. ${step.name} - ${step.status}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec-${++this.executionCounter}-${Date.now()}`;
  }

  /**
   * Detect log level from output content
   */
  private detectLogLevel(content: string): 'info' | 'warn' | 'error' | 'debug' | undefined {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('error') || lowerContent.includes('✗')) {
      return 'error';
    }
    if (lowerContent.includes('warn') || lowerContent.includes('warning')) {
      return 'warn';
    }
    if (lowerContent.includes('debug')) {
      return 'debug';
    }
    if (lowerContent.includes('info') || lowerContent.includes('✓')) {
      return 'info';
    }
    
    return undefined;
  }
}

/**
 * Create a default execution tracker
 */
export function createExecutionTracker(): ExecutionTracker {
  return new ExecutionTracker();
}
