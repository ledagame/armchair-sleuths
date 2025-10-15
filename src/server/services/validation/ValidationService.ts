/**
 * ValidationService.ts
 *
 * Comprehensive validation service for ensuring quality and compliance
 * Validates:
 * - Location exploration structure and consistency
 * - Evidence collection compliance (3-Clue Rule, Fair Play)
 * - Complete case quality and playability
 */

import type {
  LocationExploration,
  validateLocationStructure
} from '../../../shared/types/Location';
import type {
  MultilingualEvidence,
  validateThreeClueRule,
  validateEvidenceStructure,
  validateFairPlay
} from '../../../shared/types/Evidence';
import {
  validateLocationStructure as validateLocationFn
} from '../../../shared/types/Location';
import {
  validateThreeClueRule as validateThreeClueRuleFn,
  validateEvidenceStructure as validateEvidenceStructureFn,
  validateFairPlay as validateFairPlayFn
} from '../../../shared/types/Evidence';

/**
 * Validation error severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation error category
 */
export type ValidationCategory =
  | 'structure'
  | 'consistency'
  | 'compliance'
  | 'quality'
  | 'playability';

/**
 * Validation issue details
 */
export interface ValidationIssue {
  severity: ValidationSeverity;
  category: ValidationCategory;
  message: string;
  field?: string;
  expected?: any;
  actual?: any;
}

/**
 * Validation result for a single component
 */
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/**
 * Complete case validation result
 */
export interface CaseValidationResult {
  valid: boolean;
  location: ValidationResult;
  evidence: ValidationResult;
  overall: ValidationResult;
  summary: {
    totalIssues: number;
    errors: number;
    warnings: number;
    infos: number;
  };
}

/**
 * ValidationService
 *
 * Provides comprehensive validation for game content quality
 */
export class ValidationService {
  /**
   * Validate location exploration content
   *
   * Checks:
   * - Structure consistency between languages
   * - Area and clue counts
   * - Metadata accuracy
   */
  validateLocationExploration(
    exploration: LocationExploration
  ): ValidationResult {
    const issues: ValidationIssue[] = [];

    // 1. Check structure consistency
    const structureValid = validateLocationFn(exploration);
    if (!structureValid) {
      issues.push({
        severity: 'error',
        category: 'structure',
        message: 'Location structure is inconsistent between languages',
        field: 'translations'
      });
    }

    // 2. Validate area counts
    const { ko, en } = exploration.translations;
    const { totalAreas, totalClues } = exploration.metadata;

    if (ko.areas.length !== totalAreas) {
      issues.push({
        severity: 'error',
        category: 'consistency',
        message: 'Korean area count does not match metadata',
        field: 'metadata.totalAreas',
        expected: ko.areas.length,
        actual: totalAreas
      });
    }

    if (en.areas.length !== totalAreas) {
      issues.push({
        severity: 'error',
        category: 'consistency',
        message: 'English area count does not match metadata',
        field: 'metadata.totalAreas',
        expected: en.areas.length,
        actual: totalAreas
      });
    }

    // 3. Validate clue counts
    const koTotalClues = ko.areas.reduce(
      (sum, area) => sum + area.clues.length,
      0
    );
    const enTotalClues = en.areas.reduce(
      (sum, area) => sum + area.clues.length,
      0
    );

    if (koTotalClues !== totalClues) {
      issues.push({
        severity: 'error',
        category: 'consistency',
        message: 'Korean total clues do not match metadata',
        field: 'metadata.totalClues',
        expected: koTotalClues,
        actual: totalClues
      });
    }

    if (enTotalClues !== totalClues) {
      issues.push({
        severity: 'error',
        category: 'consistency',
        message: 'English total clues do not match metadata',
        field: 'metadata.totalClues',
        expected: enTotalClues,
        actual: totalClues
      });
    }

    // 4. Validate minimum content requirements
    if (totalAreas < 3) {
      issues.push({
        severity: 'warning',
        category: 'quality',
        message: 'Location has fewer than 3 exploration areas',
        field: 'metadata.totalAreas',
        expected: '3+',
        actual: totalAreas
      });
    }

    if (totalClues < 8) {
      issues.push({
        severity: 'warning',
        category: 'quality',
        message: 'Location has fewer than 8 clues',
        field: 'metadata.totalClues',
        expected: '8+',
        actual: totalClues
      });
    }

    // 5. Check for empty areas
    ko.areas.forEach((area, index) => {
      if (area.clues.length === 0) {
        issues.push({
          severity: 'warning',
          category: 'quality',
          message: `Area "${area.name}" (Korean) has no clues`,
          field: `translations.ko.areas[${index}].clues`
        });
      }
    });

    return {
      valid: issues.filter((issue) => issue.severity === 'error').length === 0,
      issues
    };
  }

