/**
 * Location.test.ts
 *
 * Tests for Location exploration types and validation functions
 */

import { describe, it, expect } from 'vitest';
import type { LocationExploration, ExplorationArea } from './Location';
import {
  isLocationExploration,
  getLocationInLanguage,
  validateLocationStructure
} from './Location';

describe('Location Types and Validation', () => {
  describe('isLocationExploration', () => {
    it('should return true for valid LocationExploration', () => {
      const validLocation: LocationExploration = {
        locationId: 'study',
        caseId: 'case-2025-01-15',
        translations: {
          ko: {
            atmosphere: '고요한 분위기',
            initialDescription: '첫인상',
            detailedDescription: '자세한 설명',
            areas: [
              {
                id: 'area-1',
                name: '책장',
                description: '설명',
                clues: ['단서1', '단서2'],
                interactable: true
              }
            ]
          },
          en: {
            atmosphere: 'Quiet atmosphere',
            initialDescription: 'First impression',
            detailedDescription: 'Detailed description',
            areas: [
              {
                id: 'area-1',
                name: 'Bookshelf',
                description: 'Description',
                clues: ['Clue1', 'Clue2'],
                interactable: true
              }
            ]
          }
        },
        metadata: {
          totalAreas: 1,
          totalClues: 2,
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      expect(isLocationExploration(validLocation)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isLocationExploration(null)).toBe(false);
      expect(isLocationExploration(undefined)).toBe(false);
      expect(isLocationExploration({})).toBe(false);
      expect(isLocationExploration({ locationId: 'test' })).toBe(false);
    });
  });

  describe('getLocationInLanguage', () => {
    const testLocation: LocationExploration = {
      locationId: 'study',
      caseId: 'case-2025-01-15',
      translations: {
        ko: {
          atmosphere: '한국어 분위기',
          initialDescription: '한국어 첫인상',
          detailedDescription: '한국어 자세한 설명',
          areas: [
            {
              id: 'area-1',
              name: '책장',
              description: '한국어 설명',
              clues: ['한국어 단서'],
              interactable: true
            }
          ]
        },
        en: {
          atmosphere: 'English atmosphere',
          initialDescription: 'English first impression',
          detailedDescription: 'English detailed description',
          areas: [
            {
              id: 'area-1',
              name: 'Bookshelf',
              description: 'English description',
              clues: ['English clue'],
              interactable: true
            }
          ]
        }
      },
      metadata: {
        totalAreas: 1,
        totalClues: 1,
        criticalClueCount: 1
      },
      generatedAt: Date.now()
    };

    it('should return Korean content when language is ko', () => {
      const content = getLocationInLanguage(testLocation, 'ko');
      expect(content.atmosphere).toBe('한국어 분위기');
      expect(content.areas[0].name).toBe('책장');
    });

    it('should return English content when language is en', () => {
      const content = getLocationInLanguage(testLocation, 'en');
      expect(content.atmosphere).toBe('English atmosphere');
      expect(content.areas[0].name).toBe('Bookshelf');
    });
  });

  describe('validateLocationStructure', () => {
    it('should return true when structure is consistent', () => {
      const validLocation: LocationExploration = {
        locationId: 'study',
        caseId: 'case-2025-01-15',
        translations: {
          ko: {
            atmosphere: '분위기',
            initialDescription: '첫인상',
            detailedDescription: '설명',
            areas: [
              {
                id: 'area-1',
                name: '책장',
                description: '설명',
                clues: ['단서1', '단서2'],
                interactable: true
              },
              {
                id: 'area-2',
                name: '책상',
                description: '설명',
                clues: ['단서3', '단서4', '단서5'],
                interactable: true
              }
            ]
          },
          en: {
            atmosphere: 'Atmosphere',
            initialDescription: 'First impression',
            detailedDescription: 'Description',
            areas: [
              {
                id: 'area-1',
                name: 'Bookshelf',
                description: 'Description',
                clues: ['Clue1', 'Clue2'],
                interactable: true
              },
              {
                id: 'area-2',
                name: 'Desk',
                description: 'Description',
                clues: ['Clue3', 'Clue4', 'Clue5'],
                interactable: true
              }
            ]
          }
        },
        metadata: {
          totalAreas: 2,
          totalClues: 5,
          criticalClueCount: 2
        },
        generatedAt: Date.now()
      };

      expect(validateLocationStructure(validLocation)).toBe(true);
    });

    it('should return false when area counts differ', () => {
      const invalidLocation: LocationExploration = {
        locationId: 'study',
        caseId: 'case-2025-01-15',
        translations: {
          ko: {
            atmosphere: '분위기',
            initialDescription: '첫인상',
            detailedDescription: '설명',
            areas: [
              {
                id: 'area-1',
                name: '책장',
                description: '설명',
                clues: ['단서1'],
                interactable: true
              },
              {
                id: 'area-2',
                name: '책상',
                description: '설명',
                clues: ['단서2'],
                interactable: true
              }
            ]
          },
          en: {
            atmosphere: 'Atmosphere',
            initialDescription: 'First impression',
            detailedDescription: 'Description',
            areas: [
              {
                id: 'area-1',
                name: 'Bookshelf',
                description: 'Description',
                clues: ['Clue1'],
                interactable: true
              }
              // Missing area-2!
            ]
          }
        },
        metadata: {
          totalAreas: 2,
          totalClues: 2,
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      expect(validateLocationStructure(invalidLocation)).toBe(false);
    });

    it('should return false when clue counts differ in corresponding areas', () => {
      const invalidLocation: LocationExploration = {
        locationId: 'study',
        caseId: 'case-2025-01-15',
        translations: {
          ko: {
            atmosphere: '분위기',
            initialDescription: '첫인상',
            detailedDescription: '설명',
            areas: [
              {
                id: 'area-1',
                name: '책장',
                description: '설명',
                clues: ['단서1', '단서2', '단서3'],  // 3 clues
                interactable: true
              }
            ]
          },
          en: {
            atmosphere: 'Atmosphere',
            initialDescription: 'First impression',
            detailedDescription: 'Description',
            areas: [
              {
                id: 'area-1',
                name: 'Bookshelf',
                description: 'Description',
                clues: ['Clue1', 'Clue2'],  // Only 2 clues!
                interactable: true
              }
            ]
          }
        },
        metadata: {
          totalAreas: 1,
          totalClues: 3,
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      expect(validateLocationStructure(invalidLocation)).toBe(false);
    });

    it('should return false when metadata totalAreas does not match', () => {
      const invalidLocation: LocationExploration = {
        locationId: 'study',
        caseId: 'case-2025-01-15',
        translations: {
          ko: {
            atmosphere: '분위기',
            initialDescription: '첫인상',
            detailedDescription: '설명',
            areas: [
              {
                id: 'area-1',
                name: '책장',
                description: '설명',
                clues: ['단서1'],
                interactable: true
              }
            ]
          },
          en: {
            atmosphere: 'Atmosphere',
            initialDescription: 'First impression',
            detailedDescription: 'Description',
            areas: [
              {
                id: 'area-1',
                name: 'Bookshelf',
                description: 'Description',
                clues: ['Clue1'],
                interactable: true
              }
            ]
          }
        },
        metadata: {
          totalAreas: 2,  // Says 2 but only 1 area exists!
          totalClues: 1,
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      expect(validateLocationStructure(invalidLocation)).toBe(false);
    });

    it('should return false when metadata totalClues does not match', () => {
      const invalidLocation: LocationExploration = {
        locationId: 'study',
        caseId: 'case-2025-01-15',
        translations: {
          ko: {
            atmosphere: '분위기',
            initialDescription: '첫인상',
            detailedDescription: '설명',
            areas: [
              {
                id: 'area-1',
                name: '책장',
                description: '설명',
                clues: ['단서1', '단서2', '단서3'],
                interactable: true
              }
            ]
          },
          en: {
            atmosphere: 'Atmosphere',
            initialDescription: 'First impression',
            detailedDescription: 'Description',
            areas: [
              {
                id: 'area-1',
                name: 'Bookshelf',
                description: 'Description',
                clues: ['Clue1', 'Clue2', 'Clue3'],
                interactable: true
              }
            ]
          }
        },
        metadata: {
          totalAreas: 1,
          totalClues: 5,  // Says 5 but only 3 clues exist!
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      expect(validateLocationStructure(invalidLocation)).toBe(false);
    });
  });
});
