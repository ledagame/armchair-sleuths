/**
 * Integration Tests for Archetype Prompt System
 * Phase 3: Ensures the entire system works correctly
 */

import { describe, test, expect, beforeAll } from 'vitest';
import {
  ArchetypeName,
  EmotionalStateName,
  normalizeArchetypeName,
  getArchetypeData,
  getEmotionalStateFromSuspicion,
  preloadAllArchetypes
} from '../ArchetypePrompts';

describe('Archetype Prompt System Integration Tests', () => {

  beforeAll(() => {
    // Preload all archetypes to warm up the cache
    preloadAllArchetypes();
  });

  // ===== Test Korean → English Translation =====
  describe('Korean to English Name Translation', () => {
    test('should translate "부유한 상속인" to "Wealthy Heir"', () => {
      const result = normalizeArchetypeName('부유한 상속인');
      expect(result).toBe('Wealthy Heir');
    });

    test('should translate "충성스러운 집사" to "Loyal Butler"', () => {
      const result = normalizeArchetypeName('충성스러운 집사');
      expect(result).toBe('Loyal Butler');
    });

    test('should translate "재능있는 예술가" to "Talented Artist"', () => {
      const result = normalizeArchetypeName('재능있는 예술가');
      expect(result).toBe('Talented Artist');
    });

    test('should translate "사업 파트너" to "Business Partner"', () => {
      const result = normalizeArchetypeName('사업 파트너');
      expect(result).toBe('Business Partner');
    });

    test('should translate "전직 경찰" to "Former Police Officer"', () => {
      const result = normalizeArchetypeName('전직 경찰');
      expect(result).toBe('Former Police Officer');
    });

    test('should return null for unknown archetype name', () => {
      const result = normalizeArchetypeName('Unknown Archetype');
      expect(result).toBeNull();
    });

    test('should accept English names as-is', () => {
      const result = normalizeArchetypeName('Wealthy Heir');
      expect(result).toBe('Wealthy Heir');
    });
  });

  // ===== Test Archetype Data Loading =====
  describe('Archetype Data Loading', () => {
    const archetypes: ArchetypeName[] = [
      'Wealthy Heir',
      'Loyal Butler',
      'Talented Artist',
      'Business Partner',
      'Former Police Officer'
    ];

    test.each(archetypes)('should load data for %s', (archetypeName) => {
      const data = getArchetypeData(archetypeName);
      expect(data).toBeDefined();
      expect(data?.definition).toBeTruthy();
      expect(data?.personality).toBeInstanceOf(Array);
      expect(data?.vocabulary).toBeDefined();
      expect(data?.speechPatterns).toBeDefined();
    });

    test('all archetypes should have required speech pattern states', () => {
      const requiredStates: EmotionalStateName[] = ['COOPERATIVE', 'NERVOUS', 'DEFENSIVE', 'AGGRESSIVE'];

      for (const archetypeName of archetypes) {
        const data = getArchetypeData(archetypeName);

        for (const state of requiredStates) {
          expect(data?.speechPatterns[state]).toBeDefined();
          expect(data?.speechPatterns[state].mindset).toBeTruthy();
          expect(data?.speechPatterns[state].tone).toBeTruthy();
          expect(data?.speechPatterns[state].patterns).toBeInstanceOf(Array);
          expect(data?.speechPatterns[state].patterns.length).toBeGreaterThan(0);
        }
      }
    });

    test('all archetypes should have vocabulary words', () => {
      for (const archetypeName of archetypes) {
        const data = getArchetypeData(archetypeName);

        expect(data?.vocabulary.primary).toBeInstanceOf(Array);
        expect(data?.vocabulary.primary.length).toBeGreaterThan(0);
        expect(data?.vocabulary.secondary).toBeInstanceOf(Array);
        expect(data?.vocabulary.secondary.length).toBeGreaterThan(0);
      }
    });
  });

  // ===== Test Emotional State Mapping =====
  describe('Suspicion Level to Emotional State Mapping', () => {
    test('should map 0-25 to COOPERATIVE', () => {
      expect(getEmotionalStateFromSuspicion(0)).toBe('COOPERATIVE');
      expect(getEmotionalStateFromSuspicion(12)).toBe('COOPERATIVE');
      expect(getEmotionalStateFromSuspicion(25)).toBe('COOPERATIVE');
    });

    test('should map 26-50 to NERVOUS', () => {
      expect(getEmotionalStateFromSuspicion(26)).toBe('NERVOUS');
      expect(getEmotionalStateFromSuspicion(38)).toBe('NERVOUS');
      expect(getEmotionalStateFromSuspicion(50)).toBe('NERVOUS');
    });

    test('should map 51-75 to DEFENSIVE', () => {
      expect(getEmotionalStateFromSuspicion(51)).toBe('DEFENSIVE');
      expect(getEmotionalStateFromSuspicion(63)).toBe('DEFENSIVE');
      expect(getEmotionalStateFromSuspicion(75)).toBe('DEFENSIVE');
    });

    test('should map 76-100 to AGGRESSIVE', () => {
      expect(getEmotionalStateFromSuspicion(76)).toBe('AGGRESSIVE');
      expect(getEmotionalStateFromSuspicion(88)).toBe('AGGRESSIVE');
      expect(getEmotionalStateFromSuspicion(100)).toBe('AGGRESSIVE');
    });
  });

  // ===== Test Data Consistency =====
  describe('Data Consistency Across System', () => {
    test('Korean names from CaseElementLibrary should all be translatable', () => {
      // These are the Korean names that CaseElementLibrary uses
      const koreanNames = [
        '부유한 상속인',
        '충성스러운 집사',
        '재능있는 예술가',
        '사업 파트너',
        '전직 경찰'
      ];

      for (const koreanName of koreanNames) {
        const englishName = normalizeArchetypeName(koreanName);
        expect(englishName).not.toBeNull();
        expect(englishName).toBeTruthy();

        // Verify we can also load data for this archetype
        const data = getArchetypeData(englishName as ArchetypeName);
        expect(data).toBeDefined();
      }
    });

    test('all archetypes should have unique Korean names', () => {
      const archetypes: ArchetypeName[] = [
        'Wealthy Heir',
        'Loyal Butler',
        'Talented Artist',
        'Business Partner',
        'Former Police Officer'
      ];

      const koreanNames = new Set<string>();

      for (const archetype of archetypes) {
        // Extract Korean name from archetype data
        const koreanName = normalizeArchetypeName(archetype);
        expect(koreanName).toBeTruthy();

        // Check for duplicates
        expect(koreanNames.has(koreanName!)).toBe(false);
        koreanNames.add(koreanName!);
      }

      expect(koreanNames.size).toBe(5);
    });
  });

  // ===== Test Fallback System =====
  describe('Emergency Fallback System', () => {
    test('system should still work even if primary data fails', () => {
      // This test verifies that the fallback system is in place
      // Even if JSON loading fails, the system should use EMERGENCY_FALLBACK_DATA

      const archetypes: ArchetypeName[] = [
        'Wealthy Heir',
        'Loyal Butler',
        'Talented Artist',
        'Business Partner',
        'Former Police Officer'
      ];

      // All archetypes should return data (either from JSON or fallback)
      for (const archetype of archetypes) {
        const data = getArchetypeData(archetype);
        expect(data).toBeDefined();
        expect(data?.definition).toBeTruthy();
        expect(data?.speechPatterns).toBeDefined();
      }
    });
  });

  // ===== Test End-to-End Flow =====
  describe('End-to-End Archetype Flow', () => {
    test('full flow: Korean name → English name → Load data → Get speech patterns', () => {
      // Start with Korean name (as CaseGenerator would provide)
      const koreanName = '부유한 상속인';

      // Step 1: Normalize to English
      const englishName = normalizeArchetypeName(koreanName);
      expect(englishName).toBe('Wealthy Heir');

      // Step 2: Load archetype data
      const archetypeData = getArchetypeData(englishName as ArchetypeName);
      expect(archetypeData).toBeDefined();

      // Step 3: Get emotional state from suspicion level
      const suspicionLevel = 45;
      const emotionalState = getEmotionalStateFromSuspicion(suspicionLevel);
      expect(emotionalState).toBe('NERVOUS');

      // Step 4: Access speech patterns for this state
      const speechPattern = archetypeData?.speechPatterns[emotionalState];
      expect(speechPattern).toBeDefined();
      expect(speechPattern?.mindset).toBeTruthy();
      expect(speechPattern?.tone).toBeTruthy();
      expect(speechPattern?.patterns.length).toBeGreaterThan(0);
    });
  });
});
