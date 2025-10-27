/**
 * PermissionChecker - Validates and enforces security permissions for skill scripts
 * 
 * This module checks file system, network, and system command permissions
 * before allowing script execution.
 */

import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Permission types
 */
export enum PermissionType {
  FILESYSTEM_READ = 'filesystem:read',
  FILESYSTEM_WRITE = 'filesystem:write',
  FILESYSTEM_DELETE = 'filesystem:delete',
  NETWORK_HTTP = 'network:http',
  NETWORK_HTTPS = 'network:https',
  SYSTEM_EXEC = 'system:exec',
  SYSTEM_ENV = 'system:env',
}

/**
 * Permission definition
 */
export interface Permission {
  /** Type of permission */
  type: PermissionType;
  
  /** Scope of the permission (path, URL, command, etc.) */
  scope: string;
  
  /** Reason for requesting this permission */
  reason: string;
  
  /** Whether this permission is required or optional */
  required?: boolean;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  /** Whether the permission is granted */
  granted: boolean;
  
  /** Permission that was checked */
  permission: Permission;
  
  /** Reason for denial if not granted */
  denialReason?: string;
  
  /** Suggested fix if permission was denied */
  suggestedFix?: string;
}

/**
 * Permission policy configuration
 */
export interface PermissionPolicy {
  /** Allowed file system paths for read operations */
  allowedReadPaths: string[];
  
  /** Allowed file system paths for write operations */
  allowedWritePaths: string[];
  
  /** Blocked file system paths (takes precedence over allowed) */
  blockedPaths: string[];
  
  /** Whether to allow network access */
  allowNetwork: boolean;
  
  /** Allowed network domains (if allowNetwork is true) */
  allowedDomains?: string[];
  
  /** Blocked network domains */
  blockedDomains?: string[];
  
  /** Allowed system commands */
  allowedCommands: string[];
  
  /** Blocked system commands (takes precedence over allowed) */
  blockedCommands: string[];
  
  /** Whether to allow environment variable access */
  allowEnvAccess: boolean;
}

/**
 * PermissionChecker - Validates permissions for skill script execution
 */
export class PermissionChecker {
  private policy: PermissionPolicy;

  constructor(policy: PermissionPolicy) {
    this.policy = policy;
  }

  /**
   * Check a single permission
   */
  async checkPermission(permission: Permission): Promise<PermissionCheckResult> {
    switch (permission.type) {
      case PermissionType.FILESYSTEM_READ:
        return this.checkFileSystemRead(permission);
      
      case PermissionType.FILESYSTEM_WRITE:
        return this.checkFileSystemWrite(permission);
      
      case PermissionType.FILESYSTEM_DELETE:
        return this.checkFileSystemDelete(permission);
      
      case PermissionType.NETWORK_HTTP:
      case PermissionType.NETWORK_HTTPS:
        return this.checkNetwork(permission);
      
      case PermissionType.SYSTEM_EXEC:
        return this.checkSystemExec(permission);
      
      case PermissionType.SYSTEM_ENV:
        return this.checkSystemEnv(permission);
      
      default:
        return {
          granted: false,
          permission,
          denialReason: `Unknown permission type: ${permission.type}`,
        };
    }
  }

  /**
   * Check multiple permissions
   */
  async checkPermissions(permissions: Permission[]): Promise<PermissionCheckResult[]> {
    const results = await Promise.all(
      permissions.map(permission => this.checkPermission(permission))
    );
    
    return results;
  }

  /**
   * Check if all required permissions are granted
   */
  async areAllPermissionsGranted(permissions: Permission[]): Promise<boolean> {
    const results = await this.checkPermissions(permissions);
    
    // Check if all required permissions are granted
    return results.every(result => {
      if (result.permission.required === false) {
        return true; // Optional permissions don't block execution
      }
      return result.granted;
    });
  }

  /**
   * Get denied permissions
   */
  async getDeniedPermissions(permissions: Permission[]): Promise<PermissionCheckResult[]> {
    const results = await this.checkPermissions(permissions);
    return results.filter(result => !result.granted);
  }

  /**
   * Check file system read permission
   */
  private async checkFileSystemRead(permission: Permission): Promise<PermissionCheckResult> {
    const targetPath = path.resolve(permission.scope);
    
    // Check if path is blocked
    if (this.isPathBlocked(targetPath)) {
      return {
        granted: false,
        permission,
        denialReason: 'Path is in blocked list',
        suggestedFix: 'Remove path from blockedPaths in security policy',
      };
    }
    
    // Check if path is allowed
    if (!this.isPathAllowed(targetPath, this.policy.allowedReadPaths)) {
      return {
        granted: false,
        permission,
        denialReason: 'Path is not in allowed read paths',
        suggestedFix: `Add "${targetPath}" to allowedReadPaths in security policy`,
      };
    }
    
    // Check if path exists
    try {
      await fs.access(targetPath, fs.constants.R_OK);
    } catch (error) {
      return {
        granted: false,
        permission,
        denialReason: 'Path does not exist or is not readable',
        suggestedFix: 'Ensure the path exists and has read permissions',
      };
    }
    
    return {
      granted: true,
      permission,
    };
  }

