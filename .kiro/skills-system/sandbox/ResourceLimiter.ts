/**
 * ResourceLimiter - Enforces resource limits for skill script execution
 * 
 * This module limits CPU usage, memory usage, and enforces execution timeouts
 * to prevent resource exhaustion and ensure system stability.
 */

import { EventEmitter } from 'events';

/**
 * Resource limits configuration
 */
export interface ResourceLimits {
  /** Maximum CPU usage percentage (0-100) */
  maxCpuPercent?: number;
  
  /** Maximum memory usage in MB */
  maxMemoryMB: number;
  
  /** Maximum execution time in milliseconds */
  maxExecutionTimeMs: number;
  
  /** Maximum number of concurrent processes */
  maxConcurrentProcesses?: number;
  
  /** Maximum file size that can be created/modified in MB */
  maxFileSizeMB?: number;
}

/**
 * Resource usage statistics
 */
export interface ResourceUsage {
  /** CPU usage percentage */
  cpuPercent: number;
  
  /** Memory usage in MB */
  memoryMB: number;
  
  /** Execution time in milliseconds */
  executionTimeMs: number;
  
  /** Number of active processes */
  activeProcesses: number;
}

/**
 * Resource limit violation
 */
export interface ResourceViolation {
  /** Type of resource that was violated */
  resource: 'cpu' | 'memory' | 'time' | 'processes' | 'fileSize';
  
  /** Current usage */
  current: number;
  
  /** Limit that was exceeded */
  limit: number;
  
  /** Timestamp of violation */
  timestamp: Date;
  
  /** Message describing the violation */
  message: string;
}

/**
 * Resource monitoring result
 */
export interface MonitoringResult {
  /** Whether limits are being respected */
  withinLimits: boolean;
  
  /** Current resource usage */
  usage: ResourceUsage;
  
  /** Any violations detected */
  violations: ResourceViolation[];
}

/**
 * ResourceLimiter - Monitors and enforces resource limits
 */
export class ResourceLimiter extends EventEmitter {
  private limits: ResourceLimits;
  private startTime: number = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private activeProcessCount: number = 0;
  private violations: ResourceViolation[] = [];

  constructor(limits: ResourceLimits) {
    super();
    this.limits = limits;
  }

  /**
   * Start monitoring resources
   */
  startMonitoring(): void {
    this.startTime = Date.now();
    this.violations = [];
    
    // Monitor every second
    this.monitoringInterval = setInterval(() => {
      this.checkLimits();
    }, 1000);
  }

  /**
   * Stop monitoring resources
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Check if current usage is within limits
   */
  async checkLimits(): Promise<MonitoringResult> {
    const usage = await this.getCurrentUsage();
    const violations: ResourceViolation[] = [];

    // Check CPU limit
    if (this.limits.maxCpuPercent && usage.cpuPercent > this.limits.maxCpuPercent) {
      const violation: ResourceViolation = {
        resource: 'cpu',
        current: usage.cpuPercent,
        limit: this.limits.maxCpuPercent,
        timestamp: new Date(),
        message: `CPU usage (${usage.cpuPercent.toFixed(1)}%) exceeds limit (${this.limits.maxCpuPercent}%)`,
      };
      violations.push(violation);
      this.violations.push(violation);
      this.emit('violation', violation);
    }

    // Check memory limit
    if (usage.memoryMB > this.limits.maxMemoryMB) {
      const violation: ResourceViolation = {
        resource: 'memory',
        current: usage.memoryMB,
        limit: this.limits.maxMemoryMB,
        timestamp: new Date(),
        message: `Memory usage (${usage.memoryMB.toFixed(1)}MB) exceeds limit (${this.limits.maxMemoryMB}MB)`,
      };
      violations.push(violation);
      this.violations.push(violation);
      this.emit('violation', violation);
    }

    // Check execution time limit
    if (usage.executionTimeMs > this.limits.maxExecutionTimeMs) {
      const violation: ResourceViolation = {
        resource: 'time',
        current: usage.executionTimeMs,
        limit: this.limits.maxExecutionTimeMs,
        timestamp: new Date(),
        message: `Execution time (${usage.executionTimeMs}ms) exceeds limit (${this.limits.maxExecutionTimeMs}ms)`,
      };
      violations.push(violation);
      this.violations.push(violation);
      this.emit('violation', violation);
      this.emit('timeout');
    }

    // Check concurrent processes limit
    if (this.limits.maxConcurrentProcesses && usage.activeProcesses > this.limits.maxConcurrentProcesses) {
      const violation: ResourceViolation = {
        resource: 'processes',
        current: usage.activeProcesses,
        limit: this.limits.maxConcurrentProcesses,
        timestamp: new Date(),
        message: `Active processes (${usage.activeProcesses}) exceeds limit (${this.limits.maxConcurrentProcesses})`,
      };
      violations.push(violation);
      this.violations.push(violation);
      this.emit('violation', violation);
    }

    return {
      withinLimits: violations.length === 0,
      usage,
      violations,
    };
  }

  /**
   * Get current resource usage
   */
  async getCurrentUsage(): Promise<ResourceUsage> {
    const memoryUsage = process.memoryUsage();
    const executionTime = this.startTime > 0 ? Date.now() - this.startTime : 0;

    return {
      cpuPercent: await this.getCpuUsage(),
      memoryMB: memoryUsage.heapUsed / (1024 * 1024),
      executionTimeMs: executionTime,
      activeProcesses: this.activeProcessCount,
    };
  }

