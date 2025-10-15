/**
 * CaseGeneratorService.integration.test.ts
 *
 * Integration tests for complete case generation workflow
 * Tests Location, Evidence, and Validation services working together
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CaseGeneratorService } from './CaseGeneratorService';
import { GeminiClient } from '../gemini/GeminiClient';
import { LocationGeneratorService } from '../location/LocationGeneratorService';
import { EvidenceGeneratorService } from '../evidence/EvidenceGeneratorService';
import { ValidationService } from '../validation/ValidationService';
import { validateLocationStructure } from '../../../shared/types/Location';
import {
  validateEvidenceStructure,
  validateThreeClueRule,
  validateFairPlay
} from '../../../shared/types/Evidence';

describe('CaseGeneratorService Integration Tests', () => {
  let caseGenerator: CaseGeneratorService;
  let geminiClient: GeminiClient;

  beforeAll(() => {
    // Initialize Gemini client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required for integration tests');
    }

    geminiClient = new GeminiClient(apiKey);

    // Initialize case generator with all services
    const locationGenerator = new LocationGeneratorService(geminiClient);
    const evidenceGenerator = new EvidenceGeneratorService(geminiClient);
    const validationService = new ValidationService();

    caseGenerator = new CaseGeneratorService(
      geminiClient,
      locationGenerator,
      evidenceGenerator,
      validationService
    );
  });

  describe('Complete case generation workflow', () => {
    it('should generate a complete multilingual case with location and evidence', async () => {
      // This is a real integration test that makes API calls
      // May take 30-60 seconds due to multiple AI generations
      const testDate = new Date('2025-01-15');

      const multilingualCase = await caseGenerator.generateMultilingualCase({
        date: testDate,
        includeImage: false,
        temperature: 0.7
      });

      // 1. Basic structure validation
      expect(multilingualCase).toBeDefined();
      expect(multilingualCase.id).toBe('case-2025-01-15');
      expect(multilingualCase.date).toBe('2025-01-15');

      // 2. Translations exist
      expect(multilingualCase.translations.ko).toBeDefined();
      expect(multilingualCase.translations.en).toBeDefined();

      // 3. Case elements exist
      expect(multilingualCase.weapon).toBeDefined();
      expect(multilingualCase.location).toBeDefined();
      expect(multilingualCase.motive).toBeDefined();

      // 4. Location exploration exists and is valid
      expect(multilingualCase.locationExploration).toBeDefined();
      const locationExploration = multilingualCase.locationExploration!;

      expect(locationExploration.locationId).toBe(multilingualCase.metadata.locationId);
      expect(locationExploration.caseId).toBe(multilingualCase.id);
      expect(locationExploration.metadata.totalAreas).toBeGreaterThanOrEqual(3);
      expect(locationExploration.metadata.totalClues).toBeGreaterThanOrEqual(8);

      // Validate location structure consistency
      const locationValid = validateLocationStructure(locationExploration);
      expect(locationValid).toBe(true);

      // 5. Evidence collection exists and is valid
      expect(multilingualCase.evidence).toBeDefined();
      const evidence = multilingualCase.evidence!;

      expect(evidence.locationId).toBe(multilingualCase.metadata.locationId);
      expect(evidence.caseId).toBe(multilingualCase.id);
      expect(evidence.metadata.totalItems).toBeGreaterThanOrEqual(8);
      expect(evidence.metadata.criticalCount).toBeGreaterThanOrEqual(3);

      // Validate evidence structure consistency
      const evidenceStructureValid = validateEvidenceStructure(evidence);
      expect(evidenceStructureValid).toBe(true);

      // 6. 3-Clue Rule compliance
      const threeClueRuleValid = validateThreeClueRule(evidence);
      expect(threeClueRuleValid).toBe(true);

      // 7. Fair Play compliance
      const fairPlayValid = validateFairPlay(evidence);
      expect(fairPlayValid).toBe(true);

      // 8. Guilty suspect consistency
      expect(evidence.metadata.guiltyIndex).toBe(multilingualCase.metadata.guiltyIndex);

      // 9. Multilingual consistency
      expect(locationExploration.translations.ko.areas.length).toBe(
        locationExploration.translations.en.areas.length
      );

      expect(evidence.translations.ko.items.length).toBe(
        evidence.translations.en.items.length
      );

      // 10. Cross-component consistency
      expect(locationExploration.locationId).toBe(evidence.locationId);
      expect(locationExploration.caseId).toBe(evidence.caseId);
    }, 120000); // 2 minute timeout for full AI generation

    it('should generate different cases for different dates', async () => {
      const date1 = new Date('2025-01-15');
      const date2 = new Date('2025-01-16');

      const case1 = await caseGenerator.generateMultilingualCase({
        date: date1,
        includeImage: false
      });

      const case2 = await caseGenerator.generateMultilingualCase({
        date: date2,
        includeImage: false
      });

      // Different cases should have different IDs
      expect(case1.id).not.toBe(case2.id);

      // Different elements (deterministic but date-based)
      // Note: This might fail if the same elements are selected by chance
      const sameWeapon = case1.metadata.weaponId === case2.metadata.weaponId;
      const sameLocation = case1.metadata.locationId === case2.metadata.locationId;
      const sameMotive = case1.metadata.motiveId === case2.metadata.motiveId;

      // At least one element should be different
      expect(sameWeapon && sameLocation && sameMotive).toBe(false);
    }, 180000); // 3 minute timeout for two full generations
  });

  describe('Validation integration', () => {
    it('should validate generated case successfully', async () => {
      const testDate = new Date('2025-01-17');

      const multilingualCase = await caseGenerator.generateMultilingualCase({
        date: testDate,
        includeImage: false
      });

      const validationService = new ValidationService();

      // Validate complete case
      const validationResult = validationService.validateCompleteCase(
        multilingualCase.locationExploration!,
        multilingualCase.evidence!
      );

      // Should pass validation (or have only warnings, no errors)
      expect(validationResult.summary.errors).toBe(0);

      // Report should be generated without errors
      const report = validationService.formatValidationReport(validationResult);
      expect(report).toContain('CASE VALIDATION REPORT');
      expect(report).toContain('Overall Status');
    }, 120000);
  });

  describe('Detective game principles', () => {
    it('should ensure 3-Clue Rule is satisfied', async () => {
      const testDate = new Date('2025-01-18');

      const multilingualCase = await caseGenerator.generateMultilingualCase({
        date: testDate,
        includeImage: false
      });

      const evidence = multilingualCase.evidence!;

      // Must have at least 3 critical evidence
      expect(evidence.metadata.criticalCount).toBeGreaterThanOrEqual(3);

      // Must have at least 3 evidence pointing to guilty
      expect(evidence.metadata.evidencePointingToGuilty).toBeGreaterThanOrEqual(3);

      // Metadata must confirm compliance
      expect(evidence.metadata.threeClueRuleCompliant).toBe(true);
    }, 120000);

    it('should ensure Fair Play principle is followed', async () => {
      const testDate = new Date('2025-01-19');

      const multilingualCase = await caseGenerator.generateMultilingualCase({
        date: testDate,
        includeImage: false
      });

      const evidence = multilingualCase.evidence!;

      // All evidence must have discovery hints
      evidence.translations.ko.items.forEach((item) => {
        expect(item.discoveryHint).toBeTruthy();
        expect(item.discoveryHint.length).toBeGreaterThan(0);
      });

      // Critical evidence must have interpretation hints
      const criticalItems = evidence.translations.ko.items.filter(
        (item) => item.relevance === 'critical'
      );

      criticalItems.forEach((item) => {
        expect(item.interpretationHint).toBeTruthy();
        expect(item.interpretationHint.length).toBeGreaterThan(0);
      });
    }, 120000);

    it('should have sufficient location exploration content', async () => {
      const testDate = new Date('2025-01-20');

      const multilingualCase = await caseGenerator.generateMultilingualCase({
        date: testDate,
        includeImage: false
      });

      const locationExploration = multilingualCase.locationExploration!;

      // Should have 3-5 exploration areas
      expect(locationExploration.metadata.totalAreas).toBeGreaterThanOrEqual(3);
      expect(locationExploration.metadata.totalAreas).toBeLessThanOrEqual(5);

      // Should have 8-12 total clues
      expect(locationExploration.metadata.totalClues).toBeGreaterThanOrEqual(8);

      // Each area should have clues
      locationExploration.translations.ko.areas.forEach((area) => {
        expect(area.clues.length).toBeGreaterThan(0);
      });
    }, 120000);
  });

  describe('Multilingual consistency', () => {
    it('should maintain same game structure across languages', async () => {
      const testDate = new Date('2025-01-21');

      const multilingualCase = await caseGenerator.generateMultilingualCase({
        date: testDate,
        includeImage: false
      });

      // Same guilty suspect index
      const koGuilty = multilingualCase.translations.ko.suspects.find(
        (s) => s.isGuilty
      );
      const enGuilty = multilingualCase.translations.en.suspects.find(
        (s) => s.isGuilty
      );

      const koIndex = multilingualCase.translations.ko.suspects.indexOf(koGuilty!);
      const enIndex = multilingualCase.translations.en.suspects.indexOf(enGuilty!);

      expect(koIndex).toBe(enIndex);
      expect(koIndex).toBe(multilingualCase.metadata.guiltyIndex);

      // Same number of suspects
      expect(multilingualCase.translations.ko.suspects.length).toBe(
        multilingualCase.translations.en.suspects.length
      );

      // Same location exploration structure
      const locationExploration = multilingualCase.locationExploration!;
      expect(locationExploration.translations.ko.areas.length).toBe(
        locationExploration.translations.en.areas.length
      );

      // Same evidence structure
      const evidence = multilingualCase.evidence!;
      expect(evidence.translations.ko.items.length).toBe(
        evidence.translations.en.items.length
      );

      // Same evidence types
      for (let i = 0; i < evidence.translations.ko.items.length; i++) {
        expect(evidence.translations.ko.items[i].type).toBe(
          evidence.translations.en.items[i].type
        );
      }
    }, 120000);
  });
});
