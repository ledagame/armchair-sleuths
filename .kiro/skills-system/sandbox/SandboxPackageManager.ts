/**
 * SandboxPackageManager - Manages isolated package environments for sandboxes
 * 
 * This module creates isolated node_modules directories for sandbox execution,
 * ensuring that skill scripts run with their own dependencies without affecting
 * the main workspace.
 */

import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Sandbox environment configuration
 */
export interface SandboxEnvironment {
  /** Unique sandbox ID */
  id: string;
  
  /** Path to sandbox directory */
  path: string;
  
  /** Path to node_modules in sandbox */
  nodeModulesPath: string;
  
  /** Path to package.json in sandbox */
  packageJsonPath: string;
  
  /** Cleanup function */
  cleanup: () => Promise<void>;
}

/**
 * Package installation options for sandbox
 */
export interface SandboxInstallOptions {
  /** Packages to install */
  packages: string[];
  
  /** Whether to install as dev dependencies */
  dev?: boolean;
  
  /** Whether to use exact versions */
  exact?: boolean;
  
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * SandboxPackageManager - Manages isolated package environments
 */
export class SandboxPackageManager {
  private sandboxBaseDir: string;
  private activeSandboxes: Map<string, SandboxEnvironment> = new Map();
  private sandboxCounter = 0;

  constructor(sandboxBaseDir: string = '.kiro/sandbox') {
    this.sandboxBaseDir = sandboxBaseDir;
  }

  /**
   * Create a new sandbox environment
   */
  async createSandboxEnvironment(
    skillName: string,
    packages: string[]
  ): Promise<SandboxEnvironment> {
    const sandboxId = this.generateSandboxId(skillName);
    const sandboxPath = path.join(this.sandboxBaseDir, sandboxId);

    // Create sandbox directory
    await fs.mkdir(sandboxPath, { recursive: true });

    // Create package.json
    const packageJson = this.createPackageJson(skillName, packages);
    const packageJsonPath = path.join(sandboxPath, 'package.json');
    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf-8'
    );

    // Install dependencies
    await this.runNpmInstall(sandboxPath);

    const nodeModulesPath = path.join(sandboxPath, 'node_modules');

    const environment: SandboxEnvironment = {
      id: sandboxId,
      path: sandboxPath,
      nodeModulesPath,
      packageJsonPath,
      cleanup: async () => {
        await this.cleanupSandbox(sandboxId);
      },
    };

    this.activeSandboxes.set(sandboxId, environment);
    return environment;
  }

  /**
   * Install packages in an existing sandbox
   */
  async installPackages(
    sandboxId: string,
    options: SandboxInstallOptions
  ): Promise<void> {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    // Update package.json
    const packageJson = await this.readPackageJson(sandbox.packageJsonPath);
    const depKey = options.dev ? 'devDependencies' : 'dependencies';
    
    if (!packageJson[depKey]) {
      packageJson[depKey] = {};
    }

    for (const pkg of options.packages) {
      const [name, version] = this.parsePackageSpec(pkg);
      packageJson[depKey][name] = version || (options.exact ? version : 'latest');
    }

    await fs.writeFile(
      sandbox.packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf-8'
    );

    // Install packages
    await this.runNpmInstall(sandbox.path, options.timeout);
  }

  /**
   * Uninstall packages from sandbox
   */
  async uninstallPackages(
    sandboxId: string,
    packages: string[]
  ): Promise<void> {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    await this.runNpmUninstall(sandbox.path, packages);
  }

  /**
   * Get sandbox environment
   */
  getSandboxEnvironment(sandboxId: string): SandboxEnvironment | undefined {
    return this.activeSandboxes.get(sandboxId);
  }

  /**
   * Get all active sandboxes
   */
  getActiveSandboxes(): SandboxEnvironment[] {
    return Array.from(this.activeSandboxes.values());
  }

  /**
   * Cleanup a specific sandbox
   */
  async cleanupSandbox(sandboxId: string): Promise<void> {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      return;
    }

