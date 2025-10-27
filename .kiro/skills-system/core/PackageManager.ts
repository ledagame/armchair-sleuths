/**
 * PackageManager - Manages npm package installation and version checking
 * 
 * This module provides utilities for checking installed packages,
 * installing missing packages, and managing package versions.
 */

import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Package information
 */
export interface PackageInfo {
  /** Package name */
  name: string;
  
  /** Installed version */
  version: string;
  
  /** Whether package is installed */
  installed: boolean;
  
  /** Installation path */
  path?: string;
}

/**
 * Package installation result
 */
export interface InstallResult {
  /** Whether installation was successful */
  success: boolean;
  
  /** Packages that were installed */
  installed: string[];
  
  /** Packages that failed to install */
  failed: string[];
  
  /** Error messages */
  errors: InstallError[];
  
  /** Installation output */
  output: string;
}

/**
 * Installation error
 */
export interface InstallError {
  /** Package name */
  package: string;
  
  /** Error message */
  message: string;
  
  /** Error code */
  code?: string | number;
}

/**
 * PackageManager - Manages npm packages
 */
export class PackageManager {
  private workspaceRoot: string;
  private packageJsonPath: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.packageJsonPath = path.join(workspaceRoot, 'package.json');
  }

  /**
   * Check if a package is installed
   */
  async isInstalled(packageName: string): Promise<boolean> {
    try {
      // Try to resolve the package
      const packagePath = path.join(
        this.workspaceRoot,
        'node_modules',
        packageName
      );
      
      await fs.access(packagePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get installed package version
   */
  async getVersion(packageName: string): Promise<string | null> {
    try {
      const packageJsonPath = path.join(
        this.workspaceRoot,
        'node_modules',
        packageName,
        'package.json'
      );
      
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      return packageJson.version || null;
    } catch {
      return null;
    }
  }

  /**
   * Get package information
   */
  async getPackageInfo(packageName: string): Promise<PackageInfo> {
    const installed = await this.isInstalled(packageName);
    const version = installed ? await this.getVersion(packageName) : '';
    const packagePath = installed
      ? path.join(this.workspaceRoot, 'node_modules', packageName)
      : undefined;

    return {
      name: packageName,
      version: version || '',
      installed,
      path: packagePath,
    };
  }

  /**
   * Install packages
   */
  async install(packages: string[]): Promise<InstallResult> {
    if (packages.length === 0) {
      return {
        success: true,
        installed: [],
        failed: [],
        errors: [],
        output: '',
      };
    }

    const installed: string[] = [];
    const failed: string[] = [];
    const errors: InstallError[] = [];

    try {
      // Run npm install
      const output = await this.runNpmInstall(packages);

      // Check which packages were successfully installed
      for (const pkg of packages) {
        const isInstalled = await this.isInstalled(pkg);
        if (isInstalled) {
          installed.push(pkg);
        } else {
          failed.push(pkg);
          errors.push({
            package: pkg,
            message: 'Package not found after installation',
          });
        }
      }

      return {
        success: failed.length === 0,
        installed,
        failed,
        errors,
        output,
      };
    } catch (error) {
      // Installation failed
      packages.forEach(pkg => {
        failed.push(pkg);
        errors.push({
          package: pkg,
          message: error instanceof Error ? error.message : String(error),
        });
      });

      return {
        success: false,
        installed,
        failed,
        errors,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Install a single package
   */
  async installPackage(packageName: string): Promise<boolean> {
    const result = await this.install([packageName]);
    return result.success;
  }

  /**
   * Uninstall packages
   */
  async uninstall(packages: string[]): Promise<InstallResult> {
    if (packages.length === 0) {
      return {
        success: true,
        installed: [],
        failed: [],
        errors: [],
        output: '',
      };
    }

    const uninstalled: string[] = [];
    const failed: string[] = [];
    const errors: InstallError[] = [];

    try {
      // Run npm uninstall
      const output = await this.runNpmUninstall(packages);

      // Check which packages were successfully uninstalled
      for (const pkg of packages) {
        const isInstalled = await this.isInstalled(pkg);
        if (!isInstalled) {
          uninstalled.push(pkg);
        } else {
          failed.push(pkg);
          errors.push({
            package: pkg,
            message: 'Package still exists after uninstallation',
          });
        }
      }

      return {
        success: failed.length === 0,
        installed: uninstalled,
        failed,
        errors,
        output,
      };
    } catch (error) {
      packages.forEach(pkg => {
        failed.push(pkg);
        errors.push({
          package: pkg,
          message: error instanceof Error ? error.message : String(error),
        });
      });

      return {
        success: false,
        installed: uninstalled,
        failed,
        errors,
        output: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get all installed packages
   */
  async getInstalledPackages(): Promise<PackageInfo[]> {
    try {
      const nodeModulesPath = path.join(this.workspaceRoot, 'node_modules');
      const entries = await fs.readdir(nodeModulesPath, { withFileTypes: true });

      const packages: PackageInfo[] = [];

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          // Handle scoped packages (@scope/package)
          if (entry.name.startsWith('@')) {
            const scopePath = path.join(nodeModulesPath, entry.name);
            const scopedEntries = await fs.readdir(scopePath, { withFileTypes: true });
            
            for (const scopedEntry of scopedEntries) {
              if (scopedEntry.isDirectory()) {
                const packageName = `${entry.name}/${scopedEntry.name}`;
                const info = await this.getPackageInfo(packageName);
                packages.push(info);
              }
            }
          } else {
            const info = await this.getPackageInfo(entry.name);
            packages.push(info);
          }
        }
      }

      return packages;
    } catch {
      return [];
    }
  }

  /**
   * Check for missing packages
   */
  async getMissingPackages(requiredPackages: string[]): Promise<string[]> {
    const missing: string[] = [];

    for (const pkg of requiredPackages) {
      const installed = await this.isInstalled(pkg);
      if (!installed) {
        missing.push(pkg);
      }
    }

    return missing;
  }

  /**
   * Install missing packages
   */
  async installMissing(requiredPackages: string[]): Promise<InstallResult> {
    const missing = await this.getMissingPackages(requiredPackages);
    
    if (missing.length === 0) {
      return {
        success: true,
        installed: [],
        failed: [],
        errors: [],
        output: 'All packages already installed',
      };
    }

    return this.install(missing);
  }

  /**
   * Run npm install command
   */
  private async runNpmInstall(packages: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';

      const npm = spawn('npm', ['install', ...packages], {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      });

      npm.stdout?.on('data', (data) => {
        output += data.toString();
      });

      npm.stderr?.on('data', (data) => {
        output += data.toString();
      });

      npm.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`npm install failed with code ${code}\n${output}`));
        }
      });

      npm.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Run npm uninstall command
   */
  private async runNpmUninstall(packages: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';

      const npm = spawn('npm', ['uninstall', ...packages], {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      });

      npm.stdout?.on('data', (data) => {
        output += data.toString();
      });

      npm.stderr?.on('data', (data) => {
        output += data.toString();
      });

      npm.on('close', (code) => {
        if (code === 0) {
          resolve(output);
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
   * Get workspace root
   */
  getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }

  /**
   * Check if package.json exists
   */
  async hasPackageJson(): Promise<boolean> {
    try {
      await fs.access(this.packageJsonPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read package.json
   */
  async readPackageJson(): Promise<any> {
    try {
      const content = await fs.readFile(this.packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Get dependencies from package.json
   */
  async getDependencies(): Promise<Record<string, string>> {
    const packageJson = await this.readPackageJson();
    return packageJson?.dependencies || {};
  }

  /**
   * Get dev dependencies from package.json
   */
  async getDevDependencies(): Promise<Record<string, string>> {
    const packageJson = await this.readPackageJson();
    return packageJson?.devDependencies || {};
  }

  /**
   * Get all dependencies (dependencies + devDependencies)
   */
  async getAllDependencies(): Promise<Record<string, string>> {
    const deps = await this.getDependencies();
    const devDeps = await this.getDevDependencies();
    return { ...deps, ...devDeps };
  }
}

/**
 * Create a package manager for the workspace
 */
export function createPackageManager(workspaceRoot: string): PackageManager {
  return new PackageManager(workspaceRoot);
}