  /**
   * Check file system write permission
   */
  private async checkFileSystemWrite(permission: Permission): Promise<PermissionCheckResult> {
    const targetPath = path.resolve(permission.scope);
    
    // Check if path is blocked
    if (this.isPathBlocked(targetPath)) {
      return {
        granted: false,
        permission,
        denialReason: 'Path is in blocked list',
        suggestedFix: 'Remove path from blockedPaths in security policy',
      };
    }
    
    // Check if path is allowed
    if (!this.isPathAllowed(targetPath, this.policy.allowedWritePaths)) {
      return {
        granted: false,
        permission,
        denialReason: 'Path is not in allowed write paths',
        suggestedFix: `Add "${targetPath}" to allowedWritePaths in security policy`,
      };
    }
    
    // Check if parent directory exists and is writable
    const parentDir = path.dirname(targetPath);
    try {
      await fs.access(parentDir, fs.constants.W_OK);
    } catch (error) {
      return {
        granted: false,
        permission,
        denialReason: 'Parent directory does not exist or is not writable',
        suggestedFix: 'Ensure the parent directory exists and has write permissions',
      };
    }
    
    return {
      granted: true,
      permission,
    };
  }

  /**
   * Check file system delete permission
   */
  private async checkFileSystemDelete(permission: Permission): Promise<PermissionCheckResult> {
    const targetPath = path.resolve(permission.scope);
    
    // Check if path is blocked
    if (this.isPathBlocked(targetPath)) {
      return {
        granted: false,
        permission,
        denialReason: 'Path is in blocked list',
        suggestedFix: 'Remove path from blockedPaths in security policy',
      };
    }
    
    // Check if path is allowed for write (delete requires write permission)
    if (!this.isPathAllowed(targetPath, this.policy.allowedWritePaths)) {
      return {
        granted: false,
        permission,
        denialReason: 'Path is not in allowed write paths',
        suggestedFix: `Add "${targetPath}" to allowedWritePaths in security policy`,
      };
    }
    
    return {
      granted: true,
      permission,
    };
  }

  /**
   * Check network permission
   */
  private async checkNetwork(permission: Permission): Promise<PermissionCheckResult> {
    // Check if network access is allowed
    if (!this.policy.allowNetwork) {
      return {
        granted: false,
        permission,
        denialReason: 'Network access is disabled',
        suggestedFix: 'Enable allowNetwork in security policy',
      };
    }
    
    // Extract domain from URL
    const url = new URL(permission.scope);
    const domain = url.hostname;
    
    // Check if domain is blocked
    if (this.policy.blockedDomains?.includes(domain)) {
      return {
        granted: false,
        permission,
        denialReason: `Domain "${domain}" is blocked`,
        suggestedFix: `Remove "${domain}" from blockedDomains in security policy`,
      };
    }
    
    // Check if domain is allowed (if allowedDomains is specified)
    if (this.policy.allowedDomains && this.policy.allowedDomains.length > 0) {
      if (!this.policy.allowedDomains.includes(domain)) {
        return {
          granted: false,
          permission,
          denialReason: `Domain "${domain}" is not in allowed domains`,
          suggestedFix: `Add "${domain}" to allowedDomains in security policy`,
        };
      }
    }
    
    return {
      granted: true,
      permission,
    };
  }

  /**
   * Check system command execution permission
   */
  private async checkSystemExec(permission: Permission): Promise<PermissionCheckResult> {
    const command = permission.scope;
    
    // Check if command is blocked
    if (this.policy.blockedCommands.includes(command)) {
      return {
        granted: false,
        permission,
        denialReason: `Command "${command}" is blocked`,
        suggestedFix: `Remove "${command}" from blockedCommands in security policy`,
      };
    }
    
    // Check if command is allowed
    if (!this.policy.allowedCommands.includes(command)) {
      return {
        granted: false,
        permission,
        denialReason: `Command "${command}" is not in allowed commands`,
        suggestedFix: `Add "${command}" to allowedCommands in security policy`,
      };
    }
    
    return {
      granted: true,
      permission,
    };
  }

  /**
   * Check environment variable access permission
   */
  private async checkSystemEnv(permission: Permission): Promise<PermissionCheckResult> {
    if (!this.policy.allowEnvAccess) {
      return {
        granted: false,
        permission,
        denialReason: 'Environment variable access is disabled',
        suggestedFix: 'Enable allowEnvAccess in security policy',
      };
    }
    
    return {
      granted: true,
      permission,
    };
  }

  /**
   * Check if a path is blocked
   */
  private isPathBlocked(targetPath: string): boolean {
    return this.policy.blockedPaths.some(blockedPath => {
      const resolvedBlocked = path.resolve(blockedPath);
      return targetPath.startsWith(resolvedBlocked);
    });
  }

  /**
   * Check if a path is allowed
   */
  private isPathAllowed(targetPath: string, allowedPaths: string[]): boolean {
    return allowedPaths.some(allowedPath => {
      const resolvedAllowed = path.resolve(allowedPath);
      return targetPath.startsWith(resolvedAllowed);
    });
  }

  /**
   * Update permission policy
   */
  updatePolicy(policy: Partial<PermissionPolicy>): void {
    this.policy = {
      ...this.policy,
      ...policy,
    };
  }

  /**
   * Get current policy
   */
  getPolicy(): PermissionPolicy {
    return { ...this.policy };
  }
}

/**
 * Create a default permission checker with secure defaults
 */
export function createPermissionChecker(workspaceRoot: string): PermissionChecker {
  const policy: PermissionPolicy = {
    // Allow read/write only within workspace
    allowedReadPaths: [workspaceRoot],
    allowedWritePaths: [workspaceRoot],
    
    // Block sensitive directories
    blockedPaths: [
      path.join(workspaceRoot, 'node_modules'),
      path.join(workspaceRoot, '.git'),
      path.join(workspaceRoot, '.env'),
    ],
    
    // Disable network by default
    allowNetwork: false,
    allowedDomains: [],
    blockedDomains: [],
    
    // Allow only safe commands
    allowedCommands: ['npm', 'node', 'tsx', 'tsc'],
    blockedCommands: ['rm', 'del', 'format', 'shutdown'],
    
    // Disable env access by default
    allowEnvAccess: false,
  };
  
  return new PermissionChecker(policy);
}
