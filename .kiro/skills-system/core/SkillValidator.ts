import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import type {
  SkillMetadata,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types.js';

/**
 * SkillValidator - Validates skill structure and metadata
 */
export class SkillValidator {
  private requiredFields: string[] = ['name', 'version', 'description'];
  private requiredFiles: string[] = []; // No files are strictly required anymore
  private optionalFiles: string[] = ['SKILL.yaml', 'SKILL.md', 'PROMPT.md', 'README.md'];

  /**
   * Validate a complete skill
   * @param skillPath Path to skill folder
   * @param metadata Parsed skill metadata
   * @returns Validation result with errors and warnings
   */
  async validateSkill(
    skillPath: string,
    metadata: SkillMetadata
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate metadata
    const metadataErrors = this.validateMetadata(metadata);
    errors.push(...metadataErrors);

    // Validate file structure
    const fileErrors = await this.validateFileStructure(skillPath);
    errors.push(...fileErrors.errors);
    warnings.push(...fileErrors.warnings);

    // Validate dependencies
    const depErrors = this.validateDependencies(metadata);
    errors.push(...depErrors.errors);
    warnings.push(...depErrors.warnings);

    // Validate capabilities
    const capErrors = this.validateCapabilities(metadata);
    errors.push(...capErrors.errors);
    warnings.push(...capErrors.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate skill metadata
   * @param metadata Skill metadata
   * @returns Array of validation errors
   */
  validateMetadata(metadata: SkillMetadata): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check required fields
    for (const field of this.requiredFields) {
      if (!metadata[field as keyof SkillMetadata]) {
        errors.push({
          field,
          message: `Required field '${field}' is missing`,
          severity: 'error',
        });
      }
    }

    // Validate name format
    if (metadata.name) {
      if (!/^[a-z0-9-]+$/.test(metadata.name)) {
        errors.push({
          field: 'name',
          message:
            'Skill name must contain only lowercase letters, numbers, and hyphens',
          severity: 'error',
        });
      }
    }

    // Validate version format (semver)
    if (metadata.version) {
      if (!/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?$/.test(metadata.version)) {
        errors.push({
          field: 'version',
          message: 'Version must follow semantic versioning (e.g., 1.0.0)',
          severity: 'error',
        });
      }
    }

    // Validate description length
    if (metadata.description) {
      if (metadata.description.length < 10) {
        errors.push({
          field: 'description',
          message: 'Description must be at least 10 characters',
          severity: 'error',
        });
      }
      if (metadata.description.length > 500) {
        errors.push({
          field: 'description',
          message: 'Description should not exceed 500 characters',
          severity: 'warning',
        });
      }
    }

    // Validate triggers
    if (!metadata.triggers || metadata.triggers.length === 0) {
      errors.push({
        field: 'triggers',
        message: 'At least one trigger keyword is required',
        severity: 'warning',
      });
    }

    return errors;
  }

  /**
   * Validate file structure
   * @param skillPath Path to skill folder
   * @returns Validation errors and warnings
   */
  async validateFileStructure(
    skillPath: string
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      const files = await readdir(skillPath);

      // Check for at least one prompt file (REQUIRED)
      const hasPromptFile =
        files.includes('SKILL.md') || files.includes('PROMPT.md');
      if (!hasPromptFile) {
        errors.push({
          field: 'files',
          message: 'At least one prompt file (SKILL.md or PROMPT.md) is required',
          severity: 'error',
        });
      }

      // Warn if SKILL.yaml is missing (recommended but not required)
      if (!files.includes('SKILL.yaml')) {
        warnings.push({
          field: 'files',
          message: 'SKILL.yaml is recommended for structured metadata. Falling back to markdown frontmatter.',
        });
      }

      // Warn if README is missing
      if (!files.includes('README.md')) {
        warnings.push({
          field: 'files',
          message: 'README.md is recommended for documentation',
        });
      }

      // Check for scripts directory if capabilities reference scripts
      if (files.some((f) => f.includes('script'))) {
        const hasScriptsDir = files.includes('scripts');
        if (!hasScriptsDir) {
          warnings.push({
            field: 'files',
            message: 'scripts/ directory is recommended for automation scripts',
          });
        }
      }
    } catch (error) {
      errors.push({
        field: 'files',
        message: `Failed to read skill directory: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate dependencies
   * @param metadata Skill metadata
   * @returns Validation errors and warnings
   */
  validateDependencies(
    metadata: SkillMetadata
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!metadata.dependencies) {
      return { errors, warnings };
    }

    // Validate skill dependencies
    if (metadata.dependencies.skills) {
      for (const skillDep of metadata.dependencies.skills) {
        if (!/^[a-z0-9-]+$/.test(skillDep)) {
          errors.push({
            field: 'dependencies.skills',
            message: `Invalid skill dependency name: ${skillDep}`,
            severity: 'error',
          });
        }
      }
    }

    // Validate package dependencies
    if (metadata.dependencies.packages) {
      for (const pkg of metadata.dependencies.packages) {
        // Check for valid npm package name format
        if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(pkg)) {
          errors.push({
            field: 'dependencies.packages',
            message: `Invalid package name: ${pkg}`,
            severity: 'error',
          });
        }
      }
    }

    // Warn if there are many dependencies
    const totalDeps =
      (metadata.dependencies.skills?.length || 0) +
      (metadata.dependencies.apis?.length || 0) +
      (metadata.dependencies.packages?.length || 0);

    if (totalDeps > 10) {
      warnings.push({
        field: 'dependencies',
        message: `Skill has ${totalDeps} dependencies, consider reducing complexity`,
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate capabilities
   * @param metadata Skill metadata
   * @returns Validation errors and warnings
   */
  validateCapabilities(
    metadata: SkillMetadata
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!metadata.capabilities || metadata.capabilities.length === 0) {
      warnings.push({
        field: 'capabilities',
        message: 'No capabilities defined - skill may not be very useful',
      });
      return { errors, warnings };
    }

    // Validate each capability
    for (const capability of metadata.capabilities) {
      if (!capability.name) {
        errors.push({
          field: 'capabilities',
          message: 'Capability is missing required field: name',
          severity: 'error',
        });
      }

      if (!capability.description) {
        errors.push({
          field: 'capabilities',
          message: `Capability '${capability.name}' is missing description`,
          severity: 'error',
        });
      }

      // Validate capability name format
      if (capability.name && !/^[a-z0-9-]+$/.test(capability.name)) {
        errors.push({
          field: 'capabilities',
          message: `Capability name '${capability.name}' must contain only lowercase letters, numbers, and hyphens`,
          severity: 'error',
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Quick validation - check only critical fields
   * @param metadata Skill metadata
   * @returns true if skill passes basic validation
   */
  quickValidate(metadata: SkillMetadata): boolean {
    return (
      !!metadata.name &&
      !!metadata.version &&
      !!metadata.description &&
      /^[a-z0-9-]+$/.test(metadata.name) &&
      /^\d+\.\d+\.\d+/.test(metadata.version)
    );
  }

  /**
   * Get validation summary
   * @param result Validation result
   * @returns Human-readable summary
   */
  getSummary(result: ValidationResult): string {
    const { valid, errors, warnings } = result;

    if (valid && warnings.length === 0) {
      return '✅ Skill is valid with no issues';
    }

    if (valid && warnings.length > 0) {
      return `✅ Skill is valid with ${warnings.length} warning(s)`;
    }

    return `❌ Skill validation failed with ${errors.length} error(s) and ${warnings.length} warning(s)`;
  }
}