  /**
   * Get CPU usage percentage
   * Note: This is a simplified implementation
   */
  private async getCpuUsage(): Promise<number> {
    // Get CPU usage from process
    const usage = process.cpuUsage();
    const totalUsage = (usage.user + usage.system) / 1000; // Convert to milliseconds
    
    // Calculate percentage (simplified)
    // In a real implementation, you'd want to track this over time
    const elapsedTime = this.startTime > 0 ? Date.now() - this.startTime : 1;
    const cpuPercent = (totalUsage / elapsedTime) * 100;
    
    return Math.min(cpuPercent, 100);
  }

  /**
   * Check if a file size is within limits
   */
  async checkFileSize(fileSizeBytes: number): Promise<boolean> {
    if (!this.limits.maxFileSizeMB) {
      return true;
    }

    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    
    if (fileSizeMB > this.limits.maxFileSizeMB) {
      const violation: ResourceViolation = {
        resource: 'fileSize',
        current: fileSizeMB,
        limit: this.limits.maxFileSizeMB,
        timestamp: new Date(),
        message: `File size (${fileSizeMB.toFixed(1)}MB) exceeds limit (${this.limits.maxFileSizeMB}MB)`,
      };
      this.violations.push(violation);
      this.emit('violation', violation);
      return false;
    }

    return true;
  }

  /**
   * Register a new process
   */
  registerProcess(): void {
    this.activeProcessCount++;
  }

  /**
   * Unregister a process
   */
  unregisterProcess(): void {
    this.activeProcessCount = Math.max(0, this.activeProcessCount - 1);
  }

  /**
   * Get all violations
   */
  getViolations(): ResourceViolation[] {
    return [...this.violations];
  }

  /**
   * Clear violations
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Update resource limits
   */
  updateLimits(limits: Partial<ResourceLimits>): void {
    this.limits = {
      ...this.limits,
      ...limits,
    };
  }

  /**
   * Get current limits
   */
  getLimits(): ResourceLimits {
    return { ...this.limits };
  }

  /**
   * Reset monitoring state
   */
  reset(): void {
    this.stopMonitoring();
    this.startTime = 0;
    this.activeProcessCount = 0;
    this.violations = [];
  }

  /**
   * Get execution time in milliseconds
   */
  getExecutionTime(): number {
    return this.startTime > 0 ? Date.now() - this.startTime : 0;
  }

  /**
   * Check if execution time limit is exceeded
   */
  isTimeoutExceeded(): boolean {
    return this.getExecutionTime() > this.limits.maxExecutionTimeMs;
  }

  /**
   * Get remaining execution time in milliseconds
   */
  getRemainingTime(): number {
    const elapsed = this.getExecutionTime();
    return Math.max(0, this.limits.maxExecutionTimeMs - elapsed);
  }

  /**
   * Get usage percentage for each resource
   */
  async getUsagePercentages(): Promise<{
    cpu: number;
    memory: number;
    time: number;
  }> {
    const usage = await this.getCurrentUsage();
    
    return {
      cpu: this.limits.maxCpuPercent 
        ? (usage.cpuPercent / this.limits.maxCpuPercent) * 100 
        : 0,
      memory: (usage.memoryMB / this.limits.maxMemoryMB) * 100,
      time: (usage.executionTimeMs / this.limits.maxExecutionTimeMs) * 100,
    };
  }
}

/**
 * Create a resource limiter with default limits
 */
export function createResourceLimiter(customLimits?: Partial<ResourceLimits>): ResourceLimiter {
  const defaultLimits: ResourceLimits = {
    maxCpuPercent: 80,
    maxMemoryMB: 512,
    maxExecutionTimeMs: 30000, // 30 seconds
    maxConcurrentProcesses: 5,
    maxFileSizeMB: 10,
  };

  const limits = {
    ...defaultLimits,
    ...customLimits,
  };

  return new ResourceLimiter(limits);
}

/**
 * Resource limiter with automatic enforcement
 */
export class EnforcedResourceLimiter extends ResourceLimiter {
  private killCallback: (() => void) | null = null;

  /**
   * Set callback to kill process when limits are exceeded
   */
  setKillCallback(callback: () => void): void {
    this.killCallback = callback;
  }

  /**
   * Start monitoring with automatic enforcement
   */
  startMonitoring(): void {
    super.startMonitoring();

    // Listen for violations and enforce limits
    this.on('violation', (violation: ResourceViolation) => {
      if (violation.resource === 'time' || violation.resource === 'memory') {
        // Critical violations - kill process immediately
        if (this.killCallback) {
          this.killCallback();
        }
      }
    });

    this.on('timeout', () => {
      // Timeout - kill process
      if (this.killCallback) {
        this.killCallback();
      }
    });
  }
}

/**
 * Create an enforced resource limiter
 */
export function createEnforcedResourceLimiter(
  customLimits?: Partial<ResourceLimits>
): EnforcedResourceLimiter {
  const defaultLimits: ResourceLimits = {
    maxCpuPercent: 80,
    maxMemoryMB: 512,
    maxExecutionTimeMs: 30000,
    maxConcurrentProcesses: 5,
    maxFileSizeMB: 10,
  };

  const limits = {
    ...defaultLimits,
    ...customLimits,
  };

  return new EnforcedResourceLimiter(limits);
}