  /**
   * Validate evidence collection
   *
   * Checks:
   * - 3-Clue Rule compliance
   * - Fair Play compliance
   * - Structure consistency between languages
   * - Metadata accuracy
   */
  validateEvidence(evidence: MultilingualEvidence): ValidationResult {
    const issues: ValidationIssue[] = [];

    // 1. Check 3-Clue Rule compliance
    const threeClueRuleValid = validateThreeClueRuleFn(evidence);
    if (!threeClueRuleValid) {
      const { criticalCount, evidencePointingToGuilty } = evidence.metadata;

      if (criticalCount < 3) {
        issues.push({
          severity: 'error',
          category: 'compliance',
          message: '3-Clue Rule violation: Fewer than 3 critical evidence items',
          field: 'metadata.criticalCount',
          expected: '3+',
          actual: criticalCount
        });
      }

      if (evidencePointingToGuilty < 3) {
        issues.push({
          severity: 'error',
          category: 'compliance',
          message:
            '3-Clue Rule violation: Fewer than 3 evidence items point to guilty',
          field: 'metadata.evidencePointingToGuilty',
          expected: '3+',
          actual: evidencePointingToGuilty
        });
      }
    }

    // 2. Check Fair Play compliance
    const fairPlayValid = validateFairPlayFn(evidence);
    if (!fairPlayValid) {
      const { ko } = evidence.translations;

      // Check for missing discovery hints
      ko.items.forEach((item, index) => {
        if (!item.discoveryHint || item.discoveryHint.trim().length === 0) {
          issues.push({
            severity: 'error',
            category: 'compliance',
            message: `Fair Play violation: Evidence "${item.name}" missing discovery hint`,
            field: `translations.ko.items[${index}].discoveryHint`
          });
        }
      });

      // Check for missing interpretation hints in critical evidence
      const criticalItems = ko.items.filter(
        (item) => item.relevance === 'critical'
      );
      criticalItems.forEach((item, index) => {
        if (
          !item.interpretationHint ||
          item.interpretationHint.trim().length === 0
        ) {
          issues.push({
            severity: 'error',
            category: 'compliance',
            message: `Fair Play violation: Critical evidence "${item.name}" missing interpretation hint`,
            field: `translations.ko.items[${ko.items.indexOf(item)}].interpretationHint`
          });
        }
      });
    }

    // 3. Check structure consistency
    const structureValid = validateEvidenceStructureFn(evidence);
    if (!structureValid) {
      issues.push({
        severity: 'error',
        category: 'structure',
        message: 'Evidence structure is inconsistent between languages',
        field: 'translations'
      });
    }

    // 4. Validate metadata consistency
    const { ko, en } = evidence.translations;
    const { totalItems, criticalCount } = evidence.metadata;

    if (ko.items.length !== totalItems) {
      issues.push({
        severity: 'error',
        category: 'consistency',
        message: 'Korean item count does not match metadata',
        field: 'metadata.totalItems',
        expected: ko.items.length,
        actual: totalItems
      });
    }

    if (en.items.length !== totalItems) {
      issues.push({
        severity: 'error',
        category: 'consistency',
        message: 'English item count does not match metadata',
        field: 'metadata.totalItems',
        expected: en.items.length,
        actual: totalItems
      });
    }

    const koCriticalCount = ko.items.filter(
      (item) => item.relevance === 'critical'
    ).length;
    if (koCriticalCount !== criticalCount) {
      issues.push({
        severity: 'error',
        category: 'consistency',
        message: 'Korean critical count does not match metadata',
        field: 'metadata.criticalCount',
        expected: koCriticalCount,
        actual: criticalCount
      });
    }

    // 5. Validate evidence variety
    const evidenceTypes = new Set(ko.items.map((item) => item.type));
    if (evidenceTypes.size < 3) {
      issues.push({
        severity: 'warning',
        category: 'quality',
        message: 'Evidence lacks variety (fewer than 3 different types)',
        field: 'translations.ko.items',
        expected: '3+ types',
        actual: `${evidenceTypes.size} types`
      });
    }

    // 6. Validate evidence distribution
    if (totalItems < 8) {
      issues.push({
        severity: 'warning',
        category: 'quality',
        message: 'Fewer than 8 evidence items',
        field: 'metadata.totalItems',
        expected: '8+',
        actual: totalItems
      });
    }

    if (totalItems > 15) {
      issues.push({
        severity: 'info',
        category: 'quality',
        message: 'More than 15 evidence items (may be overwhelming)',
        field: 'metadata.totalItems',
        actual: totalItems
      });
    }

    return {
      valid: issues.filter((issue) => issue.severity === 'error').length === 0,
      issues
    };
  }

