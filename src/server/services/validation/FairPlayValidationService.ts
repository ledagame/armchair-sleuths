/**
 * FairPlayValidationService.ts
 *
 * Validates that generated cases comply with Fair Play principles
 * Ensures all evidence is discoverable and case is solvable
 */

import type { MultilingualEvidence } from '@/shared/types/Evidence';
import {
  validateThreeClueRule,
  validateEvidenceStructure,
  validateFairPlay,
  validateDiscoveryProbabilities,
} from '@/shared/types/Evidence';

/**
 * Validation result for Fair Play compliance
 */
export interface FairPlayValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    threeClueRuleCompliant: boolean;
    structureValid: boolean;
    fairPlayCompliant: boolean;
    probabilitiesValid: boolean;
    criticalEvidenceDiscoverable: boolean;
  };
}

/**
 * FairPlayValidationService
 *
 * Comprehensive validation for detective game fairness
 */
export class FairPlayValidationService {
  /**
   * Validate evidence collection for Fair Play compliance
   *
   * Checks:
   * 1. 3-Clue Rule: Minimum 3 critical clues pointing to guilty
   * 2. Structure: Korean and English have same structure
   * 3. Fair Play: All evidence has discovery hints
   * 4. Probabilities: Critical evidence has >= 70% thorough discovery rate
   * 5. Discoverability: All critical evidence findable with exhaustive search
   *
   * @param evidence - Evidence collection to validate
   * @returns Validation result with errors and warnings
   */
  validateEvidence(evidence: MultilingualEvidence): FairPlayValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate 3-Clue Rule
    const threeClueRuleCompliant = validateThreeClueRule(evidence);
    if (!threeClueRuleCompliant) {
      errors.push(
        '3-Clue Rule violation: Must have at least 3 critical clues pointing to guilty suspect'
      );
    }

    // Validate structure consistency
    const structureValid = validateEvidenceStructure(evidence);
    if (!structureValid) {
      errors.push(
        'Structure inconsistency: Korean and English evidence must have identical structure'
      );
    }

    // Validate Fair Play principles
    const fairPlayCompliant = validateFairPlay(evidence);
    if (!fairPlayCompliant) {
      errors.push(
        'Fair Play violation: All evidence must have discovery hints, critical evidence must have interpretation hints'
      );
    }

    // Validate discovery probabilities
    const probabilitiesValid = validateDiscoveryProbabilities(evidence);
    if (!probabilitiesValid) {
      errors.push(
        'Discovery probability violation: Critical evidence must have >= 70% thorough search probability'
      );
    }

    // Additional check: Critical evidence discoverability
    const criticalEvidenceDiscoverable =
      this.validateCriticalEvidenceDiscoverable(evidence);
    if (!criticalEvidenceDiscoverable.isValid) {
      errors.push(...criticalEvidenceDiscoverable.errors);
      warnings.push(...criticalEvidenceDiscoverable.warnings);
    }

    // Overall validation
    const isValid =
      threeClueRuleCompliant &&
      structureValid &&
      fairPlayCompliant &&
      probabilitiesValid &&
      criticalEvidenceDiscoverable.isValid;

    return {
      isValid,
      errors,
      warnings,
      summary: {
        threeClueRuleCompliant,
        structureValid,
        fairPlayCompliant,
        probabilitiesValid,
        criticalEvidenceDiscoverable: criticalEvidenceDiscoverable.isValid,
      },
    };
  }

  /**
   * Validate that all critical evidence is discoverable
   * Critical evidence must have:
   * - >= 70% probability on thorough search
   * - >= 95% probability on exhaustive search
   * - 100% probability on exhaustive search for evidence pointing to guilty
   *
   * @param evidence - Evidence collection
   * @returns Validation result
   */
  private validateCriticalEvidenceDiscoverable(
    evidence: MultilingualEvidence
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { ko } = evidence.translations;
    const criticalEvidence = ko.items.filter((item) => item.relevance === 'critical');

    for (const item of criticalEvidence) {
      const { quick, thorough, exhaustive } = item.discoveryProbability;

      // Critical evidence must be discoverable on thorough search
      if (thorough < 0.7) {
        errors.push(
          `Critical evidence "${item.name}" has only ${(thorough * 100).toFixed(0)}% thorough search probability (minimum 70% required)`
        );
      }

      // Critical evidence must be very likely on exhaustive search
      if (exhaustive < 0.95) {
        errors.push(
          `Critical evidence "${item.name}" has only ${(exhaustive * 100).toFixed(0)}% exhaustive search probability (minimum 95% required)`
        );
      }

      // Evidence pointing to guilty should be 100% on exhaustive
      if (item.pointsToSuspect === evidence.metadata.guiltyIndex && exhaustive < 1.0) {
        warnings.push(
          `Critical evidence "${item.name}" points to guilty suspect but is not guaranteed on exhaustive search (${(exhaustive * 100).toFixed(0)}%)`
        );
      }

      // Warn if quick search probability is too high (makes it too easy)
      if (quick > 0.9 && item.discoveryDifficulty !== 'obvious') {
        warnings.push(
          `Critical evidence "${item.name}" has very high quick search probability (${(quick * 100).toFixed(0)}%) but is marked as ${item.discoveryDifficulty}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get human-readable validation report
   *
   * @param result - Validation result
   * @returns Formatted report string
   */
  getValidationReport(result: FairPlayValidationResult): string {
    const lines: string[] = [];

    lines.push('=== Fair Play Validation Report ===\n');
    lines.push(`Status: ${result.isValid ? '✅ PASSED' : '❌ FAILED'}\n`);

    // Summary
    lines.push('Summary:');
    lines.push(
      `  3-Clue Rule: ${result.summary.threeClueRuleCompliant ? '✅' : '❌'}`
    );
    lines.push(`  Structure: ${result.summary.structureValid ? '✅' : '❌'}`);
    lines.push(`  Fair Play: ${result.summary.fairPlayCompliant ? '✅' : '❌'}`);
    lines.push(
      `  Probabilities: ${result.summary.probabilitiesValid ? '✅' : '❌'}`
    );
    lines.push(
      `  Discoverability: ${result.summary.criticalEvidenceDiscoverable ? '✅' : '❌'}`
    );
    lines.push('');

    // Errors
    if (result.errors.length > 0) {
      lines.push('Errors:');
      result.errors.forEach((error) => lines.push(`  ❌ ${error}`));
      lines.push('');
    }

    // Warnings
    if (result.warnings.length > 0) {
      lines.push('Warnings:');
      result.warnings.forEach((warning) => lines.push(`  ⚠️  ${warning}`));
      lines.push('');
    }

    if (result.isValid && result.warnings.length === 0) {
      lines.push('✅ Evidence collection is Fair Play compliant!');
    }

    return lines.join('\n');
  }
}

/**
 * Factory function to create FairPlayValidationService
 */
export function createFairPlayValidationService(): FairPlayValidationService {
  return new FairPlayValidationService();
}