    try {
      await fs.rm(sandbox.path, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to cleanup sandbox ${sandboxId}:`, error);
    }

    this.activeSandboxes.delete(sandboxId);
  }

  /**
   * Cleanup all sandboxes
   */
  async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.activeSandboxes.keys()).map(
      sandboxId => this.cleanupSandbox(sandboxId)
    );

    await Promise.all(cleanupPromises);
  }

  /**
   * Get sandbox count
   */
  getSandboxCount(): number {
    return this.activeSandboxes.size;
  }

  /**
   * Check if package is installed in sandbox
   */
  async isPackageInstalled(
    sandboxId: string,
    packageName: string
  ): Promise<boolean> {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      return false;
    }

    try {
      const packagePath = path.join(sandbox.nodeModulesPath, packageName);
      await fs.access(packagePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get installed packages in sandbox
   */
  async getInstalledPackages(sandboxId: string): Promise<string[]> {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      return [];
    }

    try {
      const entries = await fs.readdir(sandbox.nodeModulesPath, {
        withFileTypes: true,
      });

      const packages: string[] = [];

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          // Handle scoped packages
          if (entry.name.startsWith('@')) {
            const scopePath = path.join(sandbox.nodeModulesPath, entry.name);
            const scopedEntries = await fs.readdir(scopePath, {
              withFileTypes: true,
            });

            for (const scopedEntry of scopedEntries) {
              if (scopedEntry.isDirectory()) {
                packages.push(`${entry.name}/${scopedEntry.name}`);
              }
            }
          } else {
            packages.push(entry.name);
          }
        }
      }

      return packages;
    } catch {
      return [];
    }
  }

  /**
   * Create package.json for sandbox
   */
  private createPackageJson(
    skillName: string,
    packages: string[]
  ): any {
    const dependencies: Record<string, string> = {};

    for (const pkg of packages) {
      const [name, version] = this.parsePackageSpec(pkg);
      dependencies[name] = version || 'latest';
    }

    return {
      name: `sandbox-${skillName}`,
      version: '1.0.0',
      private: true,
      description: `Sandbox environment for ${skillName}`,
      dependencies,
    };
  }

  /**
   * Parse package specification (name@version)
   */
  private parsePackageSpec(spec: string): [string, string] {
    const parts = spec.split('@');
    
    if (spec.startsWith('@')) {
      // Scoped package: @scope/package@version
      if (parts.length >= 3) {
        const name = `@${parts[1]}`;
        const version = parts.slice(2).join('@');
        return [name, version];
      } else {
        // @scope/package without version
        return [spec, 'latest'];
      }
    } else {
      // Regular package: package@version
      if (parts.length >= 2) {
        const name = parts[0];
        const version = parts.slice(1).join('@');
        return [name, version];
      } else {
        // package without version
        return [spec, 'latest'];
      }
    }
  }

  /**
   * Run npm install in sandbox
   */
  private async runNpmInstall(
    sandboxPath: string,
    timeout: number = 60000
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install'], {
        cwd: sandboxPath,
        stdio: 'pipe',
      });

      let output = '';

      npm.stdout?.on('data', (data) => {
        output += data.toString();
      });

      npm.stderr?.on('data', (data) => {
        output += data.toString();
      });

      const timeoutHandle = setTimeout(() => {
        npm.kill('SIGTERM');
        reject(new Error(`npm install timed out after ${timeout}ms`));
      }, timeout);

      npm.on('close', (code) => {
        clearTimeout(timeoutHandle);
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}\n${output}`));
        }
      });

      npm.on('error', (error) => {
        clearTimeout(timeoutHandle);
        reject(error);
      });
    });
  }

  /**
   * Run npm uninstall in sandbox
   */
  private async runNpmUninstall(
    sandboxPath: string,
    packages: string[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['uninstall', ...packages], {
        cwd: sandboxPath,
        stdio: 'pipe',
      });

      let output = '';

      npm.stdout?.on('data', (data) => {
        output += data.toString();
      });

      npm.stderr?.on('data', (data) => {
        output += data.toString();
      });

      npm.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm uninstall failed with code ${code}\n${output}`));
        }
      });

      npm.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Read package.json from sandbox
   */
  private async readPackageJson(packageJsonPath: string): Promise<any> {
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Generate unique sandbox ID
   */
  private generateSandboxId(skillName: string): string {
    const sanitized = skillName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    return `${sanitized}-${++this.sandboxCounter}-${Date.now()}`;
  }

  /**
   * Get sandbox base directory
   */
  getSandboxBaseDir(): string {
    return this.sandboxBaseDir;
  }

  /**
   * Initialize sandbox base directory
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.sandboxBaseDir, { recursive: true });
  }
}

/**
 * Create a sandbox package manager
 */
export function createSandboxPackageManager(
  sandboxBaseDir?: string
): SandboxPackageManager {
  return new SandboxPackageManager(sandboxBaseDir);
}