  /**
   * Validate complete case with location and evidence
   *
   * Performs comprehensive validation and returns detailed results
   */
  validateCompleteCase(
    location: LocationExploration,
    evidence: MultilingualEvidence
  ): CaseValidationResult {
    const issues: ValidationIssue[] = [];

    // 1. Validate individual components
    const locationResult = this.validateLocationExploration(location);
    const evidenceResult = this.validateEvidence(evidence);

    // 2. Validate cross-component consistency
    if (location.locationId !== evidence.locationId) {
      issues.push({
        severity: 'error',
        category: 'consistency',
        message: 'Location ID mismatch between exploration and evidence',
        field: 'locationId',
        expected: location.locationId,
        actual: evidence.locationId
      });
    }

    if (location.caseId !== evidence.caseId) {
      issues.push({
        severity: 'error',
        category: 'consistency',
        message: 'Case ID mismatch between exploration and evidence',
        field: 'caseId',
        expected: location.caseId,
        actual: evidence.caseId
      });
    }

    // 3. Validate playability
    const totalClues = location.metadata.totalClues;
    const totalEvidence = evidence.metadata.totalItems;

    if (totalClues === 0 && totalEvidence === 0) {
      issues.push({
        severity: 'error',
        category: 'playability',
        message: 'Case has no clues or evidence (unplayable)',
        field: 'content'
      });
    }

    if (!evidence.metadata.threeClueRuleCompliant) {
      issues.push({
        severity: 'error',
        category: 'playability',
        message: 'Case does not satisfy 3-Clue Rule (unsolvable)',
        field: 'evidence.metadata.threeClueRuleCompliant'
      });
    }

    // 4. Calculate summary
    const allIssues = [
      ...locationResult.issues,
      ...evidenceResult.issues,
      ...issues
    ];

    const summary = {
      totalIssues: allIssues.length,
      errors: allIssues.filter((issue) => issue.severity === 'error').length,
      warnings: allIssues.filter((issue) => issue.severity === 'warning')
        .length,
      infos: allIssues.filter((issue) => issue.severity === 'info').length
    };

    const overallValid =
      locationResult.valid &&
      evidenceResult.valid &&
      issues.filter((issue) => issue.severity === 'error').length === 0;

    return {
      valid: overallValid,
      location: locationResult,
      evidence: evidenceResult,
      overall: {
        valid: overallValid,
        issues
      },
      summary
    };
  }

  /**
   * Format validation result as human-readable report
   */
  formatValidationReport(result: CaseValidationResult): string {
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push('CASE VALIDATION REPORT');
    lines.push('='.repeat(60));
    lines.push('');

    // Summary
    lines.push(`Overall Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
    lines.push(
      `Total Issues: ${result.summary.totalIssues} (${result.summary.errors} errors, ${result.summary.warnings} warnings, ${result.summary.infos} info)`
    );
    lines.push('');

    // Location validation
    lines.push('--- Location Exploration ---');
    lines.push(
      `Status: ${result.location.valid ? '✅ Valid' : '❌ Invalid'}`
    );
    if (result.location.issues.length > 0) {
      result.location.issues.forEach((issue) => {
        const icon =
          issue.severity === 'error'
            ? '❌'
            : issue.severity === 'warning'
              ? '⚠️'
              : 'ℹ️';
        lines.push(`  ${icon} [${issue.category}] ${issue.message}`);
        if (issue.field) lines.push(`     Field: ${issue.field}`);
        if (issue.expected !== undefined)
          lines.push(`     Expected: ${issue.expected}`);
        if (issue.actual !== undefined)
          lines.push(`     Actual: ${issue.actual}`);
      });
    }
    lines.push('');

    // Evidence validation
    lines.push('--- Evidence Collection ---');
    lines.push(`Status: ${result.evidence.valid ? '✅ Valid' : '❌ Invalid'}`);
    if (result.evidence.issues.length > 0) {
      result.evidence.issues.forEach((issue) => {
        const icon =
          issue.severity === 'error'
            ? '❌'
            : issue.severity === 'warning'
              ? '⚠️'
              : 'ℹ️';
        lines.push(`  ${icon} [${issue.category}] ${issue.message}`);
        if (issue.field) lines.push(`     Field: ${issue.field}`);
        if (issue.expected !== undefined)
          lines.push(`     Expected: ${issue.expected}`);
        if (issue.actual !== undefined)
          lines.push(`     Actual: ${issue.actual}`);
      });
    }
    lines.push('');

    // Overall validation
    if (result.overall.issues.length > 0) {
      lines.push('--- Overall Case Quality ---');
      result.overall.issues.forEach((issue) => {
        const icon =
          issue.severity === 'error'
            ? '❌'
            : issue.severity === 'warning'
              ? '⚠️'
              : 'ℹ️';
        lines.push(`  ${icon} [${issue.category}] ${issue.message}`);
        if (issue.field) lines.push(`     Field: ${issue.field}`);
        if (issue.expected !== undefined)
          lines.push(`     Expected: ${issue.expected}`);
        if (issue.actual !== undefined)
          lines.push(`     Actual: ${issue.actual}`);
      });
      lines.push('');
    }

    lines.push('='.repeat(60));

    return lines.join('\n');
  }
}

/**
 * Factory function to create ValidationService
 */
export function createValidationService(): ValidationService {
  return new ValidationService();
}
