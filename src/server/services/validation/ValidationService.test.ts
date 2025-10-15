/**
 * ValidationService.test.ts
 *
 * Tests for ValidationService quality and compliance checks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationService, createValidationService } from './ValidationService';
import type { LocationExploration } from '../../../shared/types/Location';
import type { MultilingualEvidence } from '../../../shared/types/Evidence';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = createValidationService();
  });

  describe('validateLocationExploration', () => {
    it('should validate a correct location exploration', () => {
      const validLocation: LocationExploration = {
        locationId: 'study',
        caseId: 'case-2025-01-15',
        translations: {
          ko: {
            atmosphere: '긴장감 넘치는 분위기',
            initialDescription: '첫인상',
            detailedDescription: '자세한 설명',
            areas: [
              {
                id: 'area-1',
                name: '책장',
                description: '설명',
                clues: ['단서1', '단서2', '단서3'],
                interactable: true
              },
              {
                id: 'area-2',
                name: '책상',
                description: '설명',
                clues: ['단서4', '단서5', '단서6'],
                interactable: true
              },
              {
                id: 'area-3',
                name: '금고',
                description: '설명',
                clues: ['단서7', '단서8'],
                interactable: true
              }
            ]
          },
          en: {
            atmosphere: 'Tense atmosphere',
            initialDescription: 'First impression',
            detailedDescription: 'Detailed description',
            areas: [
              {
                id: 'area-1',
                name: 'Bookshelf',
                description: 'Description',
                clues: ['Clue1', 'Clue2', 'Clue3'],
                interactable: true
              },
              {
                id: 'area-2',
                name: 'Desk',
                description: 'Description',
                clues: ['Clue4', 'Clue5', 'Clue6'],
                interactable: true
              },
              {
                id: 'area-3',
                name: 'Safe',
                description: 'Description',
                clues: ['Clue7', 'Clue8'],
                interactable: true
              }
            ]
          }
        },
        metadata: {
          totalAreas: 3,
          totalClues: 8,
          criticalClueCount: 3
        },
        generatedAt: Date.now()
      };

      const result = service.validateLocationExploration(validLocation);
      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(
        0
      );
    });

    it('should detect area count mismatch', () => {
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
          totalAreas: 2, // Wrong! Should be 1
          totalClues: 1,
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      const result = service.validateLocationExploration(invalidLocation);
      expect(result.valid).toBe(false);
      expect(
        result.issues.find((i) => i.field === 'metadata.totalAreas')
      ).toBeDefined();
    });

    it('should detect clue count mismatch', () => {
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
          totalClues: 5, // Wrong! Should be 3
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      const result = service.validateLocationExploration(invalidLocation);
      expect(result.valid).toBe(false);
      expect(
        result.issues.find((i) => i.field === 'metadata.totalClues')
      ).toBeDefined();
    });

    it('should warn about insufficient areas', () => {
      const locationWithFewAreas: LocationExploration = {
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
                clues: ['단서1', '단서2', '단서3', '단서4', '단서5'],
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
                clues: ['Clue1', 'Clue2', 'Clue3', 'Clue4', 'Clue5'],
                interactable: true
              }
            ]
          }
        },
        metadata: {
          totalAreas: 1, // Only 1 area (warning threshold is 3)
          totalClues: 5,
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      const result = service.validateLocationExploration(
        locationWithFewAreas
      );
      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(
        result.issues.find(
          (i) =>
            i.severity === 'warning' &&
            i.message.includes('fewer than 3 exploration areas')
        )
      ).toBeDefined();
    });

    it('should warn about insufficient clues', () => {
      const locationWithFewClues: LocationExploration = {
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
              },
              {
                id: 'area-3',
                name: '금고',
                description: '설명',
                clues: ['단서3'],
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
              },
              {
                id: 'area-2',
                name: 'Desk',
                description: 'Description',
                clues: ['Clue2'],
                interactable: true
              },
              {
                id: 'area-3',
                name: 'Safe',
                description: 'Description',
                clues: ['Clue3'],
                interactable: true
              }
            ]
          }
        },
        metadata: {
          totalAreas: 3,
          totalClues: 3, // Only 3 clues (warning threshold is 8)
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      const result = service.validateLocationExploration(locationWithFewClues);
      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(
        result.issues.find(
          (i) =>
            i.severity === 'warning' && i.message.includes('fewer than 8 clues')
        )
      ).toBeDefined();
    });
  });

  describe('validateEvidence', () => {
    it('should validate correct evidence collection', () => {
      const validEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '증거 요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: '증거2',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-3',
                type: 'communication',
                name: '증거3',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-4',
                type: 'testimony',
                name: '증거4',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '',
                relevance: 'important'
              }
            ]
          },
          en: {
            summary: 'Evidence summary',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: 'Evidence1',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: 'Evidence2',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-3',
                type: 'communication',
                name: 'Evidence3',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-4',
                type: 'testimony',
                name: 'Evidence4',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: '',
                relevance: 'important'
              }
            ]
          }
        },
        metadata: {
          totalItems: 4,
          criticalCount: 3,
          threeClueRuleCompliant: true,
          guiltyIndex: 1,
          evidencePointingToGuilty: 3
        },
        generatedAt: Date.now()
      };

      const result = service.validateEvidence(validEvidence);
      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(
        0
      );
    });

    it('should detect 3-Clue Rule violation (insufficient critical evidence)', () => {
      const invalidEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '증거 요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: '증거2',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          },
          en: {
            summary: 'Evidence summary',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: 'Evidence1',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: 'Evidence2',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          }
        },
        metadata: {
          totalItems: 2,
          criticalCount: 2, // Only 2 critical (need 3+)
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 2
        },
        generatedAt: Date.now()
      };

      const result = service.validateEvidence(invalidEvidence);
      expect(result.valid).toBe(false);
      expect(
        result.issues.find(
          (i) =>
            i.category === 'compliance' &&
            i.message.includes('Fewer than 3 critical evidence items')
        )
      ).toBeDefined();
    });

    it('should detect Fair Play violation (missing discovery hint)', () => {
      const invalidEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '증거 요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '', // Missing!
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          },
          en: {
            summary: 'Evidence summary',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: 'Evidence1',
                description: 'Description',
                discoveryHint: '', // Missing!
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          }
        },
        metadata: {
          totalItems: 1,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        },
        generatedAt: Date.now()
      };

      const result = service.validateEvidence(invalidEvidence);
      expect(result.valid).toBe(false);
      expect(
        result.issues.find(
          (i) =>
            i.category === 'compliance' &&
            i.message.includes('missing discovery hint')
        )
      ).toBeDefined();
    });

    it('should detect Fair Play violation (missing interpretation hint for critical)', () => {
      const invalidEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '증거 요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '', // Missing for critical!
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          },
          en: {
            summary: 'Evidence summary',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: 'Evidence1',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: '', // Missing for critical!
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          }
        },
        metadata: {
          totalItems: 1,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        },
        generatedAt: Date.now()
      };

      const result = service.validateEvidence(invalidEvidence);
      expect(result.valid).toBe(false);
      expect(
        result.issues.find(
          (i) =>
            i.category === 'compliance' &&
            i.message.includes('missing interpretation hint')
        )
      ).toBeDefined();
    });

    it('should warn about lack of evidence variety', () => {
      const evidenceWithoutVariety: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '증거 요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'physical', // Same type
                name: '증거2',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-3',
                type: 'physical', // Same type
                name: '증거3',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          },
          en: {
            summary: 'Evidence summary',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: 'Evidence1',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'physical',
                name: 'Evidence2',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-3',
                type: 'physical',
                name: 'Evidence3',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          }
        },
        metadata: {
          totalItems: 3,
          criticalCount: 3,
          threeClueRuleCompliant: true,
          guiltyIndex: 1,
          evidencePointingToGuilty: 3
        },
        generatedAt: Date.now()
      };

      const result = service.validateEvidence(evidenceWithoutVariety);
      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(
        result.issues.find(
          (i) =>
            i.severity === 'warning' &&
            i.message.includes('lacks variety')
        )
      ).toBeDefined();
    });
  });

  describe('validateCompleteCase', () => {
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
              clues: ['단서1', '단서2', '단서3', '단서4', '단서5'],
              interactable: true
            },
            {
              id: 'area-2',
              name: '책상',
              description: '설명',
              clues: ['단서6', '단서7', '단서8'],
              interactable: true
            },
            {
              id: 'area-3',
              name: '금고',
              description: '설명',
              clues: ['단서9', '단서10'],
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
              clues: ['Clue1', 'Clue2', 'Clue3', 'Clue4', 'Clue5'],
              interactable: true
            },
            {
              id: 'area-2',
              name: 'Desk',
              description: 'Description',
              clues: ['Clue6', 'Clue7', 'Clue8'],
              interactable: true
            },
            {
              id: 'area-3',
              name: 'Safe',
              description: 'Description',
              clues: ['Clue9', 'Clue10'],
              interactable: true
            }
          ]
        }
      },
      metadata: {
        totalAreas: 3,
        totalClues: 10,
        criticalClueCount: 3
      },
      generatedAt: Date.now()
    };

    const validEvidence: MultilingualEvidence = {
      caseId: 'case-2025-01-15',
      locationId: 'study',
      translations: {
        ko: {
          summary: '증거 요약',
          items: [
            {
              id: 'ev-1',
              type: 'physical',
              name: '증거1',
              description: '설명',
              discoveryHint: '발견',
              interpretationHint: '해석',
              relevance: 'critical',
              pointsToSuspect: 1
            },
            {
              id: 'ev-2',
              type: 'financial',
              name: '증거2',
              description: '설명',
              discoveryHint: '발견',
              interpretationHint: '해석',
              relevance: 'critical',
              pointsToSuspect: 1
            },
            {
              id: 'ev-3',
              type: 'communication',
              name: '증거3',
              description: '설명',
              discoveryHint: '발견',
              interpretationHint: '해석',
              relevance: 'critical',
              pointsToSuspect: 1
            }
          ]
        },
        en: {
          summary: 'Evidence summary',
          items: [
            {
              id: 'ev-1',
              type: 'physical',
              name: 'Evidence1',
              description: 'Description',
              discoveryHint: 'Discovery',
              interpretationHint: 'Interpretation',
              relevance: 'critical',
              pointsToSuspect: 1
            },
            {
              id: 'ev-2',
              type: 'financial',
              name: 'Evidence2',
              description: 'Description',
              discoveryHint: 'Discovery',
              interpretationHint: 'Interpretation',
              relevance: 'critical',
              pointsToSuspect: 1
            },
            {
              id: 'ev-3',
              type: 'communication',
              name: 'Evidence3',
              description: 'Description',
              discoveryHint: 'Discovery',
              interpretationHint: 'Interpretation',
              relevance: 'critical',
              pointsToSuspect: 1
            }
          ]
        }
      },
      metadata: {
        totalItems: 3,
        criticalCount: 3,
        threeClueRuleCompliant: true,
        guiltyIndex: 1,
        evidencePointingToGuilty: 3
      },
      generatedAt: Date.now()
    };

    it('should validate a complete valid case', () => {
      const result = service.validateCompleteCase(validLocation, validEvidence);
      expect(result.valid).toBe(true);
      expect(result.location.valid).toBe(true);
      expect(result.evidence.valid).toBe(true);
      expect(result.overall.valid).toBe(true);
      expect(result.summary.errors).toBe(0);
    });

    it('should detect location ID mismatch', () => {
      const evidenceWithWrongLocationId: MultilingualEvidence = {
        ...validEvidence,
        locationId: 'wrong-location' // Mismatch!
      };

      const result = service.validateCompleteCase(
        validLocation,
        evidenceWithWrongLocationId
      );
      expect(result.valid).toBe(false);
      expect(
        result.overall.issues.find(
          (i) =>
            i.field === 'locationId' &&
            i.message.includes('Location ID mismatch')
        )
      ).toBeDefined();
    });

    it('should detect case ID mismatch', () => {
      const evidenceWithWrongCaseId: MultilingualEvidence = {
        ...validEvidence,
        caseId: 'wrong-case' // Mismatch!
      };

      const result = service.validateCompleteCase(
        validLocation,
        evidenceWithWrongCaseId
      );
      expect(result.valid).toBe(false);
      expect(
        result.overall.issues.find(
          (i) =>
            i.field === 'caseId' && i.message.includes('Case ID mismatch')
        )
      ).toBeDefined();
    });

    it('should detect unplayable case (no clues or evidence)', () => {
      const emptyLocation: LocationExploration = {
        ...validLocation,
        translations: {
          ko: {
            atmosphere: '분위기',
            initialDescription: '첫인상',
            detailedDescription: '설명',
            areas: []
          },
          en: {
            atmosphere: 'Atmosphere',
            initialDescription: 'First impression',
            detailedDescription: 'Description',
            areas: []
          }
        },
        metadata: {
          totalAreas: 0,
          totalClues: 0,
          criticalClueCount: 0
        }
      };

      const emptyEvidence: MultilingualEvidence = {
        ...validEvidence,
        translations: {
          ko: { summary: '요약', items: [] },
          en: { summary: 'Summary', items: [] }
        },
        metadata: {
          totalItems: 0,
          criticalCount: 0,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 0
        }
      };

      const result = service.validateCompleteCase(emptyLocation, emptyEvidence);
      expect(result.valid).toBe(false);
      expect(
        result.overall.issues.find(
          (i) =>
            i.category === 'playability' &&
            i.message.includes('unplayable')
        )
      ).toBeDefined();
    });

    it('should detect unsolvable case (3-Clue Rule not satisfied)', () => {
      const unsolvableEvidence: MultilingualEvidence = {
        ...validEvidence,
        metadata: {
          totalItems: 3,
          criticalCount: 2, // Not enough
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 2
        }
      };

      const result = service.validateCompleteCase(
        validLocation,
        unsolvableEvidence
      );
      expect(result.valid).toBe(false);
      expect(
        result.overall.issues.find(
          (i) =>
            i.category === 'playability' &&
            i.message.includes('unsolvable')
        )
      ).toBeDefined();
    });

    it('should provide correct summary counts', () => {
      const result = service.validateCompleteCase(validLocation, validEvidence);
      expect(result.summary.totalIssues).toBeGreaterThanOrEqual(0);
      expect(result.summary.errors).toBe(0);
      expect(result.summary.warnings).toBeGreaterThanOrEqual(0);
      expect(result.summary.infos).toBeGreaterThanOrEqual(0);
    });
  });

  describe('formatValidationReport', () => {
    it('should format a validation report with all sections', () => {
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
          totalAreas: 2, // Wrong
          totalClues: 1,
          criticalClueCount: 1
        },
        generatedAt: Date.now()
      };

      const validEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '증거 요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          },
          en: {
            summary: 'Evidence summary',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: 'Evidence1',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          }
        },
        metadata: {
          totalItems: 1,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        }
      };

      const result = service.validateCompleteCase(validLocation, validEvidence);
      const report = service.formatValidationReport(result);

      expect(report).toContain('CASE VALIDATION REPORT');
      expect(report).toContain('Location Exploration');
      expect(report).toContain('Evidence Collection');
      expect(report).toContain('Overall Status');
    });
  });
});
